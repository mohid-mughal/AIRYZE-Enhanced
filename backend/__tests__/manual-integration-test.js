/**
 * Manual Integration Test Script
 * 
 * This script manually tests the complete user flow for the crowd-sourced reporting feature.
 * Run with: node __tests__/manual-integration-test.js
 * 
 * Tests:
 * - Report submission with map location selection
 * - Report display on map and list
 * - Upvote/downvote functionality
 * - Search filtering
 * - Poll voting and chart updates
 * - Authentication requirements
 */

require('dotenv').config();
const supabase = require('../db');
const { 
  getAllReports, 
  createReport, 
  upvoteReport, 
  downvoteReport 
} = require('../controllers/userReportsController');
const {
  getAllPolls,
  submitVote,
  getUserVote,
  createPoll
} = require('../controllers/pollsController');

// Test state
let testUserId;
let testReportIds = [];
let testPollId;
let testVoteIds = [];
let testsPassed = 0;
let testsFailed = 0;

// Helper to create mock request/response objects
function createMockReqRes(params = {}, body = {}, query = {}) {
  const req = { params, body, query };
  const res = {
    statusCode: null,
    responseData: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.responseData = data;
      return this;
    }
  };
  return { req, res };
}

// Test assertion helper
function assert(condition, testName) {
  if (condition) {
    console.log(`✓ ${testName}`);
    testsPassed++;
  } else {
    console.error(`✗ ${testName}`);
    testsFailed++;
  }
}

