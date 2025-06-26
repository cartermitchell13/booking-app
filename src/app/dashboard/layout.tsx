'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import TenantAdminSidebar from '@/components/tenant-admin/TenantAdminSidebar';
import TenantAdminHeader from '@/components/tenant-admin/TenantAdminHeader';

export default function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading) {
        if (!user) {
          router.push('/login?redirect=/dashboard');
          return;
        }
        
        // Check if user has admin permissions
        if (user.role !== 'tenant_admin' && user.role !== 'super_admin') {
          router.push('/account');
          return;
        }
        
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading || isChecking) {
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

  // Don't render dashboard if user is not authenticated or doesn't have permission
  // TEMPORARY: Allow all authenticated users for testing
  // if (!user || (user.role !== 'tenant_admin' && user.role !== 'super_admin')) {
  //   return null;
  // }
  if (!user) {
    return null;
  }

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