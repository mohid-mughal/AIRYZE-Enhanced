const supabase = require('../db');
const { handleSupabaseResponse } = require('../utils/supabaseErrors');

/**
 * Get historical AQI data for a specific city
 * @param {string} city - City name to fetch history for
 * @returns {Promise<Array>} Array of AQI records ordered by timestamp descending
 */
async function getHistoryForCity(city) {
  const supabaseResponse = await supabase
    .from('aqi_data')
    .select('*')
    .eq('location_name', city)
    .order('timestamp', { ascending: false })
    .limit(30);

  const result = handleSupabaseResponse(supabaseResponse);

  if (!result.success) {
    const error = new Error(result.error);
    error.status = result.status;
    throw error;
  }

  return result.data;
}

/**
 * Insert AQI data into the database
 * @param {Object} aqiData - AQI data object with all pollutant components
 * @returns {Promise<Object>} Inserted record
 */
async function insertAQIData(aqiData) {
  const supabaseResponse = await supabase
    .from('aqi_data')
    .insert([{
      location_name: aqiData.location_name,
      lat: aqiData.lat,
      lon: aqiData.lon,
      aqi: aqiData.aqi,
      co: aqiData.co,
      no: aqiData.no,
      no2: aqiData.no2,
      o3: aqiData.o3,
      so2: aqiData.so2,
      pm2_5: aqiData.pm2_5,
      pm10: aqiData.pm10,
      nh3: aqiData.nh3,
      timestamp: aqiData.timestamp
    }])
    .select()
    .single();

  const result = handleSupabaseResponse(supabaseResponse);

  if (!result.success) {
    const error = new Error(result.error);
    error.status = result.status;
    throw error;
  }

  return result.data;
}

module.exports = {
  getHistoryForCity,
  insertAQIData
};