// Main test runner
async function runTests() {
  console.log('\n=== Starting Integration Tests ===\n');

  try {
    // Setup: Create test user
    console.log('Setting up test user...');
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name: 'Manual Test User',
        email: `manual-test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        city: 'Test City'
      }])
      .select()
      .single();

    if (error) throw error;
    testUserId = user.id;
    console.log(`Test user created with ID: ${testUserId}\n`);

    // Test 1: Report Submission with Map Location
    console.log('--- Test 1: Report Submission with Map Location ---');
    const { req: createReq, res: createRes } = createMockReqRes(
      {},
      {
        user_id: testUserId,
        lat: 24.8607,
        lon: 67.0011,
        description: 'Heavy smog visible from my location',
        photo_url: 'https://example.com/photo.jpg'
      }
    );
    
    await createReport(createReq, createRes);
    assert(createRes.statusCode === 201, 'Report created with status 201');
    assert(createRes.responseData?.success === true, 'Response indicates success');
    assert(createRes.responseData?.report?.lat === 24.8607, 'Latitude preserved');
    assert(createRes.responseData?.report?.lon === 67.0011, 'Longitude preserved');
    assert(createRes.responseData?.report?.upvotes === 0, 'Upvotes initialized to 0');
    assert(createRes.responseData?.report?.downvotes === 0, 'Downvotes initialized to 0');
    
    if (createRes.responseData?.report?.id) {
      testReportIds.push(createRes.responseData.report.id);
    }

    // Test 2: Report Display and Ordering
    console.log('\n--- Test 2: Report Display and Ordering ---');
    
    // Create multiple reports with different timestamps
    for (let i = 0; i < 3; i++) {
      const { req, res } = createMockReqRes(
        {},
        {
          user_id: testUserId,
          lat: 24.8607 + i * 0.1,
          lon: 67.0011 + i * 0.1,
          description: `Test report ${i + 1}`
        }
      );
      await createReport(req, res);
      if (res.responseData?.report?.id) {
        testReportIds.push(res.responseData.report.id);
      }
      // Small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const { req: getAllReq, res: getAllRes } = createMockReqRes();
    await getAllReports(getAllReq, getAllRes);
    
    assert(getAllRes.statusCode === 200, 'Get all reports returns 200');
    assert(Array.isArray(getAllRes.responseData?.reports), 'Reports is an array');
    assert(getAllRes.responseData.reports.length > 0, 'Reports array is not empty');
    
    // Check ordering (most recent first)
    const reports = getAllRes.responseData.reports;
    let isOrdered = true;
    for (let i = 0; i < reports.length - 1; i++) {
      const currentTime = new Date(reports[i].timestamp).getTime();
      const nextTime = new Date(reports[i + 1].timestamp).getTime();
      if (currentTime < nextTime) {
        isOrdered = false;
        break;
      }
    }
    assert(isOrdered, 'Reports are ordered by timestamp (most recent first)');

    // Test 3: Upvote/Downvote Functionality
    console.log('\n--- Test 3: Upvote/Downvote Functionality ---');
    
    const reportIdForVoting = testReportIds[0];
    
    // Upvote
    const { req: upvoteReq, res: upvoteRes } = createMockReqRes({ id: reportIdForVoting });
    await upvoteReport(upvoteReq, upvoteRes);
    
    assert(upvoteRes.statusCode === 200, 'Upvote returns 200');
    assert(upvoteRes.responseData?.report?.upvotes > 0, 'Upvote count increased');
    
    // Downvote
    const { req: downvoteReq, res: downvoteRes } = createMockReqRes({ id: reportIdForVoting });
    await downvoteReport(downvoteReq, downvoteRes);
    
    assert(downvoteRes.statusCode === 200, 'Downvote returns 200');
    assert(downvoteRes.responseData?.report?.downvotes > 0, 'Downvote count increased');
    
    // Verify persistence
    const { data: persistedReport } = await supabase
      .from('user_reports')
      .select('*')
      .eq('id', reportIdForVoting)
      .single();
    
    assert(persistedReport.upvotes > 0, 'Upvotes persisted in database');
    assert(persistedReport.downvotes > 0, 'Downvotes persisted in database');

    // Test 4: Search Filtering
    console.log('\n--- Test 4: Search Filtering ---');
    
    // Create reports with specific keywords
    const { req: smogReq, res: smogRes } = createMockReqRes(
      {},
      {
        user_id: testUserId,
        lat: 24.8607,
        lon: 67.0011,
        description: 'Heavy SMOG and pollution today'
      }
    );
    await createReport(smogReq, smogRes);
    if (smogRes.responseData?.report?.id) {
      testReportIds.push(smogRes.responseData.report.id);
    }

    const { req: clearReq, res: clearRes } = createMockReqRes(
      {},
      {
        user_id: testUserId,
        lat: 31.5204,
        lon: 74.3587,
        description: 'Clear skies and fresh air'
      }
    );
    await createReport(clearReq, clearRes);
    if (clearRes.responseData?.report?.id) {
      testReportIds.push(clearRes.responseData.report.id);
    }

    // Get all reports and filter
    const { req: filterReq, res: filterRes } = createMockReqRes();
    await getAllReports(filterReq, filterRes);
    
    const allReports = filterRes.responseData.reports;
    const smogReports = allReports.filter(r => r.description.toLowerCase().includes('smog'));
    const clearReports = allReports.filter(r => r.description.toLowerCase().includes('clear'));
    
    assert(smogReports.length > 0, 'Search finds reports with "smog"');
    assert(clearReports.length > 0, 'Search finds reports with "clear"');
    assert(smogReports.every(r => r.description.toLowerCase().includes('smog')), 'All filtered reports contain search term');

    // Test 5: Poll Creation and Voting
    console.log('\n--- Test 5: Poll Creation and Voting ---');
    
    // Create a poll
    const { req: createPollReq, res: createPollRes } = createMockReqRes(
      {},
      {
        question: 'How would you describe today\'s air quality?',
        options: ['Very Good', 'Good', 'Moderate', 'Poor', 'Very Poor']
      }
    );
    await createPoll(createPollReq, createPollRes);
    
    assert(createPollRes.statusCode === 201, 'Poll created with status 201');
    assert(createPollRes.responseData?.poll?.id, 'Poll has an ID');
    assert(createPollRes.responseData?.poll?.votes, 'Poll has votes object');
    
    testPollId = createPollRes.responseData.poll.id;
    
    // Check initial vote counts
    const initialVotes = createPollRes.responseData.poll.votes;
    assert(Object.values(initialVotes).every(count => count === 0), 'All options initialized to 0 votes');

    // Submit a vote
    const { req: voteReq, res: voteRes } = createMockReqRes(
      { id: testPollId },
      {
        user_id: testUserId,
        option: 'Moderate'
      }
    );
    await submitVote(voteReq, voteRes);
    
    assert(voteRes.statusCode === 201, 'Vote submitted with status 201');
    assert(voteRes.responseData?.vote?.option === 'Moderate', 'Vote option recorded');
    assert(voteRes.responseData?.poll?.votes['Moderate'] > 0, 'Vote count incremented');
    
    if (voteRes.responseData?.vote?.id) {
      testVoteIds.push(voteRes.responseData.vote.id);
    }

    // Test 6: Duplicate Vote Prevention
    console.log('\n--- Test 6: Duplicate Vote Prevention ---');
    
    const { req: dupVoteReq, res: dupVoteRes } = createMockReqRes(
      { id: testPollId },
      {
        user_id: testUserId,
        option: 'Good'
      }
    );
    await submitVote(dupVoteReq, dupVoteRes);
    
    assert(dupVoteRes.statusCode === 409, 'Duplicate vote returns 409 Conflict');
    assert(dupVoteRes.responseData?.error?.includes('already voted'), 'Error message indicates duplicate vote');

    // Test 7: Get User Vote
    console.log('\n--- Test 7: Get User Vote ---');
    
    const { req: getUserVoteReq, res: getUserVoteRes } = createMockReqRes(
      { id: testPollId },
      {},
      { user_id: testUserId }
    );
    await getUserVote(getUserVoteReq, getUserVoteRes);
    
    assert(getUserVoteRes.statusCode === 200, 'Get user vote returns 200');
    assert(getUserVoteRes.responseData?.vote?.option === 'Moderate', 'User\'s previous vote retrieved');

    // Test 8: Poll Results Accuracy
    console.log('\n--- Test 8: Poll Results Accuracy ---');
    
    const { data: pollData } = await supabase
      .from('polls')
      .select('*')
      .eq('id', testPollId)
      .single();
    
    const { data: voteData } = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', testPollId);
    
    const totalFromVotes = Object.values(pollData.votes).reduce((sum, count) => sum + count, 0);
    assert(totalFromVotes === voteData.length, 'Total vote count matches actual votes in database');

    // Test 9: Authentication Requirements
    console.log('\n--- Test 9: Authentication Requirements ---');
    
    // Try to create report without user_id
    const { req: noAuthReq, res: noAuthRes } = createMockReqRes(
      {},
      {
        lat: 24.8607,
        lon: 67.0011,
        description: 'Test without auth'
      }
    );
    await createReport(noAuthReq, noAuthRes);
    
    assert(noAuthRes.statusCode === 400, 'Report without user_id returns 400');
    
    // Try to vote without user_id
    const { req: noAuthVoteReq, res: noAuthVoteRes } = createMockReqRes(
      { id: testPollId },
      { option: 'Good' }
    );
    await submitVote(noAuthVoteReq, noAuthVoteRes);
    
    assert(noAuthVoteRes.statusCode === 400, 'Vote without user_id returns 400');

    // Test 10: Complete User Journey
    console.log('\n--- Test 10: Complete User Journey ---');
    
    // Submit report
    const { req: journeyReq, res: journeyRes } = createMockReqRes(
      {},
      {
        user_id: testUserId,
        lat: 24.8607,
        lon: 67.0011,
        description: 'End-to-end JOURNEY test report'
      }
    );
    await createReport(journeyReq, journeyRes);
    const journeyReportId = journeyRes.responseData?.report?.id;
    if (journeyReportId) {
      testReportIds.push(journeyReportId);
    }
    
    assert(journeyRes.statusCode === 201, 'Journey: Report created');
    
    // Upvote the report
    const { req: journeyUpvoteReq, res: journeyUpvoteRes } = createMockReqRes({ id: journeyReportId });
    await upvoteReport(journeyUpvoteReq, journeyUpvoteRes);
    
    assert(journeyUpvoteRes.statusCode === 200, 'Journey: Report upvoted');
    assert(journeyUpvoteRes.responseData?.report?.upvotes === 1, 'Journey: Upvote count is 1');
    
    // Search for the report
    const { req: journeySearchReq, res: journeySearchRes } = createMockReqRes();
    await getAllReports(journeySearchReq, journeySearchRes);
    
    const foundReport = journeySearchRes.responseData.reports.find(r => r.id === journeyReportId);
    assert(foundReport !== undefined, 'Journey: Report found in search results');
    assert(foundReport.description.includes('JOURNEY'), 'Journey: Report description matches');
    
    // Filter search
    const filteredJourney = journeySearchRes.responseData.reports.filter(r => 
      r.description.toLowerCase().includes('journey')
    );
    assert(filteredJourney.length > 0, 'Journey: Filtered search finds report');
    assert(filteredJourney.some(r => r.id === journeyReportId), 'Journey: Specific report in filtered results');

  } catch (error) {
    console.error('\n❌ Test execution error:', error.message);
    testsFailed++;
  } finally {
    // Cleanup
    console.log('\n--- Cleaning up test data ---');
    
    if (testVoteIds.length > 0) {
      await supabase.from('poll_votes').delete().in('id', testVoteIds);
      console.log(`Cleaned up ${testVoteIds.length} test votes`);
    }
    
    if (testPollId) {
      await supabase.from('polls').delete().eq('id', testPollId);
      console.log(`Cleaned up test poll ${testPollId}`);
    }
    
    if (testReportIds.length > 0) {
      await supabase.from('user_reports').delete().in('id', testReportIds);
      console.log(`Cleaned up ${testReportIds.length} test reports`);
    }
    
    if (testUserId) {
      await supabase.from('users').delete().eq('id', testUserId);
      console.log(`Cleaned up test user ${testUserId}`);
    }

    // Print summary
    console.log('\n=== Test Summary ===');
    console.log(`✓ Passed: ${testsPassed}`);
    console.log(`✗ Failed: ${testsFailed}`);
    console.log(`Total: ${testsPassed + testsFailed}`);
    
    if (testsFailed === 0) {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    } else {
      console.log('\n❌ Some tests failed');
      process.exit(1);
    }
  }
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
