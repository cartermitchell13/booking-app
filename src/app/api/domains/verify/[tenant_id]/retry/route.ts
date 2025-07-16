import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { promises as dns } from 'dns';

// Use the same hardcoded values as the rest of the application
const supabaseUrl = 'https://zsdkqmlhnffoidwyygce.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Platform domain - should match the main verify endpoint
const PLATFORM_DOMAIN = process.env.PLATFORM_DOMAIN || 'parkbus-platform.vercel.app';

// Helper function to check CNAME record resolution
async function checkCNAMERecord(hostname: string, expectedTarget: string): Promise<{
  found: boolean;
  actualTarget?: string;
  conflicts?: string[];
  error?: string;
}> {
  try {
    const cnameRecords = await dns.resolveCname(hostname);
    
    // Check if our verification target is in the CNAME records
    const foundTarget = cnameRecords.find(record => record === expectedTarget);
    
    if (foundTarget) {
      return { found: true, actualTarget: foundTarget };
    }
    
    // If not found, check for conflicts (other CNAME records)
    const conflicts = cnameRecords.filter(record => record !== expectedTarget);
    
    return { 
      found: false, 
      actualTarget: cnameRecords[0] || 'No CNAME record found',
      conflicts: conflicts.length > 0 ? conflicts : undefined
    };
    
  } catch (error) {
    return { 
      found: false, 
      error: error instanceof Error ? error.message : 'CNAME lookup failed' 
    };
  }
}

