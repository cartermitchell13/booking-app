'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GeistSans } from 'geist/font/sans';
import { 
  Building, 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  UserCog,
  Plus,
  HelpCircle,
  Shield
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: BarChart3,
    description: 'Platform Overview & Analytics'
  },
  {
    name: 'Tenants',
    href: '/admin/tenants',
    icon: Building,
    description: 'Manage Client Accounts'
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Platform User Management'
  },
  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
    description: 'Billing & Plans'
  },
  {
    name: 'Onboarding',
    href: '/admin/onboarding',
    icon: Plus,
    description: 'New Tenant Setup'
  },
  {
    name: 'Support',
    href: '/admin/support',
    icon: HelpCircle,
    description: 'Customer Support'
  },
  {
    name: 'Platform Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'System Configuration'
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen ${GeistSans.className}`}>
      {/* Platform Logo & Info */}
      <div className="flex flex-col items-center px-6 py-6 border-b border-gray-200">
        <Shield className="w-20 h-20 text-blue-600 mb-2 flex-shrink-0" />
        <div className="text-center">
          <h1 className="text-gray-900 font-bold text-lg">Platform Admin</h1>
          <p className="text-gray-500 text-sm">Multi-Tenant SaaS</p>
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

      {/* Platform Status */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-900">
              Super Admin Access
            </span>
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
              Active
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Full platform administration
          </div>
        </div>
      </div>
    </div>
  );
} 