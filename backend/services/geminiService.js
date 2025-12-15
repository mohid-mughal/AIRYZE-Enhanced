/**
 * Gemini AI Service
 * 
 * Integrates Google's Gemini API for personalized health recommendations
 * and dynamic content generation based on user profiles and AQI data.
 * Falls back to Groq API when Gemini fails (429 rate limit or other errors).
 */

const axios = require('axios');

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Groq API configuration (fallback)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

// In-memory cache for AI responses (1 hour TTL)
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Generate cache key from parameters
 */
function getCacheKey(healthProfile, aqi, context = {}) {
  const key = JSON.stringify({
    age: healthProfile?.age_group,
    conditions: healthProfile?.health_conditions?.sort(),
    activity: healthProfile?.activity_level,
    aqi: Math.floor(aqi), // Round AQI to reduce cache fragmentation
    type: context.type || 'recommendations'
  });
  return key;
}

/**
 * Get cached response if available and not expired
 */
function getCachedResponse(cacheKey) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('Returning cached Gemini response');
    return cached.data;
  }
  if (cached) {
    cache.delete(cacheKey); // Remove expired cache
  }
  return null;
}

/**
 * Store response in cache
 */
function setCachedResponse(cacheKey, data) {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Call Groq API with prompt
 */
async function callGroqAPI(prompt) {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 1024
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000 // 20 second timeout
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content;
    }

    throw new Error('Invalid response format from Groq API');
  } catch (error) {
    console.error('Groq API error:', error.message);
    throw error;
  }
}

/**
 * Call Gemini API with prompt
 */
async function callGeminiAPI(prompt) {
  try {
    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      },
      {
        headers: {
          'x-goog-api-key': GEMINI_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 20000 // 20 second timeout
      }
    );

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      return response.data.candidates[0].content.parts[0].text;
    }

    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    console.error('Gemini API error:', error.message);
    throw error;
  }
}

/**
 * Call AI API with Groq as primary, Gemini as fallback
 * This is the main function used by all AI generation features
 */
async function callAIAPI(prompt) {
  // Try Groq first (primary)
  try {
    console.log('Calling Groq API (primary)...');
    return await callGroqAPI(prompt);
  } catch (groqError) {
    const status = groqError.response?.status;
    console.error('Groq API failed:', groqError.message, status ? `(Status: ${status})` : '');
    
    // Fallback to Gemini
    try {
      console.log('Falling back to Gemini API...');
      return await callGeminiAPI(prompt);
    } catch (geminiError) {
      console.error('Gemini API also failed:', geminiError.message);
      throw geminiError;
    }
  }
}

/**
 * Build prompt for personalized recommendations
 */
function buildRecommendationsPrompt(healthProfile, aqiData, completedQuizzes = [], quizScores = {}) {
  const ageGroup = healthProfile?.age_group || 'unknown';
  const conditions = healthProfile?.health_conditions || [];
  const activity = healthProfile?.activity_level || 'unknown';
  const aqi = aqiData.aqi;
  const pollutants = aqiData.components || {};

  // Map quiz IDs to readable names
  const quizNames = {
    'kids_adventure': 'Kids\' Air Adventure',
    'asthma_smart': 'Asthma-Smart Quiz',
    'senior_safety': 'Senior Citizen Safety Quiz',
    'athlete_quiz': 'Outdoor Athlete Quiz',
    'general_knowledge': 'General Knowledge Quiz'
  };

  let quizContext = '';
  if (completedQuizzes && completedQuizzes.length > 0) {
    const quizList = completedQuizzes.map(id => {
      const score = quizScores[id]?.score || 'N/A';
      return `${quizNames[id] || id} (Score: ${score}%)`;
    }).join(', ');
    
    quizContext = `\nCompleted Quizzes: ${quizList}
Note: The user has demonstrated knowledge in these areas. Prioritize recommendations that build on their quiz learning and reinforce key concepts from the quizzes they completed.`;
  }

  return `Generate personalized air quality health recommendations for a user with the following profile:

Age Group: ${ageGroup}
Health Conditions: ${conditions.join(', ') || 'none'}
Activity Level: ${activity}
Current AQI: ${aqi} (1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor)
Primary Pollutants: PM2.5=${pollutants.pm2_5 || 'N/A'} μg/m³, PM10=${pollutants.pm10 || 'N/A'} μg/m³, NO2=${pollutants.no2 || 'N/A'} μg/m³${quizContext}

Provide 3-5 specific, actionable recommendations tailored to this user's situation. Format as a numbered list. Be concise and practical. Focus on immediate actions they can take today.`;
}

/**
 * Build prompt for email content generation
 */
