/**
 * Authentication Routes
 * 
 * Defines routes for user signup and login
 */

const express = require('express');
const router = express.Router();
const { 
  signup, 
  login, 
  updateHealthProfile, 
  getHealthProfile,
  updateAlertPreferences,
  getAlertPreferences,
  updateBadges,
  getBadges,
  trackAlertOpen
} = require('../controllers/authControllers');

// POST /auth/signup - Register new user
router.post('/signup', signup);

// POST /auth/login - Authenticate user
router.post('/login', login);

// PATCH /auth/profile/:userId - Update health profile
router.patch('/profile/:userId', updateHealthProfile);

// GET /auth/profile/:userId - Get health profile
router.get('/profile/:userId', getHealthProfile);

// PATCH /auth/alert-prefs/:userId - Update alert preferences
router.patch('/alert-prefs/:userId', updateAlertPreferences);

// GET /auth/alert-prefs/:userId - Get alert preferences
router.get('/alert-prefs/:userId', getAlertPreferences);

// PATCH /auth/badges/:userId - Update badges
router.patch('/badges/:userId', updateBadges);

// GET /auth/badges/:userId - Get badges
router.get('/badges/:userId', getBadges);

// GET /auth/track-alert/:userId - Track email alert open
router.get('/track-alert/:userId', trackAlertOpen);

module.exports = router;
