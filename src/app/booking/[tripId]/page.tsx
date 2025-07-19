'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useTenant, useTenantSupabase, useTenantBranding } from '@/lib/tenant-context'
import { useAuth } from '@/lib/auth-context'
import { TenantTrip } from '@/types'
import { PageLoading } from '@/components/ui'
import BookingHeader from '@/components/booking/BookingHeader'
import BookingProgressBar from '@/components/booking/BookingProgressBar'
import BookingSidebar from '@/components/booking/BookingSidebar'
import TripDetailsStep from '@/components/booking/steps/TripDetailsStep'
import DateSelectionStep from '@/components/booking/steps/DateSelectionStep'
import PassengersStep from '@/components/booking/steps/PassengersStep'
import ReviewStep from '@/components/booking/steps/ReviewStep'
import PaymentStep from '@/components/booking/steps/PaymentStep'
import ConfirmationStep from '@/components/booking/steps/ConfirmationStep'

type BookingStep = 'details' | 'dates' | 'passengers' | 'review' | 'payment' | 'confirmation'

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

interface ProductInstance {
  id: string
  product_id: string
  start_time: string
  end_time: string
  max_quantity: number
  available_quantity: number
  status: string
}

export default function BookingPage() {
  const params = useParams()
  const tripId = params.tripId as string
  const [trip, setTrip] = useState<TenantTrip | null>(null)
  const [productInstances, setProductInstances] = useState<ProductInstance[]>([])
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
  const { getProductById, supabase } = useTenantSupabase()
  const { user } = useAuth()
  const branding = useTenantBranding()

  // Load trip data from database
  useEffect(() => {
    if (tenantLoading || !tenant || !tripId) return

    const loadTrip = async () => {
      try {
        setLoading(true)
        setError(undefined)
        
        // Load trip data
        const tripData = await getProductById(tripId)
        setTrip(tripData)
        
        // Load product instances for this trip
        if (tripData) {
          const { data: instances, error: instancesError } = await supabase
            .from('product_instances')
            .select('*')
            .eq('product_id', tripId)
            .eq('status', 'active')
            .gte('start_time', new Date().toISOString())
            .order('start_time', { ascending: true })
          
          if (instancesError) {
            console.error('Error loading product instances:', instancesError)
          } else {
            setProductInstances(instances || [])
          }
        }
      } catch (err) {
        console.error('Error loading trip:', err)
        setError('Trip not found or no longer available')
      } finally {
        setLoading(false)
      }
    }

    loadTrip()
  }, [tenant, tenantLoading, tripId, getProductById, supabase])

  // Helper functions
  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(0)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Step navigation functions
  const goToStep = (step: BookingStep) => {
    setCurrentStep(step)
  }

  const goToNextStep = () => {
    const stepOrder: BookingStep[] = ['details', 'dates', 'passengers', 'review', 'payment', 'confirmation']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1])
    }
  }

  const goToPreviousStep = () => {
    const stepOrder: BookingStep[] = ['details', 'dates', 'passengers', 'review', 'payment', 'confirmation']
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  // Booking creation function
  const createBooking = async () => {
    if (!trip || !user) return

    setIsCreatingBooking(true)
    try {
      // Create booking in database
      const bookingReference = `PB${Date.now().toString().slice(-6)}`
      const totalAmount = trip.price_adult * passengerCount

      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          tenant_id: tenant?.id,
          product_id: tripId,
          product_instance_id: bookingData.selectedInstanceId,
          user_id: user.id,
          booking_reference: bookingReference,
          status: 'confirmed',
          payment_status: 'paid',
          total_amount: totalAmount,
          passenger_count_adult: passengerCount,
          passenger_count_child: 0,
          selected_date: bookingData.selectedDate,
          selected_time: bookingData.selectedTime,
          departure_datetime: bookingData.selectedDate || trip.departure_time,
          passenger_details: bookingData.passengers,
          special_requests: bookingData.specialRequests
        })
        .select()
        .single()

      if (bookingError) {
        throw new Error(bookingError.message)
      }

      // Update product instance availability
      if (bookingData.selectedInstanceId) {
        // Get current availability first
        const { data: currentInstance } = await supabase
          .from('product_instances')
          .select('available_quantity')
          .eq('id', bookingData.selectedInstanceId)
          .single()
        
        if (currentInstance) {
          await supabase
            .from('product_instances')
            .update({
              available_quantity: Math.max(0, currentInstance.available_quantity - passengerCount)
            })
            .eq('id', bookingData.selectedInstanceId)
        }
      }

      setCreatedBooking({
        id: booking.id,
        booking_reference: booking.booking_reference,
        status: booking.status,
        payment_status: booking.payment_status,
        total_amount: booking.total_amount,
        passenger_count_adult: booking.passenger_count_adult,
        passenger_count_child: booking.passenger_count_child,
        created_at: booking.created_at
      })

      goToNextStep() // Go to confirmation step
    } catch (err) {
      console.error('Error creating booking:', err)
      alert('Failed to create booking. Please try again.')
    } finally {
      setIsCreatingBooking(false)
    }
  }

  // Component logic
  const steps = [
    { id: 'details', label: 'Trip Details', completed: false },
    { id: 'dates', label: 'Select Date', completed: false },
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

  const totalPrice = trip ? (trip.price_adult * passengerCount) / 100 : 0

  // Early returns for loading and error states
  if (tenantLoading || loading) {
    return <PageLoading message="Loading trip details..." />
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

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'details':
        return (
          <TripDetailsStep
            trip={trip}
            passengerCount={passengerCount}
            setPassengerCount={setPassengerCount}
            onNext={goToNextStep}
            branding={branding}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )
      case 'dates':
        return (
          <DateSelectionStep
            productInstances={productInstances}
            bookingData={bookingData}
            setBookingData={(data) => setBookingData({ ...bookingData, ...data })}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            branding={branding}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        )
      case 'passengers':
        return (
          <PassengersStep
            passengerCount={passengerCount}
            bookingData={bookingData}
            setBookingData={(data) => setBookingData({ ...bookingData, ...data })}
            formErrors={formErrors}
            setFormErrors={setFormErrors}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            branding={branding}
          />
        )
      case 'review':
        return (
          <ReviewStep
            trip={trip}
            bookingData={bookingData}
            setBookingData={(data) => setBookingData({ ...bookingData, ...data })}
            passengerCount={passengerCount}
            totalPrice={totalPrice}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
            branding={branding}
            formatDate={formatDate}
            formatTime={formatTime}
            formatPrice={formatPrice}
          />
        )
      case 'payment':
        return (
          <PaymentStep
            totalPrice={totalPrice}
            isCreatingBooking={isCreatingBooking}
            onCreateBooking={createBooking}
            onBack={goToPreviousStep}
            branding={branding}
          />
        )
      case 'confirmation':
        return createdBooking ? (
          <ConfirmationStep
            trip={trip}
            createdBooking={createdBooking}
            bookingData={bookingData}
            branding={branding}
            formatDate={formatDate}
            formatTime={formatTime}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: branding.background_color || '#FFFFFF' }}>
      {/* Header */}
      <BookingHeader trip={trip} branding={branding} totalPrice={totalPrice} />

      {/* Progress Bar */}
      <BookingProgressBar steps={steps} currentStep={currentStep} branding={branding} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {renderStepContent()}
          </div>

          {/* Sidebar - Hide on confirmation step */}
          {currentStep !== 'confirmation' && (
            <div className="lg:col-span-1">
              <BookingSidebar 
                trip={trip}
                bookingData={bookingData}
                passengerCount={passengerCount}
                totalPrice={totalPrice}
                branding={branding}
                formatDate={formatDate}
                formatTime={formatTime}
                formatPrice={formatPrice}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
