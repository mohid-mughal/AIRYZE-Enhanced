/**
 * Airyze AQI Monitor - Backend Server
 * 
 * Express server for air quality monitoring application
 * Provides REST API endpoints for AQI data, user authentication, and alerts
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const aqiRoutes = require('./routes/aqiRoutes');
const historyRoutes = require('./routes/historyRoutes');
const majorCitiesRoutes = require('./routes/majorCitiesRoutes');
const userReportsRoutes = require('./routes/userReportsRoutes');
const pollsRoutes = require('./routes/pollsRoutes');
const alertsRoutes = require('./routes/alertsRoutes');
const personalizationRoutes = require('./routes/personalizationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const geminiRoutes = require('./routes/geminiRoutes');

// Mount routes
app.use('/auth', authRoutes);
app.use('/api/aqi', aqiRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/pak_cities', majorCitiesRoutes);
app.use('/api/user-reports', userReportsRoutes);
app.use('/api/polls', pollsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/personalization', personalizationRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/gemini', geminiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Start cron jobs for alerts
require('./jobs/aqiAlerts');

module.exports = app;
