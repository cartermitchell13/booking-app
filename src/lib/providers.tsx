'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { TenantProvider, useTenantBranding } from './tenant-context'
import { AuthProvider } from './auth-context'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Component to apply tenant branding globally
function BrandingApplier() {
  useTenantBranding(); // This hook applies the CSS variables
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TenantProvider>
          <AuthProvider>
            <BrandingApplier />
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </AuthProvider>
        </TenantProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
} 