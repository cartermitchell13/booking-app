'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Clock, Users, Star, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTenant, useTenantSupabase, useTenantBranding } from '@/lib/tenant-context'
import { useAuth } from '@/lib/auth-context'
import { TenantTrip } from '@/types'
import { PageLoading, ButtonLoading } from '@/components/ui'

type BookingStep = 'details' | 'passengers' | 'review' | 'payment' | 'confirmation'

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
}

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

export default function BookingPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const [trip, setTrip] = useState<TenantTrip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [currentStep, setCurrentStep] = useState<BookingStep>('details')
  const [passengerCount, setPassengerCount] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    passengers: [],
    agreeToTerms: false,
    specialRequests: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [createdBooking, setCreatedBooking] = useState<CreatedBooking | null>(null)
  const [isCreatingBooking, setIsCreatingBooking] = useState(false)

  const { tenant, isLoading: tenantLoading } = useTenant()
  const { getProductById } = useTenantSupabase()
  const { user } = useAuth()
  const branding = useTenantBranding()

  // Load trip data from database (using new products system)
  useEffect(() => {
    if (tenantLoading || !tenant || !tripId) return

    const loadTrip = async () => {
      try {
        setLoading(true)
        setError(undefined)
        console.log('Loading trip with ID:', tripId)
        const tripData = await getProductById(tripId)
        console.log('Trip data loaded:', tripData)
        setTrip(tripData)
      } catch (err) {
        console.error('Error loading trip:', err)
        setError('Trip not found or no longer available')
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [tenant, tenantLoading, tripId, getProductById])

  // Format price for display
  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(0)}`
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Create booking function
  const createBooking = async () => {
    if (!trip || !tenant) {
      console.error('Missing trip or tenant data')
      return
    }

    setIsCreatingBooking(true)
    try {
      console.log('Creating booking for trip:', trip.id)
      
      const bookingPayload = {
        tenant_id: tenant.id,
        product_id: trip.id, // Using products system
        user_id: user?.id || null, // Use logged-in user ID or null for guest booking
        customer_email: user?.email,
        customer_name: user ? `${user.first_name} ${user.last_name}` : '',
        passenger_count_adult: passengerCount,
        passenger_count_child: 0,
        passenger_details: bookingData.passengers,
        total_amount: trip.price_adult * passengerCount, // Already in cents
        special_requests: bookingData.specialRequests || null,
        payment_intent_id: `sim_${Date.now()}` // Simulated payment ID for now
      }

      console.log('Booking payload:', bookingPayload)

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload)
      })

      const result = await response.json()
      console.log('Booking API response:', JSON.stringify(result, null, 2))
      console.log('Response status:', response.status)

      if (!response.ok) {
        console.error('Booking API error:', result)
        console.error('Response details:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error,
          details: result.details
        })
        throw new Error(result.error || `Failed to create booking (Status: ${response.status})`)
      }

      if (result.success && result.booking) {
        setCreatedBooking(result.booking)
        setCurrentStep('confirmation')
        console.log('Booking created successfully:', result.booking)
      } else {
        throw new Error('Invalid response from booking API')
      }

    } catch (error) {
      console.error('Error creating booking:', error)
      alert(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreatingBooking(false)
    }
  }

  if (tenantLoading || loading) {
    return <PageLoading message="Loading trip details..." />;
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
        <div className="text-center">
          <p className="mb-2" style={{ color: '#DC2626' }}>Tenant not found</p>
          <p style={{ color: branding.textOnBackground }}>Please check your domain configuration</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4" style={{ color: branding.textOnBackground }}>
            {error || 'Trip Not Found'}
          </h1>
          <p className="mb-8" style={{ color: branding.textOnBackground }}>
            {error || "The trip you're looking for doesn't exist."}
          </p>
          <Link 
            href="/"
            className="inline-block py-3 px-6 rounded-lg font-medium transition-colors hover:opacity-90"
            style={{
              backgroundColor: branding.primary_color || '#21452e',
              color: branding.textOnPrimary
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const steps = [
    { id: 'details', label: 'Trip Details', completed: false },
    { id: 'passengers', label: 'Passengers', completed: false },
    { id: 'review', label: 'Review', completed: false },
    { id: 'payment', label: 'Payment', completed: false },
    { id: 'confirmation', label: 'Confirmation', completed: false }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  
  // Mark completed steps
  steps.forEach((step, index) => {
    step.completed = index < currentStepIndex
  })

  const totalPrice = (trip.price_adult * passengerCount) / 100 // Convert from cents

  return (
    <div className="min-h-screen" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center hover:opacity-70 transition-colors"
                style={{ color: branding.textOnBackground }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <Image
                src={branding.logo_url || "/images/black-pb-logo.png"}
                alt={tenant.name}
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            
            <div className="text-right">
              <p className="text-sm" style={{ color: branding.textOnBackground }}>Total</p>
              <p className="text-xl font-bold" style={{ color: branding.primary_color || '#21452e' }}>
                ${totalPrice.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.completed 
                      ? 'text-white' 
                      : step.id === currentStep 
                        ? 'text-white' 
                        : 'text-gray-400 border-2 border-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: step.completed || step.id === currentStep ? (branding.primary_color || '#21452e') : 'transparent'
                  }}
                >
                  {step.completed ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span 
                  className={`ml-2 text-sm font-medium ${
                    step.completed || step.id === currentStep ? '' : 'text-gray-400'
                  }`}
                  style={{ 
                    color: step.completed || step.id === currentStep ? (branding.primary_color || '#21452e') : undefined 
                  }}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-12 h-px bg-gray-300 mx-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 'details' && (
              <div 
                className="rounded-lg shadow-sm p-6 border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#637752'
                }}
              >
                <h1 className="text-2xl font-bold mb-4" style={{ 
                  color: branding.textOnForeground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                }}>
                  {trip.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-6 text-sm" style={{ color: branding.textOnForeground }}>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {trip.destination}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(trip.departure_time)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(trip.departure_time)}
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    4.9
                  </div>
                </div>

                <div className="mb-6">
                  <Image
                    src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center"}
                    alt={trip.title}
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3" style={{ 
                    color: branding.textOnForeground,
                    fontFamily: `var(--tenant-font, 'Inter')`
                  }}>
                    About This Experience
                  </h2>
                  <p className="leading-relaxed" style={{ color: branding.textOnForeground }}>
                    {trip.description || "Experience the beauty of nature with our guided adventure."}
                  </p>
                </div>

                {trip.highlights && trip.highlights.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3" style={{ 
                      color: branding.textOnForeground,
                      fontFamily: `var(--tenant-font, 'Inter')`
                    }}>
                      Highlights
                    </h2>
                    <ul className="space-y-2">
                      {trip.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <Check 
                            className="w-5 h-5 mr-2 mt-0.5" 
                            style={{ color: branding.primary_color || '#10B981' }}
                          />
                          <span style={{ color: branding.textOnForeground }}>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trip.included_items && trip.included_items.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3" style={{ 
                      color: branding.textOnForeground,
                      fontFamily: `var(--tenant-font, 'Inter')`
                    }}>
                      What's Included
                    </h2>
                    <ul className="space-y-2">
                      {trip.included_items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check 
                            className="w-5 h-5 mr-2 mt-0.5" 
                            style={{ color: branding.primary_color || '#10B981' }}
                          />
                          <span style={{ color: branding.textOnForeground }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3" style={{ 
                    color: branding.textOnForeground,
                    fontFamily: `var(--tenant-font, 'Inter')`
                  }}>
                    Select Passengers
                  </h2>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-medium transition-colors hover:opacity-70"
                      style={{ borderColor: branding.primary_color || '#21452e', color: branding.primary_color || '#21452e' }}
                    >
                      -
                    </button>
                    <span className="text-lg font-medium min-w-[3rem] text-center" style={{ color: branding.textOnForeground }}>
                      {passengerCount} {passengerCount === 1 ? 'Adult' : 'Adults'}
                    </span>
                    <button 
                      onClick={() => setPassengerCount(Math.min(trip.available_seats, passengerCount + 1))}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-medium transition-colors hover:opacity-70"
                      style={{ borderColor: branding.primary_color || '#21452e', color: branding.primary_color || '#21452e' }}
                      disabled={passengerCount >= trip.available_seats}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm mt-2" style={{ color: branding.textOnForeground }}>
                    {trip.available_seats} spots available
                  </p>
                </div>

                <button 
                  onClick={() => setCurrentStep('passengers')}
                  className="w-full py-3 px-6 rounded-lg font-medium transition-colors hover:opacity-90"
                  style={{
                    backgroundColor: branding.primary_color || '#21452e',
                    color: branding.textOnPrimary
                  }}
                >
                  Continue to Passenger Details
                </button>
              </div>
            )}

{currentStep === 'passengers' && (
              <div 
                className="rounded-lg shadow-sm p-6 border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#637752'
                }}
              >
                <h2 className="text-xl font-semibold mb-6" style={{ 
                  color: branding.textOnForeground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                }}>
                  Passenger Information
                </h2>
                
                {/* Initialize passenger forms */}
                {(() => {
                  // Ensure we have the right number of passenger objects
                  const passengers = [...bookingData.passengers]
                  while (passengers.length < passengerCount) {
                    passengers.push({
                      firstName: '',
                      lastName: '',
                      email: '',
                      phone: '',
                      dateOfBirth: '',
                      emergencyContact: '',
                      emergencyPhone: '',
                      dietaryRestrictions: ''
                    })
                  }
                  // Update booking data if needed
                  if (passengers.length !== bookingData.passengers.length) {
                    setBookingData({ ...bookingData, passengers })
                  }
                  
                  return passengers.map((passenger, index) => (
                    <div 
                      key={index} 
                      className="border-2 rounded-lg p-6 mb-6"
                      style={{ 
                        backgroundColor: branding.background_color || '#FFFFFF',
                        borderColor: branding.accent_color || '#637752'
                      }}
                    >
                      <h3 className="text-lg font-medium mb-4" style={{ color: branding.textOnBackground }}>
                        Passenger {index + 1} {index === 0 && '(Lead Passenger)'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                          </label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => {
                              const newPassengers = [...bookingData.passengers]
                              newPassengers[index] = { ...newPassengers[index], firstName: e.target.value }
                              setBookingData({ ...bookingData, passengers: newPassengers })
                              // Clear error when user starts typing
                              if (formErrors[`passenger${index}firstName`]) {
                                const newErrors = { ...formErrors }
                                delete newErrors[`passenger${index}firstName`]
                                setFormErrors(newErrors)
                              }
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                              formErrors[`passenger${index}firstName`] 
                                ? 'border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:ring-blue-200'
                            }`}
                            placeholder="Enter first name"
                          />
                          {formErrors[`passenger${index}firstName`] && (
                            <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}firstName`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => {
                              const newPassengers = [...bookingData.passengers]
                              newPassengers[index] = { ...newPassengers[index], lastName: e.target.value }
                              setBookingData({ ...bookingData, passengers: newPassengers })
                              if (formErrors[`passenger${index}lastName`]) {
                                const newErrors = { ...formErrors }
                                delete newErrors[`passenger${index}lastName`]
                                setFormErrors(newErrors)
                              }
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                              formErrors[`passenger${index}lastName`] 
                                ? 'border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:ring-blue-200'
                            }`}
                            placeholder="Enter last name"
                          />
                          {formErrors[`passenger${index}lastName`] && (
                            <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}lastName`]}</p>
                          )}
                        </div>
                        
                        {index === 0 && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address *
                              </label>
                              <input
                                type="email"
                                value={passenger.email}
                                onChange={(e) => {
                                  const newPassengers = [...bookingData.passengers]
                                  newPassengers[index] = { ...newPassengers[index], email: e.target.value }
                                  setBookingData({ ...bookingData, passengers: newPassengers })
                                  if (formErrors[`passenger${index}email`]) {
                                    const newErrors = { ...formErrors }
                                    delete newErrors[`passenger${index}email`]
                                    setFormErrors(newErrors)
                                  }
                                }}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                                  formErrors[`passenger${index}email`] 
                                    ? 'border-red-500 focus:ring-red-200' 
                                    : 'border-gray-300 focus:ring-blue-200'
                                }`}
                                placeholder="your.email@example.com"
                              />
                              {formErrors[`passenger${index}email`] && (
                                <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}email`]}</p>
                              )}
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                value={passenger.phone}
                                onChange={(e) => {
                                  const newPassengers = [...bookingData.passengers]
                                  newPassengers[index] = { ...newPassengers[index], phone: e.target.value }
                                  setBookingData({ ...bookingData, passengers: newPassengers })
                                  if (formErrors[`passenger${index}phone`]) {
                                    const newErrors = { ...formErrors }
                                    delete newErrors[`passenger${index}phone`]
                                    setFormErrors(newErrors)
                                  }
                                }}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                                  formErrors[`passenger${index}phone`] 
                                    ? 'border-red-500 focus:ring-red-200' 
                                    : 'border-gray-300 focus:ring-blue-200'
                                }`}
                                placeholder="(555) 123-4567"
                              />
                              {formErrors[`passenger${index}phone`] && (
                                <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}phone`]}</p>
                              )}
                            </div>
                          </>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date of Birth *
                          </label>
                          <input
                            type="date"
                            value={passenger.dateOfBirth}
                            onChange={(e) => {
                              const newPassengers = [...bookingData.passengers]
                              newPassengers[index] = { ...newPassengers[index], dateOfBirth: e.target.value }
                              setBookingData({ ...bookingData, passengers: newPassengers })
                              if (formErrors[`passenger${index}dateOfBirth`]) {
                                const newErrors = { ...formErrors }
                                delete newErrors[`passenger${index}dateOfBirth`]
                                setFormErrors(newErrors)
                              }
                            }}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                              formErrors[`passenger${index}dateOfBirth`] 
                                ? 'border-red-500 focus:ring-red-200' 
                                : 'border-gray-300 focus:ring-blue-200'
                            }`}
                          />
                          {formErrors[`passenger${index}dateOfBirth`] && (
                            <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}dateOfBirth`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emergency Contact
                          </label>
                          <input
                            type="text"
                            value={passenger.emergencyContact}
                            onChange={(e) => {
                              const newPassengers = [...bookingData.passengers]
                              newPassengers[index] = { ...newPassengers[index], emergencyContact: e.target.value }
                              setBookingData({ ...bookingData, passengers: newPassengers })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            placeholder="Emergency contact name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Emergency Phone
                          </label>
                          <input
                            type="tel"
                            value={passenger.emergencyPhone}
                            onChange={(e) => {
                              const newPassengers = [...bookingData.passengers]
                              newPassengers[index] = { ...newPassengers[index], emergencyPhone: e.target.value }
                              setBookingData({ ...bookingData, passengers: newPassengers })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dietary Restrictions / Special Needs
                          </label>
                          <textarea
                            value={passenger.dietaryRestrictions}
                            onChange={(e) => {
                              const newPassengers = [...bookingData.passengers]
                              newPassengers[index] = { ...newPassengers[index], dietaryRestrictions: e.target.value }
                              setBookingData({ ...bookingData, passengers: newPassengers })
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                            rows={2}
                            placeholder="Any dietary restrictions, allergies, or special accommodations needed..."
                          />
                        </div>
                      </div>
                    </div>
                  ))
                })()}
                
                <div className="flex gap-3 justify-between">
                  <button 
                    onClick={() => setCurrentStep('details')}
                    className="py-3 px-6 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50"
                  >
                    Back to Trip Details
                  </button>
                  <button 
                    onClick={() => {
                      // Validate passenger information
                      const errors: Record<string, string> = {}
                      
                      bookingData.passengers.forEach((passenger, index) => {
                        if (!passenger.firstName.trim()) {
                          errors[`passenger${index}firstName`] = 'First name is required'
                        }
                        if (!passenger.lastName.trim()) {
                          errors[`passenger${index}lastName`] = 'Last name is required'
                        }
                        if (!passenger.dateOfBirth) {
                          errors[`passenger${index}dateOfBirth`] = 'Date of birth is required'
                        }
                        // Only validate email/phone for lead passenger (index 0)
                        if (index === 0) {
                          if (!passenger.email.trim()) {
                            errors[`passenger${index}email`] = 'Email is required'
                          } else if (!/\S+@\S+\.\S+/.test(passenger.email)) {
                            errors[`passenger${index}email`] = 'Please enter a valid email address'
                          }
                          if (!passenger.phone.trim()) {
                            errors[`passenger${index}phone`] = 'Phone number is required'
                          }
                        }
                      })
                      
                      if (Object.keys(errors).length > 0) {
                        setFormErrors(errors)
                        // Scroll to first error
                        const firstErrorElement = document.querySelector('.border-red-500')
                        if (firstErrorElement) {
                          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }
                        return
                      }
                      
                      setFormErrors({})
                      setCurrentStep('review')
                    }}
                    className="py-3 px-6 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: branding.primary_color || '#21452e',
                      color: 'white'
                    }}
                  >
                    Continue to Review
                  </button>
                </div>
              </div>
            )}

{currentStep === 'review' && (
              <div 
                className="rounded-lg shadow-sm p-6 border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#637752'
                }}
              >
                <h2 className="text-xl font-semibold mb-6" style={{ 
                  color: branding.textOnForeground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                }}>
                  Review Your Booking
                </h2>
                
                {/* Trip Summary */}
                <div 
                  className="border-2 rounded-lg p-6 mb-6"
                  style={{ 
                    backgroundColor: branding.background_color || '#FFFFFF',
                    borderColor: branding.accent_color || '#637752'
                  }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ 
                    color: branding.textOnBackground,
                    fontFamily: `var(--tenant-font, 'Inter')`
                  }}>
                    Trip Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Trip</p>
                      <p className="font-medium">{trip.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Destination</p>
                      <p className="font-medium">{trip.destination}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium">
                        {formatDate(trip.departure_time)} at {formatTime(trip.departure_time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Passengers</p>
                      <p className="font-medium">{passengerCount} {passengerCount === 1 ? 'Adult' : 'Adults'}</p>
                    </div>
                  </div>
                </div>

                {/* Passenger Summary */}
                <div 
                  className="border-2 rounded-lg p-6 mb-6"
                  style={{ 
                    backgroundColor: branding.background_color || '#FFFFFF',
                    borderColor: branding.accent_color || '#637752'
                  }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ 
                    color: branding.textOnBackground,
                    fontFamily: `var(--tenant-font, 'Inter')`
                  }}>
                    Passenger Information
                  </h3>
                  {bookingData.passengers.map((passenger, index) => (
                    <div key={index} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-b-0 border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">
                          Passenger {index + 1} {index === 0 && '(Lead Passenger)'}
                        </h4>
                        <button 
                          onClick={() => setCurrentStep('passengers')}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name: </span>
                          <span>{passenger.firstName} {passenger.lastName}</span>
                        </div>
                        {index === 0 && (
                          <>
                            <div>
                              <span className="text-gray-600">Email: </span>
                              <span>{passenger.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Phone: </span>
                              <span>{passenger.phone}</span>
                            </div>
                          </>
                        )}
                        <div>
                          <span className="text-gray-600">DOB: </span>
                          <span>{new Date(passenger.dateOfBirth).toLocaleDateString()}</span>
                        </div>
                        {passenger.dietaryRestrictions && (
                          <div className="md:col-span-3">
                            <span className="text-gray-600">Special Requirements: </span>
                            <span>{passenger.dietaryRestrictions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div 
                  className="border-2 rounded-lg p-6 mb-6"
                  style={{ 
                    backgroundColor: branding.background_color || '#FFFFFF',
                    borderColor: branding.accent_color || '#637752'
                  }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ 
                    color: branding.textOnBackground,
                    fontFamily: `var(--tenant-font, 'Inter')`
                  }}>
                    Pricing Breakdown
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{formatPrice(trip.price_adult)} × {passengerCount} adults</span>
                      <span>${((trip.price_adult * passengerCount) / 100).toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Taxes & fees</span>
                      <span>$0</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span style={{ color: branding.primary_color || '#21452e' }}>
                        ${totalPrice.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div 
                  className="border-2 rounded-lg p-6 mb-6"
                  style={{ 
                    backgroundColor: branding.background_color || '#FFFFFF',
                    borderColor: branding.accent_color || '#637752'
                  }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ color: branding.textOnBackground }}>
                    Special Requests (Optional)
                  </h3>
                  <textarea
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    rows={3}
                    placeholder="Any special requests or additional information for your trip..."
                  />
                </div>

                {/* Terms and Conditions */}
                <div 
                  className="border-2 rounded-lg p-6 mb-6"
                  style={{ 
                    backgroundColor: branding.background_color || '#FFFFFF',
                    borderColor: branding.accent_color || '#637752'
                  }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ color: branding.textOnBackground }}>
                    Cancellation Policy
                  </h3>
                  <div className="text-sm text-gray-700 space-y-2 mb-4">
                    <p><strong>Free cancellation</strong> up to 24 hours before the trip starts.</p>
                    <p><strong>50% refund</strong> for cancellations made 12-24 hours before departure.</p>
                    <p><strong>No refund</strong> for cancellations made less than 12 hours before departure.</p>
                    <p>Weather-related cancellations receive a full refund or rebooking option.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={bookingData.agreeToTerms}
                        onChange={(e) => {
                          setBookingData({ ...bookingData, agreeToTerms: e.target.checked })
                          if (formErrors.terms) {
                            const newErrors = { ...formErrors }
                            delete newErrors.terms
                            setFormErrors(newErrors)
                          }
                        }}
                        className={`mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                          formErrors.terms ? 'border-red-500' : ''
                        }`}
                      />
                      <span className="text-sm text-gray-700">
                        I agree to the <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a>, 
                        <a href="#" className="text-blue-600 hover:text-blue-800 ml-1">Privacy Policy</a>, and 
                        the cancellation policy stated above. *
                      </span>
                    </label>
                    {formErrors.terms && (
                      <p className="text-red-500 text-sm">{formErrors.terms}</p>
                    )}
                    
                    <label className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        I would like to receive updates about this trip and promotional offers from {tenant?.name}.
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 justify-between">
                  <button 
                    onClick={() => setCurrentStep('passengers')}
                    className="py-3 px-6 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50"
                  >
                    Back to Passengers
                  </button>
                  <button 
                    onClick={() => {
                      // Validate terms acceptance
                      if (!bookingData.agreeToTerms) {
                        setFormErrors({ terms: 'You must agree to the terms and conditions to continue' })
                        return
                      }
                      
                      setFormErrors({})
                      setCurrentStep('payment')
                    }}
                    className="py-3 px-6 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: branding.primary_color || '#21452e',
                      color: 'white'
                    }}
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

{currentStep === 'payment' && (
              <div 
                className="rounded-lg shadow-sm p-6 border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#637752'
                }}
              >
                <h2 className="text-xl font-semibold mb-6" style={{ 
                  color: branding.textOnForeground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                }}>
                  Payment Details
                </h2>
                
                {/* Payment Method Selection */}
                <div 
                  className="border-2 rounded-lg p-6 mb-6"
                  style={{ 
                    backgroundColor: branding.background_color || '#FFFFFF',
                    borderColor: branding.accent_color || '#637752'
                  }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ 
                    color: branding.textOnBackground,
                    fontFamily: `var(--tenant-font, 'Inter')`
                  }}>
                    Payment Method
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input type="radio" name="paymentMethod" defaultChecked className="h-4 w-4 text-blue-600" />
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                          <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                          <div className="w-8 h-5 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>
                        </div>
                        <span>Credit or Debit Card</span>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer opacity-75">
                      <input type="radio" name="paymentMethod" disabled className="h-4 w-4 text-blue-600" />
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">PayPal</div>
                        <span>PayPal <span className="text-sm text-gray-500">(Coming Soon)</span></span>
                      </div>
                    </label>
                    
                    <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer opacity-75">
                      <input type="radio" name="paymentMethod" disabled className="h-4 w-4 text-blue-600" />
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-5 bg-black rounded text-white text-xs flex items-center justify-center font-bold">Apple Pay</div>
                        <span>Apple Pay <span className="text-sm text-gray-500">(Coming Soon)</span></span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Credit Card Form */}
                <div 
                  className="border-2 rounded-lg p-6 mb-6"
                  style={{ 
                    backgroundColor: branding.background_color || '#FFFFFF',
                    borderColor: branding.accent_color || '#637752'
                  }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ 
                    color: branding.textOnBackground,
                    fontFamily: `var(--tenant-font, 'Inter')`
                  }}>
                    Card Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV *
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        placeholder="John Smith"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div 
                  className="border-2 rounded-lg p-6 mb-6"
                  style={{ 
                    backgroundColor: branding.background_color || '#FFFFFF',
                    borderColor: branding.accent_color || '#637752'
                  }}
                >
                  <h3 className="text-lg font-medium mb-4" style={{ 
                    color: branding.textOnBackground,
                    fontFamily: `var(--tenant-font, 'Inter')`
                  }}>
                    Billing Address
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        placeholder="123 Main Street"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          placeholder="Vancouver"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Province/State *
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none">
                          <option value="">Select...</option>
                          <option value="BC">British Columbia</option>
                          <option value="AB">Alberta</option>
                          <option value="ON">Ontario</option>
                          <option value="QC">Quebec</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          placeholder="V6B 1A1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Your payment is secure
                      </h4>
                      <p className="text-sm text-blue-700">
                        We use SSL encryption and trusted payment processors to protect your information. 
                        Your card details are never stored on our servers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-between">
                  <button 
                    onClick={() => setCurrentStep('review')}
                    className="py-3 px-6 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50"
                  >
                    Back to Review
                  </button>
                  <ButtonLoading
                    loading={isCreatingBooking}
                    onClick={createBooking}
                    size="md"
                    variant="primary"
                    className="py-3 px-8 flex items-center space-x-2"
                  >
                    <span>{isCreatingBooking ? 'Processing...' : 'Complete Payment'}</span>
                    <span className="font-bold">${totalPrice.toFixed(0)}</span>
                  </ButtonLoading>
                </div>
              </div>
            )}

            {currentStep === 'confirmation' && (
              <div 
                className="rounded-lg shadow-sm p-6 text-center border-2"
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: branding.accent_color || '#637752'
                }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2" style={{ 
                  color: branding.textOnForeground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                }}>
                  Booking Confirmed!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Thank you for your booking. Your trip has been confirmed and you will receive a confirmation email shortly.
                </p>
                
                <div 
                  className="rounded-lg p-6 mb-6 text-left border-2"
                  style={{ 
                    backgroundColor: branding.background_color || '#F9FAFB',
                    borderColor: branding.accent_color || '#637752'
                  }}
                >
                  <h3 className="font-medium mb-4" style={{ 
                    color: branding.textOnBackground,
                    fontFamily: `var(--tenant-font, 'Inter')`
                  }}>
                    Booking Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Reference:</span>
                      <span className="font-medium">{createdBooking?.booking_reference || 'Loading...'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trip:</span>
                      <span className="font-medium">{trip.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(trip.departure_time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Passengers:</span>
                      <span className="font-medium">{createdBooking?.passenger_count_adult || passengerCount} {(createdBooking?.passenger_count_adult || passengerCount) === 1 ? 'Adult' : 'Adults'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Paid:</span>
                      <span className="font-bold" style={{ color: branding.primary_color || '#21452e' }}>
                        ${createdBooking ? (createdBooking.total_amount / 100).toFixed(0) : totalPrice.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium text-green-600">{createdBooking?.status || 'Processing'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booked:</span>
                      <span className="font-medium">
                        {createdBooking?.created_at 
                          ? new Date(createdBooking.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })
                          : 'Just now'
                        }
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm text-gray-600 mb-6">
                  <p>
                    <strong>What's Next:</strong> You'll receive a confirmation email with your e-tickets and trip details within the next few minutes.
                  </p>
                  <p>
                    <strong>Save Your Reference:</strong> Keep your booking reference <strong>{createdBooking?.booking_reference}</strong> safe. You can use it to view or manage your booking anytime at our <Link href="/booking-lookup" className="text-blue-600 hover:underline">booking lookup page</Link>.
                  </p>
                  <p>
                    <strong>Need Help:</strong> Contact our support team at support@{tenant?.name.toLowerCase().replace(/\s+/g, '')}.com or call (555) 123-4567.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  <button 
                    onClick={() => window.print()}
                    className="py-3 px-6 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50"
                  >
                    Print Confirmation
                  </button>
                  <Link 
                    href={`/booking-lookup?ref=${createdBooking?.booking_reference || ''}`}
                    className="py-3 px-6 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50"
                  >
                    View Booking Details
                  </Link>
                  <Link 
                    href="/"
                    className="py-3 px-6 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: branding.primary_color || '#21452e',
                      color: 'white'
                    }}
                  >
                    Book Another Trip
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
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
                  {formatDate(trip.departure_time)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatTime(trip.departure_time)}
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
          </div>
        </div>
      </div>
    </div>
  )
} 