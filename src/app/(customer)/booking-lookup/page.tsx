'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, MapPin, Calendar, Clock, Users, Phone, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { useTenant, useTenantBranding } from '@/lib/tenant-context'
import { PageLoading, ButtonLoading } from '@/components/ui'

interface BookingDetails {
  id: string
  booking_reference: string
  status: string
  payment_status: string
  total_amount: number
  passenger_count_adult: number
  passenger_count_child: number
  passenger_details: any[]
  special_requests: string
  created_at: string
  trips: {
    title: string
    destination: string
    departure_location: string
    departure_time: string
    image_url: string
  }
}

export default function BookingLookupPage() {
  const { tenant } = useTenant()
  const branding = useTenantBranding()
  const searchParams = useSearchParams()
  const [bookingReference, setBookingReference] = useState('')
  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-search if booking reference is provided in URL
  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref && ref !== bookingReference) {
      setBookingReference(ref)
      // Delay to ensure state is set before searching
      setTimeout(() => searchBooking(), 100)
    }
  }, [searchParams])

  const searchBooking = async () => {
    if (!bookingReference.trim()) {
      setError('Please enter a booking reference')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/bookings?booking_reference=${bookingReference.trim()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to find booking')
      }

      if (result.success && result.bookings && result.bookings.length > 0) {
        setBooking(result.bookings[0])
      } else {
        setError('No booking found with this reference number')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search booking')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-600'
      case 'cancelled':
        return 'text-red-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  if (!tenant) {
    return <PageLoading message="Loading..." showLogo={false} />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className={`text-2xl sm:text-3xl ${branding.headingWeightClass} mb-3 sm:mb-4`} style={{ 
            color: branding.textOnBackground,
            fontFamily: `var(--tenant-font, 'Inter')`
          }}>
            Find Your Booking
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4 text-base leading-relaxed">
            Enter your booking reference number to view your trip details, make changes, or cancel your booking.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm max-w-2xl mx-auto">
            <p className="text-blue-700 leading-relaxed">
              <strong>Have an account?</strong> <Link href="/account/bookings" className="text-blue-600 hover:text-blue-800 underline">Sign in to view all your bookings</Link> without entering reference numbers.
            </p>
          </div>
        </div>

        {/* Mobile-Optimized Search Section */}
        <div 
          className="rounded-xl shadow-lg border-2 mb-6 sm:mb-8"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <div className="p-4 sm:p-6">
            <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4">
              <div className="flex-1">
                <label htmlFor="booking-ref" className="block text-base sm:text-sm font-semibold mb-3 sm:mb-2" style={{ color: branding.textOnForeground }}>
                  Booking Reference
                </label>
                <input
                  id="booking-ref"
                  type="text"
                  inputMode="text"
                  autoComplete="off"
                  value={bookingReference}
                  onChange={(e) => setBookingReference(e.target.value.toUpperCase())}
                  placeholder="e.g., PB-123456-ABCD"
                  onKeyPress={(e) => e.key === 'Enter' && searchBooking()}
                  className="block w-full min-h-[48px] h-12 sm:h-10 px-4 py-3 text-base sm:text-sm border-2 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:border-transparent focus:outline-none transition-all duration-200 placeholder-gray-500"
                  style={{ 
                    '--tw-ring-color': branding.primary_color || '#10B981'
                  } as React.CSSProperties}
                />
              </div>
              <div className="sm:flex sm:items-end">
                <ButtonLoading
                  loading={loading}
                  onClick={searchBooking}
                  size="md"
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Search
                </ButtonLoading>
              </div>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-red-800 text-sm leading-relaxed">{error}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-Optimized Booking Details */}
        {booking && (
          <div 
            className="rounded-xl shadow-lg border-2 overflow-hidden"
            style={{ 
              backgroundColor: branding.foreground_color || '#FFFFFF',
              borderColor: branding.accent_color || '#637752'
            }}
          >
            {/* Mobile Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl sm:text-2xl ${branding.headingWeightClass}`} style={{ 
                  color: branding.textOnForeground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                }}>
                  Booking Details
                </h2>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(booking.status)}
                  <span className={`font-semibold text-sm sm:text-base ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Mobile Booking Reference */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="text-center">
                  <span className="text-sm text-gray-600">Booking Reference</span>
                  <div className="text-lg font-bold mt-1" style={{ color: branding.primary_color || '#21452e' }}>
                    {booking.booking_reference}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="p-4 sm:p-6">
              <div className="space-y-6 sm:space-y-8">
                
                {/* Trip Information - Mobile Optimized */}
                <div>
                  <h3 className="font-bold text-lg mb-4 pb-2 border-b border-gray-200" style={{ color: branding.textOnForeground }}>
                    Trip Information
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start mb-3">
                        <MapPin className="w-5 h-5 mr-3 mt-1 flex-shrink-0" style={{ color: branding.primary_color }} />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-lg leading-tight mb-1" style={{ color: branding.textOnForeground }}>
                            {booking.trips.title}
                          </p>
                          <p className="text-base text-gray-600">{booking.trips.destination}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: branding.primary_color }} />
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Date</div>
                            <div className="text-sm font-semibold" style={{ color: branding.textOnForeground }}>
                              {formatDate(booking.trips.departure_time)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: branding.primary_color }} />
                          <div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Time</div>
                            <div className="text-sm font-semibold" style={{ color: branding.textOnForeground }}>
                              {formatTime(booking.trips.departure_time)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Summary - Mobile Optimized */}
                <div>
                  <h3 className="font-bold text-lg mb-4 pb-2 border-b border-gray-200" style={{ color: branding.textOnForeground }}>
                    Booking Summary
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Passengers:</span>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" style={{ color: branding.primary_color }} />
                          <span className="font-bold" style={{ color: branding.textOnForeground }}>
                            {booking.passenger_count_adult} {booking.passenger_count_adult === 1 ? 'Adult' : 'Adults'}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center py-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-700">Total Amount:</span>
                        <span className="text-xl font-bold" style={{ color: branding.primary_color || '#21452e' }}>
                          ${(booking.total_amount / 100).toFixed(0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Payment Status:</span>
                        <span className={`font-bold text-sm px-3 py-1 rounded-full ${booking.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Booked:</span>
                        <span className="font-semibold" style={{ color: branding.textOnForeground }}>
                          {new Date(booking.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Passenger Details - Mobile Optimized */}
                {booking.passenger_details && booking.passenger_details.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 pb-2 border-b border-gray-200" style={{ color: branding.textOnForeground }}>
                      Passenger Details
                    </h3>
                    <div className="space-y-4">
                      {booking.passenger_details.map((passenger: any, index: number) => (
                        <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
                          <h4 className="font-bold mb-3 flex items-center" style={{ color: branding.textOnForeground }}>
                            <Users className="w-4 h-4 mr-2" style={{ color: branding.primary_color }} />
                            Passenger {index + 1} {index === 0 && '(Lead)'}
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <span className="text-sm font-semibold text-gray-700 w-16">Name:</span>
                              <span className="text-sm font-bold" style={{ color: branding.textOnForeground }}>
                                {passenger.firstName} {passenger.lastName}
                              </span>
                            </div>
                            {passenger.email && (
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm" style={{ color: branding.textOnForeground }}>
                                  {passenger.email}
                                </span>
                              </div>
                            )}
                            {passenger.phone && (
                              <div className="flex items-center">
                                <Phone className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm" style={{ color: branding.textOnForeground }}>
                                  {passenger.phone}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Special Requests - Mobile Optimized */}
                {booking.special_requests && (
                  <div>
                    <h3 className="font-bold text-lg mb-4 pb-2 border-b border-gray-200" style={{ color: branding.textOnForeground }}>
                      Special Requests
                    </h3>
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-sm leading-relaxed" style={{ color: branding.textOnForeground }}>
                        {booking.special_requests}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mobile Action Buttons */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.print()}
                      className="w-full flex items-center justify-center gap-2 min-h-[48px] py-3 px-6 border-2 border-gray-300 rounded-lg font-semibold transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
                      style={{ color: branding.textOnForeground }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Print Booking Details
                    </button>
                    
                    {booking.status === 'confirmed' && (
                      <button
                        className="w-full flex items-center justify-center gap-2 min-h-[48px] py-3 px-6 border-2 border-red-300 text-red-600 rounded-lg font-semibold transition-all duration-200 hover:bg-red-50 hover:border-red-400"
                        onClick={async () => {
                          const canCancel = (() => {
                            const departureTime = new Date(booking.trips.departure_time);
                            const now = new Date();
                            const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
                            
                            if (departureTime <= now) return { canCancel: false, reason: 'Trip has already departed' };
                            if (hoursUntilDeparture < 24) return { canCancel: false, reason: 'Must cancel 24+ hours before departure' };
                            return { canCancel: true };
                          })();

                          if (!canCancel.canCancel) {
                            alert(canCancel.reason);
                            return;
                          }

                          if (!confirm(`Are you sure you want to cancel your booking for ${booking.trips.title}? This action cannot be undone.`)) {
                            return;
                          }

                          try {
                            const response = await fetch('/api/bookings', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                booking_reference: booking.booking_reference,
                                tenant_id: tenant?.id,
                                cancellation_reason: 'Cancelled by customer via booking lookup'
                              }),
                            });

                            const result = await response.json();
                            if (!response.ok) throw new Error(result.error || 'Failed to cancel booking');
                            
                            alert('Booking cancelled successfully');
                            setBooking({ ...booking, status: 'cancelled' });
                          } catch (error) {
                            alert(`Failed to cancel booking: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          }
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Cancel Booking
                      </button>
                    )}
                    
                    <Link 
                      href="/"
                      className="w-full flex items-center justify-center gap-2 min-h-[48px] py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 hover:shadow-lg focus:ring-2 focus:ring-offset-2"
                      style={{
                        backgroundColor: branding.primary_color || '#21452e',
                        '--tw-ring-color': branding.primary_color || '#21452e'
                      } as React.CSSProperties}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Back to Home
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 