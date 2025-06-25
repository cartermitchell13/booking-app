'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, Clock, Users, Star, Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTenant, useTenantSupabase, useTenantBranding } from '@/lib/tenant-context'
import { TenantTrip } from '@/types'

type BookingStep = 'details' | 'passengers' | 'review' | 'payment' | 'confirmation'

export default function BookingPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const [trip, setTrip] = useState<TenantTrip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [currentStep, setCurrentStep] = useState<BookingStep>('details')
  const [passengerCount, setPassengerCount] = useState(1)

  const { tenant, isLoading: tenantLoading } = useTenant()
  const { getTripById } = useTenantSupabase()
  const branding = useTenantBranding()

  // Load trip data from database
  useEffect(() => {
    if (tenantLoading || !tenant || !tripId) return

    const loadTrip = async () => {
      try {
        setLoading(true)
        setError(undefined)
        const tripData = await getTripById(tripId)
        setTrip(tripData)
      } catch (err) {
        console.error('Error loading trip:', err)
        setError('Trip not found or no longer available')
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [tenant, tenantLoading, tripId, getTripById])

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

  if (tenantLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trip details...</p>
        </div>
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f6' }}>
        <div className="text-center">
          <p className="text-red-600 mb-2">Tenant not found</p>
          <p className="text-gray-600">Please check your domain configuration</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f6' }}>
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4" style={{ color: '#21452e' }}>
            {error || 'Trip Not Found'}
          </h1>
          <p className="text-gray-600 mb-8">
            {error || "The trip you're looking for doesn't exist."}
          </p>
          <Link 
            href="/"
            className="inline-block py-3 px-6 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: branding.primary_color || '#21452e',
              color: 'white'
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
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f6' }}>
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
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
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold" style={{ color: branding.primary_color || '#21452e' }}>
                ${totalPrice.toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#21452e' }}>
                  {trip.title}
                </h1>
                
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
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
                  <h2 className="text-lg font-semibold mb-3" style={{ color: '#21452e' }}>
                    About This Experience
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {trip.description || "Experience the beauty of nature with our guided adventure."}
                  </p>
                </div>

                {trip.highlights && trip.highlights.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3" style={{ color: '#21452e' }}>
                      Highlights
                    </h2>
                    <ul className="space-y-2">
                      {trip.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 mr-2 mt-0.5 text-green-600" />
                          <span className="text-gray-700">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {trip.included_items && trip.included_items.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3" style={{ color: '#21452e' }}>
                      What's Included
                    </h2>
                    <ul className="space-y-2">
                      {trip.included_items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <Check className="w-5 h-5 mr-2 mt-0.5 text-green-600" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3" style={{ color: '#21452e' }}>
                    Select Passengers
                  </h2>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-medium transition-colors hover:bg-gray-50"
                      style={{ borderColor: branding.primary_color || '#21452e', color: branding.primary_color || '#21452e' }}
                    >
                      -
                    </button>
                    <span className="text-lg font-medium min-w-[3rem] text-center">
                      {passengerCount} {passengerCount === 1 ? 'Adult' : 'Adults'}
                    </span>
                    <button 
                      onClick={() => setPassengerCount(Math.min(trip.available_seats, passengerCount + 1))}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg font-medium transition-colors hover:bg-gray-50"
                      style={{ borderColor: branding.primary_color || '#21452e', color: branding.primary_color || '#21452e' }}
                      disabled={passengerCount >= trip.available_seats}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {trip.available_seats} spots available
                  </p>
                </div>

                <button 
                  onClick={() => setCurrentStep('passengers')}
                  className="w-full py-3 px-6 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: branding.primary_color || '#21452e',
                    color: 'white'
                  }}
                >
                  Continue to Passenger Details
                </button>
              </div>
            )}

                         {/* Additional steps would go here - passengers, review, payment, confirmation */}
             {(currentStep === 'passengers' || currentStep === 'review' || currentStep === 'payment' || currentStep === 'confirmation') && (
               <div className="bg-white rounded-lg shadow-sm p-6">
                 <div className="text-center py-12">
                   <h2 className="text-xl font-semibold mb-2" style={{ color: '#21452e' }}>
                     {currentStep === 'passengers' && 'Passenger Information'}
                     {currentStep === 'review' && 'Review Your Booking'}
                     {currentStep === 'payment' && 'Payment Details'}
                     {currentStep === 'confirmation' && 'Booking Confirmed!'}
                   </h2>
                   <p className="text-gray-600 mb-6">
                     This step is under development. The multi-tenant foundation is now in place!
                   </p>
                   <div className="flex gap-3 justify-center">
                     <button 
                       onClick={() => {
                         const currentIndex = steps.findIndex(s => s.id === currentStep)
                         if (currentIndex > 0) {
                           setCurrentStep(steps[currentIndex - 1].id as BookingStep)
                         }
                       }}
                       className="py-2 px-4 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50"
                     >
                       Back
                     </button>
                     {currentStep !== 'confirmation' && (
                       <button 
                         onClick={() => {
                           const currentIndex = steps.findIndex(s => s.id === currentStep)
                           if (currentIndex < steps.length - 1) {
                             setCurrentStep(steps[currentIndex + 1].id as BookingStep)
                           }
                         }}
                         className="py-2 px-4 rounded-lg font-medium transition-colors"
                         style={{
                           backgroundColor: branding.primary_color || '#21452e',
                           color: 'white'
                         }}
                       >
                         Continue
                       </button>
                     )}
                   </div>
                 </div>
               </div>
             )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="mb-4">
                <Image
                  src={trip.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop&crop=center"}
                  alt={trip.title}
                  width={300}
                  height={200}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              
              <h3 className="font-semibold text-lg mb-2" style={{ color: '#21452e' }}>
                {trip.title}
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
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
                  <span className="text-gray-600">
                    {formatPrice(trip.price_adult)} x {passengerCount}
                  </span>
                  <span className="font-medium">
                    ${((trip.price_adult * passengerCount) / 100).toFixed(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                  <span>Total</span>
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