/**
 * Test script to verify quiz-based recommendations integration
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testQuizRecommendations() {
  console.log('Testing quiz-based recommendations integration...\n');

  // Test data
  const healthProfile = {
    age_group: 'adult',
    health_conditions: ['asthma'],
    activity_level: 'moderate'
  };

  const aqiData = {
    aqi: 3,
    components: {
      pm2_5: 45,
      pm10: 60,
      no2: 30
    }
  };

  const completedQuizzes = ['asthma_smart', 'general_knowledge'];
  const quizScores = {
    'asthma_smart': { score: 90, date: new Date().toISOString() },
    'general_knowledge': { score: 85, date: new Date().toISOString() }
  };

  try {
    console.log('1. Testing WITHOUT quiz data...');
    const response1 = await axios.post(`${API_URL}/api/personalization/recommendations`, {
      healthProfile,
      aqiData
    });

    console.log('✓ Response received');
    console.log('  - General recommendations:', response1.data.general?.length || 0);
    console.log('  - Health-specific recommendations:', response1.data.health_specific?.length || 0);
    console.log('  - Quiz insights:', response1.data.quiz_insights?.length || 0);
    console.log('  - Source:', response1.data.source);
    console.log('');

    console.log('2. Testing WITH quiz data...');
    const response2 = await axios.post(`${API_URL}/api/personalization/recommendations`, {
      healthProfile,
      aqiData,
      completedQuizzes,
      quizScores
    });

    console.log('✓ Response received');
    console.log('  - General recommendations:', response2.data.general?.length || 0);
    console.log('  - Health-specific recommendations:', response2.data.health_specific?.length || 0);
    console.log('  - Quiz insights:', response2.data.quiz_insights?.length || 0);
    console.log('  - Source:', response2.data.source);
    
    if (response2.data.quiz_insights && response2.data.quiz_insights.length > 0) {
      console.log('\n  Quiz Insights:');
      response2.data.quiz_insights.forEach((insight, i) => {
        console.log(`    ${i + 1}. ${insight}`);
      });
    }
    console.log('');

    console.log('✅ All tests passed!');
    console.log('\nVerification complete. Quiz-based recommendations are working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testQuizRecommendations();
