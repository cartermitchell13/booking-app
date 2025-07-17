import { RouteType, RouteClassification, TenantDetectionMethod } from '@/types';

/**
 * Route Classification Utilities
 * 
 * These functions determine the type of route and appropriate tenant detection method:
 * - Customer routes: Use domain-based detection (subdomain/custom domain)
 * - Admin routes: Use auth-based detection (logged-in user's tenant_id)
 * - Platform routes: No tenant detection needed
 */

/**
 * Check if a route is a customer-facing route
 * Customer routes are tenant-branded and accessible to end users
 */
export function isCustomerRoute(pathname: string): boolean {
  // Customer routes are in the (customer) route group
  const customerRoutes = [
    '/',
    '/search',
    '/book',
    '/booking',
    '/trip',
    '/register/customer',
    '/register/operator',
    '/register/admin', // Admin registration but on customer domain
    '/account',
    '/contact',
    '/faq',
    '/help',
    '/booking-lookup',
    '/home' // Landing page
  ];

  // Check exact matches first
  if (customerRoutes.includes(pathname)) {
    return true;
  }

  // Check patterns for dynamic routes
  const customerPatterns = [
    /^\/trip\/[^\/]+$/,           // /trip/[id]
    /^\/booking\/[^\/]+$/,        // /booking/[tripId]
    /^\/account\/.*$/,            // /account/bookings, /account/profile, etc.
    /^\/register\/(customer|operator|admin)$/  // Registration pages
  ];

  return customerPatterns.some(pattern => pattern.test(pathname));
}

/**
 * Check if a route is an admin/dashboard route
 * Admin routes require authentication and should detect tenant from user
 */
export function isAdminRoute(pathname: string): boolean {
  // Admin routes are in the /dashboard path
  return pathname.startsWith('/dashboard');
}

/**
 * Check if a route is a platform route
 * Platform routes don't require tenant context
 */
export function isPlatformRoute(pathname: string): boolean {
  const platformRoutes = [
    '/login',
    '/register',
    '/admin',
    '/api',
    '/debug',
    '/onboard'
  ];

  // Check exact matches first
  if (platformRoutes.includes(pathname)) {
    return true;
  }

  // Check patterns for dynamic routes
  const platformPatterns = [
    /^\/admin\/.*$/,              // /admin/login, /admin/onboarding, etc.
    /^\/api\/.*$/,                // All API routes
    /^\/debug.*$/,                // Debug pages
    /^\/onboard\/.*$/,            // Onboarding flow
    /^\/reset-password.*$/,       // Password reset
    /^\/verify-email.*$/          // Email verification
  ];

  return platformPatterns.some(pattern => pattern.test(pathname));
}

/**
 * Get the route classification for a given pathname
 */
export function getRouteClassification(pathname: string): RouteClassification {
  if (isCustomerRoute(pathname)) {
    return {
      type: 'customer',
      requiresAuth: false, // Most customer routes don't require auth
      tenantDetectionMethod: 'domain'
    };
  }

  if (isAdminRoute(pathname)) {
    return {
      type: 'admin',
      requiresAuth: true, // Admin routes always require auth
      tenantDetectionMethod: 'auth'
    };
  }

  if (isPlatformRoute(pathname)) {
    return {
      type: 'platform',
      requiresAuth: false, // Platform routes handle auth individually
      tenantDetectionMethod: 'none'
    };
  }

  // Default to customer route with domain detection
  return {
    type: 'customer',
    requiresAuth: false,
    tenantDetectionMethod: 'domain'
  };
}

/**
 * Get the tenant detection method for a given pathname
 */
export function getTenantDetectionMethod(pathname: string): TenantDetectionMethod {
  const classification = getRouteClassification(pathname);
  
  if (classification.tenantDetectionMethod === 'none') {
    return 'domain'; // Default fallback
  }
  
  return classification.tenantDetectionMethod as TenantDetectionMethod;
}

/**
 * Get the route type for a given pathname
 */
export function getRouteType(pathname: string): RouteType {
  return getRouteClassification(pathname).type;
}

/**
 * Check if a route requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  return getRouteClassification(pathname).requiresAuth;
}

/**
 * Route classification helpers object
 */
export const routeClassificationHelpers = {
  isCustomerRoute,
  isAdminRoute,
  isPlatformRoute,
  getRouteClassification,
  getTenantDetectionMethod,
  getRouteType,
  requiresAuth
}; 