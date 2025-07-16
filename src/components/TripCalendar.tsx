import Link from 'next/link'
import { MapPin, Clock, Star } from 'lucide-react'
import { TenantTrip } from '@/types'
import { useTenantBranding } from '@/lib/tenant-context'
import { useCalendar } from '@/hooks/useCalendar'

interface TripCalendarProps {
  trips: TenantTrip[]
  selectedTripId?: string
  onTripSelect: (tripId: string) => void
  onClearSelection: () => void
}

export function TripCalendar({ trips, selectedTripId, onTripSelect, onClearSelection }: TripCalendarProps) {
  const branding = useTenantBranding()
  
  // Get smart text colors for different backgrounds
  const cardTextColor = branding.textOnForeground  // For text on card background
  const backgroundTextColor = branding.textOnBackground  // For text on background
  const buttonTextColor = branding.textOnPrimary  // For text on primary colored buttons
  const accentTextColor = branding.textOnAccent  // For text on accent colored backgrounds
  
  const {
    currentMonth,
    getDaysInMonth,
    getFirstDayOfMonth,
    formatCalendarDate,
    getTripsForDate,
    getAvailabilityStatus,
    getAvailabilityColor,
    navigateMonth,
    formatTime,
    formatPrice
  } = useCalendar()

  const isToday = (day: number) => {
    return new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString()
  }

  return (
    <div className="mb-8">
      {/* Responsive Calendar Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8 p-3 sm:p-6 rounded-xl shadow-sm border-2" style={{ 
        backgroundColor: branding.foreground_color || '#FFFFFF',
        borderColor: branding.accent_color || '#637752'
      }}>
        <button
          onClick={() => navigateMonth('prev')}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md min-h-[44px]"
          style={{ 
            backgroundColor: branding.background_color || '#F9FAFB',
            color: branding.primary_color || '#10B981'
          }}
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden text-sm">Prev</span>
        </button>
        
        <div className="text-center flex-1 mx-2">
          <h2 className="text-lg sm:text-3xl font-bold mb-1" style={{ 
            color: cardTextColor,
            fontFamily: `var(--tenant-font, 'Inter')`
          }}>
            {formatCalendarDate(currentMonth)}
          </h2>
          <p className="text-xs sm:text-sm" style={{ color: cardTextColor }}>
            {trips.length} offering{trips.length !== 1 ? 's' : ''} available this month
          </p>
        </div>
        
        <button
          onClick={() => navigateMonth('next')}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md min-h-[44px]"
          style={{ 
            backgroundColor: branding.background_color || '#F9FAFB',
            color: branding.primary_color || '#10B981'
          }}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden text-sm">Next</span>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Responsive Availability Legend */}
      <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: branding.background_color || '#F9FAFB' }}>
        {/* Mobile: 2x2 Grid */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
            <span className="text-xs font-medium" style={{ color: backgroundTextColor }}>High Availability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-xs font-medium" style={{ color: backgroundTextColor }}>Limited Spots</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-xs font-medium" style={{ color: backgroundTextColor }}>Almost Sold Out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6B7280' }}></div>
            <span className="text-xs font-medium" style={{ color: backgroundTextColor }}>Sold Out</span>
          </div>
        </div>
        
        {/* Desktop: Horizontal Layout */}
        <div className="hidden sm:flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
            <span className="text-sm font-medium" style={{ color: backgroundTextColor }}>High Availability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
            <span className="text-sm font-medium" style={{ color: backgroundTextColor }}>Limited Spots</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
            <span className="text-sm font-medium" style={{ color: backgroundTextColor }}>Almost Sold Out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#6B7280' }}></div>
            <span className="text-sm font-medium" style={{ color: backgroundTextColor }}>Sold Out</span>
          </div>
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
        {/* Responsive Day Headers */}
        <div className="grid grid-cols-7" style={{ backgroundColor: branding.background_color || '#F9FAFB' }}>
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
            <div key={day} className="p-2 sm:p-4 text-center border-b border-gray-200">
              <div className="font-semibold text-xs sm:text-sm" style={{ color: backgroundTextColor }}>
                {/* Mobile: Show single letter, Desktop: Show 3 letters */}
                <span className="sm:hidden">{day.slice(0, 1)}</span>
                <span className="hidden sm:inline">{day.slice(0, 3)}</span>
              </div>
              <div className="text-xs mt-1 hidden sm:block" style={{ color: backgroundTextColor }}>
                {day.slice(3)}
              </div>
            </div>
          ))}
        </div>

        {/* Responsive Calendar Days */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: getFirstDayOfMonth(currentMonth) }, (_, index) => (
            <div key={`empty-${index}`} className="h-16 sm:h-32 border-r border-b border-gray-100"></div>
          ))}

          {/* Days of the month */}
          {Array.from({ length: getDaysInMonth(currentMonth) }, (_, index) => {
            const day = index + 1
            const dayTrips = getTripsForDate(day, trips)
            const todayCheck = isToday(day)
            const availabilityStatus = getAvailabilityStatus(dayTrips)
            const availabilityColor = getAvailabilityColor(availabilityStatus)
            
            return (
              <div
                key={day}
                className={`h-16 sm:h-32 border-r border-b border-gray-100 p-1 sm:p-2 transition-all duration-200 hover:shadow-md cursor-pointer ${
                  todayCheck ? 'ring-2 ring-blue-400 ring-inset' : ''
                }`}
                style={{
                  backgroundColor: todayCheck ? '#EBF8FF' : '#FFFFFF'
                }}
              >
                {/* Day Number with Availability Indicator */}
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <div className={`text-xs sm:text-sm font-bold ${todayCheck ? 'text-blue-600' : ''}`} style={{ color: todayCheck ? '#2563EB' : cardTextColor }}>
                    {day}
                  </div>
                  {dayTrips.length > 0 && (
                    <div 
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                      style={{ backgroundColor: availabilityColor }}
                      title={`${availabilityStatus} availability`}
                    ></div>
                  )}
                </div>
                
                {/* Trip Cards - Show differently on mobile vs desktop */}
                <div className="space-y-1">
                  {/* Mobile: Just show count and price */}
                  <div className="sm:hidden">
                    {dayTrips.length > 0 && (
                      <div
                        className="text-xs p-1 rounded cursor-pointer transition-all duration-200"
                        style={{ 
                          backgroundColor: branding.primary_color || '#10B981',
                          color: buttonTextColor
                        }}
                        onClick={() => onTripSelect(dayTrips[0].id)}
                      >
                        <div className="font-semibold text-center">
                          {dayTrips.length} trip{dayTrips.length !== 1 ? 's' : ''}
                        </div>
                        <div className="text-center font-bold">
                          {formatPrice(Math.min(...dayTrips.map(t => t.price_adult)))}+
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop: Show detailed trip cards */}
                  <div className="hidden sm:block">
                    {dayTrips.slice(0, 1).map(trip => (
                      <div
                        key={trip.id}
                        className="text-xs p-2 rounded-md cursor-pointer hover:shadow-sm transition-all duration-200 border"
                        style={{ 
                          backgroundColor: branding.foreground_color || '#F9FAFB',
                          borderColor: branding.accent_color || '#E5E7EB'
                        }}
                        onClick={() => onTripSelect(trip.id)}
                      >
                        <div className="font-semibold truncate mb-1" title={trip.title} style={{ color: cardTextColor }}>
                          {trip.title}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold" style={{ color: branding.primary_color || '#10B981' }}>
                            {formatPrice(trip.price_adult)}
                          </span>
                          <span className="text-xs" style={{ color: cardTextColor }}>
                            {trip.available_seats} left
                          </span>
                        </div>
                        <div className="text-xs mt-1" style={{ color: cardTextColor }}>
                          {formatTime(trip.departure_time)}
                        </div>
                      </div>
                    ))}
                    {dayTrips.length > 1 && (
                      <div 
                        className="text-xs text-center p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ 
                          backgroundColor: branding.accent_color || '#637752',
                          color: accentTextColor
                        }}
                        onClick={() => {
                          // Show all trips for this day
                          onTripSelect(dayTrips[0].id)
                        }}
                      >
                        +{dayTrips.length - 1} more offering{dayTrips.length - 1 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile-Optimized Selected Trip Details */}
      {selectedTripId && (
        <div className="mt-4 sm:mt-8">
          {(() => {
            const selectedTrip = trips.find(t => t.id === selectedTripId)
            if (!selectedTrip) return null
            
            const availabilityStatus = getAvailabilityStatus([selectedTrip])
            const availabilityColor = getAvailabilityColor(availabilityStatus)
            
            return (
              <div 
                className="relative p-4 sm:p-8 rounded-xl shadow-lg border-2 transition-all duration-300 animate-in slide-in-from-bottom-4"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.primary_color || '#10B981'
                }}
              >
                {/* Close Button */}
                <button
                  onClick={onClearSelection}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2 rounded-full hover:bg-gray-100 transition-colors min-h-[44px] min-w-[44px]"
                  style={{ color: branding.primary_color || '#10B981' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Mobile Layout: Stacked */}
                <div className="sm:hidden">
                  <div className="mb-4 pr-8">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold" style={{ 
                        color: cardTextColor,
                        fontFamily: `var(--tenant-font, 'Inter')`
                      }}>
                        {selectedTrip.title}
                      </h3>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: availabilityColor }}
                      ></div>
                    </div>
                    
                    <div className="text-sm mb-3" style={{ color: cardTextColor }}>
                      {availabilityStatus === 'high' ? 'High Availability' : 
                       availabilityStatus === 'medium' ? 'Limited Spots' :
                       availabilityStatus === 'low' ? 'Almost Sold Out' : 'Sold Out'}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3 mb-4">
                      <div className="flex items-center" style={{ color: cardTextColor }}>
                        <MapPin className="w-4 h-4 mr-2" style={{ color: branding.primary_color || '#10B981' }} />
                        <div>
                          <div className="text-xs font-medium">Destination</div>
                          <div className="text-sm">{selectedTrip.destination}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center" style={{ color: cardTextColor }}>
                        <Clock className="w-4 h-4 mr-2" style={{ color: branding.primary_color || '#10B981' }} />
                        <div>
                          <div className="text-xs font-medium">Departure</div>
                          <div className="text-sm">{formatTime(selectedTrip.departure_time)}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center" style={{ color: cardTextColor }}>
                        <Star className="w-4 h-4 mr-2" style={{ color: branding.primary_color || '#10B981' }} />
                        <div>
                          <div className="text-xs font-medium">Availability</div>
                          <div className="text-sm">{selectedTrip.available_seats} of {selectedTrip.max_passengers} spots</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4 text-center">
                    <div className="text-xs mb-1" style={{ color: cardTextColor }}>Starting from</div>
                    <div className="text-2xl font-bold mb-1" style={{ color: branding.primary_color || '#10B981' }}>
                      {formatPrice(selectedTrip.price_adult)}
                    </div>
                    <div className="text-xs" style={{ color: cardTextColor }}>per adult</div>
                    {selectedTrip.price_child && (
                      <div className="text-xs mt-1" style={{ color: cardTextColor }}>
                        Children: {formatPrice(selectedTrip.price_child)}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Link href={`/trip/${selectedTrip.id}`} className="block">
                      <button 
                        className="w-full px-4 py-3 border-2 font-semibold rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-80 min-h-[44px]" 
                        style={{ 
                          borderColor: branding.accent_color || '#637752',
                          backgroundColor: 'transparent',
                          color: cardTextColor
                        }}
                      >
                        View Details
                      </button>
                    </Link>
                    <Link href={`/booking/${selectedTrip.id}`} className="block">
                      <button 
                        className="w-full px-4 py-3 font-semibold rounded-lg transition-all duration-200 hover:shadow-lg min-h-[44px]"
                        style={{ 
                          backgroundColor: branding.primary_color || '#10B981',
                          color: buttonTextColor
                        }}
                      >
                        Book This Trip
                      </button>
                    </Link>
                  </div>
                </div>

                {/* Desktop Layout: Side by side */}
                <div className="hidden sm:block">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold" style={{ 
                          color: cardTextColor,
                          fontFamily: `var(--tenant-font, 'Inter')`
                        }}>
                          {selectedTrip.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: availabilityColor }}
                          ></div>
                          <span className="text-sm font-medium" style={{ color: cardTextColor }}>
                            {availabilityStatus === 'high' ? 'High Availability' : 
                             availabilityStatus === 'medium' ? 'Limited Spots' :
                             availabilityStatus === 'low' ? 'Almost Sold Out' : 'Sold Out'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center" style={{ color: cardTextColor }}>
                          <MapPin className="w-5 h-5 mr-2" style={{ color: branding.primary_color || '#10B981' }} />
                          <div>
                            <div className="text-sm font-medium">Destination</div>
                            <div style={{ color: cardTextColor }}>{selectedTrip.destination}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center" style={{ color: cardTextColor }}>
                          <Clock className="w-5 h-5 mr-2" style={{ color: branding.primary_color || '#10B981' }} />
                          <div>
                            <div className="text-sm font-medium">Departure</div>
                            <div style={{ color: cardTextColor }}>{formatTime(selectedTrip.departure_time)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center" style={{ color: cardTextColor }}>
                          <Star className="w-5 h-5 mr-2" style={{ color: branding.primary_color || '#10B981' }} />
                          <div>
                            <div className="text-sm font-medium">Availability</div>
                            <div style={{ color: cardTextColor }}>{selectedTrip.available_seats} of {selectedTrip.max_passengers} spots</div>
                          </div>
                        </div>
                      </div>
                      
                      {selectedTrip.description && (
                        <p className="leading-relaxed" style={{ color: cardTextColor }}>
                          {selectedTrip.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Price and Actions */}
                    <div className="ml-8 text-right">
                      <div className="mb-6">
                        <div className="text-sm mb-1" style={{ color: cardTextColor }}>Starting from</div>
                        <div className="text-4xl font-bold mb-1" style={{ color: branding.primary_color || '#10B981' }}>
                          {formatPrice(selectedTrip.price_adult)}
                        </div>
                        <div className="text-sm" style={{ color: cardTextColor }}>per adult</div>
                        {selectedTrip.price_child && (
                          <div className="text-sm mt-1" style={{ color: cardTextColor }}>
                            Children: {formatPrice(selectedTrip.price_child)}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Link href={`/trip/${selectedTrip.id}`} className="block">
                          <button 
                            className="w-full px-6 py-3 border-2 font-semibold rounded-lg transition-all duration-200 hover:shadow-md hover:opacity-80" 
                            style={{ 
                              borderColor: branding.accent_color || '#637752',
                              backgroundColor: 'transparent',
                              color: cardTextColor
                            }}
                          >
                            View Full Details
                          </button>
                        </Link>
                        <Link href={`/booking/${selectedTrip.id}`} className="block">
                          <button 
                            className="w-full px-6 py-3 font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
                            style={{ 
                              backgroundColor: branding.primary_color || '#10B981',
                              color: buttonTextColor
                            }}
                          >
                            Book This Trip
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
} 