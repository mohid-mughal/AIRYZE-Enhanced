/**
 * Profile Service
 * 
 * API service for managing user health profiles and alert preferences
 * Requirements: 2.3, 5.4
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

/**
 * Update user's health profile
 * @param {Object} profileData - Health profile data
 * @param {string} profileData.age_group - Age group (under_12, 13_18, 19_40, 41_60, 60_plus)
 * @param {Array<string>} profileData.health_conditions - Health conditions array
 * @param {string} profileData.activity_level - Activity level
 * @param {string} profileData.primary_city - Primary city
 * @returns {Promise<Object>} Response with updated health profile
 */
export async function updateHealthProfile(profileData) {
  try {
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not authenticated');
    }
    const user = JSON.parse(userStr);
    
    const response = await axios.patch(
      `${API_BASE_URL}/auth/profile/${user.id}`,
      profileData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating health profile:', error);
    throw error.response?.data || error;
  }
}

/**
 * Get user's health profile
 * @returns {Promise<Object>} Response with health profile data
 */
export async function getHealthProfile() {
  try {
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not authenticated');
    }
    const user = JSON.parse(userStr);
    
    const response = await axios.get(
      `${API_BASE_URL}/auth/profile/${user.id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching health profile:', error);
    throw error.response?.data || error;
  }
}

/**
 * Update user's alert preferences
 * @param {Object} prefs - Alert preferences
 * @param {boolean} prefs.on_change - Enable change detection alerts
 * @param {string} prefs.daily_time - Daily alert time (HH:MM format)
 * @param {boolean} prefs.instant_button - Enable instant email button
 * @returns {Promise<Object>} Response with updated alert preferences
 */
export async function updateAlertPreferences(prefs) {
  try {
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not authenticated');
    }
    const user = JSON.parse(userStr);
    
    const response = await axios.patch(
      `${API_BASE_URL}/auth/alert-prefs/${user.id}`,
      prefs
    );
    return response.data;
  } catch (error) {
    console.error('Error updating alert preferences:', error);
    throw error.response?.data || error;
  }
}

/**
 * Get user's alert preferences
 * @returns {Promise<Object>} Response with alert preferences data
 */
export async function getAlertPreferences() {
  try {
    // Get current user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw new Error('User not authenticated');
    }
    const user = JSON.parse(userStr);
    
    const response = await axios.get(
      `${API_BASE_URL}/auth/alert-prefs/${user.id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching alert preferences:', error);
    throw error.response?.data || error;
  }
}
