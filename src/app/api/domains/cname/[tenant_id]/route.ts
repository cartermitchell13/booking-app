import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use the same hardcoded values as the rest of the application
const supabaseUrl = 'https://zsdkqmlhnffoidwyygce.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(
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

    // Get tenant details
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select(`
        id,
        slug,
        name,
        domain,
        domain_verified,
        domain_verified_at,
        custom_subdomain
      `)
      .eq('id', tenant_id)
      .single();

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Check if domain verification is complete
    if (!tenant.domain_verified) {
      return NextResponse.json(
        { error: 'Domain must be verified before setting up CNAME. Please complete domain verification first.' },
        { status: 400 }
      );
    }

    if (!tenant.domain) {
      return NextResponse.json(
        { error: 'No domain configured for this tenant.' },
        { status: 400 }
      );
    }

    // Extract base domain (remove 'booking.' prefix if present)
    const baseDomain = tenant.domain.replace('booking.', '');
    const subdomain = tenant.custom_subdomain || 'booking';
    const fullCustomDomain = `${subdomain}.${baseDomain}`;

    // Platform target domain (this should be configurable in production)
    const platformDomain = process.env.PLATFORM_DOMAIN || 'your-platform.vercel.app';
    const cnameTarget = `${tenant.slug}.${platformDomain}`;

    // Generate detailed instructions
    const instructions = {
      step1: {
        title: "Create CNAME Record",
        description: `Add a CNAME record in your domain's DNS settings`,
        record: {
          type: "CNAME",
          name: subdomain,
          value: cnameTarget,
          ttl: "3600 (1 hour) or Auto"
        }
      },
      step2: {
        title: "Wait for DNS Propagation", 
        description: "DNS changes can take 5-60 minutes to propagate globally",
        note: "You can check if the CNAME is active by visiting your custom domain"
      },
      step3: {
        title: "SSL Certificate",
        description: "An SSL certificate will be automatically provisioned for your custom domain",
        note: "This process is automatic and typically takes 1-5 minutes after DNS propagation"
      }
    };

    // Generate provider-specific instructions
    const providerInstructions = {
      cloudflare: {
        provider: "Cloudflare",
        steps: [
          "Log in to your Cloudflare dashboard",
          "Select your domain",
          "Go to DNS section",
          "Click 'Add record'",
          `Set Type: CNAME, Name: ${subdomain}, Target: ${cnameTarget}`,
          "Set Proxy status to 'DNS only' (gray cloud)",
          "Click Save"
        ]
      },
      godaddy: {
        provider: "GoDaddy",
        steps: [
          "Log in to your GoDaddy account",
          "Go to DNS Management for your domain",
          "Click 'Add' to create a new record",
          `Set Type: CNAME, Host: ${subdomain}, Points to: ${cnameTarget}`,
          "Set TTL to 1 Hour",
          "Click Save"
        ]
      },
      namecheap: {
        provider: "Namecheap",
        steps: [
          "Log in to your Namecheap account",
          "Go to Domain List and click 'Manage' next to your domain",
          "Go to Advanced DNS tab",
          "Click 'Add New Record'",
          `Set Type: CNAME Record, Host: ${subdomain}, Value: ${cnameTarget}`,
          "Set TTL to Automatic",
          "Click the checkmark to save"
        ]
      },
      route53: {
        provider: "AWS Route 53",
        steps: [
          "Log in to AWS Console and go to Route 53",
          "Select your hosted zone",
          "Click 'Create Record'",
          `Record name: ${subdomain}`,
          "Record type: CNAME",
          `Value: ${cnameTarget}`,
          "TTL: 300",
          "Click 'Create records'"
        ]
      }
    };

    return NextResponse.json({
      success: true,
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        verified_at: tenant.domain_verified_at
      },
      domain_info: {
        base_domain: baseDomain,
        subdomain: subdomain,
        full_custom_domain: fullCustomDomain,
        platform_target: cnameTarget
      },
      cname_record: {
        type: "CNAME",
        name: subdomain,
        value: cnameTarget,
        description: `Point ${fullCustomDomain} to ${cnameTarget}`
      },
      instructions: instructions,
      provider_guides: providerInstructions,
      testing: {
        description: "Test your setup",
        methods: [
          {
            method: "Browser",
            instruction: `Visit https://${fullCustomDomain} to test your setup`
          },
          {
            method: "DNS Lookup",
            instruction: `Run: dig ${fullCustomDomain} to verify CNAME record`
          },
          {
            method: "SSL Check",
            instruction: `Verify SSL certificate is valid for ${fullCustomDomain}`
          }
        ]
      },
      troubleshooting: {
        common_issues: [
          {
            issue: "Domain not loading",
            solution: "Check if CNAME record is correctly set and DNS has propagated (can take up to 1 hour)"
          },
          {
            issue: "SSL certificate error",
            solution: "SSL certificates are automatically provisioned after DNS propagation. Wait 5-10 minutes after CNAME is active"
          },
          {
            issue: "404 or wrong content",
            solution: "Ensure you're using the exact CNAME target provided and contact support if issues persist"
          }
        ]
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 