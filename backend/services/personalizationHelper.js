/**
 * Personalization Helper
 * 
 * Provides rule-based recommendations as fallback when Gemini AI is unavailable.
 * Contains health-specific advice rules for different conditions and AQI levels.
 */

const { getAQICategory } = require('./aqiHelper');

/**
 * Health-specific advice rules by condition and AQI level
 */
const healthAdviceRules = {
  asthma: {
    2: ['Carry your rescue inhaler', 'Consider wearing a mask if exercising outdoors'],
    3: ['Wear an N95 mask outdoors', 'Avoid outdoor exercise', 'Keep rescue inhaler handy at all times'],
    4: ['Stay indoors as much as possible', 'Use air purifier', 'Monitor symptoms closely', 'Have rescue inhaler ready'],
    5: ['Avoid all outdoor activities', 'Keep windows closed', 'Use air purifier continuously', 'Seek medical attention if symptoms worsen']
  },
  heart_issues: {
    2: ['Limit strenuous activities', 'Monitor how you feel during activities'],
    3: ['Reduce outdoor time', 'Avoid heavy exercise', 'Stay hydrated', 'Take frequent breaks'],
    4: ['Stay indoors', 'Monitor symptoms', 'Avoid all strenuous activities', 'Consult doctor if experiencing chest discomfort'],
    5: ['Avoid all outdoor activities', 'Rest and stay calm', 'Monitor symptoms closely', 'Seek immediate medical attention if symptoms occur']
  },
  young_children: {
    2: ['Limit outdoor playtime', 'Keep windows closed during peak pollution hours'],
    3: ['Keep children indoors', 'Close all windows', 'Limit outdoor playtime to essential only'],
    4: ['Keep children indoors all day', 'Use air purifier in children\'s rooms', 'Monitor for any breathing difficulties'],
    5: ['Do not let children go outside', 'Keep all windows closed', 'Use air purifier', 'Seek medical attention if breathing difficulties occur']
  },
  pregnant: {
    2: ['Limit outdoor activities', 'Stay hydrated', 'Avoid peak traffic hours'],
    3: ['Reduce outdoor exposure', 'Wear a mask if going outside', 'Rest frequently'],
    4: ['Stay indoors', 'Use air purifier', 'Monitor how you feel', 'Consult doctor if concerned'],
    5: ['Avoid all outdoor activities', 'Keep windows closed', 'Rest and stay hydrated', 'Seek medical advice if experiencing any discomfort']
  },
  allergies: {
    2: ['Take allergy medication as prescribed', 'Keep windows closed', 'Shower after being outdoors'],
    3: ['Wear a mask outdoors', 'Use air purifier indoors', 'Avoid outdoor activities during peak hours'],
    4: ['Stay indoors', 'Monitor allergy symptoms', 'Use air purifier', 'Keep all windows closed'],
    5: ['Avoid all outdoor activities', 'Use air purifier continuously', 'Consult doctor if symptoms worsen']
  }
};

/**
 * Age-specific advice for elderly (60+)
 */
const elderlyAdvice = {
  2: ['Limit outdoor activities', 'Monitor how you feel', 'Stay hydrated'],
  3: ['Reduce outdoor time', 'Avoid strenuous activities', 'Take frequent breaks'],
  4: ['Stay indoors', 'Monitor symptoms closely', 'Have medications ready', 'Avoid all strenuous activities'],
  5: ['Avoid all outdoor activities', 'Rest and stay calm', 'Monitor health closely', 'Seek medical attention if needed']
};

/**
 * Activity-level specific advice
 */
const activityAdvice = {
  heavy_sports: {
    2: ['Consider indoor training today', 'Reduce intensity of outdoor workouts'],
    3: ['Move workout indoors', 'Avoid outdoor cardio', 'Reduce training intensity'],
    4: ['Train indoors only', 'Avoid all outdoor exercise', 'Consider rest day'],
    5: ['Rest day recommended', 'No outdoor activities', 'Light indoor stretching only']
  },
  running_cycling: {
    2: ['Consider shorter outdoor sessions', 'Avoid peak traffic hours'],
    3: ['Move to indoor alternatives', 'Use gym or indoor track', 'Reduce intensity'],
    4: ['Indoor exercise only', 'Use treadmill or stationary bike', 'Reduce workout duration'],
    5: ['No outdoor exercise', 'Light indoor activity only', 'Consider rest day']
  },
  light_exercise: {
    2: ['Limit outdoor walking', 'Choose less polluted routes'],
    3: ['Walk indoors (mall, gym)', 'Reduce outdoor time', 'Wear a mask if going out'],
    4: ['Stay indoors', 'Do indoor stretching or yoga', 'Avoid outdoor walks'],
    5: ['Stay indoors', 'Light indoor movement only', 'Rest and relax']
  }
};

/**
 * General recommendations by AQI level
 */
