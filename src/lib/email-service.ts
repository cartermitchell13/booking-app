import { Resend } from 'resend';
import { 
  BookingConfirmationEmail, 
  BookingCancellationEmail, 
  WelcomeEmail, 
  BookingEmailData 
} from './email-templates';
import { supabase } from './supabase';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
const EMAIL_CONFIG = {
  from: {
    name: process.env.EMAIL_FROM_NAME || 'Booking Platform',
    address: process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev'
  },
  replyTo: process.env.EMAIL_REPLY_TO || 'support@yourdomain.com'
};

// Types for email sending
interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface TenantInfo {
  id: string;
  name: string;
  branding: {
    primary_color: string;
    secondary_color: string;
    logo_url?: string;
  };
  settings: {
    email_from?: string;
    support_email?: string;
    phone?: string;
  };
}

// Utility function to ensure logo URLs work properly in emails
function getEmailCompatibleLogoUrl(logoUrl?: string): string | undefined {
  if (!logoUrl) return undefined;

  // If it's already a Supabase Storage URL, use it as is
  if (logoUrl.includes('supabase.co/storage/v1/object/public/')) {
    console.log('Email logo: Using existing Supabase Storage URL:', logoUrl);
    return logoUrl;
  }

  // If it's already a valid external absolute URL (not localhost), use it as is
  if (logoUrl.startsWith('https://') && !logoUrl.includes('localhost')) {
    console.log('Email logo: Using existing external URL:', logoUrl);
    return logoUrl;
  }

  // If it's a relative URL starting with '/', it's likely an old path that should be in Supabase Storage
  if (logoUrl.startsWith('/')) {
    console.warn('Email logo: Relative URL detected - tenant should upload logo to Supabase Storage:', logoUrl);
    console.warn('Email logo: Skipping logo display for relative URL (requires Supabase Storage upload)');
    return undefined;
  }

  // If it's localhost or other invalid format, skip it
  if (logoUrl.includes('localhost') || logoUrl.startsWith('http://')) {
    console.warn('Email logo: Local/HTTP URL not suitable for emails:', logoUrl);
    return undefined;
  }

  // For any other format, skip it with a warning
  console.warn('Email logo: Unrecognized URL format, skipping logo display:', logoUrl);
  return undefined;
}

// Get tenant information for email branding
async function getTenantInfo(tenant_id: string): Promise<TenantInfo | null> {
  try {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, branding, settings')
      .eq('id', tenant_id)
      .single();

    if (error) {
      console.error('Error fetching tenant info:', error);
      return null;
    }

    return tenant;
  } catch (error) {
    console.error('Error in getTenantInfo:', error);
    return null;
  }
}

// Get user information for personalization
async function getUserInfo(user_id: string): Promise<{ name: string; email: string } | null> {
  try {
    const { data: user, error } = await supabase.auth.admin.getUserById(user_id);

    if (error) {
      console.error('Error fetching user info:', error);
      return null;
    }

    return {
      name: user.user?.user_metadata?.full_name || user.user?.email?.split('@')[0] || 'Customer',
      email: user.user?.email || ''
    };
  } catch (error) {
    console.error('Error in getUserInfo:', error);
    return null;
  }
}

