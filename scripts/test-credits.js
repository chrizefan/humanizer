// Script to test Undetectable AI credit checking directly

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function testCredits() {
  // API configuration
  const UNDETECTABLE_API_BASE = 'https://humanize.undetectable.ai';
  const userId = process.env.UNDETECTABLE_USER_ID;
  const apiKey = process.env.UNDETECTABLE_API_KEY;

  if (!userId || !apiKey) {
    console.error('Missing credentials. Please check your .env.local file.');
    process.exit(1);
  }

  console.log('Testing with credentials:');
  console.log(`User ID: ${userId.substring(0, 8)}...`);
  console.log(`API Key: ${apiKey.substring(0, 8)}...`);

  // Test GET /check-user-credits
  console.log('\n--- Testing GET /check-user-credits ---');
  try {
    const response = await fetch(`${UNDETECTABLE_API_BASE}/check-user-credits`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'user-id': userId
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response Body:', text);
    
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Test POST /check-user-credits
  console.log('\n--- Testing POST /check-user-credits ---');
  try {
    const response = await fetch(`${UNDETECTABLE_API_BASE}/check-user-credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({ userId })
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response Body:', text);
    
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }

  // Try directly getting user information
  console.log('\n--- Testing GET /user ---');
  try {
    const response = await fetch(`${UNDETECTABLE_API_BASE}/user`, {
      method: 'GET',
      headers: {
        'apikey': apiKey,
        'user-id': userId
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response Body:', text);
    
    if (text) {
      try {
        const json = JSON.parse(text);
        console.log('Parsed JSON:', json);
      } catch (e) {
        console.log('Could not parse as JSON');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testCredits().catch(console.error);
