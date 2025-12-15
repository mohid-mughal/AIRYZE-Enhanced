/**
 * AQI Controller
 * 
 * Handles AQI data requests for specific coordinates
 */

const { fetchAQIFromOpenWeather } = require('../services/openweatherService');
const { formatAQIResponse } = require('../services/aqiHelper');

/**
 * Get AQI data for specific coordinates
 * GET /api/aqi?lat=<latitude>&lon=<longitude>
 */
async function getAQI(req, res) {
  try {
    const { lat, lon } = req.query;

    // Validate parameters
    if (!lat || !lon) {
      return res.status(400).json({ error: 'lat & lon are required' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    // Validate coordinate ranges
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ error: 'Invalid latitude. Must be between -90 and 90' });
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid longitude. Must be between -180 and 180' });
    }

    // Fetch AQI data from OpenWeather
    const aqiData = await fetchAQIFromOpenWeather(latitude, longitude);

    // Format and return response
    const formattedData = formatAQIResponse(aqiData);
    return res.json(formattedData);

  } catch (error) {
    console.error('AQI fetch error:', error.message);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch AQI data' 
    });
  }
}

/**
 * Get AQI data for multiple coordinates (batch request)
 * POST /api/aqi/batch
 * Body: { coordinates: [{lat, lon}, ...] }
 */
async function getAQIBatch(req, res) {
  try {
    const { coordinates } = req.body;

    if (!coordinates || !Array.isArray(coordinates)) {
      return res.status(400).json({ error: 'coordinates array is required' });
    }

    if (coordinates.length === 0) {
      return res.status(400).json({ error: 'coordinates array cannot be empty' });
    }

    if (coordinates.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 coordinates allowed per request' });
    }

    // Fetch AQI for all coordinates
    const results = await Promise.all(
      coordinates.map(async (coord) => {
        try {
          const aqiData = await fetchAQIFromOpenWeather(coord.lat, coord.lon);
          return {
            lat: coord.lat,
            lon: coord.lon,
            ...formatAQIResponse(aqiData)
          };
        } catch (error) {
          return {
            lat: coord.lat,
            lon: coord.lon,
            error: error.message
          };
        }
      })
    );

    return res.json({ results });

  } catch (error) {
    console.error('Batch AQI fetch error:', error.message);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch batch AQI data' 
    });
  }
}

module.exports = {
  getAQI,
  getAQIBatch
};
