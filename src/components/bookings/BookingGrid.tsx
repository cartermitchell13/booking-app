'use client';

import React from 'react';
import { BookingCard } from './BookingCard';
import { EmptyBookingsState } from './EmptyBookingsState';

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

interface BookingGridProps {
  bookings: Booking[];
  searchQuery: string;
  statusFilter: string;
  onCancelClick: (booking: Booking) => void;
  onClearFilters: () => void;
  cancellingBookingId: string | null;
  canCancelBooking: (booking: Booking) => { canCancel: boolean; reason?: string };
}

export function BookingGrid({
  bookings,
  searchQuery,
  statusFilter,
  onCancelClick,
  onClearFilters,
  cancellingBookingId,
  canCancelBooking
}: BookingGridProps) {
  
  // Filter bookings based on search query and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = searchQuery === '' || 
      booking.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (filteredBookings.length === 0) {
    return (
      <EmptyBookingsState
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="space-y-4">
      {filteredBookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancelClick={onCancelClick}
          cancellingBookingId={cancellingBookingId}
          canCancelBooking={canCancelBooking}
        />
      ))}
    </div>
  );
} 