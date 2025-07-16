import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

// Use the same hardcoded values as the rest of the application
const supabaseUrl = 'https://zsdkqmlhnffoidwyygce.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Platform domain - should match other endpoints
const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || 'parkbus-platform.vercel.app';

/**
 * Domain Activation Endpoint
 * 
 * This handles the final step of custom domain setup:
 * 1. Customer has completed domain verification
 * 2. SSL certificate has been provisioned 
 * 3. Now customer updates CNAME to activate the domain
 * 
 * The flow:
 * - Verification: booking.parkbus.com CNAME verify-token.platform.com
 * - Activation: booking.parkbus.com CNAME parkbus.platform.com (or platform.com)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { tenant_id: string } }
) {
  try {
    const { tenant_id } = params;

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    // Get tenant information
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        id,
        name,
        slug,
        domain,
        custom_subdomain,
        domain_verified,
        ssl_status,
        domain_status,
        subscription_plan
      `)
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check if domain is verified
    if (!tenant.domain_verified) {
      return NextResponse.json({
        status: 'pending_verification',
        message: 'Domain must be verified before activation',
        next_step: 'Complete domain verification first'
      });
    }

    // Check if SSL is ready
    if (tenant.ssl_status !== 'active' && tenant.ssl_status !== 'provisioned') {
      return NextResponse.json({
        status: 'pending_ssl',
        message: 'SSL certificate is still being provisioned',
        ssl_status: tenant.ssl_status,
        next_step: 'Wait for SSL certificate to be provisioned'
      });
    }

    // Generate the final CNAME target
    const finalCnameTarget = process.env.NODE_ENV === 'production' 
      ? process.env.PLATFORM_DOMAIN || 'yourplatform.com'
      : 'localhost:3000';

    // The customer's custom domain
    const customDomain = `${tenant.custom_subdomain || 'booking'}.${tenant.domain}`;

    // Check if domain is already active by testing DNS resolution
    const isLive = await checkDomainLiveStatus(customDomain, finalCnameTarget);

    if (isLive) {
      // Domain is live! Update status in database
      await supabase
        .from('tenants')
        .update({
          domain_status: 'active',
          domain_last_check: new Date().toISOString()
        })
        .eq('id', tenant_id);

      return NextResponse.json({
        status: 'active',
        message: 'Custom domain is live and ready!',
        custom_domain: customDomain,
        final_cname_target: finalCnameTarget,
        ssl_certificate: 'active',
        ready_for_traffic: true,
        test_url: `https://${customDomain}`,
        next_step: 'Domain is ready - customers can visit your custom domain'
      });
    } else {
      // Domain not live yet - provide activation instructions
      return NextResponse.json({
        status: 'ready_for_activation',
        message: 'Domain verified and SSL ready - update CNAME to activate',
        instructions: {
          step: 'Update your DNS CNAME record',
          current_record: `${customDomain} CNAME verify-*.yourplatform.com`,
          new_record: `${customDomain} CNAME ${finalCnameTarget}`,
          ttl_recommendation: '300 seconds (5 minutes) during setup'
        },
        custom_domain: customDomain,
        final_cname_target: finalCnameTarget,
        ssl_status: tenant.ssl_status,
        estimated_propagation: '5-15 minutes',
        next_step: 'Update CNAME record at your DNS provider'
      });
    }

  } catch (error) {
    console.error('Domain activation check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check domain activation status' },
      { status: 500 }
    );
  }
}

/**
 * Manually trigger domain activation check
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { tenant_id: string } }
) {
  try {
    const { tenant_id } = params;

    // Get tenant info
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('domain, custom_subdomain, domain_verified, ssl_status')
      .eq('id', tenant_id)
      .single();

    if (error || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    if (!tenant.domain_verified) {
      return NextResponse.json(
        { error: 'Domain must be verified first' },
        { status: 400 }
      );
    }

    const customDomain = `${tenant.custom_subdomain || 'booking'}.${tenant.domain}`;
    const finalTarget = process.env.PLATFORM_DOMAIN || 'yourplatform.com';

    // Force check domain status
    const isLive = await checkDomainLiveStatus(customDomain, finalTarget);

    if (isLive) {
      // Update database
      await supabase
        .from('tenants')
        .update({
          domain_status: 'active',
          domain_last_check: new Date().toISOString()
        })
        .eq('id', tenant_id);

      return NextResponse.json({
        status: 'activated',
        message: 'Domain is now live!',
        custom_domain: customDomain,
        test_url: `https://${customDomain}`
      });
    } else {
      return NextResponse.json({
        status: 'not_ready',
        message: 'Domain not yet pointing to platform',
        custom_domain: customDomain,
        expected_cname: finalTarget,
        next_step: 'Check DNS propagation and try again'
      });
    }

  } catch (error) {
    console.error('Manual domain activation failed:', error);
    return NextResponse.json(
      { error: 'Failed to activate domain' },
      { status: 500 }
    );
  }
}

/**
 * Check if custom domain is live by testing DNS resolution
 */
async function checkDomainLiveStatus(hostname: string, expectedTarget: string): Promise<boolean> {
  try {
    // In a real implementation, you'd use DNS lookup libraries
    // For now, we'll use a simplified check
    
    if (process.env.NODE_ENV === 'development') {
      // In development, assume domains are live for testing
      return Math.random() > 0.5; // Simulate 50% chance for demo
    }

    // In production, implement actual DNS checking
    // This would use libraries like 'dns' module or external services
    const { lookup } = require('dns').promises;
    
    try {
      const addresses = await lookup(hostname);
      // In a real implementation, you'd check if the IP matches your platform
      return addresses && addresses.length > 0;
    } catch (dnsError) {
      const errorMessage = dnsError instanceof Error ? dnsError.message : String(dnsError);
      console.log(`DNS lookup failed for ${hostname}:`, errorMessage);
      return false;
    }

  } catch (error) {
    console.error('Domain status check failed:', error);
    return false;
  }
} 