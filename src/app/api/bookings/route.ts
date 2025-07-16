import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import EmailService from '@/lib/email-service';

// Generate unique booking reference
function generateBookingReference(): string {
  const prefix = 'PB'; // ParkBus prefix
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.random().toString(36).substr(2, 4).toUpperCase(); // 4 random chars
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('=== BOOKING API DEBUG ===');
    console.log('Received booking request:', body);
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));

    // Validate required fields
    const {
      tenant_id,
      product_id, // Using products system
      user_id, // Optional for guest bookings
      customer_email, // Add this
      customer_name, // Add this
      passenger_count_adult = 1,
      passenger_count_child = 0,
      passenger_details = [],
      total_amount,
      special_requests,
      payment_intent_id
    } = body;

    // Determine customer email and name, prioritizing guest details if available
    const primary_passenger = passenger_details && passenger_details.length > 0 ? passenger_details[0] : null;
    const customer_email_to_use = body.customer_email || (primary_passenger ? primary_passenger.email : null);
    const customer_name_to_use = body.customer_name || (primary_passenger ? `${primary_passenger.firstName} ${primary_passenger.lastName}`.trim() : '');


    // Basic validation
    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }

    if (!product_id) {
      return NextResponse.json(
        { error: 'product_id is required' },
        { status: 400 }
      );
    }

    if (!total_amount || total_amount <= 0) {
      return NextResponse.json(
        { error: 'total_amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Generate unique booking reference
    const booking_reference = generateBookingReference();

    // Check product availability
    console.log('Checking availability for product:', product_id);
    console.log('Tenant ID:', tenant_id);
    
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        product_instances!inner(available_quantity, max_quantity)
      `)
      .eq('id', product_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (productError) {
      console.error('Product not found:', productError);
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    // Check product instance availability
    const totalAvailable = productData.product_instances?.reduce(
      (sum: number, instance: any) => sum + (instance.available_quantity || 0),
      0
    ) || 0;

    const totalRequested = passenger_count_adult + passenger_count_child;

    if (totalAvailable < totalRequested) {
      return NextResponse.json(
        { error: `Only ${totalAvailable} seats available, but ${totalRequested} requested` },
        { status: 400 }
      );
    }

    // Create the booking
    const bookingData = {
      tenant_id,
      product_id,
      user_id: user_id || null,
      booking_reference,
      passenger_count_adult,
      passenger_count_child,
      passenger_details,
      total_amount,
      payment_status: payment_intent_id ? 'paid' : 'pending',
      payment_intent_id: payment_intent_id || null,
      status: 'confirmed',
      special_requests: special_requests || null,
    };

    console.log('=== ATTEMPTING TO CREATE BOOKING ===');
    console.log('Booking data being inserted:', JSON.stringify(bookingData, null, 2));

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    console.log('Booking creation result:', { booking, bookingError });

    if (bookingError) {
      console.error('=== BOOKING CREATION FAILED ===');
      console.error('Error details:', bookingError);
      console.error('Error message:', bookingError.message);
      console.error('Error code:', bookingError.code);
      console.error('Error hint:', bookingError.hint);
      return NextResponse.json(
        { error: 'Failed to create booking', details: bookingError.message, code: bookingError.code },
        { status: 500 }
      );
    }

    console.log('Booking created successfully:', booking);

    // Update product instance availability after successful booking
    // For now, we'll update the first available instance
    // TODO: Implement proper instance selection logic
    const { data: instances, error: instancesError } = await supabase
      .from('product_instances')
      .select('id, available_quantity')
      .eq('product_id', product_id)
      .eq('tenant_id', tenant_id)
      .gt('available_quantity', 0)
      .order('start_time', { ascending: true })
      .limit(1);

    if (!instancesError && instances && instances.length > 0) {
      const instance = instances[0];
      const { error: updateError } = await supabase
        .from('product_instances')
        .update({
          available_quantity: Math.max(0, instance.available_quantity - totalRequested)
        })
        .eq('id', instance.id);

      if (updateError) {
        console.error('Error updating product instance availability:', updateError);
        // Don't fail the booking, just log the error
      }
    }

    // Send booking confirmation email
    console.log('=== SENDING BOOKING CONFIRMATION EMAIL ===');
    try {
      const emailPayload = {
        id: booking.id,
        booking_reference: booking.booking_reference,
        tenant_id: booking.tenant_id,
        product_id: booking.product_id,
        user_id: booking.user_id,
        customer_email: customer_email_to_use,
        customer_name: customer_name_to_use,
        passenger_count_adult: booking.passenger_count_adult,
        passenger_count_child: booking.passenger_count_child,
        total_amount: booking.total_amount,
        status: booking.status,
        created_at: booking.created_at
      };

      console.log('Email payload:', JSON.stringify(emailPayload, null, 2));

      const emailResult = await EmailService.sendBookingConfirmation(emailPayload);

      if (emailResult.success) {
        console.log('Booking confirmation email sent successfully:', emailResult.messageId);
      } else {
        console.error('Failed to send booking confirmation email:', emailResult.error);
        // Don't fail the booking, just log the error
      }
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError);
      // Don't fail the booking, just log the error
    }

    // Return the created booking
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        status: booking.status,
        payment_status: booking.payment_status,
        total_amount: booking.total_amount,
        passenger_count_adult: booking.passenger_count_adult,
        passenger_count_child: booking.passenger_count_child,
        created_at: booking.created_at
      },
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Unexpected error in booking creation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve bookings (for admin/customer use)
export async function GET(request: NextRequest) {
  try {
    console.log('=== BOOKINGS GET API DEBUG ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');
    const user_id = searchParams.get('user_id');
    const booking_reference = searchParams.get('booking_reference');

    console.log('Query parameters:', { tenant_id, user_id, booking_reference });

    if (!supabase) {
      console.error('Supabase client is not initialized');
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    let query = supabase
      .from('bookings')
      .select(`
        *,
        products:product_id (
          name,
          description,
          product_data,
          base_price,
          image_url
        )
      `);

    if (tenant_id) {
      query = query.eq('tenant_id', tenant_id);
    }

    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    if (booking_reference) {
      query = query.eq('booking_reference', booking_reference);
    }

    query = query.order('created_at', { ascending: false });

    console.log('Executing query...');
    const { data: bookings, error } = await query;

    console.log('Query result:', { bookings, error });

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      });
      return NextResponse.json(
        { error: 'Failed to fetch bookings', details: error.message, code: error.code },
        { status: 500 }
      );
    }

    console.log(`Found ${bookings?.length || 0} bookings`);

    return NextResponse.json({
      success: true,
      bookings: bookings || []
    });

  } catch (error) {
    console.error('Unexpected error in booking retrieval:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to cancel a booking
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking_id, booking_reference, tenant_id, user_id, cancellation_reason } = body;

    console.log('=== BOOKING CANCELLATION REQUEST ===');
    console.log('Request data:', { booking_id, booking_reference, tenant_id, user_id });

    // Validate required fields
    if (!booking_id && !booking_reference) {
      return NextResponse.json(
        { error: 'Either booking_id or booking_reference is required' },
        { status: 400 }
      );
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }

    // Build query to find the booking
    let bookingQuery = supabase
      .from('bookings')
      .select(`
        *,
        products!inner(
          id,
          name,
          departure_time,
          tenant_id,
          available_quantity
        )
      `)
      .eq('tenant_id', tenant_id);

    // Add booking identifier filter
    if (booking_id) {
      bookingQuery = bookingQuery.eq('id', booking_id);
    } else {
      bookingQuery = bookingQuery.eq('booking_reference', booking_reference);
    }

    // Add user filter for customer cancellations (admin can cancel any booking)
    if (user_id) {
      bookingQuery = bookingQuery.eq('user_id', user_id);
    }

    const { data: booking, error: bookingError } = await bookingQuery.single();

    if (bookingError || !booking) {
      console.error('Booking not found:', bookingError);
      return NextResponse.json(
        { error: 'Booking not found or you do not have permission to cancel this booking' },
        { status: 404 }
      );
    }

    // Validate booking can be cancelled
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 }
      );
    }

    if (booking.status !== 'confirmed' && booking.status !== 'pending') {
      return NextResponse.json(
        { error: `Cannot cancel booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Check if trip is in the past (using product departure_time)
    const productDepartureTime = new Date(booking.products.departure_time);
    const now = new Date();
    
    if (productDepartureTime <= now) {
      return NextResponse.json(
        { error: 'Cannot cancel bookings for trips that have already departed' },
        { status: 400 }
      );
    }

    // Check cancellation policy (e.g., must cancel 24 hours before departure)
    const hoursUntilDeparture = (productDepartureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDeparture < 24) {
      return NextResponse.json(
        { error: 'Cancellations must be made at least 24 hours before departure time' },
        { status: 400 }
      );
    }

    // Cancel the booking
    const { data: cancelledBooking, error: cancellationError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        cancellation_reason: cancellation_reason || 'Cancelled by customer',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.id)
      .select()
      .single();

    if (cancellationError) {
      console.error('Error cancelling booking:', cancellationError);
      return NextResponse.json(
        { error: 'Failed to cancel booking', details: cancellationError.message },
        { status: 500 }
      );
    }

    // Restore availability to product
    const totalPassengers = booking.passenger_count_adult + booking.passenger_count_child;
    
    const { error: updateError } = await supabase
      .from('product_instances')
      .update({
        available_quantity: Math.max(0, booking.products.available_quantity + totalPassengers)
      })
      .eq('id', booking.products.id);

    if (updateError) {
      console.error('Error restoring product availability:', updateError);
      // Don't fail the cancellation, just log the error
    }

    // Send booking cancellation email
    console.log('=== SENDING BOOKING CANCELLATION EMAIL ===');
    try {
      const emailResult = await EmailService.sendBookingCancellation({
        id: cancelledBooking.id,
        booking_reference: cancelledBooking.booking_reference,
        tenant_id: cancelledBooking.tenant_id,
        product_id: cancelledBooking.product_id,
        user_id: cancelledBooking.user_id,
        total_amount: cancelledBooking.total_amount
      });

      if (emailResult.success) {
        console.log('Booking cancellation email sent successfully:', emailResult.messageId);
      } else {
        console.error('Failed to send booking cancellation email:', emailResult.error);
        // Don't fail the cancellation, just log the error
      }
    } catch (emailError) {
      console.error('Error sending booking cancellation email:', emailError);
      // Don't fail the cancellation, just log the error
    }

    console.log('Booking cancelled successfully:', cancelledBooking);

    return NextResponse.json({
      success: true,
      booking: {
        id: cancelledBooking.id,
        booking_reference: cancelledBooking.booking_reference,
        status: cancelledBooking.status,
        cancelled_at: cancelledBooking.cancelled_at,
        cancellation_reason: cancelledBooking.cancellation_reason
      },
      message: 'Booking cancelled successfully'
    });

  } catch (error) {
    console.error('Unexpected error in booking cancellation:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 