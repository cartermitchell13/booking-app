'use client';

import React from 'react';
import { useTenantBranding } from '@/lib/tenant-context';

interface Booking {
  id: string;
  booking_reference: string;
  product_id: string;
  passenger_count_adult: number;
  passenger_count_child: number;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  products: {
    name: string;
    description: string;
    product_data: any;
    base_price: number;
    image_url?: string;
  };
}

interface BookingStatsProps {
  bookings: Booking[];
}

export function BookingStats({ bookings }: BookingStatsProps) {
  const branding = useTenantBranding();

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const totalSpent = bookings.reduce((sum, b) => sum + b.total_amount, 0);

  if (totalBookings === 0) {
    return null;
  }

  return (
    <div 
      className="mt-8 rounded-lg shadow-sm p-6 border"
      style={{ 
        backgroundColor: branding.foreground_color || '#FFFFFF',
        borderColor: branding.accent_color || '#E5E7EB'
      }}
    >
      <h3 
        className="text-lg font-medium mb-6"
        style={{ 
          color: branding.textOnForeground,
          fontFamily: `var(--tenant-font, 'Inter')`
        }}
      >
        Booking Summary
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <div 
            className="text-3xl font-bold mb-1"
            style={{ color: branding.primary_color || '#10B981' }}
          >
            {totalBookings}
          </div>
          <div className="text-sm" style={{ color: branding.textOnForeground }}>
            Total Bookings
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-1 text-green-600">
            {confirmedBookings}
          </div>
          <div className="text-sm" style={{ color: branding.textOnForeground }}>
            Confirmed
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-1 text-yellow-600">
            {pendingBookings}
          </div>
          <div className="text-sm" style={{ color: branding.textOnForeground }}>
            Pending
          </div>
        </div>
        <div className="text-center">
          <div 
            className="text-3xl font-bold mb-1"
            style={{ color: branding.primary_color || '#10B981' }}
          >
            {formatPrice(totalSpent)}
          </div>
          <div className="text-sm" style={{ color: branding.textOnForeground }}>
            Total Spent
          </div>
        </div>
      </div>
    </div>
  );
} 