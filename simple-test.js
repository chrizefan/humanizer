const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uqmmhuqdbmoqaebohbwm.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbW1odXFkYm1vcWFlYm9oYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzgyMzQsImV4cCI6MjA2MzQ1NDIzNH0.FezHZRMpzhs7EdPpYxwaafYzU1sdnm7XzUFT-7x4rC0'
);

async function testSimpleSignup() {
  console.log('🔍 Testing simple signup without custom metadata...');
  
  try {
    const email = `test.user.${Math.random().toString(36).substring(7)}@example.com`;
    console.log('Testing signup for:', email);
    
    // Test without custom metadata first
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'TestPassword123!'
    });
    
    if (error) {
      console.log('❌ Simple signup failed:', error.message, 'Status:', error.status);
      return;
    }
    
    console.log('✅ Simple signup successful, user ID:', data.user?.id);
    
    // Wait for trigger to process
    console.log('⏳ Waiting for trigger to process...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if user record was created
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user?.id)
      .single();
      
    if (userError) {
      console.log('❌ User record not found in users table:', userError.message);
    } else {
      console.log('✅ User record found in users table!');
      console.log('   - ID:', userData.id);
      console.log('   - Email:', userData.email);
      console.log('   - Credits:', userData.credits_remaining);
      console.log('   - Tier:', userData.subscription_tier);
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testSimpleSignup();
