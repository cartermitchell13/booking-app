'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { TenantTrip } from '@/types'

interface BookingHeaderProps {
  trip: TenantTrip
  branding: any
  totalPrice: number
}

export default function BookingHeader({ trip, branding, totalPrice }: BookingHeaderProps) {
  return (
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
              Back to Home
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-xl font-semibold" style={{ color: branding.textOnBackground }}>
              Book Your Trip
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm" style={{ color: branding.textOnBackground }}>
              Total
            </p>
            <p className="text-2xl font-bold" style={{ color: branding.primary_color || '#21452e' }}>
              ${totalPrice.toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
