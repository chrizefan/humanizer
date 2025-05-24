/**
 * Comprehensive test suite for Supabase authentication and database setup
 * This script tests the complete authentication flow and database configuration
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqmmhuqdbmoqaebohbwm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxbW1odXFkYm1vcWFlYm9oYndtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc4NzgyMzQsImV4cCI6MjA2MzQ1NDIzNH0.FezHZRMpzhs7EdPpYxwaafYzU1sdnm7XzUFT-7x4rC0';

const supabase = createClient(supabaseUrl, supabaseKey);

class AuthTester {
  constructor() {
    this.testResults = {
      database: [],
      auth: [],
      triggers: []
    };
  }

  log(category, test, status, message) {
    const result = { test, status, message, timestamp: new Date().toISOString() };
    this.testResults[category].push(result);
    
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
    console.log(`${icon} ${test}: ${message}`);
  }

  async testDatabaseConnection() {
    console.log('\n🔍 Testing Database Connection...');
    
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        this.log('database', 'Supabase Connection', 'fail', `Connection failed: ${error.message}`);
        return false;
      }
      this.log('database', 'Supabase Connection', 'pass', 'Successfully connected to Supabase');
      return true;
    } catch (err) {
      this.log('database', 'Supabase Connection', 'fail', `Connection error: ${err.message}`);
      return false;
    }
  }

  async testTables() {
    console.log('\n📊 Testing Database Tables...');
    
    const tables = ['users', 'projects', 'usage_logs'];
    let allTablesExist = true;

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          this.log('database', `Table: ${table}`, 'fail', error.message);
          allTablesExist = false;
        } else {
          this.log('database', `Table: ${table}`, 'pass', 'Table exists and is accessible');
        }
      } catch (err) {
        this.log('database', `Table: ${table}`, 'fail', err.message);
        allTablesExist = false;
      }
    }

    return allTablesExist;
  }

  async testRowLevelSecurity() {
    console.log('\n🔒 Testing Row Level Security...');
    
    try {
      // This should fail due to RLS
      const { data, error } = await supabase
        .from('users')
        .insert({ 
          id: '00000000-0000-0000-0000-000000000000', 
          email: 'test@example.com' 
        });
      
      if (error && error.message.includes('row-level security')) {
        this.log('database', 'RLS Protection', 'pass', 'Row Level Security is properly configured');
        return true;
      } else {
        this.log('database', 'RLS Protection', 'warn', 'RLS might not be properly configured');
        return false;
      }
    } catch (err) {
      this.log('database', 'RLS Protection', 'fail', err.message);
      return false;
    }
  }

  async testAuthFlow() {
    console.log('\n🔐 Testing Authentication Flow...');
    
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    try {
      // Test sign-up
      console.log('Testing sign-up...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            confirm_email: 'true'  // For development auto-confirmation
          }
        }
      });
      
      if (signUpError) {
        this.log('auth', 'Sign-up', 'fail', `${signUpError.message} (Code: ${signUpError.status || 'unknown'})`);
        return false;
      }
      
      if (!signUpData.user) {
        this.log('auth', 'Sign-up', 'fail', 'No user data returned from sign-up');
        return false;
      }
      
      this.log('auth', 'Sign-up', 'pass', `User created with ID: ${signUpData.user?.id}`);
      
      // Wait for trigger to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test sign-in
      console.log('Testing sign-in...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        this.log('auth', 'Sign-in', 'fail', signInError.message);
        return false;
      }
      
      this.log('auth', 'Sign-in', 'pass', 'Successfully signed in');
      
      // Test user record creation in custom table
      console.log('Testing user record creation...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', signInData.user.id)
        .single();
        
      if (userError) {
        this.log('triggers', 'User Record Creation', 'fail', userError.message);
      } else {
        this.log('triggers', 'User Record Creation', 'pass', `User record created with ${userData.credits_remaining} credits`);
      }
      
      // Clean up: Sign out
      await supabase.auth.signOut();
      this.log('auth', 'Sign-out', 'pass', 'Successfully signed out');
      
      return true;
    } catch (err) {
      this.log('auth', 'Sign-up', 'fail', `Database error saving new user: ${err.message}`);
      console.error('Full error details:', err);
      return false;
    }
  }

  generateReport() {
    console.log('\n📋 Test Summary Report');
    console.log('='.repeat(50));
    
    const categories = ['database', 'auth', 'triggers'];
    let totalTests = 0;
    let passedTests = 0;
    
    categories.forEach(category => {
      const tests = this.testResults[category];
      if (tests.length > 0) {
        console.log(`\n${category.toUpperCase()}:`);
        tests.forEach(test => {
          const icon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
          console.log(`  ${icon} ${test.test}: ${test.message}`);
          totalTests++;
          if (test.status === 'pass') passedTests++;
        });
      }
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 All tests passed! Your Supabase setup is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the migration scripts in the scripts/ directory.');
    }
  }

  async runAllTests() {
    console.log('🧪 Starting Comprehensive Supabase Test Suite...');
    console.log('='.repeat(60));
    
    await this.testDatabaseConnection();
    await this.testTables();
    await this.testRowLevelSecurity();
    await this.testAuthFlow();
    
    this.generateReport();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new AuthTester();
  tester.runAllTests()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Test suite failed:', err);
      process.exit(1);
    });
}

module.exports = AuthTester;
