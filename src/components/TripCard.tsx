import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Star, Heart } from 'lucide-react'
import { TenantTrip } from '@/types'
import { useTenantBranding } from '@/lib/tenant-context'

interface TripCardProps {
  trip: TenantTrip
  selectedTripId?: string
}

export function TripCard({ trip, selectedTripId }: TripCardProps) {
  const branding = useTenantBranding()

  // Get smart text colors for different backgrounds
  const cardTextColor = branding.textOnForeground  // For text on card background
  const overlayTextColor = branding.textOnForeground  // For text on overlay backgrounds
  const buttonTextColor = branding.textOnPrimary  // For text on primary colored buttons

  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  return (
    <div 
      id={`trip-${trip.id}`}
      className={`rounded-xl shadow-sm border-2 hover:shadow-md transition-all duration-200 ${selectedTripId === trip.id ? 'ring-2' : ''}`}
      style={{ 
        backgroundColor: branding.foreground_color || '#FFFFFF',
        borderColor: branding.accent_color || '#637752',
        ...(selectedTripId === trip.id && { 
          '--tw-ring-color': branding.primary_color || '#10B981',
          '--tw-ring-opacity': '1'
        } as any)
      }}
    >
      <div className="relative">
        <Image
          src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center"}
          alt={trip.title}
          width={400}
          height={240}
          className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-t-xl"
        />
        <button 
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-opacity-100 transition-colors min-h-[44px] min-w-[44px]"
          style={{ backgroundColor: `${branding.foreground_color || '#FFFFFF'}CC` }}
        >
          <Heart className="w-4 h-4" style={{ color: overlayTextColor }} />
        </button>
        <div 
          className="absolute bottom-2 left-2 rounded-full px-2 py-1 text-xs font-medium"
          style={{ 
            backgroundColor: `${branding.foreground_color || '#FFFFFF'}E6`,
            color: overlayTextColor
          }}
        >
          {trip.available_seats} spots left
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 
            className="font-semibold text-base sm:text-lg leading-tight pr-2" 
            style={{ 
              fontFamily: `var(--tenant-font, 'Inter')`,
              color: cardTextColor
            }}
          >
            {trip.title}
          </h3>
          <div className="flex items-center gap-1 text-xs sm:text-sm flex-shrink-0">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
            <span style={{ color: cardTextColor }}>4.9</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm mb-2 sm:mb-3 flex items-center" style={{ color: cardTextColor }}>
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          {trip.destination}
        </p>
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm" style={{ color: cardTextColor }}>
            <span className="flex items-center">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Full Day
            </span>
          </div>
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold" style={{ color: cardTextColor }}>
              {formatPrice(trip.price_adult)}
            </p>
            <p className="text-xs sm:text-sm" style={{ color: cardTextColor }}>per person</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/trip/${trip.id}`} className="flex-1">
            <button 
              className="w-full py-2 px-3 border font-medium rounded-lg transition-colors hover:opacity-80 min-h-[44px] text-sm sm:text-base"
              style={{ 
                borderColor: branding.accent_color || '#637752',
                backgroundColor: 'transparent',
                color: cardTextColor
              }}
            >
              Details
            </button>
          </Link>
          <Link href={`/booking/${trip.id}`} className="flex-1">
            <button 
              className="w-full py-2 px-3 font-medium rounded-lg transition-colors hover:opacity-90 min-h-[44px] text-sm sm:text-base"
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
  )
} 