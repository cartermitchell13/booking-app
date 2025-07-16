'use client';

import React from 'react';
import { X } from 'lucide-react';
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

interface CancelBookingModalProps {
  show: boolean;
  booking: Booking | null;
  cancellationReason: string;
  setCancellationReason: (reason: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function CancelBookingModal({
  show,
  booking,
  cancellationReason,
  setCancellationReason,
  onCancel,
  onConfirm,
  isLoading
}: CancelBookingModalProps) {
  const branding = useTenantBranding();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!show || !booking) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="rounded-lg max-w-md w-full p-6 shadow-xl border"
        style={{ 
          backgroundColor: branding.foreground_color || '#FFFFFF',
          borderColor: branding.accent_color || '#E5E7EB'
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 
            className="text-lg font-semibold"
            style={{ 
              color: branding.textOnForeground,
              fontFamily: `var(--tenant-font, 'Inter')`
            }}
          >
            Cancel Booking
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="mb-2" style={{ color: branding.textOnForeground }}>
            Are you sure you want to cancel your booking for:
          </p>
          <div 
            className="rounded-lg p-4 border"
            style={{ 
              backgroundColor: branding.background_color || '#faf9f6',
              borderColor: branding.accent_color || '#E5E7EB'
            }}
          >
            <p className="font-medium" style={{ color: branding.textOnForeground }}>
              {booking.products.name}
            </p>
            <p className="text-sm" style={{ color: branding.textOnForeground }}>
              Booked on {formatDate(booking.created_at)}
            </p>
            <p className="text-sm" style={{ color: branding.textOnForeground }}>
              Booking #{booking.booking_reference}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label 
            className="block text-sm font-medium mb-2"
            style={{ color: branding.textOnForeground }}
          >
            Reason for cancellation (optional)
          </label>
          <textarea
            value={cancellationReason}
            onChange={(e) => setCancellationReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent"
            style={{ 
              '--tw-ring-color': branding.primary_color || '#10B981'
            } as React.CSSProperties}
            rows={3}
            placeholder="Let us know why you're cancelling..."
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>Cancellation Policy:</strong> Cancellations must be made at least 24 hours before departure. 
            Refunds will be processed according to our refund policy.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
            style={{ 
              borderColor: branding.accent_color || '#E5E7EB',
              color: branding.textOnForeground
            }}
          >
            Keep Booking
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  );
} 