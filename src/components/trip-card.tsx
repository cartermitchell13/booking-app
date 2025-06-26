'use client'

import { TenantTrip } from '@/types'
import { MapPin, Clock, Star, Heart, Share } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTenantBranding } from '@/lib/tenant-context'

interface TripCardProps {
  trip: TenantTrip
  variant?: 'default' | 'compact' | 'horizontal'
  showWishlist?: boolean
  showShare?: boolean
}

export function TripCard({ 
  trip, 
  variant = 'default', 
  showWishlist = true, 
  showShare = true 
}: TripCardProps) {
  const branding = useTenantBranding()

  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Default variant - full trip card
  if (variant === 'default') {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
        <div className="relative">
          <Image
            src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center"}
            alt={trip.title}
            width={400}
            height={240}
            className="w-full h-60 object-cover"
          />
          <div className="absolute top-4 left-4">
            <span 
              className="px-3 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: branding.primary_color || '#10B981' }}
            >
              {trip.available_seats} spots left
            </span>
          </div>
          {showWishlist && (
            <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
              <Heart className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
                  <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <Link href={`/trip/${trip.id}`}>
                <h3 className="font-semibold text-lg text-gray-900 leading-tight hover:text-emerald-600 transition-colors cursor-pointer">
                  {trip.title}
                </h3>
              </Link>
            <div className="flex items-center gap-1 text-sm text-gray-600 ml-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.9</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-3 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {trip.destination}
          </p>
          <p className="text-gray-700 text-sm mb-4">
            {trip.description || "Experience the beauty of nature with our guided adventure."}
          </p>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(trip.departure_time)}
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
              <button className="w-full py-3 px-4 border border-gray-200 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50">
                View Details
              </button>
            </Link>
            <Link href={`/booking/${trip.id}`} className="flex-1">
              <button 
                className="w-full py-3 px-4 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                style={{ backgroundColor: branding.primary_color || '#10B981' }}
              >
                Book Now
              </button>
            </Link>
            {showShare && (
              <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Share className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Horizontal variant - for search results with more details
  if (variant === 'horizontal') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="flex">
          <div className="w-48 h-32 relative flex-shrink-0">
            <Image
              src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center"}
              alt={trip.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
                             <div>
                 <Link href={`/trip/${trip.id}`}>
                   <h3 className="font-semibold text-lg text-gray-900 hover:text-emerald-600 transition-colors cursor-pointer">
                     {trip.title}
                   </h3>
                 </Link>
                <p className="text-gray-600 text-sm flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {trip.destination}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.9</span>
                </div>
                {showWishlist && (
                  <button className="p-1 hover:bg-gray-50 rounded">
                    <Heart className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">
              {trip.description || "Experience the beauty of nature with our guided adventure."}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatTime(trip.departure_time)}
                </span>
                <span 
                  className="px-2 py-1 text-xs font-medium text-white rounded-full"
                  style={{ backgroundColor: branding.primary_color || '#10B981' }}
                >
                  {trip.available_seats} spots left
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(trip.price_adult)}
                  </p>
                  <p className="text-xs text-gray-600">per person</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/trip/${trip.id}`}>
                    <button className="py-2 px-3 border border-gray-200 text-gray-700 font-medium rounded-lg transition-colors hover:bg-gray-50">
                      Details
                    </button>
                  </Link>
                  <Link href={`/booking/${trip.id}`}>
                    <button 
                      className="py-2 px-4 text-white font-medium rounded-lg transition-colors hover:opacity-90"
                      style={{ backgroundColor: branding.primary_color || '#10B981' }}
                    >
                      Book
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

  // Compact variant - for today's trips or sidebars
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex">
          <div className="w-20 p-4 flex flex-col items-center justify-center border-r border-gray-100">
            <span className="text-lg font-bold text-gray-900">
              {formatTime(trip.departure_time)}
            </span>
          </div>
          <div className="flex-1 p-4">
            <div className="flex items-start gap-3">
              <Image
                src={trip.image_url || "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=200&h=150&fit=crop&crop=center"}
                alt={trip.title}
                width={60}
                height={60}
                className="w-15 h-15 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                                 <Link href={`/trip/${trip.id}`}>
                   <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 hover:text-emerald-600 transition-colors cursor-pointer">
                     {trip.title}
                   </h3>
                 </Link>
                <p className="text-xs text-gray-600 mb-2 flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {trip.destination}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">
                    {formatPrice(trip.price_adult)}
                  </span>
                  <span className="text-xs text-orange-600 font-medium">
                    {trip.available_seats} spots left
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Link href={`/trip/${trip.id}`} className="flex-1">
                <button className="w-full py-2 px-3 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors hover:bg-gray-50">
                  Details
                </button>
              </Link>
              <Link href={`/booking/${trip.id}`} className="flex-1">
                <button 
                  className="w-full py-2 px-3 text-white text-sm font-medium rounded-lg transition-colors hover:opacity-90"
                  style={{ backgroundColor: branding.primary_color || '#10B981' }}
                >
                  Book
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
} 