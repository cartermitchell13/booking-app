'use client';

import CustomerNavbar from '@/components/customer/CustomerNavbar';
import { useTenantBranding } from '@/lib/tenant-context';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const branding = useTenantBranding();

  return (
    <div style={{
      '--primary-color': branding.primary_color,
      '--secondary-color': branding.secondary_color,
      backgroundColor: branding.background_color,
      color: branding.getOptimalTextColor(branding.background_color),
    } as React.CSSProperties}>
      <CustomerNavbar />
      <main>{children}</main>
    </div>
  );
} 