/**
 * Fetch AQI Service
 * 
 * Handles fetching and storing historical AQI data from Open-Meteo API
 */

const axios = require('axios');
const cities = require('../data/cities');
const { insertAQIData } = require('../controllers/historyController');

const OPEN_METEO_BASE_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

/**
 * Fetch historical AQI data from Open-Meteo API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} days - Number of days of historical data (default: 30)
 * @returns {Promise<Array>} Array of historical AQI data
 */
async function fetchHistoricalAQIFromOpenMeteo(lat, lon, days = 30) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    const url = `${OPEN_METEO_BASE_URL}?latitude=${lat}&longitude=${lon}&start_date=${startDateStr}&end_date=${endDateStr}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,dust,european_aqi`;

    const response = await axios.get(url);

    if (!response.data || !response.data.hourly) {
      throw new Error('Invalid response from Open-Meteo API');
    }

    const hourly = response.data.hourly;
    const dataPoints = [];

    // Process hourly data (take one reading per day at noon)
    for (let i = 0; i < hourly.time.length; i += 24) {
      const noonIndex = i + 12; // Get noon reading
      if (noonIndex < hourly.time.length) {
        dataPoints.push({
          timestamp: new Date(hourly.time[noonIndex]),
          pm2_5: hourly.pm2_5[noonIndex] || 0,
          pm10: hourly.pm10[noonIndex] || 0,
          co: hourly.carbon_monoxide[noonIndex] || 0,
          no2: hourly.nitrogen_dioxide[noonIndex] || 0,
          so2: hourly.sulphur_dioxide[noonIndex] || 0,
          o3: hourly.ozone[noonIndex] || 0,
          aqi: hourly.european_aqi ? Math.min(5, Math.ceil(hourly.european_aqi[noonIndex] / 20)) : 3
        });
      }
    }

    return dataPoints;

  } catch (error) {
    console.error('Open-Meteo API error:', error.message);
    throw new Error(`Failed to fetch historical AQI: ${error.message}`);
  }
}

/**
 * Fetch and store historical AQI data for all major cities
 * @returns {Promise<void>}
 */
async function fetchHistoricalData() {
  try {
    console.log('Starting historical AQI data fetch for all cities...');

    for (const city of cities) {
      try {
        console.log(`Fetching historical data for ${city.name}...`);
        
        const historicalData = await fetchHistoricalAQIFromOpenMeteo(city.lat, city.lon, 30);

        // Store each data point
        for (const dataPoint of historicalData) {
          await insertAQIData({
            location_name: city.name,
            lat: city.lat,
            lon: city.lon,
            aqi: dataPoint.aqi,
            co: dataPoint.co,
            no: 0, // Open-Meteo doesn't provide NO
            no2: dataPoint.no2,
            o3: dataPoint.o3,
            so2: dataPoint.so2,
            pm2_5: dataPoint.pm2_5,
            pm10: dataPoint.pm10,
            nh3: 0, // Open-Meteo doesn't provide NH3
            timestamp: dataPoint.timestamp
          });
        }

        console.log(`Stored ${historicalData.length} records for ${city.name}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error fetching data for ${city.name}:`, error.message);
        // Continue with next city
      }
    }

    console.log('Historical AQI data fetch completed');

  } catch (error) {
    console.error('Historical data fetch error:', error.message);
    throw error;
  }
}

module.exports = {
  fetchHistoricalAQIFromOpenMeteo,
  fetchHistoricalData
};
