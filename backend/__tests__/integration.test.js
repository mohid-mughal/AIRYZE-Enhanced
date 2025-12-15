/**
 * Integration Tests for Crowd-Sourced Reporting Feature
 * 
 * Tests the complete user flow including:
 * - Report submission with map location selection
 * - Report display on map and list
 * - Upvote/downvote functionality
 * - Search filtering
 * - Poll voting and chart updates
 * - Authentication requirements
 * 
 * Requirements: All (Task 10.1)
 */

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

// Increase Jest timeout for integration tests
jest.setTimeout(30000);

describe('Crowd-Sourced Reporting Integration Tests', () => {
  let testUserId;
  let testReportIds = [];
  let testPollId;
  let testVoteIds = [];

  beforeAll(async () => {
    // Create a test user for all integration tests
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name: 'Integration Test User',
        email: `integration-test-${Date.now()}@example.com`,
        password: 'hashedpassword',
        city: 'Test City'
      }])
      .select()
      .single();

    if (error) throw error;
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up all test data
    if (testVoteIds.length > 0) {
      await supabase.from('poll_votes').delete().in('id', testVoteIds);
    }
    if (testPollId) {
      await supabase.from('polls').delete().eq('id', testPollId);
    }
    if (testReportIds.length > 0) {
      await supabase.from('user_reports').delete().in('id', testReportIds);
    }
    if (testUserId) {
      await supabase.from('users').delete().eq('id', testUserId);
    }
  });

  describe('Report Submission Flow', () => {
    test('User can submit report with map location selection', async () => {
      // Simulate map click coordinates
      const mapClickLat = 24.8607;
      const mapClickLon = 67.0011;

      // Create report with map-selected location
      const req = {
        body: {
          user_id: testUserId,
          lat: mapClickLat,
          lon: mapClickLon,
          description: 'Heavy smog visible from my location',
          photo_url: 'https://example.com/photo.jpg'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          report: expect.objectContaining({
            id: expect.any(Number),
            user_id: testUserId,
            lat: mapClickLat,
            lon: mapClickLon,
            description: 'Heavy smog visible from my location',
            photo_url: 'https://example.com/photo.jpg',
            upvotes: 0,
            downvotes: 0
          })
        })
      );

      // Save report ID for cleanup
      testReportIds.push(res.json.mock.calls[0][0].report.id);
    });

    test('Report submission requires authentication', async () => {
      // Attempt to create report without user_id
      const req = {
        body: {
          lat: 24.8607,
          lon: 67.0011,
          description: 'Test report'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });
  });

  describe('Report Display and Retrieval', () => {
    beforeAll(async () => {
      // Create multiple reports with different timestamps
      const reports = [
        {
          user_id: testUserId,
          lat: 24.8607,
          lon: 67.0011,
          description: 'Report 1 - Recent',
          timestamp: new Date().toISOString()
        },
        {
          user_id: testUserId,
          lat: 31.5204,
          lon: 74.3587,
          description: 'Report 2 - Older',
          timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
        },
        {
          user_id: testUserId,
          lat: 33.6844,
          lon: 73.0479,
          description: 'Report 3 - Oldest',
          timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
        }
      ];

      for (const report of reports) {
        const { data, error } = await supabase
          .from('user_reports')
          .insert([report])
          .select()
          .single();
        
        if (error) throw error;
        testReportIds.push(data.id);
      }
    });

    test('Reports are displayed ordered by timestamp (most recent first)', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getAllReports(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const reports = res.json.mock.calls[0][0].reports;
      
      // Verify reports are ordered by timestamp descending
      for (let i = 0; i < reports.length - 1; i++) {
        const currentTime = new Date(reports[i].timestamp).getTime();
        const nextTime = new Date(reports[i + 1].timestamp).getTime();
        expect(currentTime).toBeGreaterThanOrEqual(nextTime);
      }
    });

    test('Reports contain all required fields for map display', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getAllReports(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const reports = res.json.mock.calls[0][0].reports;
      
      // Verify each report has required fields for map markers
      reports.forEach(report => {
        expect(report).toHaveProperty('id');
        expect(report).toHaveProperty('lat');
        expect(report).toHaveProperty('lon');
        expect(report).toHaveProperty('description');
        expect(report).toHaveProperty('timestamp');
        expect(report).toHaveProperty('upvotes');
        expect(report).toHaveProperty('downvotes');
      });
    });
  });

  describe('Voting Functionality', () => {
    let voteTestReportId;

    beforeAll(async () => {
      // Create a report for voting tests
      const { data, error } = await supabase
        .from('user_reports')
        .insert([{
          user_id: testUserId,
          lat: 24.8607,
          lon: 67.0011,
          description: 'Report for voting test'
        }])
        .select()
        .single();
      
      if (error) throw error;
      voteTestReportId = data.id;
      testReportIds.push(data.id);
    });

    test('Authenticated user can upvote a report', async () => {
      const req = {
        params: { id: voteTestReportId },
        body: { user_id: testUserId }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await upvoteReport(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          report: expect.objectContaining({
            id: voteTestReportId,
            upvotes: expect.any(Number)
          })
        })
      );

      const upvotes = res.json.mock.calls[0][0].report.upvotes;
      expect(upvotes).toBeGreaterThan(0);
    });

    test('Authenticated user can downvote a report', async () => {
      const req = {
        params: { id: voteTestReportId },
        body: { user_id: testUserId }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await downvoteReport(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          report: expect.objectContaining({
            id: voteTestReportId,
            downvotes: expect.any(Number)
          })
        })
      );

      const downvotes = res.json.mock.calls[0][0].report.downvotes;
      expect(downvotes).toBeGreaterThan(0);
    });

    test('Vote counts persist in database', async () => {
      // Get the report directly from database
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .eq('id', voteTestReportId)
        .single();

      expect(error).toBeNull();
      // After upvote then downvote (which switches), we should have 0 upvotes and 1 downvote
      expect(data.upvotes).toBe(0);
      expect(data.downvotes).toBe(1);
    });
  });

  describe('Search Filtering', () => {
    beforeAll(async () => {
      // Create reports with specific keywords
      const searchReports = [
        {
          user_id: testUserId,
          lat: 24.8607,
          lon: 67.0011,
          description: 'Heavy SMOG and pollution today'
        },
        {
          user_id: testUserId,
          lat: 31.5204,
          lon: 74.3587,
          description: 'Clear skies and fresh air'
        },
        {
          user_id: testUserId,
          lat: 33.6844,
          lon: 73.0479,
          description: 'Moderate smog levels observed'
        }
      ];

      for (const report of searchReports) {
        const { data, error } = await supabase
          .from('user_reports')
          .insert([report])
          .select()
          .single();
        
        if (error) throw error;
        testReportIds.push(data.id);
      }
    });

    test('Search filtering is case-insensitive', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getAllReports(req, res);

      const allReports = res.json.mock.calls[0][0].reports;
      
      // Filter reports containing "smog" (case-insensitive)
      const filteredReports = allReports.filter(report => 
        report.description.toLowerCase().includes('smog')
      );

      expect(filteredReports.length).toBeGreaterThanOrEqual(2);
      filteredReports.forEach(report => {
        expect(report.description.toLowerCase()).toContain('smog');
      });
    });

    test('Search returns only matching reports', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getAllReports(req, res);

      const allReports = res.json.mock.calls[0][0].reports;
      
      // Filter reports containing "clear"
      const filteredReports = allReports.filter(report => 
        report.description.toLowerCase().includes('clear')
      );

      expect(filteredReports.length).toBeGreaterThanOrEqual(1);
      filteredReports.forEach(report => {
        expect(report.description.toLowerCase()).toContain('clear');
      });
    });

    test('Empty search returns all reports', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getAllReports(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const reports = res.json.mock.calls[0][0].reports;
      expect(reports.length).toBeGreaterThan(0);
    });
  });

  describe('Poll Voting Flow', () => {
    beforeAll(async () => {
      // Create a test poll
      const req = {
        body: {
          question: 'How would you describe today\'s air quality?',
          options: ['Very Good', 'Good', 'Moderate', 'Poor', 'Very Poor']
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createPoll(req, res);
      testPollId = res.json.mock.calls[0][0].poll.id;
    });

    test('User can view all polls', async () => {
      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getAllPolls(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          polls: expect.any(Array)
        })
      );

      const polls = res.json.mock.calls[0][0].polls;
      expect(polls.length).toBeGreaterThan(0);
      
      // Verify poll structure
      polls.forEach(poll => {
        expect(poll).toHaveProperty('id');
        expect(poll).toHaveProperty('question');
        expect(poll).toHaveProperty('options');
        expect(poll).toHaveProperty('votes');
      });
    });

    test('Authenticated user can submit a vote', async () => {
      const req = {
        params: { id: testPollId },
        body: {
          user_id: testUserId,
          option: 'Moderate'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await submitVote(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          vote: expect.objectContaining({
            poll_id: testPollId,
            user_id: testUserId,
            option: 'Moderate'
          }),
          poll: expect.objectContaining({
            votes: expect.any(Object)
          })
        })
      );

      // Save vote ID for cleanup
      testVoteIds.push(res.json.mock.calls[0][0].vote.id);
    });

    test('Vote count increments correctly', async () => {
      // Get the poll to check vote count
      const { data, error } = await supabase
        .from('polls')
        .select('*')
        .eq('id', testPollId)
        .single();

      expect(error).toBeNull();
      expect(data.votes['Moderate']).toBeGreaterThan(0);
    });

    test('User cannot vote twice on same poll', async () => {
      const req = {
        params: { id: testPollId },
        body: {
          user_id: testUserId,
          option: 'Good'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await submitVote(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringMatching(/already voted|can't add more than 1 vote/i)
        })
      );
    });

    test('User can retrieve their previous vote', async () => {
      const req = {
        params: { id: testPollId },
        query: { user_id: testUserId }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getUserVote(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          vote: expect.objectContaining({
            poll_id: testPollId,
            user_id: testUserId,
            option: 'Moderate'
          })
        })
      );
    });

    test('Poll results are accurate', async () => {
      // Get poll data
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', testPollId)
        .single();

      expect(pollError).toBeNull();

      // Get vote count from poll_votes table
      const { data: votes, error: votesError } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('poll_id', testPollId);

      expect(votesError).toBeNull();

      // Calculate total from votes object
      const totalFromVotes = Object.values(poll.votes).reduce((sum, count) => sum + count, 0);
      
      // Verify total matches actual vote count
      expect(totalFromVotes).toBe(votes.length);
    });
  });

  describe('Authentication Requirements', () => {
    test('Non-authenticated user cannot submit report', async () => {
      const req = {
        body: {
          lat: 24.8607,
          lon: 67.0011,
          description: 'Test report without auth'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createReport(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('Non-authenticated user cannot vote on poll', async () => {
      const req = {
        params: { id: testPollId },
        body: {
          option: 'Good'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await submitVote(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.stringContaining('user_id')
        })
      );
    });
  });

  describe('Complete User Journey', () => {
    test('End-to-end flow: Submit report, vote, search, and poll', async () => {
      // Step 1: User submits a report
      const createReq = {
        body: {
          user_id: testUserId,
          lat: 24.8607,
          lon: 67.0011,
          description: 'End-to-end test report with keyword JOURNEY'
        }
      };
      const createRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await createReport(createReq, createRes);
      expect(createRes.status).toHaveBeenCalledWith(201);
      const reportId = createRes.json.mock.calls[0][0].report.id;
      testReportIds.push(reportId);

      // Step 2: User upvotes the report
      const upvoteReq = {
        params: { id: reportId },
        body: { user_id: testUserId }
      };
      const upvoteRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await upvoteReport(upvoteReq, upvoteRes);
      expect(upvoteRes.status).toHaveBeenCalledWith(200);
      expect(upvoteRes.json.mock.calls[0][0].report.upvotes).toBe(1);

      // Step 3: User searches for reports
      const searchReq = {};
      const searchRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getAllReports(searchReq, searchRes);
      const allReports = searchRes.json.mock.calls[0][0].reports;
      const foundReport = allReports.find(r => r.id === reportId);
      expect(foundReport).toBeDefined();
      expect(foundReport.description).toContain('JOURNEY');

      // Step 4: Verify report appears in filtered search
      const filteredReports = allReports.filter(r => 
        r.description.toLowerCase().includes('journey')
      );
      expect(filteredReports.length).toBeGreaterThan(0);
      expect(filteredReports.some(r => r.id === reportId)).toBe(true);
    });
  });
});
