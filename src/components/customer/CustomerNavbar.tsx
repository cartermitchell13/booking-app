'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { useAuth } from '@/lib/auth-context';
import { Menu, X } from 'lucide-react';

export default function CustomerNavbar() {
  const router = useRouter();
  const { tenant } = useTenant();
  const branding = useTenantBranding();
  const { isAuthenticated, user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const backgroundTextColor = branding.textOnBackground;

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const navLinks = (
    <>
      {isAuthenticated ? (
        <>
          <Link href="/account/bookings" className="transition-colors hover:opacity-80" style={{ color: backgroundTextColor }}>
            My Bookings
          </Link>
          <Link href="/account" className="transition-colors hover:opacity-80" style={{ color: backgroundTextColor }}>
            My Account
          </Link>
          <button onClick={handleSignOut} className="transition-colors hover:opacity-80" style={{ color: backgroundTextColor }}>
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link href="/booking-lookup" className="transition-colors hover:opacity-80" style={{ color: backgroundTextColor }}>
            Find Booking
          </Link>
          <Link href="/login" className="transition-colors hover:opacity-80" style={{ color: backgroundTextColor }}>
            Sign In
          </Link>
        </>
      )}
    </>
  );

  const mobileNavLinks = (
    <nav className="px-4 sm:px-6 py-4 space-y-2">
       {isAuthenticated ? (
        <>
          <Link href="/account/bookings" className="block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80" style={{ color: backgroundTextColor, backgroundColor: 'transparent' }} onClick={closeMobileMenu}>
            My Bookings
          </Link>
          <Link href="/account" className="block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80" style={{ color: backgroundTextColor, backgroundColor: 'transparent' }} onClick={closeMobileMenu}>
            My Account
          </Link>
          <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80" style={{ color: backgroundTextColor, backgroundColor: 'transparent' }}>
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link href="/booking-lookup" className="block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80" style={{ color: backgroundTextColor, backgroundColor: 'transparent' }} onClick={closeMobileMenu}>
            Find Booking
          </Link>
          <Link href="/login" className="block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80" style={{ color: backgroundTextColor, backgroundColor: 'transparent' }} onClick={closeMobileMenu}>
            Sign In
          </Link>
        </>
      )}
    </nav>
  );

  return (
    <header style={{ backgroundColor: branding.background_color || '#FFFFFF' }} className="border-b border-gray-200 sticky top-0 z-20" ref={mobileMenuRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Link href="/">
                <Image
                    src={branding.logo_url || "/images/black-pb-logo.png"}
                    alt={tenant?.name || 'Home'}
                    width={160}
                    height={42}
                    className="h-8 w-auto"
                />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks}
          </nav>

          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            style={{ color: backgroundTextColor }}
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-40 md:hidden border-b border-gray-200 shadow-lg" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
          {mobileNavLinks}
        </div>
      )}
    </header>
  );
} 