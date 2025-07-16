import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Star } from 'lucide-react'
import { TenantTrip } from '@/types'
import { useTenantBranding } from '@/lib/tenant-context'

interface TripListItemProps {
  trip: TenantTrip
  selectedTripId?: string
}

export function TripListItem({ trip, selectedTripId }: TripListItemProps) {
  const branding = useTenantBranding()

  // Get smart text colors for different backgrounds
  const cardTextColor = branding.textOnForeground  // For text on card background
  const buttonTextColor = branding.textOnPrimary  // For text on primary colored buttons

  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  return (
    <div 
      id={`trip-${trip.id}`}
      className={`rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 ${selectedTripId === trip.id ? 'ring-2' : ''}`}
      style={{ 
        backgroundColor: branding.foreground_color || '#FFFFFF',
        borderColor: branding.accent_color || '#637752',
        ...(selectedTripId === trip.id && { 
          '--tw-ring-color': branding.primary_color || '#10B981',
          '--tw-ring-opacity': '1'
        } as any)
      }}
    >
      {/* Mobile List Layout: Ultra compact, no image */}
      <div className="block sm:hidden">
        <div className="p-3">
          <div className="flex items-start justify-between mb-1">
            <h3 
              className="font-semibold text-sm leading-tight pr-2 flex-1" 
              style={{ 
                fontFamily: `var(--tenant-font, 'Inter')`,
                color: cardTextColor
              }}
            >
              {trip.title}
            </h3>
            <div className="text-right flex-shrink-0">
              <p className="text-base font-bold" style={{ color: cardTextColor }}>
                {formatPrice(trip.price_adult)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3 text-xs" style={{ color: cardTextColor }}>
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                {trip.destination}
              </span>
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Full Day
              </span>
              <span className="flex items-center">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                4.9
              </span>
            </div>
            <Link href={`/booking/${trip.id}`}>
              <button 
                className="py-1 px-3 font-medium rounded-md transition-colors hover:opacity-90 min-h-[28px] text-xs"
                style={{ 
                  backgroundColor: branding.primary_color || '#10B981',
                  color: buttonTextColor
                }}
              >
                Book Now
              </button>
            </Link>
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: cardTextColor }}>
            <span>{trip.available_seats} spots left</span>
            <Link href={`/trip/${trip.id}`} className="text-xs hover:opacity-80" style={{ color: branding.primary_color || '#10B981' }}>
              View Details →
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Layout: Full horizontal with image */}
      <div className="hidden sm:flex p-4">
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
              <h3 
                className="font-semibold text-lg mb-1" 
                style={{ 
                  fontFamily: `var(--tenant-font, 'Inter')`,
                  color: cardTextColor
                }}
              >
                {trip.title}
              </h3>
              <p className="text-sm mb-2 flex items-center" style={{ color: cardTextColor }}>
                <MapPin className="w-4 h-4 mr-1" />
                {trip.destination}
              </p>
              <div className="flex items-center gap-4 text-sm mb-3" style={{ color: cardTextColor }}>
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
              <p className="text-2xl font-bold" style={{ color: cardTextColor }}>
                {formatPrice(trip.price_adult)}
              </p>
              <p className="text-sm mb-3" style={{ color: cardTextColor }}>per person</p>
              <div className="flex gap-2">
                <Link href={`/trip/${trip.id}`}>
                  <button 
                    className="px-4 py-2 border font-medium rounded-lg transition-colors hover:opacity-80 min-h-[40px]"
                    style={{ 
                      borderColor: branding.accent_color || '#637752',
                      backgroundColor: 'transparent',
                      color: cardTextColor
                    }}
                  >
                    Details
                  </button>
                </Link>
                <Link href={`/booking/${trip.id}`}>
                  <button 
                    className="px-4 py-2 font-medium rounded-lg transition-colors hover:opacity-90 min-h-[40px]"
                    style={{ 
                      backgroundColor: branding.primary_color || '#10B981',
                      color: buttonTextColor
                    }}
                  >
                    Book Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 