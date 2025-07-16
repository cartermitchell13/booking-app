'use client';

import React, { useState, useEffect } from 'react';
import { useTenant, useTenantBranding } from '@/lib/tenant-context';
import { useAuth } from '@/lib/auth-context';
import { PageLoading } from '@/components/ui';
import {
  BookingHeader,
  BookingSearchFilters,
  BookingGrid,
  BookingStats,
  CancelBookingModal
} from '@/components/bookings';

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

export default function BookingHistory() {
  const { user } = useAuth();
  const { tenant, supabase } = useTenant();
  const branding = useTenantBranding();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);

  const canCancelBooking = (booking: Booking) => {
    if (booking.status === 'cancelled') {
      return { canCancel: false, reason: 'Booking is already cancelled' };
    }
    
    // Check if booking is too close to departure (example: 24 hours)
    const now = new Date();
    const createdAt = new Date(booking.created_at);
    const hoursDifference = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    
    // For demo purposes, allow cancellation if booked less than 168 hours (7 days) ago
    if (hoursDifference > 168) {
      return { canCancel: false, reason: 'Cancellation period has expired' };
    }
    
    return { canCancel: true };
  };

  const handleCancelClick = (booking: Booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel || !supabase) return;
    
    setCancellingBookingId(bookingToCancel.id);
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          cancellation_reason: cancellationReason || 'User requested cancellation',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', bookingToCancel.id);

      if (error) throw error;

      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingToCancel.id 
          ? { ...booking, status: 'cancelled' }
          : booking
      ));

      setShowCancelModal(false);
      setBookingToCancel(null);
      setCancellationReason('');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBookingId(null);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setBookingToCancel(null);
    setCancellationReason('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  // Filter bookings for stats
  const filteredBookingsForStats = bookings.filter(booking => {
    const matchesSearch = searchQuery === '' || 
      booking.products.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !supabase) return;
      
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            products (
              name,
              description,
              product_data,
              base_price,
              image_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, supabase]);

  if (isLoading) {
    return <PageLoading message="Loading your bookings..." />;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: branding.background_color || '#faf9f6' }}>
      <BookingHeader tenant={tenant} user={user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 
            className="text-3xl sm:text-4xl font-bold"
            style={{ 
              color: branding.textOnBackground,
              fontFamily: `var(--tenant-font, 'Inter')`
            }}
          >
            Your Bookings
          </h1>
          <p className="mt-2 text-lg" style={{ color: branding.textOnBackground }}>
            Manage and track all your trip bookings
          </p>
        </div>

        <BookingSearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          isLoading={false}
          totalBookings={bookings.length}
          filteredCount={filteredBookingsForStats.length}
        />

        <BookingGrid
          bookings={bookings}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          onCancelClick={handleCancelClick}
          onClearFilters={handleClearFilters}
          cancellingBookingId={cancellingBookingId}
          canCancelBooking={canCancelBooking}
        />

        <BookingStats bookings={filteredBookingsForStats} />
      </main>

      <CancelBookingModal
        show={showCancelModal}
        booking={bookingToCancel}
        cancellationReason={cancellationReason}
        setCancellationReason={setCancellationReason}
        onCancel={handleCancelModalClose}
        onConfirm={handleCancelConfirm}
        isLoading={cancellingBookingId !== null}
      />
    </div>
  );
} 