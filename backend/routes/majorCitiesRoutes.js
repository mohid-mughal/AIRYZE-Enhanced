/**
 * Major Cities Routes
 * 
 * Defines routes for major Pakistani cities AQI data
 */

const express = require('express');
const router = express.Router();
const { getMajorCitiesAQI, getSelectedCitiesAQI } = require('../controllers/majorCitiesController');

// GET /api/pak_cities - Get AQI for all major cities
router.get('/', getMajorCitiesAQI);

// POST /api/pak_cities/selected - Get AQI for selected cities
router.post('/selected', getSelectedCitiesAQI);

module.exports = router;
