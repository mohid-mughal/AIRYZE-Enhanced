/**
 * Chatbot Service
 * 
 * API service for AI chatbot interactions
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Send message to chatbot
 * @param {string} message - User's message
 * @param {string} sessionId - Session ID for conversation history
 * @param {Object} context - Optional context (currentAQI, city, pollutants)
 * @returns {Promise<Object>} Response with AI message
 */
export async function sendChatMessage(message, sessionId, context = {}) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/chatbot/message`,
      {
        message,
        sessionId,
        context
      },
      {
        timeout: 25000 // 25 second timeout for chat responses
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

/**
 * Clear conversation history
 * @param {string} sessionId - Session ID to clear
 * @returns {Promise<Object>} Success response
 */
export async function clearChatHistory(sessionId) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/chatbot/clear`,
      { sessionId }
    );
    return response.data;
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
}
