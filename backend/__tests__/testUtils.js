/**
 * Test Utilities for Supabase Property-Based Tests
 * 
 * Provides helper functions for:
 * - Supabase test client setup
 * - Test data cleanup
 * - Unique identifier generation
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

/**
 * Create a Supabase test client
 * Uses environment variables for configuration
 * 
 * @returns {Object} Supabase client instance
 * @throws {Error} If required environment variables are missing
 */
function createTestClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set for tests');
  }

  return createClient(supabaseUrl, supabaseKey);
}

/**
 * Generate a unique email address for testing
 * Format: test_{timestamp}_{random}@test.com
 * 
 * @returns {string} Unique email address
 */
function generateUniqueEmail() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test_${timestamp}_${random}@test.com`;
}

/**
 * Generate a unique location name for testing
 * Format: TestCity_{timestamp}_{random}
 * 
 * @returns {string} Unique location name
 */
function generateUniqueLocation() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `TestCity_${timestamp}_${random}`;
}

/**
 * Cleanup utility for test users
 * Tracks and removes users created during tests
 */
class UserCleanup {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.createdEmails = [];
  }

  /**
   * Track an email for cleanup
   * @param {string} email - Email address to track
   */
  track(email) {
    this.createdEmails.push(email);
  }

  /**
   * Remove all tracked users from the database
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (this.createdEmails.length === 0) {
      return;
    }

    try {
      await this.supabase
        .from('users')
        .delete()
        .in('email', this.createdEmails);
    } catch (error) {
      console.error('Error cleaning up test users:', error);
    } finally {
      this.createdEmails.length = 0;
    }
  }

  /**
   * Get count of tracked emails
   * @returns {number}
   */
  count() {
    return this.createdEmails.length;
  }
}

/**
 * Cleanup utility for AQI data records
 * Tracks and removes records created during tests
 */
class AQIDataCleanup {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.createdIds = [];
  }

  /**
   * Track a record ID for cleanup
   * @param {number} id - Record ID to track
   */
  track(id) {
    this.createdIds.push(id);
  }

  /**
   * Track multiple record IDs for cleanup
   * @param {number[]} ids - Array of record IDs to track
   */
  trackMany(ids) {
    this.createdIds.push(...ids);
  }

  /**
   * Remove all tracked records from the database
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (this.createdIds.length === 0) {
      return;
    }

    try {
      await this.supabase
        .from('aqi_data')
        .delete()
        .in('id', this.createdIds);
    } catch (error) {
      console.error('Error cleaning up test AQI data:', error);
    } finally {
      this.createdIds.length = 0;
    }
  }

  /**
   * Get count of tracked IDs
   * @returns {number}
   */
  count() {
    return this.createdIds.length;
  }
}

/**
 * Verify Supabase connection is working
 * Useful for beforeAll hooks to ensure tests can run
 * 
 * @param {Object} supabaseClient - Supabase client instance
 * @returns {Promise<boolean>} True if connection is valid
 * @throws {Error} If connection fails
 */
async function verifyConnection(supabaseClient) {
  const { error } = await supabaseClient.from('users').select('id').limit(1);
  
  // PGRST116 means no rows found, which is acceptable
  // null error means query succeeded
  const isValid = error === null || error?.code === 'PGRST116';
  
  if (!isValid) {
    throw new Error(`Supabase connection failed: ${error?.message}`);
  }
  
  return true;
}

/**
 * Wait for a specified duration
 * Useful for rate limiting or ensuring time-based ordering
 * 
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  createTestClient,
  generateUniqueEmail,
  generateUniqueLocation,
  UserCleanup,
  AQIDataCleanup,
  verifyConnection,
  wait
};
