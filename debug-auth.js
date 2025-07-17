const { createClient } = require('@supabase/supabase-js');

// Replace these with your actual environment variables
const supabaseUrl = 'https://zsdkqmlhnffoidwyygce.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzZGtxbWxobmZmb2lkd3l5Z2NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1MjY1MDAsImV4cCI6MjA2NTEwMjUwMH0.wBz8qK_lmSgX-c2iVlGE36bdaGMWzxbEdd81tQZjBxo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔧 Testing Supabase Authentication...\n');
  
  // Test with the Park Bus admin user
  const testEmail = 'admin@parkbus.ca';
  const testPassword = 'parkbus123'; // ← Replace with actual password
  
  try {
    console.log(`📧 Attempting to sign in with: ${testEmail}`);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (error) {
      console.error('❌ Authentication failed:', error.message);
      console.error('🔍 Error details:', error);
      return;
    }
    
    if (data.user) {
      console.log('✅ Authentication successful!');
      console.log('👤 User ID:', data.user.id);
      console.log('📧 Email:', data.user.email);
      console.log('✓ Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
      
      // Test fetching user data from your custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, tenant:tenants(*)')
        .eq('id', data.user.id)
        .single();
      
      if (userError) {
        console.error('❌ Failed to fetch user data:', userError.message);
        return;
      }
      
      console.log('🏢 Tenant:', userData.tenant?.name);
      console.log('🛡️ Role:', userData.role);
      console.log('📝 User details:', {
        firstName: userData.first_name,
        lastName: userData.last_name,
        tenantId: userData.tenant_id
      });
      
      // Sign out
      await supabase.auth.signOut();
      console.log('🚪 Signed out successfully');
      
    }
  } catch (err) {
    console.error('💥 Unexpected error:', err);
  }
}

console.log('🚀 Starting authentication test...');
testAuth().then(() => {
  console.log('\n✨ Test completed');
}).catch(console.error); 