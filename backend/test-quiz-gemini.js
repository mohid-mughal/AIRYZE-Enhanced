/**
 * Quiz Gemini Integration Test
 * Tests quiz feedback, recommendations, and Gemini integration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logPass(message) {
  log(`✓ ${message}`, 'green');
}

function logFail(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, 'blue');
  log(message, 'blue');
  log('='.repeat(60), 'blue');
}

// Test 1: Quiz Feedback Generation
async function testQuizFeedback() {
  logSection('Test 1: Quiz Feedback Generation');
  
  const quizData = {
    quizTitle: "Kids' Air Adventure",
    score: 80,
    totalQuestions: 10,
    correctAnswers: 8,
    incorrectQuestions: [
      { question: 'What is PM2.5?', userAnswer: 'A type of game', correctAnswer: 'Tiny particles in air' },
      { question: 'What makes air dirty?', userAnswer: 'Rain', correctAnswer: 'Car smoke and factories' }
    ],
    userProfile: {
      age_group: 'child',
      health_conditions: []
    }
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/gemini/quiz-feedback`, quizData);
    
    if (response.data.feedback) {
      logPass('Quiz feedback generated successfully');
      logInfo(`Feedback length: ${response.data.feedback.length} characters`);
      logInfo(`Preview: ${response.data.feedback.substring(0, 150)}...`);
      return true;
    } else {
      logFail('No feedback in response');
      return false;
    }
  } catch (error) {
    logFail(`Quiz feedback failed: ${error.message}`);
    if (error.response && error.response.data && error.response.data.feedback) {
      logInfo('Fallback feedback used (expected if Gemini unavailable)');
      return true;
    }
    return false;
  }
}

// Test 2: Quiz Explanation Enhancement
async function testQuizExplanation() {
  logSection('Test 2: Quiz Explanation Enhancement');
  
  const explanationData = {
    question: 'What is AQI?',
    correctAnswer: 'Air Quality Index - tells us how clean the air is',
    userAnswer: 'A type of weather',
    isCorrect: false,
    basicExplanation: 'AQI stands for Air Quality Index. It tells us if the air is clean and safe to breathe!'
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/gemini/quiz-explanation`, explanationData);
    
    if (response.data.explanation) {
      logPass('Quiz explanation enhanced successfully');
      logInfo(`Explanation: ${response.data.explanation.substring(0, 150)}...`);
      return true;
    } else {
      logFail('No explanation in response');
      return false;
    }
  } catch (error) {
    logFail(`Quiz explanation failed: ${error.message}`);
    if (error.response && error.response.data && error.response.data.explanation) {
      logInfo('Fallback explanation used');
      return true;
    }
    return false;
  }
}

// Test 3: Quiz Recommendation
async function testQuizRecommendation() {
  logSection('Test 3: Quiz Recommendation');
  
  const userData = {
    completedQuizzes: ['kids_adventure', 'general_knowledge'],
    healthProfile: {
      age_group: 'adult',
      health_conditions: ['asthma'],
      activity_level: 'moderate'
    },
    city: 'Karachi',
    currentAqi: 3
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/gemini/quiz-recommendation`, userData);
    
    if (response.data.recommendation) {
      logPass('Quiz recommendation generated successfully');
      logInfo(`Recommended quiz: ${response.data.recommendedQuiz || 'Not specified'}`);
      logInfo(`Reason: ${response.data.recommendation.substring(0, 150)}...`);
      return true;
    } else {
      logFail('No recommendation in response');
      return false;
    }
  } catch (error) {
    logFail(`Quiz recommendation failed: ${error.message}`);
    if (error.response && error.response.data && error.response.data.recommendation) {
      logInfo('Fallback recommendation used');
      return true;
    }
    return false;
  }
}

// Test 4: All 5 Quizzes Feedback
async function testAllQuizzesFeedback() {
  logSection('Test 4: All 5 Quizzes Feedback');
  
  const quizzes = [
    { title: "Kids' Air Adventure", score: 75 },
    { title: "Asthma-Smart Quiz", score: 90 },
    { title: "Senior Citizen Safety Quiz", score: 85 },
    { title: "Outdoor Athlete Quiz", score: 80 },
    { title: "General Knowledge Quiz", score: 95 }
  ];
  
  let allPassed = true;
  
  for (const quiz of quizzes) {
    logInfo(`Testing feedback for ${quiz.title}...`);
    
    try {
      const response = await axios.post(`${BASE_URL}/gemini/quiz-feedback`, {
        quizTitle: quiz.title,
        score: quiz.score,
        totalQuestions: 10,
        correctAnswers: Math.floor(quiz.score / 10),
        incorrectQuestions: [],
        userProfile: { age_group: 'adult', health_conditions: [] }
      });
      
      if (response.data.feedback) {
        logPass(`  - ${quiz.title}: Feedback generated`);
      } else {
        logFail(`  - ${quiz.title}: No feedback`);
        allPassed = false;
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.feedback) {
        logPass(`  - ${quiz.title}: Fallback used`);
      } else {
        logFail(`  - ${quiz.title}: Failed`);
        allPassed = false;
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return allPassed;
}

// Test 5: Score-Based Feedback Variation
async function testScoreBasedFeedback() {
  logSection('Test 5: Score-Based Feedback Variation');
  
  const scores = [100, 80, 60, 40, 20];
  let allPassed = true;
  
  for (const score of scores) {
    logInfo(`Testing feedback for ${score}% score...`);
    
    try {
      const response = await axios.post(`${BASE_URL}/gemini/quiz-feedback`, {
        quizTitle: 'General Knowledge Quiz',
        score: score,
        totalQuestions: 10,
        correctAnswers: score / 10,
        incorrectQuestions: [],
        userProfile: { age_group: 'adult', health_conditions: [] }
      });
      
      if (response.data.feedback) {
        logPass(`  - ${score}%: Feedback generated`);
        
        // Check if feedback is appropriate for score
        const feedback = response.data.feedback.toLowerCase();
        if (score >= 80 && (feedback.includes('great') || feedback.includes('excellent') || feedback.includes('well done'))) {
          logPass(`    - Positive tone for high score`);
        } else if (score < 60 && (feedback.includes('practice') || feedback.includes('review') || feedback.includes('improve'))) {
          logPass(`    - Encouraging tone for low score`);
        }
      } else {
        logFail(`  - ${score}%: No feedback`);
        allPassed = false;
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.feedback) {
        logPass(`  - ${score}%: Fallback used`);
      } else {
        logFail(`  - ${score}%: Failed`);
        allPassed = false;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return allPassed;
}

// Test 6: Health Profile Integration
async function testHealthProfileIntegration() {
  logSection('Test 6: Health Profile Integration');
  
  const profiles = [
    { age_group: 'child', health_conditions: [] },
    { age_group: 'adult', health_conditions: ['asthma'] },
    { age_group: 'senior', health_conditions: ['heart_disease'] },
    { age_group: 'adult', health_conditions: [], activity_level: 'athlete' }
  ];
  
  let allPassed = true;
  
  for (const profile of profiles) {
    logInfo(`Testing with profile: ${JSON.stringify(profile)}...`);
    
    try {
      const response = await axios.post(`${BASE_URL}/gemini/quiz-feedback`, {
        quizTitle: 'General Knowledge Quiz',
        score: 80,
        totalQuestions: 10,
        correctAnswers: 8,
        incorrectQuestions: [],
        userProfile: profile
      });
      
      if (response.data.feedback) {
        logPass(`  - Feedback generated for profile`);
      } else {
        logFail(`  - No feedback for profile`);
        allPassed = false;
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.feedback) {
        logPass(`  - Fallback used for profile`);
      } else {
        logFail(`  - Failed for profile`);
        allPassed = false;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return allPassed;
}

// Test 7: Fallback Messages
async function testFallbackMessages() {
  logSection('Test 7: Fallback Messages');
  
  logInfo('Testing fallback messages when Gemini is unavailable...');
  
  // This test assumes Gemini might fail and checks if fallbacks work
  try {
    const response = await axios.post(`${BASE_URL}/gemini/quiz-feedback`, {
      quizTitle: 'Test Quiz',
      score: 80,
      totalQuestions: 10,
      correctAnswers: 8,
      incorrectQuestions: [],
      userProfile: { age_group: 'adult', health_conditions: [] }
    });
    
    if (response.data.feedback) {
      logPass('Feedback received (Gemini or fallback)');
      logInfo(`Feedback: ${response.data.feedback.substring(0, 100)}...`);
      return true;
    } else {
      logFail('No feedback received');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.feedback) {
      logPass('Fallback message used successfully');
      return true;
    } else {
      logFail('No fallback available');
      return false;
    }
  }
}

// Main test runner
async function runAllTests() {
  log('\n🧪 Quiz Gemini Integration Test Suite', 'yellow');
  log('Testing quiz feedback, recommendations, and Gemini integration\n', 'yellow');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 7
  };
  
  // Check if server is running
  try {
    await axios.get(`${BASE_URL}/health`);
    logInfo('Server is running');
  } catch (error) {
    logFail('Server is not running. Please start the backend server first.');
    logInfo('Run: cd backend && npm start');
    process.exit(1);
  }
  
  // Run tests
  const tests = [
    testQuizFeedback,
    testQuizExplanation,
    testQuizRecommendation,
    testAllQuizzesFeedback,
    testScoreBasedFeedback,
    testHealthProfileIntegration,
    testFallbackMessages
  ];
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      logFail(`Test threw error: ${error.message}`);
      results.failed++;
    }
    
    // Delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  logSection('Test Summary');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`, 'yellow');
  
  if (results.failed === 0) {
    log('🎉 All tests passed!', 'green');
  } else {
    log('⚠️  Some tests failed. Please review the output above.', 'red');
  }
}

// Run tests
runAllTests().catch(error => {
  logFail(`Test suite failed: ${error.message}`);
  process.exit(1);
});
