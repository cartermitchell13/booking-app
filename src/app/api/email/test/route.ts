import { NextRequest, NextResponse } from 'next/server';
import EmailService from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, tenant_id, test_type } = body;

    console.log('=== EMAIL TEST REQUEST ===');
    console.log('Request data:', { email, tenant_id, test_type });

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'Tenant ID is required' },
        { status: 400 }
      );
    }

    const validTestTypes = ['simple', 'booking_confirmation', 'booking_cancellation', 'welcome'];
    if (!test_type || !validTestTypes.includes(test_type)) {
      return NextResponse.json(
        { error: `Invalid test_type. Must be one of: ${validTestTypes.join(', ')}` },
        { status: 400 }
      );
    }

    let emailResult;

    switch (test_type) {
      case 'simple':
        // Simple test email
        emailResult = await EmailService.sendTestEmail(email, tenant_id);
        break;

      case 'booking_confirmation':
        // Test booking confirmation email with real product data
        emailResult = await EmailService.sendBookingConfirmation({
          id: 'test-booking-id',
          booking_reference: 'PB-TEST-001',
          tenant_id: tenant_id,
          product_id: '956bd758-5ced-4446-8965-fd964306bb64', // Real ParkBus product ID
          user_id: 'test-user-id',
          customer_email: email,
          customer_name: 'John Doe',
          passenger_count_adult: 2,
          passenger_count_child: 1,
          total_amount: 150.00,
          status: 'confirmed',
          created_at: new Date().toISOString()
        });
        break;

      case 'booking_cancellation':
        // Test booking cancellation email with real product data
        emailResult = await EmailService.sendBookingCancellation({
          id: 'test-booking-id',
          booking_reference: 'PB-TEST-002',
          tenant_id: tenant_id,
          product_id: '956bd758-5ced-4446-8965-fd964306bb64', // Real ParkBus product ID
          user_id: 'test-user-id',
          customer_email: email,
          customer_name: 'Jane Smith',
          total_amount: 120.00
        });
        break;

      case 'welcome':
        // Test welcome email with mock data
        emailResult = await EmailService.sendWelcomeEmail({
          user_id: 'test-user-id',
          tenant_id: tenant_id,
          customer_email: email,
          customer_name: 'Alex Johnson'
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid test type' },
          { status: 400 }
        );
    }

    if (emailResult.success) {
      console.log('Test email sent successfully:', emailResult.messageId);
      return NextResponse.json({
        success: true,
        message: `Test email (${test_type}) sent successfully to ${email}`,
        messageId: emailResult.messageId
      });
    } else {
      console.error('Failed to send test email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send test email', details: emailResult.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in email test endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for API documentation
export async function GET() {
  return NextResponse.json({
    message: 'Email Test API Endpoint',
    usage: {
      method: 'POST',
      endpoint: '/api/email/test',
      body: {
        email: 'test@example.com',
        tenant_id: 'your-tenant-id',
        test_type: 'simple | booking_confirmation | booking_cancellation | welcome'
      }
    },
    examples: {
      simple_test: {
        email: 'test@example.com',
        tenant_id: '123e4567-e89b-12d3-a456-426614174000',
        test_type: 'simple'
      },
      booking_confirmation: {
        email: 'test@example.com',
        tenant_id: '123e4567-e89b-12d3-a456-426614174000',
        test_type: 'booking_confirmation'
      },
      booking_cancellation: {
        email: 'test@example.com',
        tenant_id: '123e4567-e89b-12d3-a456-426614174000',
        test_type: 'booking_cancellation'
      },
      welcome: {
        email: 'test@example.com',
        tenant_id: '123e4567-e89b-12d3-a456-426614174000',
        test_type: 'welcome'
      }
    }
  });
} 