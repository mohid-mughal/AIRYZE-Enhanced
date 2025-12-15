/**
 * User Reports Unit Tests
 * 
 * Tests for user reports controller functions.
 */

const supabase = require('../db');
const { 
  getAllReports, 
  createReport, 
  upvoteReport, 
  downvoteReport 
} = require('../controllers/userReportsController');

// Increase Jest timeout for network operations
jest.setTimeout(30000);

describe('User Reports Controller Tests', () => {
  let testUserId;
  let testReportId;

  beforeAll(async () => {
    // Create a test user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name: 'Test User Reports',
        email: `test-reports-${Date.now()}@example.com`,
        password: 'hashedpassword',
        city: 'Test City'
      }])
      .select()
      .single();

    if (error) throw error;
    testUserId = user.id;
  });

  afterAll(async () => {
    // Clean up
    if (testReportId) {
      await supabase.from('user_reports').delete().eq('id', testReportId);
    }
    if (testUserId) {
      await supabase.from('users').delete().eq('id', testUserId);
    }
  });

  test('getAllReports returns reports array', async () => {
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await getAllReports(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        reports: expect.any(Array)
      })
    );
  });

  test('createReport creates a new report', async () => {
    const req = {
      body: {
        user_id: testUserId,
        lat: 24.8607,
        lon: 67.0011,
        description: 'Test air quality report'
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
          description: 'Test air quality report',
          upvotes: 0,
          downvotes: 0
        })
      })
    );

    // Save report ID for cleanup
    testReportId = res.json.mock.calls[0][0].report.id;
  });

  test('createReport validates required fields', async () => {
    const req = {
      body: {
        user_id: testUserId
        // Missing lat, lon, description
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

  test('createReport validates coordinate ranges', async () => {
    const req = {
      body: {
        user_id: testUserId,
        lat: 100, // Invalid
        lon: 67.0011,
        description: 'Test'
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
        error: expect.stringContaining('latitude')
      })
    );
  });

  test('upvoteReport increments upvotes', async () => {
    // First create a report
    const createReq = {
      body: {
        user_id: testUserId,
        lat: 24.8607,
        lon: 67.0011,
        description: 'Test for upvote'
      }
    };
    const createRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await createReport(createReq, createRes);
    const reportId = createRes.json.mock.calls[0][0].report.id;
    const initialUpvotes = createRes.json.mock.calls[0][0].report.upvotes;

    // Now upvote it
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
    expect(upvoteRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        report: expect.objectContaining({
          upvotes: initialUpvotes + 1
        })
      })
    );

    // Cleanup
    await supabase.from('user_reports').delete().eq('id', reportId);
  });

  test('downvoteReport increments downvotes', async () => {
    // First create a report
    const createReq = {
      body: {
        user_id: testUserId,
        lat: 24.8607,
        lon: 67.0011,
        description: 'Test for downvote'
      }
    };
    const createRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await createReport(createReq, createRes);
    const reportId = createRes.json.mock.calls[0][0].report.id;
    const initialDownvotes = createRes.json.mock.calls[0][0].report.downvotes;

    // Now downvote it
    const downvoteReq = {
      params: { id: reportId },
      body: { user_id: testUserId }
    };
    const downvoteRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await downvoteReport(downvoteReq, downvoteRes);

    expect(downvoteRes.status).toHaveBeenCalledWith(200);
    expect(downvoteRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        report: expect.objectContaining({
          downvotes: initialDownvotes + 1
        })
      })
    );

    // Cleanup
    await supabase.from('user_reports').delete().eq('id', reportId);
  });

  test('upvoteReport returns 404 for non-existent report', async () => {
    const req = {
      params: { id: 999999 },
      body: { user_id: testUserId }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await upvoteReport(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Report not found'
      })
    );
  });
});
