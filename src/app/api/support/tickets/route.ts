import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use the same hardcoded values as the rest of the application
const supabaseUrl = 'https://zsdkqmlhnffoidwyygce.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo'

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      tenant_id,
      subject,
      category,
      customer_name,
      customer_email,
      customer_phone,
      description,
      priority = 'medium'
    } = body;

    // Validate required fields
    if (!tenant_id || !subject || !category || !customer_name || !customer_email || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique ticket number
    const { data: ticketNumberData, error: ticketNumberError } = await supabase
      .rpc('generate_ticket_number');

    if (ticketNumberError) {
      console.error('Error generating ticket number:', ticketNumberError);
      return NextResponse.json(
        { error: 'Failed to generate ticket number' },
        { status: 500 }
      );
    }

    const ticket_number = ticketNumberData;

    // Create the support ticket
    const { data: ticketData, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        tenant_id,
        ticket_number,
        subject,
        category,
        priority,
        customer_name,
        customer_email,
        customer_phone,
        description,
        status: 'open'
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating support ticket:', ticketError);
      return NextResponse.json(
        { error: 'Failed to create support ticket' },
        { status: 500 }
      );
    }

    // Create initial message in the conversation thread
    const { error: messageError } = await supabase
      .from('support_ticket_messages')
      .insert({
        ticket_id: ticketData.id,
        sender_type: 'customer',
        sender_name: customer_name,
        sender_email: customer_email,
        message: description,
        is_internal: false
      });

    if (messageError) {
      console.error('Error creating initial message:', messageError);
      // Don't fail the request if message creation fails
    }

    return NextResponse.json({
      success: true,
      ticket: ticketData,
      message: 'Support ticket created successfully'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get('tenant_id');

    if (!tenant_id) {
      return NextResponse.json(
        { error: 'tenant_id is required' },
        { status: 400 }
      );
    }

    // Get all support tickets for the tenant
    const { data: tickets, error } = await supabase
      .from('support_tickets')
      .select(`
        *,
        support_ticket_messages (
          id,
          sender_type,
          sender_name,
          sender_email,
          message,
          is_internal,
          created_at
        )
      `)
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching support tickets:', error);
      return NextResponse.json(
        { error: 'Failed to fetch support tickets' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      tickets: tickets || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 