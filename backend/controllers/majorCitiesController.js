/**
 * Major Cities Controller
 * 
 * Handles requests for AQI data for major Pakistani cities
 */

const cities = require('../data/cities');
const { fetchAQIFromOpenWeather } = require('../services/openweatherService');
const { formatAQIResponse } = require('../services/aqiHelper');

// Cache for city AQI data (5 minutes)
let citiesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Get AQI data for all major Pakistani cities
 * GET /api/pak_cities
 */
async function getMajorCitiesAQI(req, res) {
  try {
    // Check if cache is valid
    const now = Date.now();
    if (citiesCache && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return res.json(citiesCache);
    }

    // Fetch fresh data for all cities
    const citiesData = await Promise.all(
      cities.map(async (city) => {
        try {
          const aqiData = await fetchAQIFromOpenWeather(city.lat, city.lon);
          const formatted = formatAQIResponse(aqiData);
          
          return {
            name: city.name,
            aqi: formatted.aqi,
            category: formatted.category,
            color: formatted.color,
            components: formatted.components,
            updatedAt: Math.floor(Date.now() / 1000)
          };
        } catch (error) {
          console.error(`Error fetching AQI for ${city.name}:`, error.message);
          return {
            name: city.name,
            error: 'Failed to fetch AQI data',
            updatedAt: Math.floor(Date.now() / 1000)
          };
        }
      })
    );

    // Update cache
    citiesCache = citiesData;
    cacheTimestamp = now;

    return res.json(citiesData);

  } catch (error) {
    console.error('Major cities AQI error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch major cities AQI',
      message: error.message 
    });
  }
}

/**
 * Get AQI data for specific cities
 * POST /api/pak_cities/selected
 * Body: { cities: ['Karachi', 'Lahore', ...] }
 */
async function getSelectedCitiesAQI(req, res) {
  try {
    const { cities: selectedCities } = req.body;

    if (!selectedCities || !Array.isArray(selectedCities)) {
      return res.status(400).json({ error: 'cities array is required' });
    }

    // Filter cities data
    const filteredCities = cities.filter(city => 
      selectedCities.includes(city.name)
    );

    if (filteredCities.length === 0) {
      return res.status(400).json({ error: 'No valid cities found' });
    }

    // Fetch AQI for selected cities
    const citiesData = await Promise.all(
      filteredCities.map(async (city) => {
        try {
          const aqiData = await fetchAQIFromOpenWeather(city.lat, city.lon);
          const formatted = formatAQIResponse(aqiData);
          
          return {
            name: city.name,
            aqi: formatted.aqi,
            category: formatted.category,
            color: formatted.color,
            components: formatted.components,
            updatedAt: Math.floor(Date.now() / 1000)
          };
        } catch (error) {
          console.error(`Error fetching AQI for ${city.name}:`, error.message);
          return {
            name: city.name,
            error: 'Failed to fetch AQI data'
          };
        }
      })
    );

    return res.json(citiesData);

  } catch (error) {
    console.error('Selected cities AQI error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to fetch selected cities AQI',
      message: error.message 
    });
  }
}

module.exports = {
  getMajorCitiesAQI,
  getSelectedCitiesAQI
};
