#!/usr/bin/env node

// Script to give 10 free credits to all users without subscriptions
// Usage: node scripts/give-credits.js

const https = require('https');

async function giveFreeCredits() {
  console.log('🎁 Giving 10 free credits to users without subscriptions...');
  
  try {
    const response = await fetch('http://localhost:3000/api/admin/give-credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Success!');
      console.log(`📊 ${result.message}`);
      console.log(`👥 Users updated: ${result.details.usersUpdated}`);
      console.log(`💰 Average credits after update: ${result.details.averageCreditsAfter}`);
    } else {
      console.error('❌ Failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  giveFreeCredits();
}
