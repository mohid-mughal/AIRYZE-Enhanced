const { generatePersonalizedRecommendations } = require('../services/geminiService');
const { getRuleBasedRecommendations } = require('../services/personalizationHelper');

/**
 * Generate personalized recommendations
 * POST /api/personalization/recommendations
 */
async function getPersonalizedRecommendations(req, res) {
  try {
    const { healthProfile, aqiData, completedQuizzes = [], quizScores = {} } = req.body;

    if (!aqiData || !aqiData.aqi) {
      return res.status(400).json({ error: 'AQI data is required' });
    }

    let recommendations = null;
    let quizInsights = [];
    let source = 'rules';

    // Try Gemini AI first for general recommendations
    try {
      recommendations = await generatePersonalizedRecommendations(healthProfile, aqiData, completedQuizzes, quizScores);
      if (recommendations && Array.isArray(recommendations) && recommendations.length > 0) {
        source = 'ai';
      } else {
        recommendations = null;
      }
    } catch (error) {
      console.error('Gemini API failed, using fallback:', error.message);
      recommendations = null;
    }

    // Fallback to rule-based recommendations
    if (!recommendations || !Array.isArray(recommendations) || recommendations.length === 0) {
      recommendations = getRuleBasedRecommendations(healthProfile, aqiData.aqi);
      source = 'rules';
    }

    // Ensure recommendations is an array
    if (!Array.isArray(recommendations)) {
      recommendations = [];
    }

    // Generate quiz-based insights if user has completed quizzes
    if (completedQuizzes && completedQuizzes.length > 0) {
      quizInsights = await generateQuizBasedInsights(
        completedQuizzes,
        quizScores,
        healthProfile,
        aqiData.aqi
      );
    }

    // Separate into general and health-specific
    const general = recommendations.slice(0, 3);
    const healthSpecific = recommendations.slice(3);

    return res.status(200).json({
      general,
      health_specific: healthSpecific,
      quiz_insights: quizInsights,
      aqi_level: aqiData.aqi,
      source
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
}

/**
 * Generate quiz-based insights for recommendations
 */
async function generateQuizBasedInsights(completedQuizzes, quizScores, healthProfile, currentAqi) {
  const insights = [];

  try {
    // Map quiz IDs to topics
    const quizTopics = {
      'kids_adventure': 'children',
      'asthma_smart': 'asthma',
      'senior_safety': 'seniors',
      'athlete_quiz': 'athletes',
      'general_knowledge': 'general'
    };

    // Prioritize topics based on completed quizzes
    const topics = completedQuizzes.map(quizId => quizTopics[quizId]).filter(Boolean);

    // Generate insights based on quiz topics and current AQI
    if (topics.includes('asthma')) {
      if (currentAqi >= 3) {
        insights.push('Based on your Asthma-Smart Quiz: Keep your rescue inhaler handy and consider staying indoors today.');
      } else {
        insights.push('Based on your Asthma-Smart Quiz: Good air quality today! A great time for light outdoor activities.');
      }
    }

    if (topics.includes('seniors')) {
      if (currentAqi >= 3) {
        insights.push('Based on your Senior Safety Quiz: Consider postponing your morning walk until air quality improves.');
      } else {
        insights.push('Based on your Senior Safety Quiz: Perfect conditions for your morning walk! Early hours are best.');
      }
    }

    if (topics.includes('athletes')) {
      if (currentAqi >= 4) {
        insights.push('Based on your Athlete Quiz: Move your training indoors today. Try yoga or strength training.');
      } else if (currentAqi === 3) {
        insights.push('Based on your Athlete Quiz: Reduce training intensity and breathe through your nose to filter particles.');
      } else {
        insights.push('Based on your Athlete Quiz: Great conditions for outdoor training! Stay hydrated and monitor how you feel.');
      }
    }

    if (topics.includes('children')) {
      if (currentAqi >= 4) {
        insights.push('Based on your Kids\' Quiz: Keep children indoors today. Use air purifiers if available.');
      } else if (currentAqi === 3) {
        insights.push('Based on your Kids\' Quiz: Limit outdoor playtime and watch for any breathing difficulties.');
      }
    }

    // Add general insights based on quiz performance
    const avgScore = Object.values(quizScores).reduce((sum, score) => sum + (score.score || 0), 0) / Object.keys(quizScores).length;
    
    if (avgScore >= 80 && completedQuizzes.length >= 3) {
      insights.push('Your quiz knowledge is excellent! You\'re well-equipped to make informed decisions about air quality.');
    }

    // Limit to 3 insights
    return insights.slice(0, 3);
  } catch (error) {
    console.error('Error generating quiz insights:', error);
    return [];
  }
}

/**
 * Generate personalized welcome message
 * POST /api/personalization/welcome
 */
async function generateWelcomeMessage(req, res) {
  try {
    const { healthProfile, currentAQI } = req.body;

    if (!currentAQI || !currentAQI.aqi) {
      return res.status(400).json({ error: 'Current AQI data is required' });
    }

    // Build a simple prompt for welcome message
    const aqiLevel = currentAQI.aqi;
    const conditions = healthProfile?.health_conditions || [];
    const ageGroup = healthProfile?.age_group || 'adult';
    const hasHealthConditions = conditions.length > 0 && !conditions.includes('none');

    // Generate personalized message using Gemini
    try {
      const recommendations = await generatePersonalizedRecommendations(
        healthProfile,
        currentAQI,
        { type: 'welcome' }
      );

      if (recommendations && recommendations.length > 0) {
        // Use first recommendation as welcome message
        const message = recommendations[0];
        return res.json({ message });
      }
    } catch (error) {
      console.error('Gemini API failed, using fallback:', error.message);
    }

    // Fallback message if Gemini fails
    let fallbackMessage = '';
    
    if (aqiLevel === 1) {
      fallbackMessage = hasHealthConditions
        ? 'Great news! The air quality is excellent today. Perfect conditions for outdoor activities!'
        : 'Great news! The air quality is excellent today. Enjoy your outdoor activities!';
    } else if (aqiLevel === 2) {
      fallbackMessage = hasHealthConditions
        ? 'Air quality is fair today. Most activities are fine, but stay aware of how you feel.'
        : 'Air quality is fair today. Good conditions for most outdoor activities.';
    } else if (aqiLevel === 3) {
      fallbackMessage = hasHealthConditions
        ? 'Air quality is moderate today. Consider limiting prolonged outdoor activities.'
        : 'Air quality is moderate today. Most people can enjoy outdoor activities, but sensitive groups should be cautious.';
    } else if (aqiLevel === 4) {
      fallbackMessage = hasHealthConditions
        ? 'Air quality is poor today. Stay indoors and avoid strenuous activities.'
        : 'Air quality is poor today. Consider limiting outdoor activities and wearing a mask if needed.';
    } else {
      fallbackMessage = hasHealthConditions
        ? 'Air quality is very poor today. Stay indoors, use air purifiers, and monitor your symptoms closely.'
        : 'Air quality is very poor today. Avoid all outdoor activities and stay indoors with windows closed.';
    }

    res.json({ message: fallbackMessage });
  } catch (error) {
    console.error('Error generating welcome message:', error);
    res.status(500).json({ error: 'Failed to generate welcome message' });
  }
}

module.exports = {
  generateWelcomeMessage,
  getPersonalizedRecommendations
};
