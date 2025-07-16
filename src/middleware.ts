import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Production domains - update these to match your actual domain
const MAIN_DOMAIN = 'yourbookingplatform.com' // Webflow landing page
const APP_DOMAIN = 'app.yourbookingplatform.com' // Next.js application
const ADMIN_DOMAIN = 'admin.yourbookingplatform.com' // Admin dashboard

// Development domains - using .localhost for easy local development
const DEV_ADMIN_DOMAIN = 'admin.localhost:3000'
const DEV_APP_DOMAIN = 'app.localhost:3000'
const DEV_PLATFORM_DOMAIN = 'localhost:3000'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // Skip middleware for static assets, API routes, and specific pages
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon.ico') ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  console.log(`[Middleware] ${request.method} ${hostname}${pathname}`)

  // Parse hostname for subdomain detection
  const parts = hostname.split('.')
  const subdomain = parts.length > 1 ? parts[0] : null
  const isLocalhost = hostname.includes('localhost')

  // Check if request is for the main marketing site (should redirect to Webflow)
  const isMarketingSite = (
    hostname === MAIN_DOMAIN || 
    hostname === `www.${MAIN_DOMAIN}` ||
    (isLocalhost && hostname === DEV_PLATFORM_DOMAIN && pathname === '/')
  )

  // Check if request is for the app subdomain
  const isAppSite = (
    hostname === APP_DOMAIN || 
    (isLocalhost && hostname === DEV_APP_DOMAIN) ||
    (isLocalhost && hostname === DEV_PLATFORM_DOMAIN && pathname.startsWith('/app'))
  )
  
  // Check if request is for the admin dashboard
  const isAdminSite = (
    hostname === ADMIN_DOMAIN || 
    (isLocalhost && hostname === DEV_ADMIN_DOMAIN) ||
    subdomain === 'admin'
  )

  // Handle main marketing site requests
  if (isMarketingSite) {
    console.log(`[Middleware] Marketing site request - should be handled by Webflow`)
    
    // In development, serve the current landing page
    if (isLocalhost) {
      url.pathname = '/home'
      return NextResponse.rewrite(url)
    }
    
    // In production, this would be handled by your DNS/proxy to route to Webflow
    // For now, redirect to the app
    return NextResponse.redirect(`https://${APP_DOMAIN}`)
  }

  // Handle app subdomain requests
  if (isAppSite) {
    console.log(`[Middleware] App site request: ${pathname}`)
    
    // If using path-based routing, strip /app prefix
    if (pathname.startsWith('/app')) {
      url.pathname = pathname.replace('/app', '') || '/'
      return NextResponse.rewrite(url)
    }
    
    // Default landing for app subdomain
    if (pathname === '/') {
      url.pathname = '/register/operator' // or whatever your main app entry is
      return NextResponse.rewrite(url)
    }
    
    return NextResponse.next()
  }
  
  // Handle admin dashboard requests
  if (isAdminSite) {
    console.log(`[Middleware] Admin site request: ${pathname}`)
    return NextResponse.next()
  }

  // If none of the above, treat as tenant site (booking.tenantname.com)
  console.log(`[Middleware] Tenant site request: ${hostname} (subdomain: ${subdomain})`)
  
  const response = NextResponse.next()
  response.headers.set('x-tenant-hostname', hostname)
  if (subdomain && subdomain !== 'www') {
    response.headers.set('x-tenant-subdomain', subdomain)
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 