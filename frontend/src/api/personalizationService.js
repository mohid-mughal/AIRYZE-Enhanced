import axios from 'axios';

const API_URL = 'http://localhost:5000/api/personalization';

/**
 * Get personalized recommendations based on health profile, AQI, and quiz history
 */
export async function getPersonalizedRecommendations(healthProfile, aqiData, completedQuizzes = [], quizScores = {}) {
  try {
    const response = await axios.post(`${API_URL}/recommendations`, {
      healthProfile,
      aqiData,
      completedQuizzes,
      quizScores
    }, {
      timeout: 20000 // 20 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    throw error;
  }
}

/**
 * Generate personalized welcome message
 */
export async function generateWelcomeMessage(healthProfile, currentAQI) {
  try {
    const response = await axios.post(`${API_URL}/welcome`, {
      healthProfile,
      currentAQI
    }, {
      timeout: 20000 // 20 second timeout
    });
    return response.data;
  } catch (error) {
    console.error('Error generating welcome message:', error);
    throw error;
  }
}
