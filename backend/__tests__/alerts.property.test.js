/**
 * Property-Based Tests for Alert Service
 * Tests alert-related operations using fast-check
 */

const fc = require('fast-check');
const bcrypt = require('bcryptjs');
const supabase = require('../db');
const { getAllUsers, updateLastAQI } = require('../services/alertService');

// Increase Jest timeout for network operations
jest.setTimeout(180000);

// Track created test users for cleanup
const createdUserEmails = [];

// Cleanup function to remove test users after tests
async function cleanupTestUsers() {
  for (const email of createdUserEmails) {
    await supabase.from('users').delete().eq('email', email);
  }
  createdUserEmails.length = 0;
}

// Generate unique email to avoid conflicts
function generateUniqueEmail() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test_${timestamp}_${random}@test.com`;
}

/**
 * Feature: supabase-migration, Property 7: User Alert Data Retrieval
 * Validates: Requirements 6.1, 6.4
 * 
 * Property: For any user with city and last_aqi fields set,
 * querying users for alerts should return objects containing
 * email, city, and last_aqi fields.
 */
describe('Property 7: User Alert Data Retrieval', () => {
  afterAll(async () => {
    await cleanupTestUsers();
  });

  test('getAllUsers returns email, city, and last_aqi fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          password: fc.string({ minLength: 8, maxLength: 50 }),
          city: fc.string({ minLength: 1, maxLength: 100 }),
          last_aqi: fc.integer({ min: 1, max: 5 })
        }),
        async (userData) => {
          // Generate unique email for each test run
          const email = generateUniqueEmail();
          createdUserEmails.push(email);

          // Hash the password
          const hashedPassword = await bcrypt.hash(userData.password, 10);

          // Insert test user with last_aqi
          const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([{
              name: userData.name,
              email: email,
              password: hashedPassword,
              city: userData.city,
              last_aqi: userData.last_aqi
            }])
            .select('id')
            .single();

          expect(insertError).toBeNull();
          expect(insertedUser).toBeTruthy();

          // Get all users using the alert service
          const users = await getAllUsers();

          // Find our test user in the results
          const testUser = users.find(u => u.email === email);

          // Verify the user was returned with required fields
          expect(testUser).toBeTruthy();
          expect(testUser).toHaveProperty('id');
          expect(testUser).toHaveProperty('email');
          expect(testUser).toHaveProperty('city');
          expect(testUser).toHaveProperty('last_aqi');

          // Verify the values match
          expect(testUser.email).toBe(email);
          expect(testUser.city).toBe(userData.city);
          expect(testUser.last_aqi).toBe(userData.last_aqi);

          // Verify password is NOT included
          expect(testUser).not.toHaveProperty('password');

          // Clean up immediately after test to prevent database bloat
          await supabase.from('users').delete().eq('email', email);
          const index = createdUserEmails.indexOf(email);
          if (index > -1) createdUserEmails.splice(index, 1);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  }, 180000);
});

/**
 * Feature: supabase-migration, Property 8: Last AQI Update Round-Trip
 * Validates: Requirements 6.3
 * 
 * Property: For any user and any valid AQI value,
 * after updating the user's last_aqi field,
 * querying that user should return the updated last_aqi value.
 */
describe('Property 8: Last AQI Update Round-Trip', () => {
  afterAll(async () => {
    await cleanupTestUsers();
  });

  test('updateLastAQI persists and retrieves the new value', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          password: fc.string({ minLength: 8, maxLength: 50 }),
          city: fc.string({ minLength: 1, maxLength: 100 }),
          initialAqi: fc.integer({ min: 1, max: 5 }),
          updatedAqi: fc.integer({ min: 1, max: 5 })
        }),
        async (userData) => {
          // Generate unique email for each test run
          const email = generateUniqueEmail();
          createdUserEmails.push(email);

          // Hash the password
          const hashedPassword = await bcrypt.hash(userData.password, 10);

          // Insert test user with initial last_aqi
          const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([{
              name: userData.name,
              email: email,
              password: hashedPassword,
              city: userData.city,
              last_aqi: userData.initialAqi
            }])
            .select('id')
            .single();

          expect(insertError).toBeNull();
          expect(insertedUser).toBeTruthy();

          const userId = insertedUser.id;

          // Update the last_aqi using the alert service
          await updateLastAQI(userId, userData.updatedAqi);

          // Retrieve the user to verify the update
          const { data: retrievedUser, error: selectError } = await supabase
            .from('users')
            .select('id, last_aqi')
            .eq('id', userId)
            .single();

          expect(selectError).toBeNull();
          expect(retrievedUser).toBeTruthy();

          // Verify the last_aqi was updated correctly
          expect(retrievedUser.last_aqi).toBe(userData.updatedAqi);

          // Clean up immediately after test
          await supabase.from('users').delete().eq('email', email);
          const index = createdUserEmails.indexOf(email);
          if (index > -1) createdUserEmails.splice(index, 1);

          return true;
        }
      ),
      { numRuns: 20 }
    );
  }, 180000);
});
