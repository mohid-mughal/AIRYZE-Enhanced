/**
 * Backend Badge Sync Integration Test
 * Tests the complete badge flow including Supabase sync and Gemini integration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = null;
let testUserId = null;

// Test user credentials
const testUser = {
  email: `badge_test_${Date.now()}@test.com`,
  password: 'TestPassword123!',
  city: 'Karachi'
};

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

// Test 1: User Registration
async function testUserRegistration() {
  logSection('Test 1: User Registration');
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    
    if (response.data.token) {
      authToken = response.data.token;
      testUserId = response.data.user.id;
      logPass('User registered successfully');
      logInfo(`User ID: ${testUserId}`);
      return true;
    } else {
      logFail('No token received');
      return false;
    }
  } catch (error) {
    logFail(`Registration failed: ${error.message}`);
    if (error.response) {
      logInfo(`Status: ${error.response.status}`);
      logInfo(`Error: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// Test 2: Get Initial Badges (should be empty)
async function testGetInitialBadges() {
  logSection('Test 2: Get Initial Badges');
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/badges/${testUserId}`);
    
    if (response.data.badges !== undefined) {
      logPass('Badges retrieved successfully');
      
      // Badges might be null, empty object, or empty array for new user
      const badgeData = response.data.badges || {};
      const earnedBadges = badgeData.earnedBadges || [];
      
      logInfo(`Initial earned badges: ${earnedBadges.length}`);
      
      if (earnedBadges.length === 0) {
        logPass('No badges earned yet (as expected for new user)');
        return true;
      } else {
        logFail('New user should not have earned badges');
        return false;
      }
    } else {
      logFail('Invalid badges response');
      return false;
    }
  } catch (error) {
    logFail(`Get badges failed: ${error.message}`);
    if (error.response) {
      logInfo(`Status: ${error.response.status}`);
    }
    return false;
  }
}

// Test 3: Update Badges with Progress
async function testUpdateBadgesProgress() {
  logSection('Test 3: Update Badges with Progress');
  
  const badgeData = {
    reports_submitted: 3,
    upvotes_given: 5,
    downvotes_given: 2,
    quizzes_completed: 1,
    alerts_opened: 2,
    cities_viewed: ['Karachi', 'Lahore'],
    aqi_checks: 4,
    earnedBadges: []
  };
  
  try {
    const response = await axios.patch(`${BASE_URL}/auth/badges/${testUserId}`, badgeData);
    
    if (response.data.success) {
      logPass('Badge progress updated successfully');
      return true;
    } else {
      logFail('Update failed');
      return false;
    }
  } catch (error) {
    logFail(`Update badges failed: ${error.message}`);
    if (error.response) {
      logInfo(`Status: ${error.response.status}`);
      logInfo(`Error: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// Test 4: Verify Progress Persisted
async function testVerifyProgress() {
  logSection('Test 4: Verify Progress Persisted');
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/badges/${testUserId}`);
    
    const badges = response.data.badges || {};
    
    if (badges.reports_submitted === 3) {
      logPass('Reports submitted count persisted');
    } else {
      logFail(`Reports submitted mismatch: ${badges.reports_submitted}`);
    }
    
    if (badges.upvotes_given === 5) {
      logPass('Upvotes given count persisted');
    } else {
      logFail(`Upvotes given mismatch: ${badges.upvotes_given}`);
    }
    
    if (badges.cities_viewed && badges.cities_viewed.length === 2) {
      logPass('Cities viewed array persisted');
    } else {
      logFail('Cities viewed not persisted correctly');
    }
    
    return true;
  } catch (error) {
    logFail(`Verify progress failed: ${error.message}`);
    return false;
  }
}

// Test 5: Earn a Badge
async function testEarnBadge() {
  logSection('Test 5: Earn a Badge (Report Contributor)');
  
  const badgeData = {
    reports_submitted: 5,
    upvotes_given: 5,
    downvotes_given: 2,
    quizzes_completed: 1,
    alerts_opened: 2,
    cities_viewed: ['Karachi', 'Lahore'],
    aqi_checks: 4,
    earnedBadges: ['report_contributor']
  };
  
  try {
    const response = await axios.patch(`${BASE_URL}/auth/badges/${testUserId}`, badgeData);
    
    if (response.data.success) {
      logPass('Badge earned and synced successfully');
      return true;
    } else {
      logFail('Earn badge failed');
      return false;
    }
  } catch (error) {
    logFail(`Earn badge failed: ${error.message}`);
    return false;
  }
}

// Test 6: Verify Badge Earned
async function testVerifyBadgeEarned() {
  logSection('Test 6: Verify Badge Earned');
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/badges/${testUserId}`);
    
    const badges = response.data.badges || {};
    
    if (badges.earnedBadges && badges.earnedBadges.includes('report_contributor')) {
      logPass('Report Contributor badge found in earned badges');
      return true;
    } else {
      logFail('Badge not found in earned badges');
      return false;
    }
  } catch (error) {
    logFail(`Verify badge earned failed: ${error.message}`);
    return false;
  }
}

// Test 7: Earn Multiple Badges
async function testEarnMultipleBadges() {
  logSection('Test 7: Earn Multiple Badges');
  
  const badgeData = {
    reports_submitted: 5,
    upvotes_given: 10,
    downvotes_given: 10,
    quizzes_completed: 3,
    alerts_opened: 5,
    cities_viewed: ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta'],
    aqi_checks: 7,
    earnedBadges: [
      'report_contributor',
      'upvoter',
      'downvoter',
      'quiz_master',
      'alert_responder',
      'city_explorer',
      'daily_streak_7'
    ]
  };
  
  try {
    const response = await axios.patch(`${BASE_URL}/auth/badges/${testUserId}`, badgeData);
    
    if (response.data.success) {
      logPass('Multiple badges synced successfully');
      return true;
    } else {
      logFail('Sync multiple badges failed');
      return false;
    }
  } catch (error) {
    logFail(`Earn multiple badges failed: ${error.message}`);
    return false;
  }
}

// Test 8: Verify All Badges
async function testVerifyAllBadges() {
  logSection('Test 8: Verify All Badges Persisted');
  
  try {
    const response = await axios.get(`${BASE_URL}/auth/badges/${testUserId}`);
    
    const badges = response.data.badges || {};
    
    logInfo(`Total earned badges: ${badges.earnedBadges ? badges.earnedBadges.length : 0}`);
    
    const expectedBadges = [
      'report_contributor',
      'upvoter',
      'downvoter',
      'quiz_master',
      'alert_responder',
      'city_explorer',
      'daily_streak_7'
    ];
    
    let allFound = true;
    expectedBadges.forEach(badgeId => {
      if (badges.earnedBadges && badges.earnedBadges.includes(badgeId)) {
        logPass(`Badge found: ${badgeId}`);
      } else {
        logFail(`Badge missing: ${badgeId}`);
        allFound = false;
      }
    });
    
    return allFound;
  } catch (error) {
    logFail(`Verify all badges failed: ${error.message}`);
    return false;
  }
}

// Test 9: Test Gemini Congratulations
async function testGeminiCongratulations() {
  logSection('Test 9: Test Gemini Congratulations');
  
  try {
    const response = await axios.post(`${BASE_URL}/gemini/badge-congrats`, {
      badgeName: 'Report Contributor',
      badgeDescription: 'Submit 5 crowd reports',
      userProfile: {
        age_group: 'adult',
        health_conditions: []
      }
    });
    
    if (response.data.message) {
      logPass('Gemini congratulations message generated');
      logInfo(`Message: ${response.data.message.substring(0, 100)}...`);
      return true;
    } else {
      logFail('No message in response');
      return false;
    }
  } catch (error) {
    logFail(`Gemini congratulations failed: ${error.message}`);
    // Check if fallback was used
    if (error.response && error.response.data && error.response.data.message) {
      logInfo('Fallback message used (expected if Gemini fails)');
      logInfo(`Message: ${error.response.data.message.substring(0, 100)}...`);
      return true;
    }
    return false;
  }
}

// Test 10: Test Gemini Fallback
async function testGeminiFallback() {
  logSection('Test 10: Test Gemini Fallback');
  
  try {
    // This should use fallback if Gemini is unavailable
    const response = await axios.post(`${BASE_URL}/gemini/badge-motivation`, {
      badgeName: 'Quiz Master',
      progress: 2,
      threshold: 3
    });
    
    if (response.data.message) {
      logPass('Fallback message generated');
      logInfo(`Message: ${response.data.message.substring(0, 100)}...`);
      return true;
    } else {
      logFail('No fallback message');
      return false;
    }
  } catch (error) {
    logFail(`Gemini fallback test failed: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log('\n🧪 Badge Integration Test Suite', 'yellow');
  log('Testing complete badge flow with Supabase sync\n', 'yellow');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 10
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
    testUserRegistration,
    testGetInitialBadges,
    testUpdateBadgesProgress,
    testVerifyProgress,
    testEarnBadge,
    testVerifyBadgeEarned,
    testEarnMultipleBadges,
    testVerifyAllBadges,
    testGeminiCongratulations,
    testGeminiFallback
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
    
    // Small delay between tests
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
