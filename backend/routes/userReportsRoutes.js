/**
 * User Reports Routes
 * 
 * Defines routes for crowd-sourced air quality reports
 */

const express = require('express');
const router = express.Router();
const { 
  getAllReports, 
  createReport, 
  upvoteReport, 
  downvoteReport,
  getUserReportVote
} = require('../controllers/userReportsController');
const { requireAuth } = require('../middleware/auth');

// GET /api/user-reports - Get all reports (public)
router.get('/', getAllReports);

// POST /api/user-reports - Create new report (auth required)
router.post('/', requireAuth, createReport);

// PATCH /api/user-reports/:id/upvote - Upvote a report (auth required)
router.patch('/:id/upvote', requireAuth, upvoteReport);

// PATCH /api/user-reports/:id/downvote - Downvote a report (auth required)
router.patch('/:id/downvote', requireAuth, downvoteReport);

// GET /api/user-reports/:id/user-vote - Get user's vote for a report (auth required)
router.get('/:id/user-vote', requireAuth, getUserReportVote);

module.exports = router;
