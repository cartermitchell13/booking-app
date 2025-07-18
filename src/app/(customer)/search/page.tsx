'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { TripCard } from '@/components/trip-card'
import { ViewToggle } from '@/components/ViewToggle'
import { useTenant, useTenantSupabase, useTenantBranding } from '@/lib/tenant-context'
import { TenantTrip, SearchFilters } from '@/types'
import { MapPin, Filter, SlidersHorizontal, ArrowUpDown, Search, X } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

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

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { tenant, isLoading: tenantLoading } = useTenant()
  const { getTrips } = useTenantSupabase()
  const branding = useTenantBranding()

  // State
  const [trips, setTrips] = useState<TenantTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'list' | 'map'>('list')
  const [selectedTripId, setSelectedTripId] = useState<string>()

  // Filter state
  const [filters, setFilters] = useState<SearchFilters>({
    origin: searchParams.get('from') || undefined,
    destination: searchParams.get('destination') || undefined,
    priceMin: searchParams.get('price_min') ? parseInt(searchParams.get('price_min')!) : undefined,
    priceMax: searchParams.get('price_max') ? parseInt(searchParams.get('price_max')!) : undefined,
    dateFrom: searchParams.get('date_from') || undefined,
    dateTo: searchParams.get('date_to') || undefined,
    availableSeats: searchParams.get('passengers') ? parseInt(searchParams.get('passengers')!) : undefined,
    sortBy: (searchParams.get('sort') as SearchFilters['sortBy']) || 'popularity'
  })

  // Debounced search function for better performance
  const debouncedLoadTrips = useCallback(
    debounce(async (searchFilters: any) => {
      if (tenantLoading || !tenant) return

      try {
        setLoading(true)
        setError(undefined)
        
        // Validate search filters
        if (searchFilters.dateFrom && searchFilters.dateTo) {
          const fromDate = new Date(searchFilters.dateFrom)
          const toDate = new Date(searchFilters.dateTo)
          
          if (toDate < fromDate) {
            setError('End date cannot be before start date')
            return
          }
        }
        
        if (searchFilters.passengers && searchFilters.passengers > 50) {
          setError('Maximum 50 passengers allowed')
          return
        }
        
        const tripData = await getTrips(searchFilters)
        setTrips(tripData || [])
      } catch (err) {
        console.error('Error loading trips:', err)
        
        // Provide more specific error messages
        if (err instanceof Error) {
          if (err.message.includes('network')) {
            setError('Network error - please check your connection and try again')
          } else if (err.message.includes('auth')) {
            setError('Authentication error - please refresh the page')
          } else {
            setError(`Search failed: ${err.message}`)
          }
        } else {
          setError('Failed to load trips - please try again')
        }
      } finally {
        setLoading(false)
      }
    }, 300), // 300ms debounce delay
    [tenantLoading, tenant, getTrips]
  )

  // Load trips from database with search filters
  useEffect(() => {
    // Build search filters from URL parameters and local state
    const searchFilters = {
      origin: filters.origin,
      destination: filters.destination,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      passengers: filters.availableSeats,
      searchQuery: searchQuery
    }
    
    debouncedLoadTrips(searchFilters)
  }, [tenant, tenantLoading, filters, searchQuery, debouncedLoadTrips])

  // Sort trips (filtering now happens server-side)
  const filteredAndSortedTrips = useMemo(() => {
    let filtered = trips.filter(trip => {
      // Price filters (still client-side as they're not in the main search)
      if (filters.priceMin && trip.price_adult < filters.priceMin * 100) {
        return false
      }
      if (filters.priceMax && trip.price_adult > filters.priceMax * 100) {
        return false
      }

      return true
    })

    // Sort trips
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.price_adult - b.price_adult
        case 'price_high':
          return b.price_adult - a.price_adult
        case 'departure_time':
          return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
        case 'popularity':
        default:
          // Sort by available seats (fewer = more popular)
          return (a.max_passengers - a.available_seats) - (b.max_passengers - b.available_seats)
      }
    })

    return filtered
  }, [trips, filters])

  // Update filter
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      sortBy: 'popularity'
    })
    setSearchQuery('')
  }

  // Format price
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  // Get unique destinations and origins for filter dropdowns
  const uniqueDestinations = useMemo(() => {
    return Array.from(new Set(trips.map(trip => trip.destination)))
  }, [trips])

  const uniqueOrigins = useMemo(() => {
    return Array.from(new Set(trips.map(trip => trip.departure_location)))
  }, [trips])

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f6' }}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Tenant not found</p>
          <p className="text-gray-600">Please check your domain configuration</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Header */}
        <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: `var(--tenant-font, 'Inter')` }}>Find Your Perfect Adventure</h1>
          <p className="text-gray-600">
            {filteredAndSortedTrips.length} {filteredAndSortedTrips.length === 1 ? 'trip' : 'trips'} available
            {filters.origin && ` from ${filters.origin}`}
            {filters.destination && ` to ${filters.destination}`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-80 lg:flex-shrink-0`}>
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-100 h-fit sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900" style={{ fontFamily: `var(--tenant-font, 'Inter')` }}>Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Clear all
                </button>
              </div>

              {/* Search */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search trips
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by title or destination..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    />
                  </div>
                </div>

                {/* Origin Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Origin
                  </label>
                  <select
                    value={filters.origin || ''}
                    onChange={(e) => updateFilter('origin', e.target.value || undefined)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="">All origins</option>
                    {uniqueOrigins.map(origin => (
                      <option key={origin} value={origin}>
                        {origin}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destination
                  </label>
                  <select
                    value={filters.destination || ''}
                    onChange={(e) => updateFilter('destination', e.target.value || undefined)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="">All destinations</option>
                    {uniqueDestinations.map(destination => (
                      <option key={destination} value={destination}>
                        {destination}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceMin || ''}
                      onChange={(e) => updateFilter('priceMin', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceMax || ''}
                      onChange={(e) => updateFilter('priceMax', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                      min="0"
                    />
                  </div>
                </div>

                {/* Available Seats */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Available Spots
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 2"
                    value={filters.availableSeats || ''}
                    onChange={(e) => updateFilter('availableSeats', e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                    min="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                
                {/* View Toggle */}
                <ViewToggle view={view} onViewChange={setView} />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value as SearchFilters['sortBy'])}
                  className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="departure_time">Departure Time</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {searchQuery || filters.origin || filters.destination || filters.dateFrom 
                    ? 'Searching for trips...' 
                    : 'Loading trips...'}
                </p>
                {(searchQuery || filters.origin || filters.destination) && (
                  <p className="text-gray-500 text-sm mt-2">
                    {searchQuery && `"${searchQuery}"`}
                    {filters.origin && ` from ${filters.origin}`}
                    {filters.destination && ` to ${filters.destination}`}
                  </p>
                )}
              </div>
            )}

            {/* Trip Results */}
            {!loading && (
              <>
                {filteredAndSortedTrips.length > 0 ? (
                  <>
                    {view === 'list' ? (
                      <div className="space-y-6">
                        {filteredAndSortedTrips.map((trip) => (
                          <TripCard 
                            key={trip.id} 
                            trip={trip} 
                            variant="horizontal"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Map View */}
                        <TripMap
                          trips={filteredAndSortedTrips}
                          selectedTripId={selectedTripId}
                          onTripSelect={setSelectedTripId}
                          className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200"
                        />
                        
                        {/* Selected Trip Details (below map) */}
                        {selectedTripId && (
                          <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: `var(--tenant-font, 'Inter')` }}>Selected Trip</h3>
                            {filteredAndSortedTrips
                              .filter(trip => trip.id === selectedTripId)
                              .map((trip) => (
                                <TripCard 
                                  key={trip.id} 
                                  trip={trip} 
                                  variant="horizontal"
                                />
                              ))
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2" style={{ fontFamily: `var(--tenant-font, 'Inter')` }}>No trips found</h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search terms
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
                      style={{ backgroundColor: branding.primary_color || '#10B981' }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 