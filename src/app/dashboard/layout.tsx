'use client';

import { useRouteGuard } from '@/hooks/useRouteGuard';
import TenantAdminSidebar from '@/components/tenant-admin/TenantAdminSidebar';
import TenantAdminHeader from '@/components/tenant-admin/TenantAdminHeader';

export default function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAllowed, isChecking } = useRouteGuard({
    allowedRoles: ['tenant_admin', 'tenant_staff', 'super_admin'],
    redirectTo: '/login',
  });

  if (isChecking) {
    return (
      <div className="flex h-screen bg-gray-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAllowed) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      <TenantAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TenantAdminHeader />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 