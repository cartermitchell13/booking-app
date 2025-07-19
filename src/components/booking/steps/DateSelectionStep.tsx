'use client'

import { Calendar, Clock, Users } from 'lucide-react'

interface ProductInstance {
  id: string
  product_id: string
  start_time: string
  end_time: string
  max_quantity: number
  available_quantity: number
  status: string
}

interface BookingData {
  selectedDate?: string
  selectedTime?: string
  selectedInstanceId?: string
}

interface DateSelectionStepProps {
  productInstances: ProductInstance[]
  bookingData: BookingData
  setBookingData: (data: BookingData) => void
  onNext: () => void
  onBack: () => void
  branding: any
  formatDate: (dateString: string) => string
  formatTime: (dateTimeString: string) => string
}

export default function DateSelectionStep({ 
  productInstances, 
  bookingData, 
  setBookingData, 
  onNext, 
  onBack, 
  branding,
  formatDate,
  formatTime
}: DateSelectionStepProps) {
  
  const handleDateSelect = (instance: ProductInstance) => {
    setBookingData({
      ...bookingData,
      selectedDate: instance.start_time,
      selectedTime: formatTime(instance.start_time),
      selectedInstanceId: instance.id
    })
  }

  const canContinue = bookingData.selectedInstanceId

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ 
          color: branding.textOnForeground,
          fontFamily: `var(--tenant-font, 'Inter')`
        }}>
          Select Your Date & Time
        </h2>
        <p className="text-lg" style={{ color: branding.textOnForeground }}>
          Choose from available dates and times for your trip.
        </p>
      </div>

      {productInstances.length === 0 ? (
        <div 
          className="rounded-lg p-8 text-center border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2" style={{ color: branding.textOnForeground }}>
            No Available Dates
          </h3>
          <p style={{ color: branding.textOnForeground }}>
            Unfortunately, there are no available dates for this trip at the moment. 
            Please check back later or contact us for more information.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productInstances.map((instance) => {
            const isSelected = bookingData.selectedInstanceId === instance.id
            const isSoldOut = instance.available_quantity <= 0
            const availableSpots = instance.available_quantity
            
            return (
              <button
                key={instance.id}
                onClick={() => !isSoldOut && handleDateSelect(instance)}
                disabled={isSoldOut}
                className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                  isSelected 
                    ? 'ring-2 ring-blue-500' 
                    : isSoldOut 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-blue-300'
                }`}
                style={{ 
                  backgroundColor: branding.foreground_color || '#FFFFFF',
                  borderColor: isSelected 
                    ? branding.primary_color || '#21452e'
                    : branding.accent_color || '#637752'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="font-semibold" style={{ color: branding.textOnForeground }}>
                      {formatDate(instance.start_time)}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span style={{ color: branding.textOnForeground }}>
                    {formatTime(instance.start_time)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="text-sm" style={{ color: branding.textOnForeground }}>
                      {isSoldOut ? 'Sold Out' : `${availableSpots} spots left`}
                    </span>
                  </div>
                  {!isSoldOut && (
                    <span className="text-sm font-medium" style={{ color: branding.primary_color || '#21452e' }}>
                      Available
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Selected Date Summary */}
      {bookingData.selectedInstanceId && (
        <div 
          className="rounded-lg p-4 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.primary_color || '#21452e'
          }}
        >
          <h3 className="font-semibold mb-2" style={{ color: branding.textOnForeground }}>
            Selected Date & Time
          </h3>
          <div className="flex items-center space-x-4 text-sm" style={{ color: branding.textOnForeground }}>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {bookingData.selectedDate && formatDate(bookingData.selectedDate)}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {bookingData.selectedTime}
            </div>
          </div>
        </div>
      )}

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
          Continue to Passengers
        </button>
      </div>
    </div>
  )
}