const generalRecommendations = {
  1: [
    'Air quality is good! Enjoy outdoor activities',
    'Great day for exercise and outdoor sports',
    'Keep windows open for fresh air'
  ],
  2: [
    'Air quality is acceptable for most people',
    'Sensitive individuals should limit prolonged outdoor activities',
    'Consider wearing a mask during heavy exercise'
  ],
  3: [
    'Reduce prolonged outdoor activities',
    'Wear a mask when going outside',
    'Keep windows closed',
    'Use air purifier if available'
  ],
  4: [
    'Avoid prolonged outdoor activities',
    'Wear N95 mask if you must go outside',
    'Keep all windows closed',
    'Use air purifier indoors',
    'Limit physical exertion'
  ],
  5: [
    'Stay indoors as much as possible',
    'Avoid all outdoor activities',
    'Keep all windows and doors closed',
    'Use air purifier continuously',
    'Seek medical attention if experiencing symptoms'
  ]
};

/**
 * Get rule-based recommendations for a user
 * 
 * @param {Object} healthProfile - User's health profile
 * @param {number} aqi - Current AQI level (1-5)
 * @returns {Array<string>} Array of recommendation strings
 */
function getRuleBasedRecommendations(healthProfile, aqi) {
  const recommendations = [];
  
  // Add general recommendations
  const general = generalRecommendations[aqi] || generalRecommendations[3];
  recommendations.push(...general);

  if (!healthProfile) {
    return recommendations;
  }

  // Add age-specific advice for elderly
  if (healthProfile.age_group === '60_plus' && aqi >= 2) {
    const advice = elderlyAdvice[aqi] || elderlyAdvice[3];
    recommendations.push(...advice);
  }

  // Add health condition-specific advice
  const conditions = healthProfile.health_conditions || [];
  for (const condition of conditions) {
    if (condition === 'none') continue;
    
    const conditionAdvice = healthAdviceRules[condition];
    if (conditionAdvice && aqi >= 2) {
      const advice = conditionAdvice[aqi] || conditionAdvice[3];
      recommendations.push(...advice);
    }
  }

  // Add activity-level specific advice
  const activity = healthProfile.activity_level;
  if (activity && activity !== 'mostly_indoors' && aqi >= 2) {
    const activitySpecific = activityAdvice[activity];
    if (activitySpecific) {
      const advice = activitySpecific[aqi] || activitySpecific[3];
      recommendations.push(...advice);
    }
  }

  // Remove duplicates and limit to 8 recommendations
  return [...new Set(recommendations)].slice(0, 8);
}

/**
 * Generate personalized email content using rules
 * 
 * @param {Object} user - User object with health_profile
 * @param {number} aqi - Current AQI level
 * @param {string} alertType - 'daily' or 'change'
 * @returns {string} Personalized email content
 */
function generateRuleBasedEmailContent(user, aqi, alertType) {
  const name = user.name || 'User';
  const city = user.city || 'your city';
  const category = getAQICategory(aqi);
  const healthProfile = user.health_profile || {};
  
  let greeting = `Hello ${name},\n\n`;
  
  if (alertType === 'daily') {
    greeting += `Here's your daily air quality report for ${city}.\n\n`;
  } else {
    greeting += `The air quality in ${city} has changed. Here's an update.\n\n`;
  }

  let statusMessage = `Current AQI: ${aqi} (${category.level})\n`;
  statusMessage += `Status: ${category.description}\n\n`;

  // Add personalized context based on health profile
  let personalNote = '';
  const conditions = healthProfile.health_conditions || [];
  
  if (conditions.includes('asthma') && aqi >= 3) {
    personalNote += 'Given your asthma, please take extra precautions today. ';
  }
  if (conditions.includes('heart_issues') && aqi >= 3) {
    personalNote += 'With your heart condition, it\'s important to avoid strenuous activities. ';
  }
  if (conditions.includes('young_children') && aqi >= 3) {
    personalNote += 'Keep children indoors today to protect their developing lungs. ';
  }
  if (conditions.includes('pregnant') && aqi >= 3) {
    personalNote += 'As an expectant mother, please minimize outdoor exposure. ';
  }
  if (healthProfile.age_group === '60_plus' && aqi >= 3) {
    personalNote += 'Please take it easy and avoid outdoor activities. ';
  }

  if (personalNote) {
    personalNote += '\n\n';
  }

  const recommendations = getRuleBasedRecommendations(healthProfile, aqi);
  let recList = 'Recommendations:\n';
  recommendations.slice(0, 5).forEach((rec, index) => {
    recList += `${index + 1}. ${rec}\n`;
  });

  const closing = '\n\nStay safe and monitor air quality regularly!\n\nBest regards,\nAiryze AQI Monitor';

  return greeting + statusMessage + personalNote + recList + closing;
}

module.exports = {
  getRuleBasedRecommendations,
  generateRuleBasedEmailContent,
  healthAdviceRules,
  elderlyAdvice,
  activityAdvice
};
