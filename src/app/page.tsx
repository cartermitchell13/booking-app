'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useTenant, useTenantBranding } from '@/lib/tenant-context'
import { useTrips } from '@/hooks/useTrips'
import { useTripFilters } from '@/hooks/useTripFilters'
import { useViewMode } from '@/hooks/useViewMode'
import { HomeHeader } from '@/components/HomeHeader'
import { LoadingState, ErrorState } from '@/components/ui'
import { EmptyState } from '@/components/EmptyState'
import { TripCard } from '@/components/TripCard'
import { TripListItem } from '@/components/TripListItem'
import { TripCalendar } from '@/components/TripCalendar'

// Dynamically import the map component to avoid SSR issues
const TripMap = dynamic(() => import('@/components/map/TripMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 w-full rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

export default function HomePage() {
  const { tenant, isLoading: tenantLoading } = useTenant()
  const branding = useTenantBranding()
  const { trips, loading, error, tenantLoading: tripsLoading } = useTrips()
  const {
    filters,
    filteredTrips,
    showFilters,
    setShowFilters,
    handleFilterChange,
    setSearchFilters,
    clearFilters
  } = useTripFilters(trips)
  const {
    viewMode,
    setViewMode,
    selectedTripId,
    handleTripSelect,
    clearTripSelection
  } = useViewMode()

  // Debug font loading
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const currentFontVar = getComputedStyle(root).getPropertyValue('--tenant-font');
      console.log('🔍 Font debugging:', {
        tenantName: tenant?.name,
        brandingFontFamily: tenant?.branding?.font_family,
        customFontFamily: tenant?.branding?.custom_font_family,
        customFontUrl: tenant?.branding?.custom_font_url,
        cssFontVariable: currentFontVar,
        testElementFont: getComputedStyle(document.body).fontFamily
      });
    }
  }, [tenant?.branding, branding]);

  if (tenantLoading || tripsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: branding.background_color || '#F9FAFB' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: branding.background_color || '#F9FAFB' }}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Tenant not found</p>
          <p className="text-gray-600">Please check your domain configuration</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: branding.background_color || '#F9FAFB' }}>
      <HomeHeader
        tenant={tenant}
        totalTrips={trips.length}
        filteredTrips={filteredTrips.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        filters={filters}
        onFilterChange={handleFilterChange}
        setSearchFilters={setSearchFilters}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Error State */}
        {error && <ErrorState error={error} />}

        {/* Loading State */}
        {loading && <LoadingState message="Loading offerings..." />}

        {/* Map View */}
        {!loading && filteredTrips.length > 0 && viewMode === 'map' && (
          <div className="mb-8">
            <TripMap 
              trips={filteredTrips}
              selectedTripId={selectedTripId}
              onTripSelect={handleTripSelect}
              className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200"
            />
          </div>
        )}

        {/* Calendar View */}
        {!loading && filteredTrips.length > 0 && viewMode === 'calendar' && (
          <TripCalendar
            trips={filteredTrips}
            selectedTripId={selectedTripId}
            onTripSelect={handleTripSelect}
            onClearSelection={clearTripSelection}
          />
        )}

        {/* Offering Grid/List */}
        {!loading && filteredTrips.length > 0 && viewMode !== 'map' && viewMode !== 'calendar' && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" 
            : "space-y-3 sm:space-y-4"
          }>
            {filteredTrips.map((trip) => (
              viewMode === 'grid' ? (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  selectedTripId={selectedTripId}
                />
              ) : (
                <TripListItem
                  key={trip.id}
                  trip={trip}
                  selectedTripId={selectedTripId}
                />
              )
            ))}
          </div>
        )}

        {/* Empty State - No trips at all */}
        {!loading && trips.length === 0 && (
          <EmptyState type="no-trips" />
        )}

        {/* Empty State - No filtered results */}
        {!loading && trips.length > 0 && filteredTrips.length === 0 && (
          <EmptyState type="no-filtered-results" onClearFilters={clearFilters} />
        )}
      </main>
    </div>
  )
}
