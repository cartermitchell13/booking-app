'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GeistSans } from 'geist/font/sans';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Settings, 
  Palette,
  CreditCard,
  FileText,
  MessageSquare,
  Building2
} from 'lucide-react';

interface TenantProps {
  tenant?: {
    id: string;
    name: string;
    branding?: {
      primary_color?: string;
      secondary_color?: string;
      logo_url?: string;
    };
    subscription_plan?: string;
  } | null;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Overview & Analytics'
  },
  {
    name: 'Offerings',
    href: '/dashboard/offerings',
    icon: Calendar,
    description: 'Manage Your Offerings'
  },
  {
    name: 'Bookings',
    href: '/dashboard/bookings',
    icon: FileText,
    description: 'Customer Bookings'
  },
  {
    name: 'Customers',
    href: '/dashboard/customers',
    icon: Users,
    description: 'Customer Management'
  },
  {
    name: 'Team',
    href: '/dashboard/team',
    icon: Building2,
    description: 'Staff & Permissions'
  },
  {
    name: 'Branding',
    href: '/dashboard/branding',
    icon: Palette,
    description: 'Brand Customization'
  },
  {
    name: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
    description: 'Subscription & Billing'
  },
  {
    name: 'Support',
    href: '/dashboard/support',
    icon: MessageSquare,
    description: 'Help & Support'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account Settings'
  },
];

export default function TenantAdminSidebar({ tenant }: TenantProps) {
  const pathname = usePathname();

  return (
    <div className={`w-64 bg-white shadow-lg border-r border-gray-200 ${GeistSans.className}`}>
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex flex-col items-center px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col items-center">
            {tenant?.branding?.logo_url ? (
              <img
                src={tenant.branding.logo_url}
                alt={`${tenant.name} logo`}
                className="h-10 w-auto mb-2"
              />
            ) : (
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center mb-2">
                <Building2 className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-4 w-4',
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  )}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {tenant?.subscription_plan 
                ? `${tenant.subscription_plan.charAt(0).toUpperCase()}${tenant.subscription_plan.slice(1)} Plan`
                : 'Free Plan'
              }
            </div>
            <Link
              href="/dashboard/billing"
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 