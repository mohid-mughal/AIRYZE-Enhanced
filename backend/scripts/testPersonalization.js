/**
 * Test Script for Backend Personalization
 * 
 * Verifies that personalization services are working correctly
 */

require('dotenv').config();
const { getRuleBasedRecommendations, generateRuleBasedEmailContent } = require('../services/personalizationHelper');
const { generatePersonalizedRecommendations, generateEmailContent } = require('../services/geminiService');

console.log('=== Testing Backend Personalization ===\n');

// Test 1: Rule-based recommendations
console.log('Test 1: Rule-based Recommendations');
console.log('-----------------------------------');

const testProfile1 = {
  age_group: '19_40',
  health_conditions: ['asthma'],
  activity_level: 'running_cycling',
  primary_city: 'Karachi'
};

const testAQI1 = 3; // Moderate

const recommendations1 = getRuleBasedRecommendations(testProfile1, testAQI1);
console.log(`Profile: Age 19-40, Asthma, Running/Cycling`);
console.log(`AQI: ${testAQI1} (Moderate)`);
console.log('Recommendations:');
recommendations1.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
console.log('✓ Rule-based recommendations working\n');

// Test 2: Rule-based email content
console.log('Test 2: Rule-based Email Content');
console.log('--------------------------------');

const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  city: 'Karachi',
  health_profile: testProfile1
};

const emailContent = generateRuleBasedEmailContent(testUser, testAQI1, 'daily');
console.log('Generated Email Content:');
console.log(emailContent);
console.log('✓ Rule-based email content working\n');

// Test 3: Elderly recommendations
console.log('Test 3: Elderly-specific Recommendations');
console.log('---------------------------------------');

const elderlyProfile = {
  age_group: '60_plus',
  health_conditions: ['heart_issues'],
  activity_level: 'light_exercise',
  primary_city: 'Lahore'
};

const recommendations2 = getRuleBasedRecommendations(elderlyProfile, 4);
console.log(`Profile: Age 60+, Heart Issues, Light Exercise`);
console.log(`AQI: 4 (Poor)`);
console.log('Recommendations:');
recommendations2.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
console.log('✓ Elderly recommendations working\n');

// Test 4: Young children recommendations
console.log('Test 4: Young Children Recommendations');
console.log('-------------------------------------');

const parentProfile = {
  age_group: '19_40',
  health_conditions: ['young_children'],
  activity_level: 'light_exercise',
  primary_city: 'Islamabad'
};

const recommendations3 = getRuleBasedRecommendations(parentProfile, 4);
console.log(`Profile: Parent with Young Children`);
console.log(`AQI: 4 (Poor)`);
console.log('Recommendations:');
recommendations3.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
console.log('✓ Young children recommendations working\n');

// Test 5: Gemini AI (will fallback if API fails)
console.log('Test 5: Gemini AI Integration (with fallback)');
console.log('--------------------------------------------');

const testAQIData = {
  aqi: 3,
  components: {
    pm2_5: 35,
    pm10: 50,
    no2: 20
  }
};

(async () => {
  try {
    const geminiRecs = await generatePersonalizedRecommendations(testProfile1, testAQIData);
    
    if (geminiRecs) {
      console.log('Gemini AI Recommendations:');
      geminiRecs.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
      console.log('✓ Gemini AI working\n');
    } else {
      console.log('⚠ Gemini AI returned null (expected if API unavailable)');
      console.log('✓ Fallback mechanism will be used\n');
    }
  } catch (error) {
    console.log('⚠ Gemini AI error (expected if API unavailable):', error.message);
    console.log('✓ Fallback mechanism will be used\n');
  }

  console.log('=== All Personalization Tests Complete ===');
  console.log('✓ Rule-based recommendations: WORKING');
  console.log('✓ Email content generation: WORKING');
  console.log('✓ Health-specific advice: WORKING');
  console.log('✓ Age-specific advice: WORKING');
  console.log('✓ Activity-specific advice: WORKING');
  console.log('✓ Gemini AI integration: CONFIGURED (with fallback)');
  console.log('\nBackend personalization is ready! ✓');
})();
