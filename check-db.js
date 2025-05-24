const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uqmmhuqdbmoqaebohbwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbW1odXFkYm1vcWFlYm9oYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzgyMzQsImV4cCI6MjA2MzQ1NDIzNH0.FezHZRMpzhs7EdPpYxwaafYzU1sdnm7XzUFT-7x4rC0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTriggers() {
  console.log('🔍 Checking database functions and triggers...\n');
  
  try {
    // Test basic table access
    console.log('Testing table access...');
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.log('❌ Cannot access users table:', error.message);
    } else {
      console.log('✅ Users table accessible');
    }
    
    // Try a simple insert to see if RLS is blocking us
    console.log('\nTesting direct insert (should fail due to RLS)...');
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert({ 
        id: '00000000-0000-0000-0000-000000000000', 
        email: 'test@example.com' 
      });
    
    if (insertError) {
      if (insertError.message.includes('RLS')) {
        console.log('✅ RLS is working (insert blocked as expected)');
      } else {
        console.log('⚠️  Unexpected insert error:', insertError.message);
      }
    } else {
      console.log('⚠️  Insert succeeded (RLS might not be working)');
    }
    
  } catch (err) {
    console.error('Test error:', err);
  }
}

checkTriggers();
