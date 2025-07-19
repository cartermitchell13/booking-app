'use client'

import { useState } from 'react'
import { User, Phone, Mail, Calendar, AlertTriangle } from 'lucide-react'

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
  specialRequests: string
}

interface PassengersStepProps {
  passengerCount: number
  bookingData: BookingData
  setBookingData: (data: BookingData) => void
  formErrors: Record<string, string>
  setFormErrors: (errors: Record<string, string>) => void
  onNext: () => void
  onBack: () => void
  branding: any
}

export default function PassengersStep({ 
  passengerCount, 
  bookingData, 
  setBookingData, 
  formErrors, 
  setFormErrors,
  onNext, 
  onBack, 
  branding 
}: PassengersStepProps) {
  
  // Initialize passengers array if needed
  const initializePassengers = () => {
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
    return passengers.slice(0, passengerCount)
  }

  const passengers = initializePassengers()

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const updatedPassengers = [...passengers]
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value }
    setBookingData({ ...bookingData, passengers: updatedPassengers })
    
    // Clear error for this field
    const errorKey = `passenger${index}_${field}`
    if (formErrors[errorKey]) {
      const newErrors = { ...formErrors }
      delete newErrors[errorKey]
      setFormErrors(newErrors)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    passengers.forEach((passenger, index) => {
      if (!passenger.firstName.trim()) {
        errors[`passenger${index}_firstName`] = 'First name is required'
      }
      if (!passenger.lastName.trim()) {
        errors[`passenger${index}_lastName`] = 'Last name is required'
      }
      if (!passenger.email.trim()) {
        errors[`passenger${index}_email`] = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(passenger.email)) {
        errors[`passenger${index}_email`] = 'Please enter a valid email'
      }
      if (!passenger.phone.trim()) {
        errors[`passenger${index}_phone`] = 'Phone number is required'
      }
      if (!passenger.dateOfBirth.trim()) {
        errors[`passenger${index}_dateOfBirth`] = 'Date of birth is required'
      }
      if (!passenger.emergencyContact.trim()) {
        errors[`passenger${index}_emergencyContact`] = 'Emergency contact is required'
      }
      if (!passenger.emergencyPhone.trim()) {
        errors[`passenger${index}_emergencyPhone`] = 'Emergency phone is required'
      }
    })
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ 
          color: branding.textOnForeground,
          fontFamily: `var(--tenant-font, 'Inter')`
        }}>
          Passenger Information
        </h2>
        <p className="text-lg" style={{ color: branding.textOnForeground }}>
          Please provide information for all passengers.
        </p>
      </div>

      {passengers.map((passenger, index) => (
        <div 
          key={index}
          className="rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: branding.textOnForeground }}>
            <User className="w-5 h-5 mr-2" />
            Passenger {index + 1}
            {index === 0 && <span className="ml-2 text-sm font-normal">(Lead Passenger)</span>}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                First Name *
              </label>
              <input
                type="text"
                value={passenger.firstName}
                onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors[`passenger${index}_firstName`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter first name"
              />
              {formErrors[`passenger${index}_firstName`] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}_firstName`]}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                Last Name *
              </label>
              <input
                type="text"
                value={passenger.lastName}
                onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors[`passenger${index}_lastName`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter last name"
              />
              {formErrors[`passenger${index}_lastName`] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}_lastName`]}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                <Mail className="w-4 h-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                value={passenger.email}
                onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors[`passenger${index}_email`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {formErrors[`passenger${index}_email`] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}_email`]}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={passenger.phone}
                onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors[`passenger${index}_phone`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
              {formErrors[`passenger${index}_phone`] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}_phone`]}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                <Calendar className="w-4 h-4 inline mr-1" />
                Date of Birth *
              </label>
              <input
                type="date"
                value={passenger.dateOfBirth}
                onChange={(e) => updatePassenger(index, 'dateOfBirth', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors[`passenger${index}_dateOfBirth`] ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors[`passenger${index}_dateOfBirth`] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}_dateOfBirth`]}</p>
              )}
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Emergency Contact *
              </label>
              <input
                type="text"
                value={passenger.emergencyContact}
                onChange={(e) => updatePassenger(index, 'emergencyContact', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors[`passenger${index}_emergencyContact`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Emergency contact name"
              />
              {formErrors[`passenger${index}_emergencyContact`] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}_emergencyContact`]}</p>
              )}
            </div>

            {/* Emergency Phone */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                Emergency Phone *
              </label>
              <input
                type="tel"
                value={passenger.emergencyPhone}
                onChange={(e) => updatePassenger(index, 'emergencyPhone', e.target.value)}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formErrors[`passenger${index}_emergencyPhone`] ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Emergency contact phone"
              />
              {formErrors[`passenger${index}_emergencyPhone`] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[`passenger${index}_emergencyPhone`]}</p>
              )}
            </div>

            {/* Dietary Restrictions */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                Dietary Restrictions / Allergies
              </label>
              <textarea
                value={passenger.dietaryRestrictions}
                onChange={(e) => updatePassenger(index, 'dietaryRestrictions', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Please list any dietary restrictions, allergies, or special requirements"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Special Requests */}
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
        <textarea
          value={bookingData.specialRequests}
          onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Any special requests or additional information for your trip?"
        />
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
          onClick={handleNext}
          className="py-3 px-8 rounded-lg font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: branding.primary_color || '#21452e',
            color: 'white'
          }}
        >
          Continue to Review
        </button>
      </div>
    </div>
  )
}
