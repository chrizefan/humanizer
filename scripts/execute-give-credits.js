#!/usr/bin/env node

// Simple script to execute the give credits operation
// Usage: node scripts/execute-give-credits.js

async function executeGiveCredits() {
  console.log('🎁 Starting operation to give 10 free credits to users without subscriptions...');
  
  try {
    // First, let's start the dev server if it's not running
    console.log('📡 Checking if server is available...');
    
    const response = await fetch('http://localhost:3000/api/admin/give-credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch(error => {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Server is not running. Please start it with: npm run dev');
      }
      throw error;
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Success!');
      console.log(`📊 ${result.message}`);
      console.log(`👥 Users updated: ${result.details.usersUpdated}`);
      console.log(`💰 Average credits after update: ${result.details.averageCreditsAfter}`);
      console.log('');
      console.log('🎉 Operation completed successfully!');
    } else {
      console.error('❌ Failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('Server is not running')) {
      console.log('💡 Please run: npm run dev');
      console.log('   Then try this script again.');
    }
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  executeGiveCredits();
}
