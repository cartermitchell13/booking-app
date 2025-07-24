'use client'

import React, { useState } from 'react'
import { EditablePricingSidebar } from '@/components/ui/EditablePricingSidebar'
import { PricingFormData } from '@/types/offering-form'

export function EditablePricingExample() {
  const [pricing, setPricing] = useState<PricingFormData>({
    basePricing: {
      adult: 89,
      child: 45,
      student: 75
    },
    currency: 'USD',
    groupDiscounts: [
      {
        minSize: 5,
        discount: 10,
        type: 'percentage'
      }
    ],
    seasonalPricing: [
      {
        name: 'Summer Peak',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-08-31'),
        multiplier: 1.3
      }
    ],
    cancellationPolicy: {
      freeCancellationHours: 24,
      refundPercentage: 100,
      processingFee: 2.50
    },
    depositRequired: true,
    depositAmount: 25,
    taxInclusive: false
  })

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Editable Pricing Sidebar Demo
          </h1>
          <p className="text-gray-600">
            This demonstrates the editable pricing sidebar with inline editing capabilities and advanced configuration options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Banff National Park Adventure Tour
              </h2>
              
              <div className="mb-6">
                <img
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop&crop=center"
                  alt="Banff National Park"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Experience the breathtaking beauty of Banff National Park on this full-day guided adventure tour. 
                  Discover pristine wilderness, stunning mountain vistas, and diverse wildlife in one of Canada's 
                  most iconic national parks.
                </p>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">What's Included</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                  <li>Professional naturalist guide</li>
                  <li>Transportation in comfortable vehicle</li>
                  <li>All park entrance fees</li>
                  <li>Light refreshments and water</li>
                  <li>Wildlife spotting equipment</li>
                  <li>Digital photo package</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tour Highlights</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Lake Louise and Moraine Lake viewpoints</li>
                  <li>Wildlife viewing opportunities</li>
                  <li>Scenic mountain photography stops</li>
                  <li>Indigenous cultural insights</li>
                  <li>Small group experience (max 12 people)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Editable Pricing Sidebar */}
          <div className="lg:col-span-1">
            <EditablePricingSidebar
              pricing={pricing}
              onChange={setPricing}
              className="sticky top-8"
            />
          </div>
        </div>

        {/* Current Pricing State Display */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Pricing Configuration (for development)
          </h3>
          <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
            {JSON.stringify(pricing, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}