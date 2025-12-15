/**
 * History Routes
 * 
 * Defines routes for historical AQI data
 */

const express = require('express');
const router = express.Router();
const { getHistoryForCity, insertAQIData } = require('../controllers/historyController');
const { fetchHistoricalData } = require('../services/fetchAQI');

/**
 * GET /api/history/city?city=<cityName>
 * Get historical AQI data for a specific city
 */
router.get('/city', async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

    const history = await getHistoryForCity(city);
    return res.json(history);

  } catch (error) {
    console.error('History fetch error:', error.message);
    return res.status(error.status || 500).json({ 
      error: error.message || 'Failed to fetch history' 
    });
  }
});

/**
 * GET /api/history?lat=<lat>&lon=<lon>
 * Get historical AQI data for specific coordinates from Open-Meteo API
 */
router.get('/', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const axios = require('axios');
    
    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const formatDate = (date) => date.toISOString().split('T')[0];
    
    // Fetch from Open-Meteo Air Quality API
    const response = await axios.get('https://air-quality-api.open-meteo.com/v1/air-quality', {
      params: {
        latitude: lat,
        longitude: lon,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        hourly: 'pm10,pm2_5,us_aqi'
      }
    });

    if (!response.data || !response.data.hourly) {
      return res.json([]);
    }

    // Process data - group by day and calculate daily average
    const hourlyData = response.data.hourly;
    const dailyData = {};

    hourlyData.time.forEach((time, index) => {
      const date = time.split('T')[0];
      const aqi = hourlyData.us_aqi?.[index];
      
      if (aqi !== null && aqi !== undefined) {
        if (!dailyData[date]) {
          dailyData[date] = { sum: 0, count: 0 };
        }
        dailyData[date].sum += aqi;
        dailyData[date].count += 1;
      }
    });

    // Convert to array format
    const result = Object.keys(dailyData).map(date => ({
      date: date,
      aqi: Math.round(dailyData[date].sum / dailyData[date].count)
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return res.json(result);

  } catch (error) {
    console.error('History fetch error:', error.message);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch history' 
    });
  }
});

/**
 * POST /api/history/fetch
 * Fetch and store 30 days of historical AQI data for all major cities
 */
router.post('/fetch', async (req, res) => {
  try {
    await fetchHistoricalData();
    return res.json({ message: 'Historical AQI stored successfully' });

  } catch (error) {
    console.error('Historical data fetch error:', error.message);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch historical data' 
    });
  }
});

module.exports = router;
