import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Health Check Endpoint
 * 
 * This endpoint is used by:
 * - Caddy reverse proxy for health checks
 * - Monitoring systems
 * - Load balancers
 */
export async function GET() {
  try {
    // Check database connectivity
    const { data, error } = await supabase
      .from('tenants')
      .select('id')
      .limit(1)

    if (error) {
      console.error('Health check failed - database error:', error)
      return NextResponse.json({ 
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    // Return healthy status
    return NextResponse.json({ 
      status: 'healthy',
      service: 'parkbus-multi-tenant',
      version: process.env.npm_package_version || '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected'
    }, { status: 200 })

  } catch (error) {
    console.error('Health check error:', error)
    return NextResponse.json({ 
      status: 'unhealthy',
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Support HEAD requests for basic health checks
export async function HEAD() {
  try {
    // Quick health check without database query
    return new NextResponse(null, { status: 200 })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
} 