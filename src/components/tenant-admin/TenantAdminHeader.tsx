'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, LogOut, ArrowLeft, Eye, MoreVertical, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { GeistSans } from 'geist/font/sans';
import { useState } from 'react';

interface TenantProps {
  tenant?: {
    id: string;
    name: string;
    branding?: {
      primary_color?: string;
      secondary_color?: string;
      logo_url?: string;
    };
  } | null;
}

export default function TenantAdminHeader({ tenant }: TenantProps) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Generate breadcrumb from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, href, current: index === pathSegments.length - 1 };
  });

  // Handle sign out
  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await signOut();
      // Redirect to login page after successful sign out
      window.location.href = '/login';
    } catch (error) {
      console.error('Sign out error:', error);
      // Show error message to user
      alert('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${GeistSans.className}`}>
      <div className="flex items-center justify-between px-6 py-4 h-[73px]">
        {/* Left side - Breadcrumbs */}
        <div className="flex items-center space-x-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {breadcrumbs.map((breadcrumb) => (
                <li key={breadcrumb.href}>
                  <div className="flex items-center">
                    {breadcrumb.current ? (
                      <span className="text-gray-900 font-medium">
                        {breadcrumb.name}
                      </span>
                    ) : (
                      <>
                        <Link
                          href={breadcrumb.href}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {breadcrumb.name}
                        </Link>
                        <span className="text-gray-400 ml-2">/</span>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </nav>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings, customers..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* View Site */}
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Site
          </Link>

          {/* Tenant Actions Menu */}
          <div className="relative">
            <button className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <div className="flex items-center">
                <span className="font-medium">{tenant?.name || 'Business'}</span>
              </div>
              <MoreVertical className="w-4 h-4 ml-2" />
            </button>
          </div>

          {/* Sign Out */}
          <button 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningOut ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            {isSigningOut ? 'Signing Out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </header>
  );
} 