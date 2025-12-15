/**
 * Test Email Configuration
 */

require('dotenv').config();
const { sendAQIAlert, verifyEmailConfig } = require('./services/email');

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('EMAIL_MOCK_MODE:', process.env.EMAIL_MOCK_MODE);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***configured***' : 'NOT SET');

  try {
    // Verify email config
    const isValid = await verifyEmailConfig();
    if (isValid) {
      console.log('✓ Email configuration is valid!');
    } else {
      console.log('✗ Email configuration is invalid');
      return;
    }
    
    // Try sending a test AQI alert
    console.log('\nSending test AQI alert email...');
    await sendAQIAlert(
      process.env.EMAIL_USER,
      'Test User',
      'Karachi',
      150,
      'instant',
      null,
      { aqi: 150, components: { pm2_5: 55, pm10: 80, o3: 30 } }
    );
    console.log('✓ Test email sent successfully!');
  } catch (error) {
    console.error('✗ Email test error:', error.message);
  }
}

testEmail();
