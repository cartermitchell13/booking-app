'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calendar,
  MapPin,
  Users,
  CreditCard,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2
} from 'lucide-react';
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

interface BookingCardProps {
  booking: Booking;
  onCancelClick: (booking: Booking) => void;
  cancellingBookingId: string | null;
  canCancelBooking: (booking: Booking) => { canCancel: boolean; reason?: string };
}

export function BookingCard({ 
  booking, 
  onCancelClick, 
  cancellingBookingId,
  canCancelBooking 
}: BookingCardProps) {
  const branding = useTenantBranding();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const { canCancel, reason } = canCancelBooking(booking);

  return (
    <div 
      className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border-2 overflow-hidden"
      style={{ 
        backgroundColor: branding.foreground_color || '#FFFFFF',
        borderColor: branding.accent_color || '#E5E7EB'
      }}
    >
      {/* Mobile-Optimized Card Layout */}
      <div className="block sm:hidden">
        {/* Mobile Header with Status */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center">
            {getStatusIcon(booking.status)}
            <span className={`ml-2 inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-500">
            #{booking.booking_reference}
          </span>
        </div>

        {/* Mobile Content */}
        <div className="px-4 pb-4">
          {/* Trip Info with Larger Image */}
          <div className="flex gap-4 mb-4">
            <div className="w-20 h-16 sm:w-24 sm:h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={booking.products.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=96&h=80&fit=crop&crop=center"}
                alt={booking.products.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-bold leading-tight mb-2 line-clamp-2"
                style={{ 
                  color: branding.textOnForeground,
                  fontFamily: `var(--tenant-font, 'Inter')`
                }}
              >
                {booking.products.name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" style={{ color: branding.primary_color }} />
                <span className="line-clamp-1">{booking.products.description}</span>
              </div>
            </div>
          </div>

          {/* Key Info - Mobile Optimized */}
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: branding.primary_color }} />
                <div>
                  <div className="font-semibold text-gray-900">Booked</div>
                  <div className="text-gray-600">{formatDate(booking.created_at)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 flex-shrink-0" style={{ color: branding.primary_color }} />
                <div>
                  <div className="font-semibold text-gray-900">Passengers</div>
                  <div className="text-gray-600">
                    {booking.passenger_count_adult} adult{booking.passenger_count_adult !== 1 ? 's' : ''}
                    {booking.passenger_count_child > 0 && `, ${booking.passenger_count_child} child${booking.passenger_count_child !== 1 ? 'ren' : ''}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Price - Prominent on Mobile */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{ backgroundColor: `${branding.primary_color || '#10B981'}15` }}>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" style={{ color: branding.primary_color }} />
              <span className="font-semibold text-gray-900">Total Paid</span>
            </div>
            <span className="text-xl font-bold" style={{ color: branding.primary_color || '#10B981' }}>
              {formatPrice(booking.total_amount)}
            </span>
          </div>

          {/* Mobile Action Buttons */}
          <div className="flex gap-3">
            <Link
              href={`/booking-lookup?ref=${booking.booking_reference}`}
              className="flex-1 flex items-center justify-center gap-2 min-h-[48px] px-4 py-3 text-base font-semibold rounded-lg border-2 transition-all duration-200 hover:shadow-md"
              style={{ 
                borderColor: branding.primary_color || '#10B981',
                color: branding.primary_color || '#10B981',
                backgroundColor: 'transparent'
              }}
            >
              View Details
              <ChevronRight className="h-4 w-4" />
            </Link>
            
            {(booking.status === 'confirmed' || booking.status === 'pending') && canCancel && (
              <button
                onClick={() => onCancelClick(booking)}
                disabled={cancellingBookingId === booking.id}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center px-3 py-3 text-base font-semibold rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout (Hidden on Mobile) */}
      <div className="hidden sm:block p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-24 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={booking.products.image_url || "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=96&h=80&fit=crop&crop=center"}
                  alt={booking.products.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <h3 
                    className="text-xl font-semibold truncate"
                    style={{ 
                      color: branding.textOnForeground,
                      fontFamily: `var(--tenant-font, 'Inter')`
                    }}
                  >
                    {booking.products.name}
                  </h3>
                  <div className="flex items-center ml-4">
                    {getStatusIcon(booking.status)}
                    <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4" style={{ color: branding.textOnForeground }}>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" style={{ color: branding.primary_color }} />
                    <span>{booking.products.description}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" style={{ color: branding.primary_color }} />
                    <span>Booked on {formatDate(booking.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" style={{ color: branding.primary_color }} />
                    <span>
                      {booking.passenger_count_adult} adult{booking.passenger_count_adult !== 1 ? 's' : ''}
                      {booking.passenger_count_child > 0 && `, ${booking.passenger_count_child} child${booking.passenger_count_child !== 1 ? 'ren' : ''}`}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" style={{ color: branding.primary_color }} />
                    <span className="font-semibold">{formatPrice(booking.total_amount)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm" style={{ color: branding.textOnForeground }}>
                    Booking #{booking.booking_reference}
                  </span>
                  <span className="text-sm" style={{ color: branding.textOnForeground }}>
                    Booked on {formatDate(booking.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="ml-6 flex-shrink-0 flex flex-col gap-3">
            {/* View Details Button */}
            <Link
              href={`/booking-lookup?ref=${booking.booking_reference}`}
              className="flex items-center gap-2 min-h-[44px] px-6 py-3 text-sm font-semibold rounded-lg border-2 transition-all duration-200 hover:shadow-md"
              style={{ 
                borderColor: branding.primary_color || '#10B981',
                color: branding.primary_color || '#10B981'
              }}
            >
              View Details
              <ChevronRight className="h-4 w-4" />
            </Link>
            
            {/* Cancel Button */}
            {booking.status === 'confirmed' || booking.status === 'pending' ? (
              <button
                onClick={() => onCancelClick(booking)}
                disabled={!canCancel || cancellingBookingId === booking.id}
                title={!canCancel ? reason : 'Cancel this booking'}
                className={`
                  flex items-center gap-2 min-h-[44px] px-6 py-3 text-sm font-semibold rounded-lg border-2 transition-all duration-200
                  ${canCancel
                    ? 'text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300'
                    : 'text-gray-400 cursor-not-allowed border-gray-200'
                  }
                  ${cancellingBookingId === booking.id ? 'opacity-50' : ''}
                `}
              >
                <Trash2 className="h-3 w-3" />
                {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
              </button>
            ) : (
              <div className="text-xs text-gray-400 text-center">
                {booking.status === 'cancelled' ? 'Cancelled' : 'Cannot cancel'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 