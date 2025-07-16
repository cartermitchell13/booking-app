'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { useTenantBranding } from '@/lib/tenant-context';

interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface BookingHeaderProps {
  tenant?: any;
  user?: AuthUser | null;
}

export function BookingHeader({ tenant, user }: BookingHeaderProps) {
  const branding = useTenantBranding();

  return (
    <header className="relative z-10 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/account"
              className="flex items-center hover:opacity-70 transition-colors"
              style={{ color: branding.textOnBackground }}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <Image
              src={branding.logo_url || "/images/black-pb-logo.png"}
              alt={tenant?.name || 'Logo'}
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </div>
          
          {user && (
            <div className="text-right">
              <p className="text-sm" style={{ color: branding.textOnBackground }}>Welcome back</p>
              <p 
                className="font-medium"
                style={{ color: branding.primary_color || '#10B981' }}
              >
                {user.first_name} {user.last_name}
              </p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 