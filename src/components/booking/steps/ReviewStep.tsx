'use client'

import { MapPin, Calendar, Clock, Users, User, Mail, Phone, AlertTriangle } from 'lucide-react'
import Image from 'next/image'
import { TenantTrip } from '@/types'

interface PassengerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  emergencyContact: string
  emergencyPhone: string
  dietaryRestrictions: string
}

interface BookingData {
  passengers: PassengerInfo[]
  agreeToTerms: boolean
  specialRequests: string
  selectedDate?: string
  selectedTime?: string
  selectedInstanceId?: string
}

interface ReviewStepProps {
  trip: TenantTrip
  bookingData: BookingData
  setBookingData: (data: BookingData) => void
  passengerCount: number
  totalPrice: number
  onNext: () => void
  onBack: () => void
  branding: any
  formatDate: (dateString: string) => string
  formatTime: (dateTimeString: string) => string
  formatPrice: (priceInCents: number) => string
}

export default function ReviewStep({ 
  trip, 
  bookingData, 
  setBookingData, 
  passengerCount, 
  totalPrice, 
  onNext, 
  onBack, 
  branding,
  formatDate,
  formatTime,
  formatPrice
}: ReviewStepProps) {
  
  const canContinue = bookingData.agreeToTerms

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ 
          color: branding.textOnForeground,
          fontFamily: `var(--tenant-font, 'Inter')`
        }}>
          Review Your Booking
        </h2>
        <p className="text-lg" style={{ color: branding.textOnForeground }}>
          Please review all details before proceeding to payment.
        </p>
      </div>

      {/* Trip Summary */}
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Image
              src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop&crop=center"}
              alt={trip.title}
              width={400}
              height={250}
              className="w-full h-32 object-cover rounded-lg"
            />
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3" style={{ color: branding.textOnForeground }}>
              {trip.title}
            </h4>
            
            <div className="space-y-2 text-sm" style={{ color: branding.textOnForeground }}>
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
                <Clock className="w-4 h-4 mr-2" />
                <span>{bookingData.selectedTime || formatTime(trip.departure_time)}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>{passengerCount} {passengerCount === 1 ? 'Adult' : 'Adults'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Passenger Information */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
          Passenger Information
        </h3>
        
        <div className="space-y-4">
          {bookingData.passengers.map((passenger, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
              <h4 className="font-medium mb-2 flex items-center" style={{ color: branding.textOnForeground }}>
                <User className="w-4 h-4 mr-2" />
                Passenger {index + 1}
                {index === 0 && <span className="ml-2 text-sm font-normal">(Lead Passenger)</span>}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm" style={{ color: branding.textOnForeground }}>
                <div>
                  <span className="font-medium">Name:</span> {passenger.firstName} {passenger.lastName}
                </div>
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  {passenger.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  {passenger.phone}
                </div>
                <div>
                  <span className="font-medium">Date of Birth:</span> {passenger.dateOfBirth}
                </div>
                <div className="flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Emergency: {passenger.emergencyContact} ({passenger.emergencyPhone})
                </div>
                {passenger.dietaryRestrictions && (
                  <div className="md:col-span-2">
                    <span className="font-medium">Dietary Restrictions:</span> {passenger.dietaryRestrictions}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Requests */}
      {bookingData.specialRequests && (
        <div 
          className="rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
            Special Requests
          </h3>
          <p style={{ color: branding.textOnForeground }}>
            {bookingData.specialRequests}
          </p>
        </div>
      )}

      {/* Pricing Summary */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
          Pricing Summary
        </h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span style={{ color: branding.textOnForeground }}>
              {formatPrice(trip.price_adult)} x {passengerCount} {passengerCount === 1 ? 'Adult' : 'Adults'}
            </span>
            <span className="font-medium" style={{ color: branding.textOnForeground }}>
              ${((trip.price_adult * passengerCount) / 100).toFixed(0)}
            </span>
          </div>
          
          <div className="border-t pt-2">
            <div className="flex justify-between items-center text-lg font-bold">
              <span style={{ color: branding.textOnForeground }}>Total</span>
              <span style={{ color: branding.primary_color || '#21452e' }}>
                ${totalPrice.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={bookingData.agreeToTerms}
            onChange={(e) => setBookingData({ ...bookingData, agreeToTerms: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="agreeToTerms" className="text-sm" style={{ color: branding.textOnForeground }}>
            I agree to the{' '}
            <a href="/terms" target="_blank" className="underline hover:no-underline" style={{ color: branding.primary_color || '#21452e' }}>
              Terms and Conditions
            </a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" className="underline hover:no-underline" style={{ color: branding.primary_color || '#21452e' }}>
              Privacy Policy
            </a>
            . I understand the cancellation policy and booking terms.
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="py-3 px-6 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50"
          style={{ color: branding.textOnForeground }}
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className={`py-3 px-8 rounded-lg font-medium transition-colors ${
            canContinue 
              ? 'hover:opacity-90' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          style={{
            backgroundColor: canContinue ? (branding.primary_color || '#21452e') : '#gray-400',
            color: 'white'
          }}
        >
          Proceed to Payment
        </button>
      </div>
    </div>
  )
}
