/**
 * Alert Service
 * Handles user alert operations for AQI monitoring
 */

const supabase = require('../db');
const { handleSupabaseResponse } = require('../utils/supabaseErrors');

/**
 * Get all users with their alert-related data
 * @returns {Promise<Array>} Array of user objects with id, name, email, city, last_aqi, health_profile, alert_prefs
 */
async function getAllUsers() {
  try {
    const supabaseResponse = await supabase
      .from('users')
      .select('id, name, email, city, last_aqi, health_profile, alert_prefs');

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      const error = new Error(result.error);
      error.status = result.status;
      throw error;
    }

    return result.data;
  } catch (err) {
    console.error('Unexpected error in getAllUsers:', err);
    throw err;
  }
}

/**
 * Update the last AQI value for a user
 * @param {number} userId - User ID
 * @param {number} lastAqi - New AQI value to store
 * @returns {Promise<Object>} Updated user data
 */
async function updateLastAQI(userId, lastAqi) {
  try {
    const supabaseResponse = await supabase
      .from('users')
      .update({ last_aqi: lastAqi })
      .eq('id', userId)
      .select();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      const error = new Error(result.error);
      error.status = result.status;
      throw error;
    }

    return result.data;
  } catch (err) {
    console.error('Unexpected error in updateLastAQI:', err);
    throw err;
  }
}

/**
 * Get personalized recommendations for a user based on their health profile and current AQI
 * @param {Object} healthProfile - User's health profile
 * @param {Object} aqiData - Current AQI data with components
 * @returns {Promise<Array<string>>} Array of personalized recommendations
 */
async function getPersonalizedRecommendations(healthProfile, aqiData) {
  try {
    // Try to get Gemini AI recommendations first
    const { generatePersonalizedRecommendations } = require('./geminiService');
    const { getRuleBasedRecommendations } = require('./personalizationHelper');
    
    if (!healthProfile) {
      // Return generic recommendations if no health profile
      const { getHealthRecommendations } = require('./aqiHelper');
      return getHealthRecommendations(aqiData.aqi);
    }

    // Try Gemini AI first
    try {
      const geminiRecs = await generatePersonalizedRecommendations(healthProfile, aqiData);
      if (geminiRecs && geminiRecs.length > 0) {
        console.log('Using Gemini AI recommendations');
        return geminiRecs;
      }
    } catch (geminiError) {
      console.log('Gemini AI failed, falling back to rule-based:', geminiError.message);
    }

    // Fallback to rule-based recommendations
    console.log('Using rule-based recommendations');
    return getRuleBasedRecommendations(healthProfile, aqiData.aqi);

  } catch (error) {
    console.error('Error in getPersonalizedRecommendations:', error);
    // Final fallback to basic recommendations
    const { getHealthRecommendations } = require('./aqiHelper');
    return getHealthRecommendations(aqiData.aqi);
  }
}

module.exports = {
  getAllUsers,
  updateLastAQI,
  getPersonalizedRecommendations
};
