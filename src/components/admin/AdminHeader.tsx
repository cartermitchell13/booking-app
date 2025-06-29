'use client';

import { usePathname } from 'next/navigation';
import { Bell, Search, Menu, LogOut, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { GeistSans } from 'geist/font/sans';

export default function AdminHeader() {
  const pathname = usePathname();

  // Generate breadcrumb from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const name = segment.charAt(0).toUpperCase() + segment.slice(1);
    return { name, href, current: index === pathSegments.length - 1 };
  });

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${GeistSans.className}`}>
      <div className="flex items-center justify-between px-6 py-4">
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
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Back to Site */}
          <Link
            href="/"
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Site
          </Link>

          {/* Sign Out */}
          <button className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50 transition-colors">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
} 