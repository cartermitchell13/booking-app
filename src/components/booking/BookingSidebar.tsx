'use client'

import { MapPin, Calendar, Clock, Users } from 'lucide-react'
import Image from 'next/image'
import { TenantTrip } from '@/types'

interface BookingData {
  selectedDate?: string
  selectedTime?: string
}

interface BookingSidebarProps {
  trip: TenantTrip
  bookingData: BookingData
  passengerCount: number
  totalPrice: number
  branding: any
  formatDate: (dateString: string) => string
  formatTime: (dateTimeString: string) => string
  formatPrice: (priceInCents: number) => string
}

export default function BookingSidebar({ 
  trip, 
  bookingData, 
  passengerCount, 
  totalPrice, 
  branding,
  formatDate,
  formatTime,
  formatPrice
}: BookingSidebarProps) {
  return (
    <div 
      className="rounded-lg shadow-sm p-6 sticky top-8 border-2"
      style={{ 
        backgroundColor: branding.foreground_color || '#FFFFFF',
        borderColor: branding.accent_color || '#637752'
      }}
    >
      <div className="mb-4">
        <Image
          src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center"}
          alt={trip.title}
          width={300}
          height={200}
          className="w-full h-32 object-cover rounded-lg"
        />
      </div>
      
      <h3 className="font-semibold text-lg mb-2" style={{ 
        color: branding.textOnForeground,
        fontFamily: `var(--tenant-font, 'Inter')`
      }}>
        {trip.title}
      </h3>
      
      <div className="space-y-2 text-sm mb-4" style={{ color: branding.textOnForeground }}>
        <div className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          {trip.destination}
        </div>
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {bookingData.selectedDate ? formatDate(bookingData.selectedDate) : formatDate(trip.departure_time)}
        </div>
        <div className="flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          {bookingData.selectedTime || formatTime(trip.departure_time)}
        </div>
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          {passengerCount} {passengerCount === 1 ? 'Adult' : 'Adults'}
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <span style={{ color: branding.textOnForeground }}>
            {formatPrice(trip.price_adult)} x {passengerCount}
          </span>
          <span className="font-medium" style={{ color: branding.textOnForeground }}>
            ${((trip.price_adult * passengerCount) / 100).toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
          <span style={{ color: branding.textOnForeground }}>Total</span>
          <span style={{ color: branding.primary_color || '#21452e' }}>
            ${totalPrice.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  )
}
