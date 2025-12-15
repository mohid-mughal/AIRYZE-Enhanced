/**
 * Alerts Controller
 * 
 * Handles instant email alert requests
 */

const supabase = require('../db');
const { handleSupabaseResponse } = require('../utils/supabaseErrors');
const { fetchAQIFromOpenWeather } = require('../services/openweatherService');
const { sendAQIAlert } = require('../services/email');
const cities = require('../data/cities');

/**
 * Send Instant Alert - Send immediate email alert to user
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.params - Request parameters
 * @param {string} req.params.userId - User ID
 * @param {Object} res - Express response object
 * 
 * Requirements: 6.2, 6.3
 */
async function sendInstantAlert(req, res) {
  try {
    const { userId } = req.params;
    console.log(`\n=== INSTANT EMAIL REQUEST ===`);
    console.log(`User ID: ${userId}`);

    // Fetch user data including health_profile and alert_prefs
    const supabaseResponse = await supabase
      .from('users')
      .select('id, name, email, city, health_profile, alert_prefs')
      .eq('id', userId)
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      console.log(`Error fetching user: ${result.error}`);
      return res.status(result.status).json({ error: result.error });
    }

    const user = result.data;
    console.log(`User found: ${user.name} (${user.email})`);
    console.log(`City: ${user.city}`);

    // Check if instant button is enabled
    if (user.alert_prefs && user.alert_prefs.instant_button === false) {
      return res.status(403).json({ error: 'Instant alerts are disabled for this user' });
    }

    // Find city coordinates
    const city = cities.find(c => c.name === user.city);
    if (!city) {
      return res.status(400).json({ error: `City ${user.city} not found` });
    }

    // Fetch current AQI
    const aqiData = await fetchAQIFromOpenWeather(city.lat, city.lon);
    console.log(`AQI fetched: ${aqiData.aqi}`);

    // Send email alert with personalization
    console.log(`Sending email to: ${user.email}`);
    await sendAQIAlert(
      user.email,
      user.name || 'User',
      user.city,
      aqiData.aqi,
      'instant',
      user.health_profile,
      aqiData, // Pass full AQI data for better personalization
      user.id // Pass user ID for tracking
    );

    console.log(`Email sent successfully!`);
    console.log(`=== END INSTANT EMAIL REQUEST ===\n`);

    return res.status(200).json({
      success: true,
      message: 'Instant alert sent successfully',
      aqi: aqiData.aqi
    });

  } catch (err) {
    console.error('Send instant alert error:', err.message);
    
    // Return appropriate status code and error message
    if (err.code === 'EMAIL_NOT_CONFIGURED') {
      return res.status(503).json({ error: err.message });
    } else if (err.code === 'EMAIL_NETWORK_ERROR') {
      return res.status(503).json({ error: err.message });
    } else if (err.code === 'EMAIL_AUTH_ERROR') {
      return res.status(500).json({ error: err.message });
    } else {
      return res.status(500).json({ error: err.message || 'Failed to send email. Please try again.' });
    }
  }
}

module.exports = {
  sendInstantAlert
};
