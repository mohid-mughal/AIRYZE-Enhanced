/**
 * Supabase Database Client Module
 * 
 * This module initializes and exports the Supabase client for database operations.
 * It validates required environment variables and verifies connection on load.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl) {
  console.error('Error: SUPABASE_URL environment variable is not set');
  process.exit(1);
}

if (!supabaseKey) {
  console.error('Error: SUPABASE_ANON_KEY environment variable is not set');
  process.exit(1);
}

// Create Supabase client instance
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Verify database connection by performing a simple query
 * @returns {Promise<boolean>} True if connection is successful
 */
async function verifyConnection() {
  try {
    // Attempt to query the users table to verify connection
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error) {
      // PGRST116 means table exists but no rows - that's fine
      if (error.code === 'PGRST116') {
        console.log('Supabase connection established successfully');
        return true;
      }
      console.error('Supabase connection error:', error.message);
      return false;
    }
    
    console.log('Supabase connection established successfully');
    return true;
  } catch (err) {
    console.error('Failed to connect to Supabase:', err.message);
    return false;
  }
}

// Verify connection on module load
verifyConnection().then((connected) => {
  if (!connected) {
    console.error('Warning: Could not verify Supabase connection');
  }
});

module.exports = supabase;
