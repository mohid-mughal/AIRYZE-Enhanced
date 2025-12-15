/**
 * Test Script for Instant Alert Endpoint
 * 
 * This script tests the instant alert functionality by making a request
 * to the endpoint with a test user ID.
 * 
 * Usage: node scripts/testInstantAlert.js <userId>
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testInstantAlert(userId) {
  try {
    console.log(`Testing instant alert for user ID: ${userId}`);
    
    const response = await axios.post(`${BASE_URL}/api/alerts/instant/${userId}`);
    
    console.log('✅ Success!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node scripts/testInstantAlert.js <userId>');
  process.exit(1);
}

testInstantAlert(userId);
