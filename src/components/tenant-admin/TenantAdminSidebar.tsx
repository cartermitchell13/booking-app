'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTenant } from '@/lib/tenant-context';
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
    description: 'Customize Appearance'
  },
  {
    name: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
    description: 'Subscription & Payments'
  },
  {
    name: 'Support',
    href: '/dashboard/support',
    icon: MessageSquare,
    description: 'Help & Contact'
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Business Configuration'
  },
];

export default function TenantAdminSidebar() {
  const pathname = usePathname();
  const { tenant, isLoading } = useTenant();

  if (isLoading) {
    return (
      <div className={`flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen ${GeistSans.className}`}>
        <div className="animate-pulse p-6">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen ${GeistSans.className}`}>
      {/* Tenant Logo & Info */}
      <div className="flex flex-col items-center px-6 py-0 border-b border-gray-200">
        {tenant?.branding?.logo_url ? (
          <div className="w-24 h-24 -mb-6 flex-shrink-0">
            <img 
              src={tenant.branding.logo_url} 
              alt={`${tenant.name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <Building2 className="w-20 h-20 text-gray-600 -mb-1 flex-shrink-0" />
        )}
        <div className="text-center">
          <p className="text-gray-500 text-sm">Admin Dashboard</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'
                    )}
                  />
                  <div>
                    <div className={cn(
                      'font-medium',
                      isActive ? 'text-blue-700' : 'text-gray-900'
                    )}>
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Tenant Plan Info */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">
              {tenant?.subscription_plan 
                ? `${tenant.subscription_plan.charAt(0).toUpperCase()}${tenant.subscription_plan.slice(1)} Plan`
                : 'Free Plan'
              }
            </span>
            <span className={cn(
              'px-2 py-1 text-xs rounded-full',
              tenant?.subscription_status === 'active' 
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            )}>
              {tenant?.subscription_status || 'inactive'}
            </span>
          </div>
          <Link 
            href="/dashboard/billing"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            Manage Subscription →
          </Link>
        </div>
      </div>
    </div>
  );
} 