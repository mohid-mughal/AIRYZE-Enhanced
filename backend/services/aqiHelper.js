/**
 * AQI Helper Service
 * 
 * Utility functions for AQI calculations and health recommendations
 */

/**
 * Get AQI category and color based on AQI value
 * @param {number} aqi - AQI value (1-5)
 * @returns {Object} Category information
 */
function getAQICategory(aqi) {
  const categories = {
    1: { level: 'Good', color: 'green', description: 'Air quality is satisfactory' },
    2: { level: 'Fair', color: 'lightgreen', description: 'Air quality is acceptable' },
    3: { level: 'Moderate', color: 'yellow', description: 'Air quality is moderate' },
    4: { level: 'Poor', color: 'orange', description: 'Air quality is poor' },
    5: { level: 'Very Poor', color: 'red', description: 'Air quality is very poor' }
  };

  return categories[aqi] || categories[3];
}

/**
 * Get health recommendations based on AQI level
 * @param {number} aqi - AQI value (1-5)
 * @returns {Array<string>} Array of health recommendations
 */
function getHealthRecommendations(aqi) {
  const recommendations = {
    1: [
      'Air quality is good. Enjoy outdoor activities!',
      'No health precautions needed.',
      'Perfect day for exercise outdoors.'
    ],
    2: [
      'Air quality is acceptable.',
      'Sensitive individuals should consider limiting prolonged outdoor exertion.',
      'Generally safe for outdoor activities.'
    ],
    3: [
      'Sensitive groups should reduce prolonged outdoor exertion.',
      'Consider wearing a mask if you have respiratory conditions.',
      'Monitor air quality if planning extended outdoor activities.'
    ],
    4: [
      'Everyone should reduce prolonged outdoor exertion.',
      'Wear a mask when going outside.',
      'Keep windows closed.',
      'Use air purifiers indoors if available.',
      'Sensitive groups should avoid outdoor activities.'
    ],
    5: [
      'Avoid outdoor activities.',
      'Wear N95 masks if you must go outside.',
      'Keep all windows and doors closed.',
      'Use air purifiers.',
      'Seek medical attention if experiencing respiratory symptoms.',
      'Stay indoors as much as possible.'
    ]
  };

  return recommendations[aqi] || recommendations[3];
}

/**
 * Calculate overall AQI from pollutant components
 * This is a simplified calculation - OpenWeather already provides AQI
 * @param {Object} components - Pollutant components
 * @returns {number} AQI value (1-5)
 */
function calculateAQI(components) {
  // OpenWeather API already provides AQI (1-5 scale)
  // This function is for reference or custom calculations
  
  // Simplified thresholds (μg/m³)
  const pm25 = components.pm2_5 || 0;
  const pm10 = components.pm10 || 0;
  
  if (pm25 <= 12 && pm10 <= 54) return 1; // Good
  if (pm25 <= 35.4 && pm10 <= 154) return 2; // Fair
  if (pm25 <= 55.4 && pm10 <= 254) return 3; // Moderate
  if (pm25 <= 150.4 && pm10 <= 354) return 4; // Poor
  return 5; // Very Poor
}

/**
 * Format AQI data for API response
 * @param {Object} aqiData - Raw AQI data
 * @returns {Object} Formatted AQI data
 */
function formatAQIResponse(aqiData) {
  const category = getAQICategory(aqiData.aqi);
  const recommendations = getHealthRecommendations(aqiData.aqi);

  return {
    success: true,
    aqi: aqiData.aqi,
    category: category.level,
    color: category.color,
    description: category.description,
    components: aqiData.components,
    recommendations
  };
}

module.exports = {
  getAQICategory,
  getHealthRecommendations,
  calculateAQI,
  formatAQIResponse
};
