import TenantAdminSidebar from '@/components/tenant-admin/TenantAdminSidebar';
import TenantAdminHeader from '@/components/tenant-admin/TenantAdminHeader';

export default function TenantAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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