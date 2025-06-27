import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTenant } from '@/lib/tenant-context';

export interface RouteGuardOptions {
  /** Roles that are allowed to view this route. Omit for any authenticated user. */
  allowedRoles?: Array<'customer' | 'tenant_staff' | 'tenant_admin' | 'super_admin'>;
  /** If true (default) the user's `tenant_id` must equal current tenant (unless role is super_admin). */
  enforceTenantMatch?: boolean;
  /** Where to send unauthenticated or unauthorized users. Defaults to '/login'. */
  redirectTo?: string;
}

/**
 * useRouteGuard – client-side route protection hook.
 *
 * Example:
 *   const { isAllowed, isChecking } = useRouteGuard({
 *     allowedRoles: ['tenant_admin', 'tenant_staff'],
 *     redirectTo: '/login?redirect=/dashboard',
 *   });
 */
export function useRouteGuard(options: RouteGuardOptions = {}) {
  const { allowedRoles, redirectTo = '/login', enforceTenantMatch = true } = options;
  const { user, isLoading } = useAuth();
  const { tenant } = useTenant();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Only run when auth state settled
    if (isLoading) return;
    // Not authenticated → login
    if (!user) {
      // Preserve intended destination in redirect param
      const intended = encodeURIComponent(`${pathname}${searchParams?.toString() ? `?${searchParams}` : ''}`);
      router.push(`${redirectTo}?redirect=${intended}`);
      return;
    }

    // Tenant check (unless super_admin or disabled)
    if (enforceTenantMatch && user.role !== 'super_admin') {
      if (tenant?.id && user.tenant_id !== tenant.id) {
        router.push(`${redirectTo}?redirect=/`);
        return;
      }
    }

    // Role check if list provided
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Determine fallback destination
      const fallback = user.role === 'customer' ? '/account' : '/dashboard';
      router.push(fallback);
      return;
    }

    // Passed all checks
    setIsAllowed(true);
    setIsChecking(false);
  }, [isLoading, user, allowedRoles, router, redirectTo, tenant?.id, pathname, searchParams, enforceTenantMatch]);

  return { isAllowed, isChecking: isLoading || isChecking } as const;
} 