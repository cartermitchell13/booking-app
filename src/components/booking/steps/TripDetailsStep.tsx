'use client'

import { Users, MapPin, Calendar, Clock, Star, X } from 'lucide-react'
import Image from 'next/image'
import { TenantTrip } from '@/types'

interface TripDetailsStepProps {
  trip: TenantTrip
  passengerCount: number
  setPassengerCount: (count: number) => void
  onNext: () => void
  branding: any
  formatDate: (dateString: string) => string
  formatTime: (dateTimeString: string) => string
}

export default function TripDetailsStep({ 
  trip, 
  passengerCount, 
  setPassengerCount, 
  onNext, 
  branding,
  formatDate,
  formatTime
}: TripDetailsStepProps) {
  return (
    <div className="space-y-8">
      {/* Trip Overview */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Image
              src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=300&fit=crop&crop=center"}
              alt={trip.title}
              width={500}
              height={300}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ 
              color: branding.textOnForeground,
              fontFamily: `var(--tenant-font, 'Inter')`
            }}>
              {trip.title}
            </h2>
            
            <div className="space-y-3 text-sm" style={{ color: branding.textOnForeground }}>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>From {trip.departure_location || 'Departure Location'} to {trip.destination}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{formatDate(trip.departure_time)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>{formatTime(trip.departure_time)}</span>
              </div>
              {(trip as any).duration && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Duration: {(trip as any).duration}</span>
                </div>
              )}
              {trip.difficulty_level && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  <span>Difficulty: {trip.difficulty_level}</span>
                </div>
              )}
              {(trip as any).minimum_age && (
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Minimum Age: {(trip as any).minimum_age}+</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trip Description */}
      {trip.description && (
        <div 
          className="rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
            About This Trip
          </h3>
          <div 
            className="prose prose-lg max-w-none"
            style={{ color: branding.textOnForeground }}
            dangerouslySetInnerHTML={{ __html: trip.description }}
          />
        </div>
      )}

      {/* Highlights */}
      {trip.highlights && trip.highlights.length > 0 && (
        <div 
          className="rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
            Trip Highlights
          </h3>
          <ul className="space-y-2">
            {trip.highlights.map((highlight, index) => (
              <li key={index} className="flex items-start">
                <Star className="w-4 h-4 mr-2 mt-0.5 text-yellow-500" />
                <span style={{ color: branding.textOnForeground }}>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What's Included */}
      {trip.included_items && trip.included_items.length > 0 && (
        <div 
          className="rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
            What's Included
          </h3>
          <ul className="space-y-2">
            {trip.included_items.map((item, index) => (
              <li key={index} className="flex items-start">
                <div className="w-4 h-4 mr-2 mt-0.5 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span style={{ color: branding.textOnForeground }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* What's NOT Included */}
      {trip.excluded_items && trip.excluded_items.length > 0 && (
        <div 
          className="rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
            What's NOT Included
          </h3>
          <ul className="space-y-2">
            {trip.excluded_items.map((item, index) => (
              <li key={index} className="flex items-start">
                <X className="w-4 h-4 mr-2 mt-0.5 text-red-500" />
                <span style={{ color: branding.textOnForeground }}>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements */}
      {trip.requirements && trip.requirements.length > 0 && (
        <div 
          className="rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
            Requirements & What to Bring
          </h3>
          <ul className="space-y-2">
            {trip.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <div className="w-4 h-4 mr-2 mt-0.5 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <span style={{ color: branding.textOnForeground }}>{requirement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Passenger Count Selection */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
          How many adults?
        </h3>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
            style={{ borderColor: branding.accent_color || '#637752' }}
            disabled={passengerCount <= 1}
          >
            <span style={{ color: branding.textOnForeground }}>-</span>
          </button>
          <span className="text-xl font-semibold min-w-[3rem] text-center" style={{ color: branding.textOnForeground }}>
            {passengerCount}
          </span>
          <button
            onClick={() => setPassengerCount(passengerCount + 1)}
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-50 transition-colors"
            style={{ borderColor: branding.accent_color || '#637752' }}
          >
            <span style={{ color: branding.textOnForeground }}>+</span>
          </button>
        </div>
        <p className="text-sm mt-2" style={{ color: branding.textOnForeground }}>
          Adult price: ${(trip.price_adult / 100).toFixed(0)} per person
        </p>
      </div>

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="py-3 px-8 rounded-lg font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: branding.primary_color || '#21452e',
            color: 'white'
          }}
        >
          Continue to Date Selection
        </button>
      </div>
    </div>
  )
}