function buildEmailPrompt(user, aqiData, alertType) {
  const healthProfile = user.health_profile || {};
  const ageGroup = healthProfile.age_group || 'adult';
  const conditions = healthProfile.health_conditions || [];
  const city = user.city || 'your city';
  const aqi = aqiData.aqi;

  return `Generate a personalized air quality email message for a user with the following profile:

Name: ${user.name || 'User'}
City: ${city}
Age Group: ${ageGroup}
Health Conditions: ${conditions.join(', ') || 'none'}
Current AQI: ${aqi} (1=Good, 2=Fair, 3=Moderate, 4=Poor, 5=Very Poor)
Alert Type: ${alertType === 'daily' ? 'Daily Report' : 'AQI Change Alert'}

Write a friendly, personalized message (2-3 paragraphs) that:
1. Greets the user warmly
2. Explains the current air quality situation in simple terms
3. Provides 2-3 health-specific recommendations based on their conditions
4. Ends with an encouraging note

Keep it conversational and supportive. Avoid medical jargon.`;
}

/**
 * Parse recommendations from Gemini response
 */
function parseRecommendations(responseText) {
  // Extract numbered list items or bullet points
  const lines = responseText.split('\n').filter(line => line.trim());
  const recommendations = [];

  for (const line of lines) {
    // Match numbered lists (1., 2., etc.) or bullet points (-, *, •)
    const match = line.match(/^[\d]+\.\s*(.+)$/) || line.match(/^[-*•]\s*(.+)$/);
    if (match) {
      recommendations.push(match[1].trim());
    }
  }

  // If no structured list found, split by sentences
  if (recommendations.length === 0) {
    const sentences = responseText.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }

  return recommendations;
}

/**
 * Generate personalized recommendations using Gemini AI
 * 
 * @param {Object} healthProfile - User's health profile
 * @param {Object} aqiData - Current AQI data with components
 * @param {Array} completedQuizzes - Array of completed quiz IDs (optional)
 * @param {Object} quizScores - Object mapping quiz IDs to scores (optional)
 * @returns {Promise<Array<string>>} Array of recommendation strings
 */
async function generatePersonalizedRecommendations(healthProfile, aqiData, completedQuizzes = [], quizScores = {}) {
  try {
    // Check cache first
    const cacheKey = getCacheKey(healthProfile, aqiData.aqi, { 
      type: 'recommendations',
      quizzes: completedQuizzes.sort().join(',')
    });
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    // Build prompt and call AI API (Groq primary, Gemini fallback)
    const prompt = buildRecommendationsPrompt(healthProfile, aqiData, completedQuizzes, quizScores);
    const responseText = await callAIAPI(prompt);
    const recommendations = parseRecommendations(responseText);

    // Cache the result
    setCachedResponse(cacheKey, recommendations);

    return recommendations;
  } catch (error) {
    console.error('Error generating personalized recommendations:', error.message);
    // Return null to trigger fallback in calling code
    return null;
  }
}

/**
 * Generate personalized email content using Gemini AI
 * 
 * @param {Object} user - User object with health_profile
 * @param {Object} aqiData - Current AQI data
 * @param {string} alertType - 'daily' or 'change'
 * @returns {Promise<string>} Personalized email content
 */
async function generateEmailContent(user, aqiData, alertType) {
  try {
    // Check cache first
    const cacheKey = getCacheKey(user.health_profile, aqiData.aqi, { type: `email_${alertType}` });
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    // Build prompt and call AI API (Groq primary, Gemini fallback)
    const prompt = buildEmailPrompt(user, aqiData, alertType);
    const content = await callAIAPI(prompt);

    // Cache the result
    setCachedResponse(cacheKey, content);

    return content;
  } catch (error) {
    console.error('Error generating email content:', error.message);
    // Return null to trigger fallback in calling code
    return null;
  }
}

/**
 * Clear expired cache entries (call periodically)
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp >= CACHE_TTL) {
      cache.delete(key);
    }
  }
}

/**
 * Generate personalized badge congratulations message
 * 
 * @param {Object} badge - Badge object with name, description, icon
 * @param {Object} userProfile - User's health profile
 * @param {number} progress - User's progress toward the badge
 * @returns {Promise<string>} Personalized congratulations message
 */
async function generateBadgeCongratulations(badge, userProfile, progress) {
  try {
    const cacheKey = JSON.stringify({
      type: 'badge_congrats',
      badgeId: badge.id,
      age: userProfile?.age_group,
      conditions: userProfile?.health_conditions?.sort()
    });
    
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    const ageGroup = userProfile?.age_group || 'user';
    const conditions = userProfile?.health_conditions || [];
    
    const prompt = `Generate a short, enthusiastic congratulations message (2-3 sentences) for a user who just earned the "${badge.name}" badge in an air quality monitoring app.

User context:
- Age group: ${ageGroup}
- Health conditions: ${conditions.join(', ') || 'none'}
- Badge earned: ${badge.name} - ${badge.description}
- Progress: ${progress}/${badge.threshold}

Make it personal, motivating, and relevant to their health profile. Keep it under 50 words. Use an encouraging and celebratory tone.`;

    const message = await callAIAPI(prompt);
    setCachedResponse(cacheKey, message);
    
    return message;
  } catch (error) {
    console.error('Error generating badge congratulations:', error.message);
    return null;
  }
}

