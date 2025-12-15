/**
 * Chatbot Routes
 * 
 * Defines routes for AI chatbot interactions
 */

const express = require('express');
const router = express.Router();
const { sendMessage, clearConversation } = require('../controllers/chatbotController');

// POST /api/chatbot/message - Send message to chatbot
router.post('/message', sendMessage);

// POST /api/chatbot/clear - Clear conversation history
router.post('/clear', clearConversation);

module.exports = router;
