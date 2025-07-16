'use client';

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SearchBar } from '@/components/search-bar'
import { SlidersHorizontal, Menu, X } from 'lucide-react'
import { useTenant, useTenantBranding } from '@/lib/tenant-context'
import { useAuth } from '@/lib/auth-context'
import { ViewModeToggle } from './ViewModeToggle'
import { TripFilters } from './TripFilters'
import { ViewMode } from '@/hooks/useViewMode'
import { TripFilters as TripFiltersType } from '@/hooks/useTripFilters'

interface HomeHeaderProps {
  tenant: any
  totalTrips: number
  filteredTrips: number
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  showFilters: boolean
  onToggleFilters: () => void
  filters: TripFiltersType
  onFilterChange: (filterType: keyof TripFiltersType, value: string) => void
  setSearchFilters: (destination: string, dateFrom?: string, dateTo?: string) => void
}

export function HomeHeader({
  tenant,
  totalTrips,
  filteredTrips,
  viewMode,
  onViewModeChange,
  showFilters,
  onToggleFilters,
  filters,
  onFilterChange,
  setSearchFilters
}: HomeHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const branding = useTenantBranding()
  const { isAuthenticated, user, signOut } = useAuth()

  // Get smart text colors for different backgrounds
  const backgroundTextColor = branding.textOnBackground  // For text on page background
  const foregroundTextColor = branding.textOnForeground  // For text on foreground elements

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsMobileMenuOpen(false) // Close mobile menu after sign out
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Handle click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Header */}
      <header style={{ backgroundColor: branding.background_color || '#FFFFFF' }} className="border-b border-gray-200 sticky top-0 z-20" ref={mobileMenuRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Image
                src={branding.logo_url || "/images/black-pb-logo.png"}
                alt={tenant.name}
                width={160}
                height={42}
                className="h-8 w-auto"
              />
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                // Authenticated user navigation
                <>
                  <Link 
                    href="/account/bookings" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: backgroundTextColor }}
                  >
                    My Bookings
                  </Link>
                  <Link 
                    href="/account" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: backgroundTextColor }}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="transition-colors hover:opacity-80"
                    style={{ color: backgroundTextColor }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                // Guest user navigation
                <>
                  <Link 
                    href="/booking-lookup" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: backgroundTextColor }}
                  >
                    Find Booking
                  </Link>
                  <Link 
                    href="/login" 
                    className="transition-colors hover:opacity-80"
                    style={{ color: backgroundTextColor }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg transition-colors hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{ 
                color: backgroundTextColor
              }}
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div 
            className="absolute top-full left-0 right-0 z-40 md:hidden border-b border-gray-200 shadow-lg"
            style={{ backgroundColor: branding.background_color || '#FFFFFF' }}
          >
            <nav className="px-4 sm:px-6 py-4 space-y-2">
              {isAuthenticated ? (
                // Authenticated user navigation
                <>
                  <Link 
                    href="/account/bookings" 
                    className="block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80"
                    style={{ 
                      color: backgroundTextColor,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = branding.foreground_color || '#F3F4F6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={closeMobileMenu}
                  >
                    My Bookings
                  </Link>
                  <Link 
                    href="/account" 
                    className="block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80"
                    style={{ 
                      color: backgroundTextColor,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = branding.foreground_color || '#F3F4F6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={closeMobileMenu}
                  >
                    My Account
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80"
                    style={{ 
                      color: backgroundTextColor,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = branding.foreground_color || '#F3F4F6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                // Guest user navigation
                <>
                  <Link 
                    href="/booking-lookup" 
                    className="block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80"
                    style={{ 
                      color: backgroundTextColor,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = branding.foreground_color || '#F3F4F6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={closeMobileMenu}
                  >
                    Find Booking
                  </Link>
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 rounded-lg text-base font-medium transition-colors hover:opacity-80"
                    style={{ 
                      color: backgroundTextColor,
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = branding.foreground_color || '#F3F4F6'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Search and Filter Section */}
      <section style={{ backgroundColor: branding.background_color || '#FFFFFF' }} className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h1 
              className={`text-2xl ${branding.headingWeightClass} mb-2`} 
              style={{ 
                fontFamily: `var(--tenant-font, 'Inter')`,
                color: backgroundTextColor
              }}
            >
              {isAuthenticated ? `Welcome back, ${user?.first_name}!` : 'Browse Offerings'}
            </h1>
            <p style={{ color: backgroundTextColor }}>
              {isAuthenticated 
                ? `Ready for your next adventure? Discover all available offerings from ${tenant.name}`
                : `Discover all available offerings and services from ${tenant.name}`
              }
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar 
              destination={filters.destination}
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              onSearch={setSearchFilters}
            />
          </div>

          {/* View Controls and Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onToggleFilters}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-80 min-h-[44px]"
                style={{ 
                  backgroundColor: branding.foreground_color || '#F3F4F6',
                  color: foregroundTextColor,
                  border: `1px solid ${branding.accent_color || '#D1D5DB'}`
                }}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              
              {/* Offering count */}
              <span className="text-sm" style={{ color: backgroundTextColor }}>
                {filteredTrips} of {totalTrips} offering{totalTrips !== 1 ? 's' : ''} available
              </span>
            </div>

            {/* View Mode Toggle */}
            <div className="w-full sm:w-auto">
              <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <TripFilters filters={filters} onFilterChange={onFilterChange} />
          )}
        </div>
      </section>
    </>
  )
} 