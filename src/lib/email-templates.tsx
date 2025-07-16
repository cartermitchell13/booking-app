import { ReactElement } from 'react';

// Types for our email templates
export interface BookingEmailData {
  // Booking Information
  booking_reference: string;
  passenger_count_adult: number;
  passenger_count_child: number;
  total_amount: number;
  status: string;
  created_at: string;
  
  // Product Information
  product_name: string;
  product_description?: string;
  departure_location?: string;
  arrival_location?: string;
  departure_time?: string;
  
  // Customer Information
  customer_name: string;
  customer_email: string;
  
  // Tenant Branding
  tenant_name: string;
  tenant_colors: {
    primary: string;
    secondary: string;
  };
  tenant_logo?: string;
  tenant_support_email?: string;
  tenant_phone?: string;
}

// Utility function to lighten a color for backgrounds
function lightenColor(color: string, percentage: number): string {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Lighten by mixing with white
  const lightenAmount = percentage / 100;
  const newR = Math.round(r + (255 - r) * lightenAmount);
  const newG = Math.round(g + (255 - g) * lightenAmount);
  const newB = Math.round(b + (255 - b) * lightenAmount);
  
  return `rgb(${newR}, ${newG}, ${newB})`;
}

// Enhanced base email styles with modern design
function getBaseStyles(primaryColor: string, secondaryColor?: string): string {
  return `
    /* CSS Reset for Email */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    .email-wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 40px 20px;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor});
      padding: 50px 40px;
      text-align: center;
      color: white;
      position: relative;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 100%);
    }
    
    .header-content {
      position: relative;
      z-index: 1;
    }
    
    .logo {
      max-height: 60px;
      margin-bottom: 20px;
      display: block;
      margin-left: auto;
      margin-right: auto;
      filter: brightness(0) invert(1);
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }
    
    .header p {
      font-size: 16px;
      margin: 0;
      opacity: 0.9;
      font-weight: 400;
    }
    
    .content {
      padding: 50px 40px;
    }
    
    .greeting {
      font-size: 24px;
      font-weight: 600;
      color: ${primaryColor};
      margin: 0 0 25px 0;
      letter-spacing: -0.3px;
    }
    
    .intro-text {
      font-size: 16px;
      line-height: 1.7;
      color: #1e293b;
      margin: 0 0 35px 0;
    }
    
    .booking-card {
      background: ${lightenColor(primaryColor, 95)};
      border-radius: 12px;
      padding: 30px;
      margin: 35px 0;
      border: 1px solid ${lightenColor(primaryColor, 80)};
      position: relative;
      overflow: hidden;
    }
    
    .booking-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${primaryColor}, ${secondaryColor || primaryColor});
    }
    
    .booking-reference {
      font-size: 18px;
      font-weight: 700;
      color: ${primaryColor};
      margin: 0 0 20px 0;
      padding: 12px 20px;
      background: ${lightenColor(primaryColor, 90)};
      border-radius: 8px;
      text-align: center;
      border: 1px dashed ${primaryColor};
    }
    
    .detail-grid {
      display: grid;
      gap: 15px;
      margin: 20px 0;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 0;
      border-bottom: 1px solid ${lightenColor(primaryColor, 80)};
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-label {
      font-weight: 600;
      color: #4b5563;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      flex: 1;
      min-width: 0;
    }
    
    .detail-value {
      font-weight: 600;
      color: #1e293b;
      font-size: 16px;
      text-align: right;
      flex: 1;
      min-width: 0;
      padding-left: 20px;
    }
    
    .total-row {
      background: ${primaryColor};
      color: white;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 18px;
      font-weight: 700;
    }
    
    .status-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-confirmed {
      background: #d1fae5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    
    .status-pending {
      background: #fef3c7;
      color: #b45309;
      border: 1px solid #fde68a;
    }
    
    .status-cancelled {
      background: #fee2e2;
      color: #dc2626;
      border: 1px solid #fecaca;
    }
    
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, ${primaryColor}, ${secondaryColor || primaryColor});
      color: white !important;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 30px 0;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }
    
    .info-box {
      background: #f0f9ff;
      border-left: 4px solid #0ea5e9;
      padding: 25px;
      border-radius: 8px;
      margin: 30px 0;
    }
    
    .info-box h3 {
      color: #0369a1;
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .info-box ul {
      margin: 0;
      padding-left: 20px;
      color: #0369a1;
    }
    
    .info-box li {
      margin: 8px 0;
      line-height: 1.6;
    }
    
    .warning-box {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 25px;
      border-radius: 8px;
      margin: 30px 0;
    }
    
    .warning-box h3 {
      color: #b45309;
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .warning-box p {
      color: #b45309;
      margin: 0;
      line-height: 1.6;
    }
    
    .footer {
      background: #f8fafc;
      padding: 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    
    .footer h3 {
      color: #1e293b;
      margin: 0 0 15px 0;
      font-size: 18px;
      font-weight: 600;
    }
    
    .contact-info {
      color: #475569;
      font-size: 14px;
      line-height: 1.6;
      margin: 15px 0;
    }
    
    .footer-note {
      color: #64748b;
      font-size: 12px;
      margin: 25px 0 0 0;
      line-height: 1.5;
    }
    
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, ${primaryColor}, transparent);
      margin: 40px 0;
    }
    

    

    
    /* Mobile Responsiveness */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 10px;
      }
      
      .email-container {
        border-radius: 8px;
      }
      
      .header, .content, .footer {
        padding: 30px 25px;
      }
      
      .header h1 {
        font-size: 24px;
      }
      
      .greeting {
        font-size: 20px;
      }
      
      .booking-card {
        padding: 20px;
      }
      
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
        padding: 20px 0;
      }
      
      .detail-value {
        text-align: left;
        padding-left: 0;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
      }
      
      .detail-label {
        font-weight: 600;
        color: #f1f5f9;
      }
      
      .cta-button {
        display: block;
        width: 100%;
        text-align: center;
      }
    }
    

  `;
}