/**
 * Generate personalized quiz feedback based on performance
 * 
 * @param {Object} quiz - Quiz object with title and questions
 * @param {number} score - User's score percentage
 * @param {Array} incorrectQuestions - Array of incorrect question objects
 * @param {Object} userProfile - User's health profile
 * @param {number} currentAqi - Current AQI in user's city
 * @returns {Promise<string>} Personalized feedback message
 */
async function generateQuizFeedback(quiz, score, incorrectQuestions, userProfile, currentAqi) {
  try {
    const cacheKey = JSON.stringify({
      type: 'quiz_feedback',
      quizId: quiz.id,
      scoreRange: Math.floor(score / 20) * 20, // Group by 20% ranges
      age: userProfile?.age_group,
      conditions: userProfile?.health_conditions?.sort(),
      aqiLevel: Math.floor(currentAqi)
    });
    
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    const ageGroup = userProfile?.age_group || 'adult';
    const conditions = userProfile?.health_conditions || [];
    const city = userProfile?.primary_city || 'your city';
    const incorrectTopics = incorrectQuestions.map(q => q.question).join('; ');
    
    const prompt = `Generate personalized feedback for a user who completed the "${quiz.title}" quiz.

User profile:
- Age: ${ageGroup}
- Health conditions: ${conditions.join(', ') || 'none'}
- City: ${city}

Quiz results:
- Score: ${score}%
- Questions answered incorrectly: ${incorrectTopics || 'None - perfect score!'}
- Current AQI in their city: ${currentAqi}

Provide:
1. Encouraging feedback on their performance (1-2 sentences)
2. Brief tips related to topics they missed (if any)
3. How this knowledge applies to their current air quality situation

Keep it supportive, practical, and under 100 words.`;

    const feedback = await callAIAPI(prompt);
    setCachedResponse(cacheKey, feedback);
    
    return feedback;
  } catch (error) {
    console.error('Error generating quiz feedback:', error.message);
    return null;
  }
}

/**
 * Generate enhanced explanation for a quiz question
 * 
 * @param {Object} question - Question object with question, options, explanation
 * @param {Object} userProfile - User's health profile
 * @returns {Promise<string>} Enhanced explanation
 */
async function generateQuizExplanation(question, userProfile) {
  try {
    const cacheKey = JSON.stringify({
      type: 'quiz_explanation',
      questionId: question.id,
      age: userProfile?.age_group,
      conditions: userProfile?.health_conditions?.sort()
    });
    
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    const ageGroup = userProfile?.age_group || 'adult';
    const conditions = userProfile?.health_conditions || [];
    
    const prompt = `Enhance this air quality quiz explanation for a user:

Question: ${question.question}
Correct Answer: ${question.options[question.correctIndex]}
Basic Explanation: ${question.explanation}

User profile:
- Age: ${ageGroup}
- Health conditions: ${conditions.join(', ') || 'none'}

Provide an enhanced explanation that:
1. Builds on the basic explanation
2. Makes it relevant to their age group and health conditions
3. Adds a practical tip they can use

Keep it conversational and under 60 words.`;

    const explanation = await callAIAPI(prompt);
    setCachedResponse(cacheKey, explanation);
    
    return explanation;
  } catch (error) {
    console.error('Error generating quiz explanation:', error.message);
    return null;
  }
}

/**
 * Generate motivational message for badge progress
 * 
 * @param {Object} badge - Badge object
 * @param {number} currentProgress - Current progress value
 * @param {Object} userProfile - User's health profile
 * @returns {Promise<string>} Motivational message
 */
async function generateBadgeMotivation(badge, currentProgress, userProfile) {
  try {
    const cacheKey = JSON.stringify({
      type: 'badge_motivation',
      badgeId: badge.id,
      progressPercent: Math.floor((currentProgress / badge.threshold) * 100 / 25) * 25, // Group by 25%
      age: userProfile?.age_group
    });
    
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    const remaining = badge.threshold - currentProgress;
    const percentComplete = Math.round((currentProgress / badge.threshold) * 100);
    
    const prompt = `Generate a short motivational message (1-2 sentences) for a user working toward the "${badge.name}" badge.

Badge: ${badge.name} - ${badge.description}
Progress: ${currentProgress}/${badge.threshold} (${percentComplete}% complete)
Remaining: ${remaining} more to go

Make it encouraging and specific to what they need to do. Keep it under 40 words.`;

    const motivation = await callAIAPI(prompt);
    setCachedResponse(cacheKey, motivation);
    
    return motivation;
  } catch (error) {
    console.error('Error generating badge motivation:', error.message);
    return null;
  }
}

