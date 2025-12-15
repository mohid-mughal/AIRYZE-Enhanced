/**
 * AQI Alert Cron Jobs
 * 
 * Scheduled tasks for sending AQI alerts to users
 */

const cron = require('node-cron');
const { getAllUsers, updateLastAQI } = require('../services/alertService');
const { sendAQIAlert, verifyEmailConfig } = require('../services/email');
const { fetchAQIFromOpenWeather } = require('../services/openweatherService');
const cities = require('../data/cities');

// Verify email configuration on startup
verifyEmailConfig();

/**
 * Daily Alert Job - Runs every hour and checks user preferences
 * Sends daily AQI report to users at their preferred time
 */
cron.schedule('0 * * * *', async () => {
  console.log('Running daily AQI alert job...');
  
  try {
    const users = await getAllUsers();
    const currentHour = new Date().getHours();
    const currentMinute = new Date().getMinutes();
    
    for (const user of users) {
      try {
        // Check user's preferred daily time
        const alertPrefs = user.alert_prefs || { daily_time: '08:00' };
        const [prefHour, prefMinute] = alertPrefs.daily_time.split(':').map(Number);
        
        // Only send if current time matches user's preference (within the hour)
        if (currentHour !== prefHour) {
          continue;
        }

        // Find city coordinates
        const city = cities.find(c => c.name === user.city);
        if (!city) {
          console.log(`City ${user.city} not found for user ${user.email}`);
          continue;
        }

        // Fetch current AQI
        const aqiData = await fetchAQIFromOpenWeather(city.lat, city.lon);
        
        // Send email alert with personalization
        await sendAQIAlert(
          user.email, 
          user.name || 'User', 
          user.city, 
          aqiData.aqi, 
          'daily',
          user.health_profile,
          aqiData, // Pass full AQI data for better personalization
          user.id // Pass user ID for tracking
        );
        
        // Update last_aqi
        await updateLastAQI(user.id, aqiData.aqi);
        
        console.log(`Daily alert sent to ${user.email} at ${alertPrefs.daily_time}`);
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error sending daily alert to ${user.email}:`, error.message);
      }
    }
    
    console.log('Daily AQI alert job completed');
    
  } catch (error) {
    console.error('Daily alert job error:', error.message);
  }
});

/**
 * Change Detection Job - Runs every 30 minutes
 * Sends alert if AQI level changes significantly (respects user preferences)
 */
cron.schedule('*/30 * * * *', async () => {
  console.log('Running AQI change detection job...');
  
  try {
    const users = await getAllUsers();
    
    for (const user of users) {
      try {
        // Check if user has change detection enabled
        const alertPrefs = user.alert_prefs || { on_change: true };
        if (alertPrefs.on_change === false) {
          continue; // Skip users who disabled change alerts
        }

        // Skip if user has no last_aqi recorded
        if (user.last_aqi === null || user.last_aqi === undefined) {
          continue;
        }

        // Find city coordinates
        const city = cities.find(c => c.name === user.city);
        if (!city) {
          continue;
        }

        // Fetch current AQI
        const aqiData = await fetchAQIFromOpenWeather(city.lat, city.lon);
        const currentAQI = aqiData.aqi;
        
        // Check if AQI level changed
        if (currentAQI !== user.last_aqi) {
          // Send change alert with personalization
          await sendAQIAlert(
            user.email, 
            user.name || 'User', 
            user.city, 
            currentAQI, 
            'change',
            user.health_profile,
            aqiData, // Pass full AQI data for better personalization
            user.id // Pass user ID for tracking
          );
          
          // Update last_aqi
          await updateLastAQI(user.id, currentAQI);
          
          console.log(`Change alert sent to ${user.email} (${user.last_aqi} -> ${currentAQI})`);
        }
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error in change detection for ${user.email}:`, error.message);
      }
    }
    
    console.log('AQI change detection job completed');
    
  } catch (error) {
    console.error('Change detection job error:', error.message);
  }
});

console.log('AQI alert cron jobs initialized');
console.log('- Daily alerts: Every hour (checks user preferences for custom times)');
console.log('- Change detection: Every 30 minutes (respects user on_change preference)');

module.exports = {
  // Export for testing purposes
};
