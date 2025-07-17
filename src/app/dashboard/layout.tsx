'use client';

import { useEffect, useState } from 'react';
import { GeistSans } from 'geist/font/sans';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import TenantAdminSidebar from '@/components/tenant-admin/TenantAdminSidebar';
import TenantAdminHeader from '@/components/tenant-admin/TenantAdminHeader';

interface DashboardTenant {
  id: string;
  name: string;
  branding?: {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
  };
  subscription_plan?: string;
}

export default function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [tenant, setTenant] = useState<DashboardTenant | null>(null);
  const [tenantLoading, setTenantLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch tenant data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.tenant_id && !tenant) {
      const fetchTenant = async () => {
        try {
          console.log('[Dashboard] Fetching tenant data for:', user.tenant_id);
          
          const { data, error } = await supabase
            .from('tenants')
            .select('id, name, branding, subscription_plan')
            .eq('id', user.tenant_id)
            .single();

          if (error) {
            console.error('[Dashboard] Tenant fetch error:', error);
            setError('Failed to load tenant information');
          } else {
            console.log('[Dashboard] Tenant loaded:', data.name);
            setTenant(data);
          }
        } catch (err) {
          console.error('[Dashboard] Tenant fetch exception:', err);
          setError('Failed to load tenant information');
        } finally {
          setTenantLoading(false);
        }
      };

      fetchTenant();
    } else if (!isAuthenticated && !authLoading) {
      setTenantLoading(false);
    }
  }, [isAuthenticated, user?.tenant_id, tenant, authLoading]);

  console.log('[Dashboard Layout] State:', {
    authLoading,
    tenantLoading,
    isAuthenticated,
    user: user ? { id: user.id, role: user.role, tenant_id: user.tenant_id } : null,
    tenant: tenant ? { id: tenant.id, name: tenant.name } : null,
    error
  });

  // Show loading state while checking authentication or tenant
  if (authLoading || tenantLoading) {
    return (
      <div className={`flex h-screen bg-gray-100 geist-dashboard ${GeistSans.className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <div className={`flex h-screen bg-gray-100 geist-dashboard ${GeistSans.className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Authentication Required</h3>
              <p className="text-blue-600 text-sm mb-4">Please log in to access the dashboard.</p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has appropriate role for dashboard access
  if (user && !['tenant_admin', 'tenant_staff', 'super_admin'].includes(user.role)) {
    return (
      <div className={`flex h-screen bg-gray-100 geist-dashboard ${GeistSans.className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Access Denied</h3>
              <p className="text-yellow-600 text-sm mb-4">
                You don't have permission to access the dashboard. Contact your administrator if you believe this is an error.
              </p>
              <p className="text-yellow-500 text-xs mb-4">
                Current role: {user.role}
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-700"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if tenant could not be loaded (but user is authenticated)
  if (error || !tenant) {
    return (
      <div className={`flex h-screen bg-gray-100 geist-dashboard ${GeistSans.className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-medium text-red-800 mb-2">Tenant Access Error</h3>
              <p className="text-red-600 text-sm mb-4">
                {error || 'Unable to load your organization data. Please try again or contact support.'}
              </p>
              {user?.tenant_id && (
                <p className="text-red-500 text-xs mb-4">
                  User tenant ID: {user.tenant_id}
                </p>
              )}
              <div className="flex gap-2 justify-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Retry
                </button>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700"
                >
                  Re-login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - render dashboard with simple tenant data
  return (
    <div className={`flex h-screen bg-gray-100 geist-dashboard ${GeistSans.className}`}>
      <TenantAdminSidebar tenant={tenant} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TenantAdminHeader tenant={tenant} />
        <main className={`flex-1 overflow-y-auto geist-dashboard ${GeistSans.className}`}>
          <div className={`geist-dashboard ${GeistSans.className}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 