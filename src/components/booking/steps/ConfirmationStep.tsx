'use client'

import { CheckCircle, Calendar, MapPin, Users, Mail, Phone, Printer, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { TenantTrip } from '@/types'

interface CreatedBooking {
  id: string
  booking_reference: string
  status: string
  payment_status: string
  total_amount: number
  passenger_count_adult: number
  passenger_count_child: number
  created_at: string
}

interface PassengerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface BookingData {
  passengers: PassengerInfo[]
  selectedDate?: string
  selectedTime?: string
}

interface ConfirmationStepProps {
  trip: TenantTrip
  createdBooking: CreatedBooking
  bookingData: BookingData
  branding: any
  formatDate: (dateString: string) => string
  formatTime: (dateTimeString: string) => string
}

export default function ConfirmationStep({ 
  trip, 
  createdBooking, 
  bookingData, 
  branding,
  formatDate,
  formatTime
}: ConfirmationStepProps) {
  
  const leadPassenger = bookingData.passengers[0]

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2" style={{ 
          color: branding.textOnForeground,
          fontFamily: `var(--tenant-font, 'Inter')`
        }}>
          Booking Confirmed!
        </h2>
        <p className="text-lg" style={{ color: branding.textOnForeground }}>
          Your trip has been successfully booked. We've sent a confirmation email to {leadPassenger?.email}.
        </p>
      </div>

      {/* Booking Reference */}
      <div 
        className="rounded-lg p-6 border-2 text-center"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.primary_color || '#21452e'
        }}
      >
        <h3 className="text-lg font-semibold mb-2" style={{ color: branding.textOnForeground }}>
          Booking Reference
        </h3>
        <div 
          className="text-3xl font-bold tracking-wider"
          style={{ color: branding.primary_color || '#21452e' }}
        >
          {createdBooking.booking_reference}
        </div>
        <p className="text-sm mt-2" style={{ color: branding.textOnForeground }}>
          Please save this reference number for your records
        </p>
      </div>

      {/* Trip Details */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
          Trip Details
        </h3>
        
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold" style={{ color: branding.textOnForeground }}>
              {trip.title}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: branding.textOnForeground }}>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              <span>From {trip.departure_location || 'Departure Location'} to {trip.destination}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                {bookingData.selectedDate ? formatDate(bookingData.selectedDate) : formatDate(trip.departure_time)}
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{bookingData.selectedTime || formatTime(trip.departure_time)}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{createdBooking.passenger_count_adult} {createdBooking.passenger_count_adult === 1 ? 'Adult' : 'Adults'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
          Booking Summary
        </h3>
        
        <div className="space-y-2 text-sm" style={{ color: branding.textOnForeground }}>
          <div className="flex justify-between">
            <span>Booking ID:</span>
            <span className="font-medium">{createdBooking.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className="font-medium capitalize">{createdBooking.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <span className="font-medium capitalize text-green-600">{createdBooking.payment_status}</span>
          </div>
          <div className="flex justify-between">
            <span>Booking Date:</span>
            <span className="font-medium">{new Date(createdBooking.created_at).toLocaleDateString()}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Paid:</span>
              <span style={{ color: branding.primary_color || '#21452e' }}>
                ${(createdBooking.total_amount / 100).toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      {leadPassenger && (
        <div 
          className="rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
            Lead Passenger
          </h3>
          
          <div className="space-y-2 text-sm" style={{ color: branding.textOnForeground }}>
            <div>
              <span className="font-medium">Name:</span> {leadPassenger.firstName} {leadPassenger.lastName}
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              {leadPassenger.email}
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              {leadPassenger.phone}
            </div>
          </div>
        </div>
      )}

      {/* What's Next */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
          What's Next?
        </h3>
        
        <ul className="space-y-2 text-sm" style={{ color: branding.textOnForeground }}>
          <li className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
            <span>You'll receive a confirmation email with your booking details and tickets</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
            <span>We'll send you trip updates and important information closer to your departure date</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
            <span>Arrive at the departure location 15 minutes before your scheduled time</span>
          </li>
          <li className="flex items-start">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
            <span>Bring a valid ID and any items mentioned in the trip requirements</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button 
          onClick={() => window.print()}
          className="py-3 px-6 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50 flex items-center"
          style={{ color: branding.textOnForeground }}
        >
          <Printer className="w-4 h-4 mr-2" />
          Print Confirmation
        </button>
        <Link 
          href={`/booking-lookup?ref=${createdBooking.booking_reference}`}
          className="py-3 px-6 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50 flex items-center"
          style={{ color: branding.textOnForeground }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Booking Details
        </Link>
        <Link 
          href="/"
          className="py-3 px-6 rounded-lg font-medium transition-colors hover:opacity-90 flex items-center"
          style={{
            backgroundColor: branding.primary_color || '#21452e',
            color: 'white'
          }}
        >
          Book Another Trip
        </Link>
      </div>
    </div>
  )
}
