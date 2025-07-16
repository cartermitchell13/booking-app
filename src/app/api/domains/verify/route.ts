import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Use the same hardcoded values as the rest of the application
const supabaseUrl = 'https://zsdkqmlhnffoidwyygce.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to validate domain format
function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.([a-zA-Z]{2,})+$/;
  return domainRegex.test(domain) && domain.length <= 253;
}

// Helper function to generate verification token
function generateVerificationToken(): string {
  return randomUUID().replace(/-/g, '');
}

// Helper function to detect apex domain attempts
function isApexDomain(subdomain: string, domain: string): boolean {
  return subdomain === '' || subdomain === '@' || `${subdomain}.${domain}` === domain;
}

// Platform domain - in production this should be from environment variables
const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || 'parkbus-platform.vercel.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, tenant_id, subdomain = 'booking' } = body;

    // Validate required fields
    if (!domain || !tenant_id) {
      return NextResponse.json(
        { error: 'Domain and tenant_id are required' },
        { status: 400 }
      );
    }

    // Validate domain format
    if (!isValidDomain(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Check for apex domain conflicts
    if (isApexDomain(subdomain, domain)) {
      return NextResponse.json(
        { 
          error: 'Apex domains are not supported. Please use a subdomain like "booking.yourdomain.com"',
          suggestion: `Try using "booking.${domain}" instead`
        },
        { status: 400 }
      );
    }

    // Check if tenant exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, slug, name')
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Full hostname for collision check
    const fullHostname = `${subdomain}.${domain}`;

    // Check for hostname collisions (UNIQUE constraint protection)
    const { data: existingTenant, error: existingError } = await supabase
      .from('tenants')
      .select('id, name')
      .eq('domain', fullHostname)
      .neq('id', tenant_id)
      .single();

    if (existingTenant) {
      return NextResponse.json(
        { 
          error: 'Hostname is already claimed by another tenant',
          conflicting_tenant: existingTenant.name
        },
        { status: 409 }
      );
    }

    // Generate verification token and create verification target
    const verificationToken = generateVerificationToken();
    const verificationTarget = `verify-${verificationToken}.${PLATFORM_DOMAIN}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    // Database-first approach: Create tenant domain record BEFORE cert provisioning
    const { error: updateError } = await supabase
      .from('tenants')
      .update({
        domain: fullHostname,
        custom_subdomain: subdomain,
        domain_verification_token: verificationToken,
        domain_verification_expires: expiresAt.toISOString(),
        domain_verified: false,
        domain_status: 'pending',
        ssl_status: 'pending',
        domain_verification_attempts: 0
      })
      .eq('id', tenant_id);

    if (updateError) {
      console.error('Error updating tenant with verification details:', updateError);
      return NextResponse.json(
        { error: 'Failed to initiate domain verification' },
        { status: 500 }
      );
    }

    // Log verification attempt with CNAME details
    try {
      await supabase
        .from('domain_verification_logs')
        .insert({
          tenant_id,
          domain,
          subdomain,
          verification_target: verificationTarget,
          verification_method: 'cname',
          verification_token: verificationToken,
          status: 'pending',
          dns_propagation: {},
          ssl_status: 'pending'
        });
    } catch (logError) {
      console.warn('Failed to log verification attempt:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      verification_target: verificationTarget,
      cname_source: fullHostname,
      cname_target: verificationTarget,
      expires_at: expiresAt.toISOString(),
      ttl_recommendation: 300, // 5 minutes for initial setup
      instructions: `Create CNAME record: ${fullHostname} → ${verificationTarget}\n\nThis single step will verify domain ownership and set up traffic routing.\n\nRecommended TTL: 300 seconds (5 minutes) during setup, then increase to 3600 seconds (1 hour) after verification.`,
      next_steps: [
        `Add CNAME record: ${fullHostname} CNAME ${verificationTarget}`,
        'Wait for DNS propagation (usually 5-15 minutes)',
        'We will automatically detect the CNAME and provision SSL certificate',
        'Your custom domain will be active once SSL is ready'
      ]
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to check DNS propagation across multiple resolvers
async function checkDNSPropagation(hostname: string, expectedTarget: string): Promise<{
  cloudflare: 'resolved' | 'pending' | 'failed';
  google: 'resolved' | 'pending' | 'failed';
  error?: string;
}> {
  const { promises: dns } = require('dns');
  const results: {
    cloudflare: 'resolved' | 'pending' | 'failed';
    google: 'resolved' | 'pending' | 'failed';
  } = { cloudflare: 'pending', google: 'pending' };

  try {
    // Check against Cloudflare DNS (1.1.1.1)
    try {
      dns.setServers(['1.1.1.1']);
      const cloudflareRecords = await dns.resolveCname(hostname);
      if (cloudflareRecords.includes(expectedTarget)) {
        results.cloudflare = 'resolved';
      } else {
        results.cloudflare = 'failed';
      }
    } catch {
      results.cloudflare = 'failed';
    }

    // Check against Google DNS (8.8.8.8)  
    try {
      dns.setServers(['8.8.8.8']);
      const googleRecords = await dns.resolveCname(hostname);
      if (googleRecords.includes(expectedTarget)) {
        results.google = 'resolved';
      } else {
        results.google = 'failed';
      }
    } catch {
      results.google = 'failed';
    }

    // Reset to default servers
    dns.setServers(['8.8.8.8', '1.1.1.1']);
    
  } catch (error) {
    return { 
      cloudflare: 'failed', 
      google: 'failed', 
      error: error instanceof Error ? error.message : 'DNS lookup failed' 
    };
  }

  return results;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }

    // Get tenant verification status with new CNAME fields
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        id,
        slug,
        name,
        domain,
        custom_subdomain,
        domain_verified,
        domain_verification_token,
        domain_verification_expires,
        domain_verified_at,
        domain_verification_attempts,
        domain_last_check,
        domain_status,
        ssl_status
      `)
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check if verification is expired
    let status = 'not_started';
    if (tenant.domain_verification_token) {
      const expiresAt = new Date(tenant.domain_verification_expires);
      const now = new Date();
      
      if (tenant.domain_verified) {
        status = 'verified';
      } else if (now > expiresAt) {
        status = 'expired';
      } else {
        status = 'pending';
      }
    }

    // If we have a verification in progress, check DNS propagation
    let dnsPropagation = null;
    if (status === 'pending' && tenant.domain && tenant.domain_verification_token) {
      const verificationTarget = `verify-${tenant.domain_verification_token}.${PLATFORM_DOMAIN}`;
      dnsPropagation = await checkDNSPropagation(tenant.domain, verificationTarget);
    }

    // Calculate next check time (5 minutes from last check, or now if never checked)
    let nextCheckAt = new Date();
    if (tenant.domain_last_check) {
      const lastCheck = new Date(tenant.domain_last_check);
      nextCheckAt = new Date(lastCheck.getTime() + 5 * 60 * 1000); // 5 minutes later
    }

    return NextResponse.json({
      success: true,
      domain: tenant.domain,
      subdomain: tenant.custom_subdomain || 'booking',
      status,
      domain_status: tenant.domain_status,
      ssl_status: tenant.ssl_status,
      dns_propagation: dnsPropagation,
      verified_at: tenant.domain_verified_at,
      verification_expires: tenant.domain_verification_expires,
      verification_attempts: tenant.domain_verification_attempts || 0,
      next_check_at: nextCheckAt.toISOString(),
      last_check_at: tenant.domain_last_check,
      verification_target: tenant.domain_verification_token ? 
        `verify-${tenant.domain_verification_token}.${PLATFORM_DOMAIN}` : null
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 