// Test script to verify credential retrieval
require('dotenv').config({ path: '.env.local' });

console.log('=== Testing Credential Retrieval ===');
console.log('Environment variables:');
console.log('UNDETECTABLE_USER_ID:', process.env.UNDETECTABLE_USER_ID ? '✓ SET' : '✗ NOT SET');
console.log('UNDETECTABLE_API_KEY:', process.env.UNDETECTABLE_API_KEY ? '✓ SET' : '✗ NOT SET');
console.log('USE_MOCK_HUMANIZER:', process.env.USE_MOCK_HUMANIZER);

if (process.env.UNDETECTABLE_USER_ID && process.env.UNDETECTABLE_API_KEY) {
  console.log('\n✅ All credentials are properly loaded');
  console.log('User ID preview:', process.env.UNDETECTABLE_USER_ID.substring(0, 8) + '...');
  console.log('API Key preview:', process.env.UNDETECTABLE_API_KEY.substring(0, 8) + '...');
} else {
  console.log('\n❌ Missing credentials');
}