/**
 * Generate quiz recommendation based on user profile
 * 
 * @param {Object} userProfile - User's health profile
 * @param {Array} completedQuizzes - Array of completed quiz IDs
 * @param {number} currentAqi - Current AQI in user's city
 * @returns {Promise<Object>} Recommendation with quizId and reason
 */
async function generateQuizRecommendation(userProfile, completedQuizzes, currentAqi) {
  try {
    const cacheKey = JSON.stringify({
      type: 'quiz_recommendation',
      age: userProfile?.age_group,
      conditions: userProfile?.health_conditions?.sort(),
      completed: completedQuizzes?.sort(),
      aqiLevel: Math.floor(currentAqi)
    });
    
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    const ageGroup = userProfile?.age_group || 'adult';
    const conditions = userProfile?.health_conditions || [];
    const activity = userProfile?.activity_level || 'moderate';
    const completed = completedQuizzes || [];
    
    const availableQuizzes = [
      'kids_adventure',
      'asthma_smart',
      'senior_safety',
      'athlete_quiz',
      'general_knowledge'
    ].filter(id => !completed.includes(id));

    const prompt = `Recommend the most relevant air quality quiz for this user:

User profile:
- Age: ${ageGroup}
- Health conditions: ${conditions.join(', ') || 'none'}
- Activity level: ${activity}
- Current AQI: ${currentAqi}
- Completed quizzes: ${completed.join(', ') || 'none'}

Available quizzes:
- kids_adventure: Fun quiz for children
- asthma_smart: Essential knowledge for asthma management
- senior_safety: Air quality safety for older adults
- athlete_quiz: Optimize training with air quality awareness
- general_knowledge: Test your air quality knowledge

Respond with ONLY the quiz ID (e.g., "asthma_smart") followed by a pipe character and a brief reason (one sentence).
Format: quiz_id|reason`;

    const response = await callAIAPI(prompt);
    const [quizId, reason] = response.split('|').map(s => s.trim());
    
    const recommendation = {
      quizId: availableQuizzes.includes(quizId) ? quizId : availableQuizzes[0] || 'general_knowledge',
      reason: reason || 'This quiz matches your profile and interests.'
    };
    
    setCachedResponse(cacheKey, recommendation);
    return recommendation;
  } catch (error) {
    console.error('Error generating quiz recommendation:', error.message);
    return null;
  }
}

/**
 * Generate badge collection summary
 * 
 * @param {Array} earnedBadges - Array of earned badge objects
 * @param {number} totalBadges - Total number of available badges
 * @param {Object} userProfile - User's health profile
 * @returns {Promise<string>} Collection summary message
 */
async function generateBadgeCollectionSummary(earnedBadges, totalBadges, userProfile) {
  try {
    const cacheKey = JSON.stringify({
      type: 'badge_summary',
      earnedCount: earnedBadges.length,
      totalCount: totalBadges,
      age: userProfile?.age_group
    });
    
    const cached = getCachedResponse(cacheKey);
    if (cached) {
      return cached;
    }

    const earnedCount = earnedBadges.length;
    const percentage = Math.round((earnedCount / totalBadges) * 100);
    const recentBadge = earnedBadges.length > 0 ? earnedBadges[earnedBadges.length - 1] : null;
    const badgeNames = earnedBadges.map(b => b.name).join(', ');
    
    const prompt = `Generate a motivational summary (2-3 sentences) for a user's badge collection in an air quality app.

Collection stats:
- Earned: ${earnedCount} out of ${totalBadges} badges (${percentage}%)
- Badges earned: ${badgeNames || 'none yet'}
- Most recent: ${recentBadge ? recentBadge.name : 'none'}

Make it encouraging and celebrate their progress. If they have few badges, motivate them to earn more. Keep it under 60 words.`;

    const summary = await callAIAPI(prompt);
    setCachedResponse(cacheKey, summary);
    
    return summary;
  } catch (error) {
    console.error('Error generating badge collection summary:', error.message);
    return null;
  }
}

// Clear expired cache every hour
setInterval(clearExpiredCache, CACHE_TTL);

module.exports = {
  generatePersonalizedRecommendations,
  generateEmailContent,
  generateBadgeCongratulations,
  generateQuizFeedback,
  generateQuizExplanation,
  generateBadgeMotivation,
  generateQuizRecommendation,
  generateBadgeCollectionSummary,
  clearExpiredCache
};
