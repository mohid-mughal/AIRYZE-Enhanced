/**
 * Alerts Service
 * 
 * API service for instant email alerts
 * Requirements: 6.2
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Send instant email alert to current user
 * Sends an immediate email with current AQI and personalized recommendations
 * @returns {Promise<Object>} Response with success status and AQI data
 * @throws {Error} If user is not authenticated or request fails
 */
export async function sendInstantAlert() {
  try {
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not authenticated');
    }
    const user = JSON.parse(userStr);
    
    const response = await axios.post(
      `${API_BASE_URL}/api/alerts/instant/${user.id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error sending instant alert:', error);
    // Re-throw with more context for better error handling
    if (error.response?.data) {
      throw error.response.data;
    }
    throw error;
  }
}
