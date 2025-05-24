/**
 * Simple database connection and table existence checker
 * Use this for quick health checks
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqmmhuqdbmoqaebohbwm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbW1odXFkYm1vcWFlYm9oYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzgyMzQsImV4cCI6MjA2MzQ1NDIzNH0.FezHZRMpzhs7EdPpYxwaafYzU1sdnm7XzUFT-7x4rC0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickHealthCheck() {
  console.log('🏥 Supabase Health Check...\n');
  
  try {
    // Test connection
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('❌ Connection failed:', sessionError.message);
      return;
    }
    console.log('✅ Supabase connection successful');
    
    // Test tables
    const tables = ['users', 'projects', 'usage_logs'];
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': ${err.message}`);
      }
    }
    
    console.log('\n🏁 Health check complete!');
    
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
  }
}

if (require.main === module) {
  quickHealthCheck();
}

module.exports = quickHealthCheck;
