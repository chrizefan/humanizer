#!/usr/bin/env node

// Script to check user credits status
// Usage: node scripts/check-credits.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkCreditsStatus() {
  console.log('📊 Checking current user credits status...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Get statistics by subscription tier
    const { data, error } = await supabase
      .from('users')
      .select('subscription_tier, credits_remaining');
    
    if (error) {
      console.error('❌ Error fetching data:', error);
      process.exit(1);
    }
    
    // Group by subscription tier
    const stats = data.reduce((acc, user) => {
      const tier = user.subscription_tier;
      if (!acc[tier]) {
        acc[tier] = {
          count: 0,
          totalCredits: 0,
          minCredits: Infinity,
          maxCredits: -Infinity
        };
      }
      
      acc[tier].count++;
      acc[tier].totalCredits += user.credits_remaining;
      acc[tier].minCredits = Math.min(acc[tier].minCredits, user.credits_remaining);
      acc[tier].maxCredits = Math.max(acc[tier].maxCredits, user.credits_remaining);
      
      return acc;
    }, {});
    
    console.log('\n📈 User Credits Statistics:');
    console.log('─'.repeat(60));
    
    Object.entries(stats).forEach(([tier, stat]) => {
      const avgCredits = (stat.totalCredits / stat.count).toFixed(2);
      console.log(`\n${tier.toUpperCase()} TIER:`);
      console.log(`  👥 Users: ${stat.count}`);
      console.log(`  💰 Average Credits: ${avgCredits}`);
      console.log(`  📉 Min Credits: ${stat.minCredits}`);
      console.log(`  📈 Max Credits: ${stat.maxCredits}`);
      console.log(`  🎯 Total Credits: ${stat.totalCredits}`);
    });
    
    const totalUsers = data.length;
    const totalCredits = data.reduce((sum, user) => sum + user.credits_remaining, 0);
    
    console.log('\n🌟 OVERALL SUMMARY:');
    console.log(`  👥 Total Users: ${totalUsers}`);
    console.log(`  💰 Total Credits: ${totalCredits}`);
    console.log(`  📊 Average Credits per User: ${(totalCredits / totalUsers).toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Only run if called directly
if (require.main === module) {
  checkCreditsStatus();
}

module.exports = { checkCreditsStatus };
