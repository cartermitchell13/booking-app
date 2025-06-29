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
  },
  {
    name: 'Tenants',
    href: '/admin/tenants',
    icon: Building,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: CreditCard,
  },
  {
    name: 'Onboarding',
    href: '/admin/onboarding',
    icon: Plus,
  },
  {
    name: 'Support',
    href: '/admin/support',
    icon: HelpCircle,
  },
  {
    name: 'Platform Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className={`flex flex-col w-64 bg-gray-900 min-h-screen ${GeistSans.className}`}>
      {/* Logo */}
      <div className="flex items-center px-4 py-6">
        <Shield className="w-8 h-8 text-white mr-3" />
        <div>
          <h1 className="text-white font-bold text-lg">Platform Admin</h1>
          <p className="text-gray-400 text-sm">Multi-Tenant SaaS</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    )}
                  />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-700">
        <div className="flex items-center">
          <UserCog className="w-5 h-5 text-gray-400 mr-2" />
          <div className="text-sm">
            <p className="text-white">Super Admin</p>
            <p className="text-gray-400">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
} 