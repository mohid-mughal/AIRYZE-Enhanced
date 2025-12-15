/**
 * Alerts Routes
 * 
 * Defines routes for instant email alerts
 */

const express = require('express');
const router = express.Router();
const { sendInstantAlert } = require('../controllers/alertsController');

// POST /api/alerts/instant/:userId - Send instant email alert
router.post('/instant/:userId', sendInstantAlert);

module.exports = router;
