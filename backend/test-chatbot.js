/**
 * Test Chatbot Service
 */

require('dotenv').config();
const { generateChatResponse } = require('./services/chatbotService');

async function testChatbot() {
  console.log('Testing chatbot service...');
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '***configured***' : 'NOT SET');

  try {
    const sessionId = 'test_session_' + Date.now();
    const message = 'What does AQI mean?';
    const context = {
      currentAQI: 3,
      city: 'Karachi',
      pollutants: { pm2_5: 55, pm10: 80 }
    };

    console.log('\nSending message:', message);
    console.log('Session ID:', sessionId);
    console.log('Context:', context);

    const response = await generateChatResponse(message, sessionId, context);

    console.log('\n✓ Response received:');
    console.log(response);
    console.log('\n✓ Chatbot test successful!');
  } catch (error) {
    console.error('\n✗ Chatbot test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testChatbot();
