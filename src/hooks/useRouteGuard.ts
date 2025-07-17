import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTenant } from '@/lib/tenant-context';
import { useAuth } from '@/lib/auth-context';
import { getRouteClassification } from '@/lib/route-classification';

export function useRouteGuard() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { tenant, isLoading: tenantLoading, detectionMethod, routeType } = useTenant();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  // Get route classification
  const routeClassification = getRouteClassification(pathname);

  useEffect(() => {
    // Set navigating state when route changes
    setIsNavigating(true);
    
    // Clear navigating state after a short delay
    const timer = setTimeout(() => {
      setIsNavigating(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Determine if the app is ready based on route requirements
  const isReady = (() => {
    // Always wait for navigation to complete
    if (isNavigating) return false;

    // For admin routes, need both auth and tenant
    if (routeClassification.type === 'admin') {
      return !authLoading && !tenantLoading && isAuthenticated && !!tenant;
    }

    // For customer routes, only need tenant (if using domain detection)
    if (routeClassification.type === 'customer') {
      return !tenantLoading;
    }

    // For platform routes, ready when auth is loaded (tenant not required)
    if (routeClassification.type === 'platform') {
      return !authLoading;
    }

    return false;
  })();

  // Determine if current user has access to current route
  const hasAccess = (() => {
    if (!isReady) return false;

    // Admin routes require authentication and proper role
    if (routeClassification.type === 'admin') {
      return isAuthenticated && 
             user && 
             ['tenant_admin', 'tenant_staff', 'super_admin'].includes(user.role) &&
             !!tenant;
    }

    // Customer routes are generally accessible
    if (routeClassification.type === 'customer') {
      return true;
    }

    // Platform routes handle access individually
    if (routeClassification.type === 'platform') {
      return true;
    }

    return false;
  })();

  return {
    isNavigating,
    isReady,
    hasAccess,
    tenant,
    tenantLoading,
    authLoading,
    isAuthenticated,
    user,
    routeClassification,
    detectionMethod,
    routeType
  };
} 