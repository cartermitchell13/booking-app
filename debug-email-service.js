// Debug script to test email service functions
const { Resend } = require('resend');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

async function testGetTenantInfo() {
  console.log('=== TESTING getTenantInfo ===');
  
  const tenant_id = '20ee5f83-1019-46c7-9382-05a6f1ded9bf';
  
  try {
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, branding, settings')
      .eq('id', tenant_id)
      .single();

    if (error) {
      console.error('❌ Error fetching tenant info:', error);
      return null;
    }

    console.log('✅ Tenant info retrieved:');
    console.log('- Name:', tenant.name);
    console.log('- Branding:', tenant.branding);
    console.log('- Settings:', tenant.settings);
    
    return tenant;
  } catch (error) {
    console.error('❌ Error in getTenantInfo:', error);
    return null;
  }
}

async function testSimpleEmail() {
  console.log('\n=== TESTING SIMPLE EMAIL ===');
  
  const tenant = await testGetTenantInfo();
  if (!tenant) {
    console.error('❌ Cannot proceed without tenant info');
    return;
  }
  
  try {
    const testEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${tenant.branding.primary_color};">Email Test - ${tenant.name}</h2>
        <p>This is a test email from your booking platform.</p>
        <p>If you received this email, your email configuration is working correctly!</p>
        <p style="color: #666; font-size: 0.9em;">
          Sent at: ${new Date().toLocaleString()}
        </p>
      </div>
    `;
    
    console.log('📧 Sending test email...');
    console.log('Email HTML length:', testEmailHtml.length);
    
    const fromAddress = tenant.settings.email_from || 'noreply@resend.dev';
    const fromName = tenant.name;
    
    const result = await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: ['cartermitchell13@gmail.com'],
      subject: `Test Email - ${tenant.name}`,
      html: testEmailHtml
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.data?.id);
    console.log('Full result:', result);
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
testSimpleEmail(); 