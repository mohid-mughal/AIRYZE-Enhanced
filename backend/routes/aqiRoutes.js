/**
 * AQI Routes
 * 
 * Defines routes for AQI data requests
 */

const express = require('express');
const router = express.Router();
const { getAQI, getAQIBatch } = require('../controllers/aqiController');

// GET /api/aqi?lat=<lat>&lon=<lon> - Get AQI for coordinates
router.get('/', getAQI);

// POST /api/aqi/batch - Get AQI for multiple coordinates
router.post('/batch', getAQIBatch);

module.exports = router;
