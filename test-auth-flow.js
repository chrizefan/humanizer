const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uqmmhuqdbmoqaebohbwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbW1odXFkYm1vcWFlYm9oYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzgyMzQsImV4cCI6MjA2MzQ1NDIzNH0.FezHZRMpzhs7EdPpYxwaafYzU1sdnm7XzUFT-7x4rC0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  console.log('🧪 Testing complete authentication flow...\n');
  
  // Test 1: Check if tables exist
  console.log('1. Testing database tables...');
  try {
    const { data: usersData, error: usersError } = await supabase.from('users').select('count').limit(1);
    const { data: projectsData, error: projectsError } = await supabase.from('projects').select('count').limit(1);
    const { data: logsData, error: logsError } = await supabase.from('usage_logs').select('count').limit(1);
    
    if (usersError) {
      console.log('❌ Users table missing:', usersError.message);
    } else {
      console.log('✅ Users table exists');
    }
    
    if (projectsError) {
      console.log('❌ Projects table missing:', projectsError.message);
    } else {
      console.log('✅ Projects table exists');
    }
    
    if (logsError) {
      console.log('❌ Usage logs table missing:', logsError.message);
    } else {
      console.log('✅ Usage logs table exists');
    }
  } catch (err) {
    console.error('Database test error:', err);
  }
  
  console.log('\n2. Testing sign-up with email confirmation bypass...');
  
  // Test 2: Sign up a test user
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          confirm_email: true  // This should trigger auto-confirmation
        }
      }
    });
    
    if (signUpError) {
      console.log('❌ Sign-up failed:', signUpError.message);
      return;
    }
    
    console.log('✅ Sign-up successful');
    console.log('User ID:', signUpData.user?.id);
    console.log('Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');
    
    // Wait a moment for the trigger to process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 3: Try to sign in
    console.log('\n3. Testing sign-in...');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Sign-in failed:', signInError.message);
      
      // If email not confirmed, check if we can fix it
      if (signInError.message.includes('Email not confirmed')) {
        console.log('🔄 Attempting to manually confirm email...');
        // Note: This would require admin privileges
      }
    } else {
      console.log('✅ Sign-in successful');
      console.log('Session created for user:', signInData.user?.email);
      
      // Test 4: Check if user record was created in our custom table
      console.log('\n4. Testing user record creation...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.user.id)
        .single();
        
      if (userError) {
        console.log('❌ User record not found in custom table:', userError.message);
      } else {
        console.log('✅ User record found in custom table');
        console.log('Credits:', userData.credits_remaining);
        console.log('Subscription:', userData.subscription_tier);
      }
      
      // Clean up: Sign out
      await supabase.auth.signOut();
    }
    
  } catch (err) {
    console.error('Auth test error:', err);
  }
  
  console.log('\n🏁 Test completed!');
}

testAuthFlow();
