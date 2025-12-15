/**
 * OpenWeather API Service
 * 
 * Fetches real-time air quality data from OpenWeather Air Pollution API
 */

const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_KEY;
const BASE_URL = 'http://api.openweathermap.org/data/2.5/air_pollution';

/**
 * Fetch AQI data from OpenWeather API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} AQI data with components
 */
async function fetchAQIFromOpenWeather(lat, lon) {
  try {
    if (!OPENWEATHER_API_KEY) {
      throw new Error('OpenWeather API key not configured');
    }

    const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);

    if (!response.data || !response.data.list || response.data.list.length === 0) {
      throw new Error('Invalid response from OpenWeather API');
    }

    const aqiData = response.data.list[0];
    
    return {
      aqi: aqiData.main.aqi,
      components: {
        co: aqiData.components.co,
        no: aqiData.components.no,
        no2: aqiData.components.no2,
        o3: aqiData.components.o3,
        so2: aqiData.components.so2,
        pm2_5: aqiData.components.pm2_5,
        pm10: aqiData.components.pm10,
        nh3: aqiData.components.nh3
      }
    };
  } catch (error) {
    console.error('OpenWeather API error:', error.message);
    throw new Error(`Failed to fetch AQI from OpenWeather: ${error.message}`);
  }
}

module.exports = {
  fetchAQIFromOpenWeather
};
