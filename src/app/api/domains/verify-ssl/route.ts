import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * SSL Verification Endpoint for Caddy On-Demand TLS
 * 
 * This endpoint is called by Caddy before issuing SSL certificates
 * to verify that the domain is registered and verified in our system.
 * 
 * Security: This prevents unauthorized SSL certificate generation for unregistered domains
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')

    if (!domain) {
      console.log('SSL verification failed: No domain parameter provided')
      return NextResponse.json({ error: 'Domain parameter required' }, { status: 400 })
    }

    console.log(`SSL verification request for domain: ${domain}`)

    // Check if domain is registered and verified in our system
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, domain, domain_verified, subscription_status, subscription_plan')
      .or(`domain.eq.${domain},domain.eq.${domain.split('.').slice(1).join('.')}`)
      .eq('domain_verified', true)
      .single()

    if (error || !tenant) {
      console.log(`SSL verification failed: Domain ${domain} not found or not verified`, error)
      return NextResponse.json({ error: 'Domain not authorized' }, { status: 403 })
    }

    // Additional security checks
    if (tenant.subscription_status === 'cancelled' || tenant.subscription_status === 'suspended') {
      console.log(`SSL verification failed: Tenant ${tenant.name} has inactive subscription`)
      return NextResponse.json({ error: 'Subscription inactive' }, { status: 403 })
    }

    // Check if tenant's plan supports custom domains
    const plansWithCustomDomains = ['professional', 'enterprise']
    if (!plansWithCustomDomains.includes(tenant.subscription_plan)) {
      console.log(`SSL verification failed: Tenant ${tenant.name} plan ${tenant.subscription_plan} doesn't support custom domains`)
      return NextResponse.json({ error: 'Plan does not support custom domains' }, { status: 403 })
    }

    // Log successful verification for monitoring
    console.log(`SSL verification successful: Domain ${domain} authorized for tenant ${tenant.name}`)

    // Update SSL status in database
    await supabase
      .from('tenants')
      .update({ 
        ssl_status: 'provisioned',
        domain_last_check: new Date().toISOString()
      })
      .eq('id', tenant.id)

    // Return success response for Caddy
    return NextResponse.json({ 
      authorized: true,
      tenant_id: tenant.id,
      tenant_name: tenant.name,
      domain: domain
    }, { status: 200 })

  } catch (error) {
    console.error('SSL verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Health check endpoint for Caddy
 */
export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 })
} 