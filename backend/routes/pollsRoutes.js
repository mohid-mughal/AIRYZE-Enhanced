/**
 * Polls Routes
 * 
 * Defines routes for community polls
 */

const express = require('express');
const router = express.Router();
const { 
  getAllPolls, 
  submitVote, 
  getUserVote, 
  createPoll 
} = require('../controllers/pollsController');
const { requireAuth } = require('../middleware/auth');

// GET /api/polls - Get all polls with vote counts (public)
router.get('/', getAllPolls);

// POST /api/polls/:id/vote - Submit vote for a poll (auth required)
router.post('/:id/vote', requireAuth, submitVote);

// GET /api/polls/:id/user-vote - Get user's vote for a poll (auth required)
router.get('/:id/user-vote', requireAuth, getUserVote);

// POST /api/polls - Create new poll (admin only, for now just auth required)
router.post('/', requireAuth, createPoll);

module.exports = router;
