import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useTenant } from '@/lib/tenant-context';

export function useRouteGuard() {
  const [isNavigating, setIsNavigating] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { tenant, isLoading: tenantLoading } = useTenant()

  useEffect(() => {
    // Set navigating state when route changes
    setIsNavigating(true)
    
    // Clear navigating state after a short delay
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  // Consider the app ready when tenant is loaded and not navigating
  const isReady = !tenantLoading && !isNavigating && !!tenant

  return {
    isNavigating,
    isReady,
    tenant,
    tenantLoading
  }
} 