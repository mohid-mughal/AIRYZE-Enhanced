const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');

// Badge congratulations message
router.post('/badge-congrats', geminiController.generateBadgeCongrats);

// Quiz feedback
router.post('/quiz-feedback', geminiController.generateQuizFeedback);

// Quiz explanation
router.post('/quiz-explanation', geminiController.generateQuizExplanation);

// Quiz recommendation
router.post('/quiz-recommendation', geminiController.generateQuizRecommendation);

// Badge motivation
router.post('/badge-motivation', geminiController.generateBadgeMotivation);

// Badge collection summary
router.post('/badge-summary', geminiController.generateBadgeCollectionSummary);

module.exports = router;
