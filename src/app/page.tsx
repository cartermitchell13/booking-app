'use client'

import { SearchBar } from '@/components/search-bar'
import { MapPin, Clock, Star, Heart, Grid, List, SlidersHorizontal, Map, Calendar } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTenant, useTenantSupabase, useTenantBranding } from '@/lib/tenant-context'
import { TenantTrip } from '@/types'
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

export default function HomePage() {
  const [trips, setTrips] = useState<TenantTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map' | 'calendar'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string>()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const { tenant, isLoading: tenantLoading } = useTenant()
  const { getProducts } = useTenantSupabase()
  const branding = useTenantBranding()

  // Load trips from database (using new products system)
  useEffect(() => {
    if (tenantLoading || !tenant) return

    const loadTrips = async () => {
      try {
        setLoading(true)
        setError(undefined)
        console.log('Starting to load trips for tenant:', tenant?.id, tenant?.name)
        const tripData = await getProducts()
        console.log('Successfully loaded trip data:', tripData)
        setTrips(tripData || [])
      } catch (err: any) {
        console.error('Error loading trips (detailed):', {
          error: err,
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint,
          stack: err?.stack,
          tenantId: tenant?.id,
          tenantName: tenant?.name
        })
        
        // Provide more specific error messages
        let errorMessage = 'Failed to load trips'
        if (err?.message?.includes('JWT')) {
          errorMessage = 'Authentication error - please refresh the page'
        } else if (err?.message?.includes('policy')) {
          errorMessage = 'Database access restricted - check authentication'
        } else if (err?.code === 'PGRST116') {
          errorMessage = 'Database permissions error - data access blocked'
        } else if (err?.message) {
          errorMessage = `Error: ${err.message}`
        }
        
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [tenant, tenantLoading, getProducts])

  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  // Format date for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Handle trip selection from map
  const handleTripSelect = (tripId: string) => {
    setSelectedTripId(tripId)
    // Scroll to trip card if in grid/list view, or just highlight on map
    if (viewMode !== 'map') {
      const element = document.getElementById(`trip-${tripId}`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatCalendarDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getTripsForDate = (day: number) => {
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return trips.filter(trip => {
      // Check if trip departure occurs on this date
      const tripDate = new Date(trip.departure_time)
      return tripDate.toDateString() === targetDate.toDateString()
    })
  }

  const getAvailabilityStatus = (dayTrips: TenantTrip[]) => {
    if (dayTrips.length === 0) return 'none'
    
    const totalAvailable = dayTrips.reduce((sum, trip) => sum + trip.available_seats, 0)
    const totalCapacity = dayTrips.reduce((sum, trip) => sum + trip.max_passengers, 0)
    const availabilityRatio = totalAvailable / totalCapacity
    
    if (availabilityRatio > 0.7) return 'high' // Green - lots of availability
    if (availabilityRatio > 0.3) return 'medium' // Orange - limited availability  
    if (availabilityRatio > 0) return 'low' // Red - very limited
    return 'full' // Gray - sold out
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'high': return '#10B981' // Green
      case 'medium': return '#F59E0B' // Orange
      case 'low': return '#EF4444' // Red
      case 'full': return '#6B7280' // Gray
      default: return 'transparent'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1)
      } else {
        newMonth.setMonth(prev.getMonth() + 1)
      }
      return newMonth
    })
  }

  if (tenantLoading) {
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
      {/* Header */}
      <header style={{ backgroundColor: branding.background_color || '#FFFFFF' }} className="border-b border-gray-200 sticky top-0 z-20">
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
            <nav className="flex items-center space-x-6">
              <Link href="/account" className="text-gray-600 hover:text-gray-900 transition-colors">
                My Account
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Search and Filter Section */}
      <section style={{ backgroundColor: branding.background_color || '#FFFFFF' }} className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Browse Offerings
            </h1>
            <p className="text-gray-600">
              Discover all available offerings and services from {tenant.name}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar />
          </div>

          {/* View Controls and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              
              {/* Offering count */}
              <span className="text-sm text-gray-600">
                {trips.length} offering{trips.length !== 1 ? 's' : ''} available
              </span>
            </div>

            {/* View Mode Toggle with Map */}
            <div className="flex items-center gap-2 rounded-lg p-1" style={{ backgroundColor: branding.foreground_color || '#F3F4F6' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={viewMode === 'grid' ? { backgroundColor: branding.background_color || '#FFFFFF' } : {}}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={viewMode === 'list' ? { backgroundColor: branding.background_color || '#FFFFFF' } : {}}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'map' 
                    ? 'shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={viewMode === 'map' ? { backgroundColor: branding.background_color || '#FFFFFF' } : {}}
              >
                <Map className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'calendar' 
                    ? 'shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                style={viewMode === 'calendar' ? { backgroundColor: branding.background_color || '#FFFFFF' } : {}}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Filters */}
          {showFilters && (
            <div 
              className="mt-4 p-4 rounded-lg border-2" 
              style={{ 
                backgroundColor: branding.foreground_color || '#F9FAFB',
                borderColor: branding.accent_color || '#637752'
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Any price</option>
                    <option>Under $100</option>
                    <option>$100 - $200</option>
                    <option>$200 - $500</option>
                    <option>Over $500</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Any duration</option>
                    <option>Half day</option>
                    <option>Full day</option>
                    <option>Multi-day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>All categories</option>
                    <option>Adventure</option>
                    <option>Wildlife</option>
                    <option>Sightseeing</option>
                    <option>Cultural</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>All dates</option>
                    <option>This week</option>
                    <option>This month</option>
                    <option>Next 3 months</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading offerings...</p>
          </div>
        )}

        {/* Map View */}
        {!loading && trips.length > 0 && viewMode === 'map' && (
          <div className="mb-8">
            <TripMap 
              trips={trips}
              selectedTripId={selectedTripId}
              onTripSelect={handleTripSelect}
              className="h-[600px] w-full rounded-lg overflow-hidden border border-gray-200"
            />
          </div>
        )}

        {/* Calendar View */}
        {!loading && trips.length > 0 && viewMode === 'calendar' && (
          <div className="mb-8">
            {/* Enhanced Calendar Header */}
            <div className="flex items-center justify-between mb-8 p-6 rounded-xl shadow-sm border-2" style={{ 
              backgroundColor: branding.foreground_color || '#FFFFFF',
              borderColor: branding.accent_color || '#637752'
            }}>
              <button
                onClick={() => navigateMonth('prev')}
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                style={{ 
                  backgroundColor: branding.background_color || '#F9FAFB',
                  color: branding.primary_color || '#10B981'
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-1" style={{ color: branding.textOnForeground || '#111827' }}>
                  {formatCalendarDate(currentMonth)}
                </h2>
                <p className="text-sm text-gray-500">
                  {trips.length} offering{trips.length !== 1 ? 's' : ''} available this month
                </p>
              </div>
              
              <button
                onClick={() => navigateMonth('next')}
                className="flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                style={{ 
                  backgroundColor: branding.background_color || '#F9FAFB',
                  color: branding.primary_color || '#10B981'
                }}
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Availability Legend */}
            <div className="flex items-center justify-center gap-6 mb-6 p-4 rounded-lg" style={{ backgroundColor: branding.background_color || '#F9FAFB' }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                <span className="text-sm font-medium text-gray-700">High Availability</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                <span className="text-sm font-medium text-gray-700">Limited Spots</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                <span className="text-sm font-medium text-gray-700">Almost Sold Out</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6B7280' }}></div>
                <span className="text-sm font-medium text-gray-700">Sold Out</span>
              </div>
            </div>

            {/* Enhanced Calendar Grid */}
            <div 
              className="rounded-xl shadow-lg border-2 overflow-hidden"
              style={{ 
                backgroundColor: branding.foreground_color || '#FFFFFF',
                borderColor: branding.accent_color || '#637752'
              }}
            >
              {/* Enhanced Day Headers */}
              <div className="grid grid-cols-7" style={{ backgroundColor: branding.background_color || '#F9FAFB' }}>
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                  <div key={day} className="p-4 text-center border-b border-gray-200">
                    <div className="font-semibold text-gray-800">{day.slice(0, 3)}</div>
                    <div className="text-xs text-gray-500 mt-1">{day.slice(3)}</div>
                  </div>
                ))}
              </div>

              {/* Enhanced Calendar Days */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, index) => (
                  <div key={`empty-${index}`} className="h-32 border-r border-b border-gray-100"></div>
                ))}

                {/* Days of the month */}
                {Array.from({ length: getDaysInMonth(currentMonth) }, (_, index) => {
                  const day = index + 1
                  const dayTrips = getTripsForDate(day)
                  const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()
                  const availabilityStatus = getAvailabilityStatus(dayTrips)
                  const availabilityColor = getAvailabilityColor(availabilityStatus)
                  
                  return (
                    <div
                      key={day}
                      className={`h-32 border-r border-b border-gray-100 p-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                        isToday ? 'ring-2 ring-blue-400 ring-inset' : ''
                      }`}
                      style={{
                        backgroundColor: isToday ? '#EBF8FF' : '#FFFFFF'
                      }}
                    >
                      {/* Day Number with Availability Indicator */}
                      <div className="flex items-center justify-between mb-2">
                        <div className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                          {day}
                        </div>
                        {dayTrips.length > 0 && (
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: availabilityColor }}
                            title={`${availabilityStatus} availability`}
                          ></div>
                        )}
                      </div>
                      
                      {/* Trip Cards */}
                      <div className="space-y-1">
                                                 {dayTrips.slice(0, 1).map(trip => (
                           <div
                             key={trip.id}
                             className="text-xs p-2 rounded-md cursor-pointer hover:shadow-sm transition-all duration-200 border"
                             style={{ 
                               backgroundColor: branding.foreground_color || '#F9FAFB',
                               borderColor: branding.accent_color || '#E5E7EB'
                             }}
                             onClick={() => handleTripSelect(trip.id)}
                                                      >
                             <div className="font-semibold truncate mb-1" title={trip.title} style={{ color: branding.textOnForeground || '#111827' }}>
                               {trip.title}
                             </div>
                             <div className="flex items-center justify-between">
                               <span className="font-bold" style={{ color: branding.primary_color || '#10B981' }}>
                                 {formatPrice(trip.price_adult)}
                               </span>
                               <span className="text-xs" style={{ color: branding.textOnForeground ? `${branding.textOnForeground}80` : '#6B7280' }}>
                                 {trip.available_seats} left
                               </span>
                             </div>
                             <div className="text-xs mt-1" style={{ color: branding.textOnForeground ? `${branding.textOnForeground}80` : '#6B7280' }}>
                               {formatTime(trip.departure_time)}
                             </div>
                          </div>
                        ))}
                        {dayTrips.length > 1 && (
                          <div 
                            className="text-xs text-center p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                            style={{ 
                              backgroundColor: branding.accent_color || '#637752',
                              color: 'white'
                            }}
                            onClick={() => {
                              // Show all trips for this day
                              setSelectedTripId(dayTrips[0].id)
                            }}
                          >
                            +{dayTrips.length - 1} more offering{dayTrips.length - 1 !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Enhanced Selected Trip Details */}
            {selectedTripId && (
              <div className="mt-8">
                {(() => {
                  const selectedTrip = trips.find(t => t.id === selectedTripId)
                  if (!selectedTrip) return null
                  
                  const availabilityStatus = getAvailabilityStatus([selectedTrip])
                  const availabilityColor = getAvailabilityColor(availabilityStatus)
                  
                  return (
                    <div 
                      className="relative p-8 rounded-xl shadow-lg border-2 transition-all duration-300 animate-in slide-in-from-bottom-4"
                      style={{ 
                        backgroundColor: branding.foreground_color || '#FFFFFF',
                        borderColor: branding.primary_color || '#10B981'
                      }}
                    >
                      {/* Trip Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-2xl font-bold" style={{ color: branding.textOnForeground || '#111827' }}>
                              {selectedTrip.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: availabilityColor }}
                              ></div>
                              <span className="text-sm font-medium text-gray-600 capitalize">
                                {availabilityStatus === 'high' ? 'High Availability' : 
                                 availabilityStatus === 'medium' ? 'Limited Spots' :
                                 availabilityStatus === 'low' ? 'Almost Sold Out' : 'Sold Out'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-5 h-5 mr-2" style={{ color: branding.primary_color || '#10B981' }} />
                              <div>
                                <div className="text-sm font-medium">Destination</div>
                                <div className="text-gray-800">{selectedTrip.destination}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Clock className="w-5 h-5 mr-2" style={{ color: branding.primary_color || '#10B981' }} />
                              <div>
                                <div className="text-sm font-medium">Departure</div>
                                <div className="text-gray-800">{formatTime(selectedTrip.departure_time)}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Star className="w-5 h-5 mr-2" style={{ color: branding.primary_color || '#10B981' }} />
                              <div>
                                <div className="text-sm font-medium">Availability</div>
                                <div className="text-gray-800">{selectedTrip.available_seats} of {selectedTrip.max_passengers} spots</div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedTrip.description && (
                            <p className="text-gray-600 leading-relaxed">
                              {selectedTrip.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Price and Actions */}
                        <div className="ml-8 text-right">
                          <div className="mb-6">
                            <div className="text-sm text-gray-500 mb-1">Starting from</div>
                            <div className="text-4xl font-bold mb-1" style={{ color: branding.primary_color || '#10B981' }}>
                              {formatPrice(selectedTrip.price_adult)}
                            </div>
                            <div className="text-sm text-gray-600">per adult</div>
                            {selectedTrip.price_child && (
                              <div className="text-sm text-gray-500 mt-1">
                                Children: {formatPrice(selectedTrip.price_child)}
                              </div>
                            )}
                          </div>
                          
                          <div className="space-y-3">
                            <Link href={`/trip/${selectedTrip.id}`} className="block">
                              <button className="w-full px-6 py-3 border-2 text-gray-700 font-semibold rounded-lg transition-all duration-200 hover:shadow-md hover:bg-gray-50" style={{ borderColor: branding.accent_color || '#637752' }}>
                                View Full Details
                              </button>
                            </Link>
                            <Link href={`/booking/${selectedTrip.id}`} className="block">
                              <button 
                                className="w-full px-6 py-3 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                                style={{ backgroundColor: branding.primary_color || '#10B981' }}
                              >
                                Book This Trip
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                      
                      {/* Close Button */}
                      <button
                        onClick={() => setSelectedTripId(undefined)}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                        style={{ color: branding.primary_color || '#10B981' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {/* Offering Grid/List */}
        {!loading && trips.length > 0 && viewMode !== 'map' && viewMode !== 'calendar' && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
          }>
            {trips.map((trip) => (
              <div 
                key={trip.id}
                id={`trip-${trip.id}`}
                className={
                  viewMode === 'grid' 
                    ? `rounded-xl shadow-sm border-2 hover:shadow-md transition-all duration-200 ${selectedTripId === trip.id ? 'ring-2' : ''}`
                    : `rounded-xl shadow-sm border-2 hover:shadow-md transition-all duration-200 ${selectedTripId === trip.id ? 'ring-2' : ''}`
                }
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#637752',
                  ...(selectedTripId === trip.id && { 
                    '--tw-ring-color': branding.primary_color || '#10B981',
                    '--tw-ring-opacity': '1'
                  } as any)
                }}
              >
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    <div className="relative">
                      <Image
                        src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center"}
                        alt={trip.title}
                        width={400}
                        height={240}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                      <button 
                        className="absolute top-3 right-3 p-2 rounded-full hover:bg-opacity-100 transition-colors"
                        style={{ backgroundColor: `${branding.foreground_color || '#FFFFFF'}CC` }}
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                      <div 
                        className="absolute bottom-3 left-3 rounded-full px-2 py-1 text-xs font-medium text-gray-700"
                        style={{ backgroundColor: `${branding.foreground_color || '#FFFFFF'}E6` }}
                      >
                        {trip.available_seats} spots left
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900 leading-tight">
                          {trip.title}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600 ml-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>4.9</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {trip.destination}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Full Day
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            {formatPrice(trip.price_adult)}
                          </p>
                          <p className="text-sm text-gray-600">per person</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/trip/${trip.id}`} className="flex-1">
                          <button className="w-full py-2 px-4 border border-gray-200 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50">
                            View Details
                          </button>
                        </Link>
                        <Link href={`/booking/${trip.id}`} className="flex-1">
                          <button 
                            className="w-full py-2 px-4 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                            style={{ backgroundColor: branding.primary_color || '#10B981' }}
                          >
                            Book Now
                          </button>
                        </Link>
                      </div>
                    </div>
                  </>
                ) : (
                  // List View
                  <div className="flex p-4">
                    <div className="flex-shrink-0">
                      <Image
                        src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=150&fit=crop&crop=center"}
                        alt={trip.title}
                        width={160}
                        height={120}
                        className="w-40 h-30 object-cover rounded-lg"
                      />
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {trip.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {trip.destination}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              Full Day
                            </span>
                            <span className="flex items-center">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                              4.9 (127 reviews)
                            </span>
                            <span>{trip.available_seats} spots left</span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(trip.price_adult)}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">per person</p>
                          <div className="flex gap-2">
                            <Link href={`/trip/${trip.id}`}>
                              <button className="px-4 py-2 border border-gray-200 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50">
                                Details
                              </button>
                            </Link>
                            <Link href={`/booking/${trip.id}`}>
                              <button 
                                className="px-4 py-2 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                                style={{ backgroundColor: branding.primary_color || '#10B981' }}
                              >
                                Book Now
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && trips.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips available</h3>
            <p className="text-gray-600">Check back soon for new adventures!</p>
          </div>
        )}
      </main>
    </div>
  )
}
