'use client'

import { useState } from 'react'
import { CreditCard, Lock, AlertCircle } from 'lucide-react'

interface PaymentStepProps {
  totalPrice: number
  isCreatingBooking: boolean
  onCreateBooking: () => void
  onBack: () => void
  branding: any
}

export default function PaymentStep({ 
  totalPrice, 
  isCreatingBooking, 
  onCreateBooking, 
  onBack, 
  branding 
}: PaymentStepProps) {
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  })

  const formatCardNumber = (value: string) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardData({ ...cardData, cardNumber: formatted })
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    if (formatted.length <= 5) { // MM/YY
      setCardData({ ...cardData, expiryDate: formatted })
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length <= 4) {
      setCardData({ ...cardData, cvv: value })
    }
  }

  const isFormValid = () => {
    if (paymentMethod === 'card') {
      return (
        cardData.cardNumber.replace(/\s/g, '').length >= 13 &&
        cardData.expiryDate.length === 5 &&
        cardData.cvv.length >= 3 &&
        cardData.cardholderName.trim().length > 0
      )
    }
    return true // PayPal doesn't need form validation here
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ 
          color: branding.textOnForeground,
          fontFamily: `var(--tenant-font, 'Inter')`
        }}>
          Payment Information
        </h2>
        <p className="text-lg" style={{ color: branding.textOnForeground }}>
          Secure payment processing for your booking.
        </p>
      </div>

      {/* Payment Method Selection */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
          Payment Method
        </h3>
        
        <div className="space-y-3">
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={(e) => setPaymentMethod(e.target.value as 'card')}
              className="mr-3"
            />
            <CreditCard className="w-5 h-5 mr-2" />
            <span style={{ color: branding.textOnForeground }}>Credit/Debit Card</span>
          </label>
          
          <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="paymentMethod"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={(e) => setPaymentMethod(e.target.value as 'paypal')}
              className="mr-3"
            />
            <div className="w-5 h-5 mr-2 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
              P
            </div>
            <span style={{ color: branding.textOnForeground }}>PayPal</span>
          </label>
        </div>
      </div>

      {/* Card Payment Form */}
      {paymentMethod === 'card' && (
        <div 
          className="rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center" style={{ color: branding.textOnForeground }}>
            <Lock className="w-5 h-5 mr-2" />
            Card Information
          </h3>
          
          <div className="space-y-4">
            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardData.cardholderName}
                onChange={(e) => setCardData({ ...cardData, cardholderName: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name as it appears on card"
              />
            </div>

            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                Card Number
              </label>
              <input
                type="text"
                value={cardData.cardNumber}
                onChange={handleCardNumberChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={cardData.expiryDate}
                  onChange={handleExpiryChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="MM/YY"
                />
              </div>

              {/* CVV */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: branding.textOnForeground }}>
                  CVV
                </label>
                <input
                  type="text"
                  value={cardData.cvv}
                  onChange={handleCvvChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Payment */}
      {paymentMethod === 'paypal' && (
        <div 
          className="rounded-lg p-6 border-2 text-center"
          style={{ 
            backgroundColor: branding.foreground_color || '#FFFFFF',
            borderColor: branding.accent_color || '#637752'
          }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: branding.textOnForeground }}>
            PayPal Payment
          </h3>
          <p className="text-sm" style={{ color: branding.textOnForeground }}>
            You will be redirected to PayPal to complete your payment securely.
          </p>
        </div>
      )}

      {/* Security Notice */}
      <div 
        className="rounded-lg p-4 border border-green-200 bg-green-50"
      >
        <div className="flex items-start">
          <Lock className="w-5 h-5 mr-2 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">Secure Payment</h4>
            <p className="text-sm text-green-700">
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div 
        className="rounded-lg p-6 border-2"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#637752'
        }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: branding.textOnForeground }}>
          Order Summary
        </h3>
        
        <div className="flex justify-between items-center text-xl font-bold">
          <span style={{ color: branding.textOnForeground }}>Total Amount</span>
          <span style={{ color: branding.primary_color || '#21452e' }}>
            ${totalPrice.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Demo Notice */}
      <div 
        className="rounded-lg p-4 border border-blue-200 bg-blue-50"
      >
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Demo Mode</h4>
            <p className="text-sm text-blue-700">
              This is a demonstration booking system. No actual payment will be processed.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isCreatingBooking}
          className="py-3 px-6 border border-gray-300 rounded-lg font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
          style={{ color: branding.textOnForeground }}
        >
          Back
        </button>
        <button
          onClick={onCreateBooking}
          disabled={!isFormValid() || isCreatingBooking}
          className={`py-3 px-8 rounded-lg font-medium transition-colors flex items-center ${
            isFormValid() && !isCreatingBooking
              ? 'hover:opacity-90' 
              : 'opacity-50 cursor-not-allowed'
          }`}
          style={{
            backgroundColor: isFormValid() && !isCreatingBooking ? (branding.primary_color || '#21452e') : '#gray-400',
            color: 'white'
          }}
        >
          {isCreatingBooking ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            `Complete Booking - $${totalPrice.toFixed(0)}`
          )}
        </button>
      </div>
    </div>
  )
}
