const express = require('express');
const router = express.Router();
const { generateWelcomeMessage, getPersonalizedRecommendations } = require('../controllers/personalizationController');

// POST /api/personalization/welcome - Generate personalized welcome message
router.post('/welcome', generateWelcomeMessage);

// POST /api/personalization/recommendations - Get personalized recommendations
router.post('/recommendations', getPersonalizedRecommendations);

module.exports = router;
