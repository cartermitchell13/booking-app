// Simple test to debug email issues
const { Resend } = require('resend');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testResend() {
  console.log('=== RESEND DEBUG TEST ===');
  
  // Check if API key is loaded
  const apiKey = process.env.RESEND_API_KEY;
  console.log('API Key loaded:', apiKey ? 'YES' : 'NO');
  console.log('API Key (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    return;
  }
  
  try {
    // Initialize Resend
    const resend = new Resend(apiKey);
    console.log('✅ Resend initialized successfully');
    
    // Send test email
    console.log('📧 Sending test email...');
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'cartermitchell13@gmail.com',
      subject: 'Debug Test Email',
      html: '<h1>Test Email</h1><p>This is a test email to debug the Resend integration.</p>'
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', result.data?.id);
    console.log('Full result:', result);
    
  } catch (error) {
    console.error('❌ Error sending email:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

testResend(); 