// Enhanced Booking Confirmation Email Template
export function BookingConfirmationEmail(data: BookingEmailData): string {
  const {
    booking_reference,
    passenger_count_adult,
    passenger_count_child,
    total_amount,
    status,
    created_at,
    product_name,
    product_description,
    departure_location,
    arrival_location,
    departure_time,
    customer_name,
    tenant_name,
    tenant_colors,
    tenant_logo,
    tenant_support_email,
    tenant_phone
  } = data;

  const totalPassengers = passenger_count_adult + passenger_count_child;
  const formattedDate = new Date(created_at).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <meta name="supported-color-schemes" content="light dark">
      <meta name="format-detection" content="telephone=no">
      <meta name="x-apple-disable-message-reformatting">
      <title>Booking Confirmation - ${booking_reference}</title>
      <style>${getBaseStyles(tenant_colors.primary, tenant_colors.secondary)}</style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="header">
            <div class="header-content">
              ${tenant_logo ? `<img src="${tenant_logo}" alt="${tenant_name}" class="logo" onerror="this.style.display='none'">` : ''}
              <h1>🎉 Booking Confirmed!</h1>
              <p>Your adventure awaits with ${tenant_name}</p>
            </div>
          </div>

          <div class="content">
            <h2 class="greeting">Hello ${customer_name},</h2>
            
            <p class="intro-text">
              Fantastic news! Your booking has been confirmed and you're all set for an amazing experience. 
              We've included all the important details below for your reference.
            </p>

            <div class="booking-card">
              <div class="booking-reference">
                📋 Booking Reference: ${booking_reference}
              </div>
              
              <div class="detail-grid">
                <div class="detail-row">
                  <span class="detail-label">✈️ Trip</span>
                  <span class="detail-value">${product_name}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📅 Booked On</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                
                ${departure_location ? `
                <div class="detail-row">
                  <span class="detail-label">📍 Departure</span>
                  <span class="detail-value">${departure_location}</span>
                </div>
                ` : ''}
                
                ${arrival_location ? `
                <div class="detail-row">
                  <span class="detail-label">🎯 Destination</span>
                  <span class="detail-value">${arrival_location}</span>
                </div>
                ` : ''}
                
                ${departure_time ? `
                <div class="detail-row">
                  <span class="detail-label">⏰ Departure Time</span>
                  <span class="detail-value">${departure_time}</span>
                </div>
                ` : ''}
                
                <div class="detail-row">
                  <span class="detail-label">👥 Passengers</span>
                  <span class="detail-value">${totalPassengers} (${passenger_count_adult} adult${passenger_count_adult !== 1 ? 's' : ''}${passenger_count_child > 0 ? `, ${passenger_count_child} child${passenger_count_child !== 1 ? 'ren' : ''}` : ''})</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📊 Status</span>
                  <span class="detail-value">
                    <span class="status-badge status-${status.toLowerCase()}">${status}</span>
                  </span>
                </div>
              </div>
              
              <div class="total-row">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>💰 Total Amount</span>
                  <span>$${total_amount.toFixed(2)} CAD</span>
                </div>
              </div>
            </div>

            ${product_description ? `
            <div class="divider"></div>
            <h3 style="color: ${tenant_colors.primary}; margin: 30px 0 20px 0; font-size: 20px;">🌟 About Your Trip</h3>
            <p style="color: #475569; line-height: 1.7; margin: 0 0 30px 0;">${product_description}</p>
            ` : ''}

            <div style="text-align: center; margin: 40px 0;">
              <a href="#" class="cta-button">
                📱 Manage Your Booking
              </a>
            </div>

            <div class="info-box">
              <h3>📋 Important Reminders</h3>
              <ul>
                <li>Please arrive at the departure location <strong>15 minutes early</strong></li>
                <li>Bring a <strong>valid photo ID</strong> for check-in</li>
                <li>Check the weather forecast and dress appropriately</li>
                <li>Cancellations must be made at least <strong>24 hours in advance</strong></li>
                <li>Keep this confirmation email for your records</li>
              </ul>
            </div>

            <div class="divider"></div>
            
            <p style="color: #475569; line-height: 1.7; margin: 30px 0;">
              We're thrilled you've chosen ${tenant_name} for your adventure! If you have any questions 
              or need to make changes to your booking, don't hesitate to reach out to our friendly support team.
            </p>
            
            <p style="margin: 40px 0 0 0; color: #334155; font-size: 16px;">
              Safe travels and enjoy your journey!<br>
              <strong style="color: ${tenant_colors.primary};">The ${tenant_name} Team</strong> ✨
            </p>
          </div>

          <div class="footer">
            <h3>${tenant_name}</h3>
            <div class="contact-info">
              ${tenant_support_email ? `📧 ${tenant_support_email}` : ''}
              ${tenant_phone ? `<br>📞 ${tenant_phone}` : ''}
            </div>
            <p class="footer-note">
              This confirmation email was sent for booking reference ${booking_reference}. 
              If you believe you received this email in error, please contact our support team immediately.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Enhanced Booking Cancellation Email Template
export function BookingCancellationEmail(data: BookingEmailData): string {
  const {
    booking_reference,
    product_name,
    customer_name,
    tenant_name,
    tenant_colors,
    tenant_logo,
    tenant_support_email,
    tenant_phone,
    total_amount,
    created_at
  } = data;

  const formattedDate = new Date(created_at).toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled - ${booking_reference}</title>
      <style>${getBaseStyles('#dc2626', '#b91c1c')}</style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="header">
            <div class="header-content">
              ${tenant_logo ? `<img src="${tenant_logo}" alt="${tenant_name}" class="logo" onerror="this.style.display='none'">` : ''}
              <h1>📝 Booking Cancelled</h1>
              <p>We're sorry to see your plans change</p>
            </div>
          </div>

          <div class="content">
            <h2 class="greeting">Hello ${customer_name},</h2>
            
            <p class="intro-text">
              Your booking has been successfully cancelled as requested. We've processed your cancellation 
              and included all the details below for your records.
            </p>

            <div class="booking-card">
              <div class="booking-reference">
                📋 Cancelled Booking: ${booking_reference}
              </div>
              
              <div class="detail-grid">
                <div class="detail-row">
                  <span class="detail-label">✈️ Trip</span>
                  <span class="detail-value">${product_name}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📅 Originally Booked</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">📊 Status</span>
                  <span class="detail-value">
                    <span class="status-badge status-cancelled">Cancelled</span>
                  </span>
                </div>
              </div>
              
              <div class="total-row">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span>💰 Refund Amount</span>
                  <span>$${total_amount.toFixed(2)} CAD</span>
                </div>
              </div>
            </div>

            <div class="warning-box">
              <h3>💳 Refund Information</h3>
              <p>
                Your refund of <strong>$${total_amount.toFixed(2)} CAD</strong> will be processed within 
                <strong>3-5 business days</strong> and will appear on your original payment method. 
                You'll receive a separate confirmation once the refund has been processed.
              </p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="#" class="cta-button">
                🌟 Explore Other Adventures
              </a>
            </div>

            <div class="info-box">
              <h3>🤝 We'd Love to Have You Back</h3>
              <ul>
                <li>Browse our latest trips and experiences</li>
                <li>Get notified about special offers and new destinations</li>
                <li>Join our community of adventurous travelers</li>
                <li>Follow us on social media for travel inspiration</li>
              </ul>
            </div>

            <div class="divider"></div>
            
            <p style="color: #475569; line-height: 1.7; margin: 30px 0;">
              While we're sad to see this particular booking end, we hope you'll consider ${tenant_name} 
              for your future travel adventures. Our team is always here to help you plan the perfect trip!
            </p>
            
            <p style="margin: 40px 0 0 0; color: #334155; font-size: 16px;">
              Thank you for choosing ${tenant_name}. We hope to see you again soon!<br>
              <strong style="color: ${tenant_colors.primary};">The ${tenant_name} Team</strong> 🌟
            </p>
          </div>

          <div class="footer">
            <h3>${tenant_name}</h3>
            <div class="contact-info">
              ${tenant_support_email ? `📧 ${tenant_support_email}` : ''}
              ${tenant_phone ? `<br>📞 ${tenant_phone}` : ''}
            </div>
            <p class="footer-note">
              This cancellation confirmation was sent for booking reference ${booking_reference}. 
              If you have any questions about your refund, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Enhanced Welcome Email Template
export function WelcomeEmail(data: { 
  customer_name: string; 
  tenant_name: string; 
  tenant_colors: { primary: string; secondary: string; };
  tenant_logo?: string;
  tenant_support_email?: string;
  tenant_phone?: string;
}): string {
  const { customer_name, tenant_name, tenant_colors, tenant_logo, tenant_support_email, tenant_phone } = data;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ${tenant_name}</title>
      <style>${getBaseStyles(tenant_colors.primary, tenant_colors.secondary)}</style>
    </head>
    <body>
      <div class="email-wrapper">
        <div class="email-container">
          <div class="header">
            <div class="header-content">
              ${tenant_logo ? `<img src="${tenant_logo}" alt="${tenant_name}" class="logo" onerror="this.style.display='none'">` : ''}
              <h1>🎉 Welcome to ${tenant_name}!</h1>
              <p>Your adventure journey starts here</p>
            </div>
          </div>

          <div class="content">
            <h2 class="greeting">Hello ${customer_name},</h2>
            
            <p class="intro-text">
              Welcome to the ${tenant_name} family! We're absolutely thrilled to have you join our 
              community of adventure seekers and travel enthusiasts. Your account is now active and 
              ready to explore amazing experiences.
            </p>

            <div class="info-box">
              <h3>🌟 What You Can Do Now</h3>
              <ul>
                <li><strong>Discover Amazing Trips:</strong> Browse our curated selection of unique experiences</li>
                <li><strong>Easy Booking:</strong> Book your adventures with just a few clicks</li>
                <li><strong>Manage Everything:</strong> Track your bookings, view history, and manage preferences</li>
                <li><strong>Exclusive Access:</strong> Get early access to new trips and special offers</li>
                <li><strong>24/7 Support:</strong> Our team is always here to help with any questions</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="#" class="cta-button">
                🌍 Start Exploring Adventures
              </a>
            </div>

            <div class="divider"></div>

            <div style="background: linear-gradient(135deg, ${lightenColor(tenant_colors.primary, 95)}, ${lightenColor(tenant_colors.secondary || tenant_colors.primary, 95)}); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center;">
              <h3 style="color: ${tenant_colors.primary}; margin: 0 0 15px 0; font-size: 20px;">🎁 Special Welcome Offer</h3>
              <p style="color: #475569; margin: 0 0 20px 0; font-size: 16px;">
                As a welcome gift, you'll receive notifications about exclusive deals and early access to new adventures. 
                Keep an eye on your inbox for special offers just for you!
              </p>
            </div>

            <div class="warning-box" style="background: #f0f9ff; border-left-color: #0ea5e9;">
              <h3 style="color: #0369a1;">💡 Getting Started Tips</h3>
              <p style="color: #0369a1;">
                <strong>Complete your profile</strong> to get personalized recommendations, 
                <strong>set up notifications</strong> to never miss great deals, and 
                <strong>follow us on social media</strong> for travel inspiration and tips!
              </p>
            </div>

            <div class="divider"></div>
            
            <p style="color: #475569; line-height: 1.7; margin: 30px 0;">
              Our mission is to create unforgettable experiences and help you discover amazing places. 
              Whether you're seeking adventure, relaxation, or cultural immersion, we're here to make 
              your travel dreams come true.
            </p>
            
            <p style="margin: 40px 0 0 0; color: #334155; font-size: 16px;">
              Once again, welcome to ${tenant_name}! We can't wait to be part of your next adventure.<br>
              <strong style="color: ${tenant_colors.primary};">The ${tenant_name} Team</strong> ✨
            </p>
          </div>

          <div class="footer">
            <h3>${tenant_name}</h3>
            <div class="contact-info">
              ${tenant_support_email ? `📧 ${tenant_support_email}` : ''}
              ${tenant_phone ? `<br>📞 ${tenant_phone}` : ''}
            </div>
            <p class="footer-note">
              You're receiving this welcome email because you recently created an account with ${tenant_name}. 
              If you have any questions, our support team is always here to help!
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
} 