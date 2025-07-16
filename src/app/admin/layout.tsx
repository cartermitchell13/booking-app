'use client';

import { GeistSans } from 'geist/font/sans';
import { useRouteGuard } from '@/hooks/useRouteGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAllowed, isChecking } = useRouteGuard({
    allowedRoles: ['super_admin'],
    redirectTo: '/login',
  });

  if (isChecking) {
    return (
      <div className={`flex h-screen bg-gray-100 geist-dashboard ${GeistSans.className}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAllowed) return null;

  return (
    <div className={`flex h-screen bg-gray-100 geist-dashboard ${GeistSans.className}`}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className={`flex-1 overflow-y-auto geist-dashboard ${GeistSans.className}`}>
          <div className={`geist-dashboard ${GeistSans.className}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 