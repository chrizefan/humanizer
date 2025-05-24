const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uqmmhuqdbmoqaebohbwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbW1odXFkYm1vcWFlYm9oYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzgyMzQsImV4cCI6MjA2MzQ1NDIzNH0.FezHZRMpzhs7EdPpYxwaafYzU1sdnm7XzUFT-7x4rC0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Database connection error:', error.message);
      if (error.message.includes('relation "public.users" does not exist')) {
        console.log('❌ The users table does not exist. Database migrations need to be applied.');
      }
    } else {
      console.log('✅ Database connection successful');
      console.log('✅ Users table exists');
    }
    
    // Test auth configuration
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth error:', authError);
    } else {
      console.log('✅ Auth service is working');
    }
    
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testDatabase();
