const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uqmmhuqdbmoqaebohbwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbW1odXFkYm1vcWFlYm9oYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzgyMzQsImV4cCI6MjA2MzQ1NDIzNH0.FezHZRMpzhs7EdPpYxwaafYzU1sdnm7XzUFT-7x4rC0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickSignUpTest() {
  console.log('🚀 Quick Sign-Up Test...\n');
  
  const testEmail = `quicktest${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    console.log('Attempting sign-up...');
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          confirm_email: 'true'
        }
      }
    });
    
    if (error) {
      console.log('❌ Sign-up error:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('✅ Sign-up successful!');
      console.log('User ID:', data.user?.id);
      console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
      
      // Wait for trigger to process
      console.log('\nWaiting 3 seconds for database trigger...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try to sign in
      console.log('Attempting sign-in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.log('❌ Sign-in error:', signInError.message);
      } else {
        console.log('✅ Sign-in successful!');
        
        // Check if user record exists in our custom table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', signInData.user.id)
          .single();
          
        if (userError) {
          console.log('❌ User record not found in custom table:', userError.message);
        } else {
          console.log('✅ User record found in custom table!');
          console.log('Credits:', userData.credits_remaining);
        }
        
        // Sign out
        await supabase.auth.signOut();
      }
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

quickSignUpTest();