// Get product information for email context
async function getProductInfo(product_id: string): Promise<{
  name: string;
  description?: string;
  departure_location?: string;
  arrival_location?: string;
  departure_time?: string;
} | null> {
  try {
    // Query products table with correct columns
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        name,
        description,
        product_data
      `)
      .eq('id', product_id)
      .single();

    if (error) {
      console.error('Error fetching product info:', error);
      return null;
    }

    // Extract location information from product_data JSONB
    const productData = product.product_data || {};
    const departureLocation = productData.departure_location || 
      (productData.pickup_locations?.[0]?.name ? 
        `${productData.pickup_locations[0].name} (${productData.pickup_locations[0].time})` : 
        'Departure location TBD');
    
    const arrivalLocation = product.name; // The product name is the destination

    // Try to get departure time from product instances
    let departureTime = undefined;
    try {
      const { data: instances } = await supabase
        .from('product_instances')
        .select('start_time')
        .eq('product_id', product_id)
        .limit(1);
      
      if (instances && instances.length > 0) {
        departureTime = new Date(instances[0].start_time).toLocaleString('en-CA', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (instanceError) {
      console.log('No product instances found, using generic departure time');
      departureTime = 'Departure time TBD';
    }

    return {
      name: product.name,
      description: product.description,
      departure_location: departureLocation,
      arrival_location: arrivalLocation,
      departure_time: departureTime
    };
  } catch (error) {
    console.error('Error in getProductInfo:', error);
    return null;
  }
}

// Send email using Resend
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  tenantInfo?: TenantInfo
): Promise<EmailSendResult> {
  try {
    // For testing, use verified domain. In production, use tenant-specific domain if verified
    const fromAddress = EMAIL_CONFIG.from.address; // Use verified domain for now
    const fromName = tenantInfo?.name || EMAIL_CONFIG.from.name;

    const { data, error } = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: [to],
      subject: subject,
      html: html,
      replyTo: tenantInfo?.settings?.support_email || EMAIL_CONFIG.replyTo
    });

    if (error) {
      console.error('Resend email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send email'
      };
    }

    console.log('Email sent successfully:', data);
    return {
      success: true,
      messageId: data?.id
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Main email service functions
export class EmailService {
  
  // Send booking confirmation email
  static async sendBookingConfirmation(booking: {
    id: string;
    booking_reference: string;
    tenant_id: string;
    product_id: string;
    user_id?: string;
    customer_email?: string;
    customer_name?: string;
    passenger_count_adult: number;
    passenger_count_child: number;
    total_amount: number;
    status: string;
    created_at: string;
  }): Promise<EmailSendResult> {
    try {
      // Get tenant information
      const tenantInfo = await getTenantInfo(booking.tenant_id);
      if (!tenantInfo) {
        return { success: false, error: 'Tenant not found' };
      }

      // Get user information
      let userInfo = null;
      if (booking.user_id) {
        userInfo = await getUserInfo(booking.user_id);
      }

      // Get product information
      const productInfo = await getProductInfo(booking.product_id);
      if (!productInfo) {
        return { success: false, error: 'Product not found' };
      }

      // Handle logo URL for emails - convert relative URLs to absolute URLs
      let logoUrl = tenantInfo.branding.logo_url;
      if (logoUrl) {
        logoUrl = getEmailCompatibleLogoUrl(logoUrl);
      }

      // Prepare email data
      const emailData: BookingEmailData = {
        booking_reference: booking.booking_reference,
        passenger_count_adult: booking.passenger_count_adult,
        passenger_count_child: booking.passenger_count_child,
        total_amount: booking.total_amount,
        status: booking.status,
        created_at: booking.created_at,
        product_name: productInfo.name,
        product_description: productInfo.description,
        departure_location: productInfo.departure_location,
        arrival_location: productInfo.arrival_location,
        departure_time: productInfo.departure_time,
        customer_name: userInfo?.name || booking.customer_name || 'Customer',
        customer_email: userInfo?.email || booking.customer_email || '',
        tenant_name: tenantInfo.name,
        tenant_colors: {
          primary: tenantInfo.branding.primary_color,
          secondary: tenantInfo.branding.secondary_color
        },
        tenant_logo: logoUrl,
        tenant_support_email: tenantInfo.settings.support_email,
        tenant_phone: tenantInfo.settings.phone
      };

      // Generate email HTML
      const emailHtml = BookingConfirmationEmail(emailData);

      // Send email
      const result = await sendEmail(
        emailData.customer_email,
        `Booking Confirmation - ${booking.booking_reference}`,
        emailHtml,
        tenantInfo
      );

      return result;
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send booking cancellation email
  static async sendBookingCancellation(booking: {
    id: string;
    booking_reference: string;
    tenant_id: string;
    product_id: string;
    user_id?: string;
    customer_email?: string;
    customer_name?: string;
    total_amount: number;
  }): Promise<EmailSendResult> {
    try {
      // Get tenant information
      const tenantInfo = await getTenantInfo(booking.tenant_id);
      if (!tenantInfo) {
        return { success: false, error: 'Tenant not found' };
      }

      // Get user information
      let userInfo = null;
      if (booking.user_id) {
        userInfo = await getUserInfo(booking.user_id);
      }

      // Get product information
      const productInfo = await getProductInfo(booking.product_id);
      if (!productInfo) {
        return { success: false, error: 'Product not found' };
      }

      // Handle logo URL for emails - convert relative URLs to absolute URLs
      let logoUrl = tenantInfo.branding.logo_url;
      if (logoUrl) {
        logoUrl = getEmailCompatibleLogoUrl(logoUrl);
      }

      // Prepare email data
      const emailData: BookingEmailData = {
        booking_reference: booking.booking_reference,
        passenger_count_adult: 0, // Not needed for cancellation
        passenger_count_child: 0, // Not needed for cancellation
        total_amount: booking.total_amount,
        status: 'cancelled',
        created_at: new Date().toISOString(),
        product_name: productInfo.name,
        customer_name: userInfo?.name || booking.customer_name || 'Customer',
        customer_email: userInfo?.email || booking.customer_email || '',
        tenant_name: tenantInfo.name,
        tenant_colors: {
          primary: tenantInfo.branding.primary_color,
          secondary: tenantInfo.branding.secondary_color
        },
        tenant_logo: logoUrl,
        tenant_support_email: tenantInfo.settings.support_email,
        tenant_phone: tenantInfo.settings.phone
      };

      // Generate email HTML
      const emailHtml = BookingCancellationEmail(emailData);

      // Send email
      const result = await sendEmail(
        emailData.customer_email,
        `Booking Cancelled - ${booking.booking_reference}`,
        emailHtml,
        tenantInfo
      );

      return result;
    } catch (error) {
      console.error('Error sending booking cancellation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Send welcome email to new customers
  static async sendWelcomeEmail(data: {
    user_id: string;
    tenant_id: string;
    customer_email: string;
    customer_name: string;
  }): Promise<EmailSendResult> {
    try {
      // Get tenant information
      const tenantInfo = await getTenantInfo(data.tenant_id);
      if (!tenantInfo) {
        return { success: false, error: 'Tenant not found' };
      }

      // Handle logo URL for emails - convert relative URLs to absolute URLs
      let logoUrl = tenantInfo.branding.logo_url;
      if (logoUrl) {
        logoUrl = getEmailCompatibleLogoUrl(logoUrl);
      }

      // Generate email HTML
      const emailHtml = WelcomeEmail({
        customer_name: data.customer_name,
        tenant_name: tenantInfo.name,
        tenant_colors: {
          primary: tenantInfo.branding.primary_color,
          secondary: tenantInfo.branding.secondary_color
        },
        tenant_logo: logoUrl,
        tenant_support_email: tenantInfo.settings.support_email
      });

      // Send email
      const result = await sendEmail(
        data.customer_email,
        `Welcome to ${tenantInfo.name}!`,
        emailHtml,
        tenantInfo
      );

      return result;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Test email function for development
  static async sendTestEmail(to: string, tenant_id: string): Promise<EmailSendResult> {
    try {
      const tenantInfo = await getTenantInfo(tenant_id);
      if (!tenantInfo) {
        return { success: false, error: 'Tenant not found' };
      }

      // Handle logo URL for emails using centralized utility
      const logoUrl = getEmailCompatibleLogoUrl(tenantInfo.branding.logo_url);

      const testEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          ${logoUrl ? `
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${logoUrl}" alt="${tenantInfo.name} Logo" style="max-height: 80px; max-width: 200px;" />
            </div>
          ` : ''}
          <h2 style="color: ${tenantInfo.branding.primary_color}; text-align: center;">Email Test - ${tenantInfo.name}</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>✅ Email Configuration Test Successful!</strong></p>
            <p style="margin: 0 0 10px 0;">This is a test email from your booking platform.</p>
            <p style="margin: 0;">If you received this email, your email service is working correctly.</p>
          </div>
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: ${tenantInfo.branding.primary_color}; margin: 0 0 10px 0;">Tenant Configuration:</h3>
            <p style="margin: 5px 0;"><strong>Tenant Name:</strong> ${tenantInfo.name}</p>
            <p style="margin: 5px 0;"><strong>Primary Color:</strong> ${tenantInfo.branding.primary_color}</p>
            <p style="margin: 5px 0;"><strong>Secondary Color:</strong> ${tenantInfo.branding.secondary_color}</p>
            <p style="margin: 5px 0;"><strong>Logo Status:</strong> ${logoUrl ? '✅ Supabase Storage URL Active' : '❌ No logo or relative URL detected'}</p>
            ${tenantInfo.settings.support_email ? `<p style="margin: 5px 0;"><strong>Support Email:</strong> ${tenantInfo.settings.support_email}</p>` : ''}
          </div>
          <p style="color: #666; font-size: 0.9em; text-align: center; margin-top: 30px;">
            Test sent at: ${new Date().toLocaleString()}
          </p>
        </div>
      `;

      const result = await sendEmail(
        to,
        `✅ Email Test - ${tenantInfo.name}`,
        testEmailHtml,
        tenantInfo
      );

      return result;
    } catch (error) {
      console.error('Error sending test email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export default email service
export default EmailService; 