/**
 * Chatbot Controller
 * 
 * Handles AI chatbot requests for air quality questions
 */

const { generateChatResponse, clearHistory } = require('../services/chatbotService');

/**
 * Send message to chatbot
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - User's message
 * @param {string} req.body.sessionId - Session ID for conversation history
 * @param {Object} req.body.context - Optional context (currentAQI, city, pollutants)
 * @param {Object} res - Express response object
 */
async function sendMessage(req, res) {
  try {
    const { message, sessionId, context } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    console.log(`\n=== CHATBOT REQUEST ===`);
    console.log(`Session: ${sessionId}`);
    console.log(`Message: ${message}`);
    if (context?.currentAQI) {
      console.log(`Context: AQI ${context.currentAQI} in ${context.city || 'Unknown'}`);
    }

    // Generate response
    const response = await generateChatResponse(message, sessionId, context);

    console.log(`Response generated (${response.length} chars)`);
    console.log(`=== END CHATBOT REQUEST ===\n`);

    return res.status(200).json({
      success: true,
      response: response,
      sessionId: sessionId
    });

  } catch (err) {
    console.error('Chatbot error:', err.message);
    
    // Return user-friendly error
    if (err.message.includes('API key')) {
      return res.status(503).json({ 
        error: 'AI service is not configured. Please contact support.' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate response. Please try again.' 
    });
  }
}

/**
 * Clear conversation history
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.sessionId - Session ID to clear
 * @param {Object} res - Express response object
 */
async function clearConversation(req, res) {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    clearHistory(sessionId);

    return res.status(200).json({
      success: true,
      message: 'Conversation history cleared'
    });

  } catch (err) {
    console.error('Clear conversation error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  sendMessage,
  clearConversation
};
