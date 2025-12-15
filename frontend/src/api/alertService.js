/**
 * Alert Service
 * 
 * API service for managing email alerts
 * Requirements: FR-13
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Send instant email alert to user
 * @returns {Promise<Object>} Response with success status and AQI
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
    throw error.response?.data || error;
  }
}
