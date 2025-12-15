/**
 * Feature: supabase-migration, Property 1: Supabase Client Initialization
 * Validates: Requirements 1.1
 * 
 * Property: For any valid SUPABASE_URL and SUPABASE_ANON_KEY combination,
 * creating a Supabase client should succeed and return a valid client object
 * capable of making queries.
 */

const fc = require('fast-check');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Increase Jest timeout for network operations
jest.setTimeout(30000);

describe('Property 1: Supabase Client Initialization', () => {
  const validUrl = process.env.SUPABASE_URL;
  const validKey = process.env.SUPABASE_ANON_KEY;

  beforeAll(() => {
    // Ensure we have valid credentials for testing
    if (!validUrl || !validKey) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set for tests');
    }
  });

  /**
   * Feature: supabase-migration, Property 1: Supabase Client Initialization
   * Validates: Requirements 1.1
   * 
   * This property test verifies that for any valid credentials,
   * the Supabase client can be created and make successful queries.
   * Since we're testing with constant valid credentials (the only valid ones we have),
   * we run 100 iterations to ensure consistency.
   */
  test('valid credentials create a working client capable of making queries', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate variations of valid credentials (using actual valid ones)
        fc.constant({ url: validUrl, key: validKey }),
        async (credentials) => {
          // Create client with valid credentials
          const client = createClient(credentials.url, credentials.key);
          
          // Verify client is a valid object
          expect(client).toBeDefined();
          expect(typeof client).toBe('object');
          
          // Verify client has required methods for database operations
          expect(typeof client.from).toBe('function');
          
          // Verify client can make a query (even if table is empty)
          const { error } = await client.from('users').select('id').limit(1);
          
          // PGRST116 means no rows found, which is acceptable
          // null error means query succeeded
          const isValidResponse = error === null || error?.code === 'PGRST116';
          expect(isValidResponse).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);

  /**
   * Feature: supabase-migration, Property 1: Supabase Client Initialization
   * Validates: Requirements 1.1
   * 
   * Test that the exported db module creates a valid client
   */
  test('db module exports a valid Supabase client', async () => {
    // Import the actual db module
    const supabase = require('../db');
    
    // Verify it's a valid Supabase client
    expect(supabase).toBeDefined();
    expect(typeof supabase).toBe('object');
    expect(typeof supabase.from).toBe('function');
    
    // Verify it can make queries
    const { error } = await supabase.from('users').select('id').limit(1);
    const isValidResponse = error === null || error?.code === 'PGRST116';
    expect(isValidResponse).toBe(true);
  });
});