// Helper function to check DNS SOA for conflict detection
async function checkDNSConflicts(hostname: string): Promise<{
  hasConflicts: boolean;
  existingRecords?: any[];
  error?: string;
}> {
  try {
    // Try to resolve different record types to detect conflicts
    const conflicts = [];
    
    try {
      const aRecords = await dns.resolve4(hostname);
      if (aRecords.length > 0) {
        conflicts.push({ type: 'A', records: aRecords });
      }
    } catch {}
    
    try {
      const aaaaRecords = await dns.resolve6(hostname);
      if (aaaaRecords.length > 0) {
        conflicts.push({ type: 'AAAA', records: aaaaRecords });
      }
    } catch {}
    
    try {
      const txtRecords = await dns.resolveTxt(hostname);
      if (txtRecords.length > 0) {
        conflicts.push({ type: 'TXT', records: txtRecords });
      }
    } catch {}
    
    return {
      hasConflicts: conflicts.length > 0,
      existingRecords: conflicts.length > 0 ? conflicts : undefined
    };
    
  } catch (error) {
    return {
      hasConflicts: false,
      error: error instanceof Error ? error.message : 'DNS conflict check failed'
    };
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { tenant_id: string } }
) {
  try {
    const { tenant_id } = params;

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }

    // Get tenant verification details with new CNAME fields
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

    // Check if already verified
    if (tenant.domain_verified) {
      return NextResponse.json({
        success: true,
        status: 'already_verified',
        message: 'Domain is already verified',
        domain_status: tenant.domain_status,
        ssl_status: tenant.ssl_status
      });
    }

    // Check if verification token exists
    if (!tenant.domain_verification_token) {
      return NextResponse.json(
        { error: 'No verification in progress. Please initiate domain verification first.' },
        { status: 400 }
      );
    }

    // Check if verification has expired
    const expiresAt = new Date(tenant.domain_verification_expires);
    const now = new Date();
    
    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification has expired. Please initiate a new verification.' },
        { status: 400 }
      );
    }

    // Rate limiting: max 5 attempts per hour
    const attempts = tenant.domain_verification_attempts || 0;
    if (attempts >= 5) {
      const lastCheck = new Date(tenant.domain_last_check || 0);
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      if (lastCheck > oneHourAgo) {
        return NextResponse.json(
          { error: 'Too many verification attempts. Please wait before trying again.' },
          { status: 429 }
        );
      }
      
      // Reset attempts if it's been more than an hour
      await supabase
        .from('tenants')
        .update({ domain_verification_attempts: 0 })
        .eq('id', tenant_id);
    }

    // Construct verification target
    const verificationTarget = `verify-${tenant.domain_verification_token}.${PLATFORM_DOMAIN}`;
    const hostname = tenant.domain || '';

    // Check for DNS conflicts first
    const conflictCheck = await checkDNSConflicts(hostname);
    
    // Check CNAME record
    const cnameResult = await checkCNAMERecord(hostname, verificationTarget);

    // Update verification attempts and last check time
    const newAttempts = (tenant.domain_verification_attempts || 0) + 1;
    
    if (cnameResult.found) {
      // Verification successful - update tenant to verified status
      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          domain_verified: true,
          domain_verified_at: now.toISOString(),
          domain_last_check: now.toISOString(),
          domain_verification_attempts: newAttempts,
          domain_status: 'verified',
          ssl_status: 'provisioned' // SSL will be provisioned next
        })
        .eq('id', tenant_id);

      if (updateError) {
        console.error('Error updating tenant verification status:', updateError);
        return NextResponse.json(
          { error: 'Failed to update verification status' },
          { status: 500 }
        );
      }

      // Log successful verification
      try {
        await supabase
          .from('domain_verification_logs')
          .insert({
            tenant_id,
            domain: hostname.split('.').slice(-2).join('.'), // Extract base domain
            subdomain: tenant.custom_subdomain || 'booking',
            verification_target: verificationTarget,
            verification_method: 'cname',
            verification_token: tenant.domain_verification_token,
            status: 'verified',
            dns_propagation: { cname_resolved: true },
            ssl_status: 'provisioned'
          });
      } catch (logError) {
        console.warn('Failed to log verification success:', logError);
      }

      return NextResponse.json({
        success: true,
        status: 'verified',
        message: 'Domain verification successful! SSL certificate provisioning will begin shortly.',
        verified_at: now.toISOString(),
        domain_status: 'verified',
        ssl_status: 'provisioned',
        next_steps: [
          'DNS verification complete ✓',
          'SSL certificate provisioning in progress...',
          'Domain will be fully active once SSL is ready (typically 2-5 minutes)'
        ]
      });

    } else {
      // Verification failed - log conflicts if any
      if (conflictCheck.hasConflicts || cnameResult.conflicts) {
        try {
          await supabase
            .from('domain_conflicts')
            .insert({
              hostname,
              existing_records: {
                dns_conflicts: conflictCheck.existingRecords || [],
                cname_conflicts: cnameResult.conflicts || []
              },
              tenant_id
            });
        } catch (logError) {
          console.warn('Failed to log domain conflicts:', logError);
        }
      }

      // Update tenant with failed attempt
      const { error: updateError } = await supabase
        .from('tenants')
        .update({
          domain_last_check: now.toISOString(),
          domain_verification_attempts: newAttempts
        })
        .eq('id', tenant_id);

      if (updateError) {
        console.error('Error updating tenant verification attempts:', updateError);
      }

      // Log failed verification
      try {
        await supabase
          .from('domain_verification_logs')
          .insert({
            tenant_id,
            domain: hostname.split('.').slice(-2).join('.'),
            subdomain: tenant.custom_subdomain || 'booking',
            verification_target: verificationTarget,
            verification_method: 'cname',
            verification_token: tenant.domain_verification_token,
            status: (conflictCheck.hasConflicts || cnameResult.conflicts) ? 'conflicted' : 'failed',
            dns_propagation: { 
              cname_resolved: false,
              actual_target: cnameResult.actualTarget 
            },
            ssl_status: 'pending',
            error_message: cnameResult.error || 'CNAME record not found or incorrect'
          });
      } catch (logError) {
        console.warn('Failed to log verification failure:', logError);
      }

      return NextResponse.json({
        success: false,
        status: 'verification_failed',
        message: 'Domain verification failed. Please check your CNAME record.',
        expected_record: {
          type: 'CNAME',
          name: hostname,
          target: verificationTarget
        },
        actual_target: cnameResult.actualTarget,
        conflicts: cnameResult.conflicts || [],
        dns_conflicts: conflictCheck.existingRecords || [],
        error: cnameResult.error,
        attempts_remaining: Math.max(0, 5 - newAttempts),
        next_retry_after: new Date(now.getTime() + 5 * 60 * 1000).toISOString(), // 5 minutes
        troubleshooting: {
          common_issues: [
            'CNAME record not created or incorrect target',
            'DNS propagation still in progress (can take 5-60 minutes)',
            'Conflicting DNS records (A, AAAA, other CNAME)',
            'TTL too high causing slow propagation'
          ],
          suggested_actions: [
            `Verify CNAME record: ${hostname} → ${verificationTarget}`,
            'Check DNS propagation status with online tools',
            'Ensure no conflicting A or AAAA records exist',
            'Consider lowering TTL to 300 seconds during setup'
          ]
        }
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 