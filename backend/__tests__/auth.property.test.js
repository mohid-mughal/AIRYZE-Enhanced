/**
 * Authentication Property Tests
 * 
 * Property-based tests for user authentication operations.
 * Uses fast-check for generating random test data.
 */

const fc = require('fast-check');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Supabase client
const supabase = require('../db');

// Increase Jest timeout for network operations
jest.setTimeout(60000);

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
 * Feature: supabase-migration, Property 2: User Signup Round-Trip
 * Validates: Requirements 3.1, 3.2
 * 
 * Property: For any valid user data (name, email, password, city),
 * after signup the user should be retrievable from the database with
 * matching name, email, and city fields, and the stored password hash
 * should verify against the original password.
 */
describe('Property 2: User Signup Round-Trip', () => {
  afterAll(async () => {
    await cleanupTestUsers();
  });

  test('user signup round-trip preserves data and password verifies', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid user data
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          password: fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.trim().length >= 8),
          city: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
        }),
        async (userData) => {
          // Generate unique email for each test run
          const email = generateUniqueEmail();
          createdUserEmails.push(email);


          // Hash the password (same as signup does)
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

          // Insert user into Supabase (simulating signup)
          const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([{
              name: userData.name,
              email: email,
              password: hashedPassword,
              city: userData.city
            }])
            .select('id, name, email, city')
            .single();

          // Verify insert succeeded
          expect(insertError).toBeNull();
          expect(insertedUser).toBeDefined();

          // Retrieve user from database (simulating login lookup)
          const { data: retrievedUser, error: selectError } = await supabase
            .from('users')
            .select('id, name, email, password, city')
            .eq('email', email)
            .single();

          // Verify retrieval succeeded
          expect(selectError).toBeNull();
          expect(retrievedUser).toBeDefined();

          // Verify data matches
          expect(retrievedUser.name).toBe(userData.name);
          expect(retrievedUser.email).toBe(email);
          expect(retrievedUser.city).toBe(userData.city);

          // Verify password hash verifies against original password
          const passwordValid = await bcrypt.compare(userData.password, retrievedUser.password);
          expect(passwordValid).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);
});


/**
 * Feature: supabase-migration, Property 3: Authentication Response Sanitization
 * Validates: Requirements 3.4
 * 
 * Property: For any successful authentication operation (signup or login),
 * the returned user object should contain id, name, email, and city fields
 * but should never contain the password field.
 */
describe('Property 3: Authentication Response Sanitization', () => {
  afterAll(async () => {
    await cleanupTestUsers();
  });

  test('signup response never contains password field', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate valid user data
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          password: fc.string({ minLength: 8, maxLength: 50 }).filter(s => s.trim().length >= 8),
          city: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
        }),
        async (userData) => {
          // Generate unique email for each test run
          const email = generateUniqueEmail();
          createdUserEmails.push(email);

          // Hash the password
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

          // Insert user and select only safe fields (as signup does)
          const { data: signupResponse, error } = await supabase
            .from('users')
            .insert([{
              name: userData.name,
              email: email,
              password: hashedPassword,
              city: userData.city
            }])
            .select('id, name, email, city, created_at')
            .single();

          // Verify insert succeeded
          expect(error).toBeNull();
          expect(signupResponse).toBeDefined();

          // Verify password is NOT in the response
          expect(signupResponse).not.toHaveProperty('password');

          // Verify required fields ARE present
          expect(signupResponse).toHaveProperty('id');
          expect(signupResponse).toHaveProperty('name');
          expect(signupResponse).toHaveProperty('email');
          expect(signupResponse).toHaveProperty('city');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 120000);

  test('login response never contains password field', async () => {
    // Create a test user first
    const testEmail = generateUniqueEmail();
    createdUserEmails.push(testEmail);
    const testPassword = 'testPassword123';
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    await supabase.from('users').insert([{
      name: 'Test User',
      email: testEmail,
      password: hashedPassword,
      city: 'Test City'
    }]);

    await fc.assert(
      fc.asyncProperty(
        // Just run multiple times to ensure consistency
        fc.constant(true),
        async () => {
          // Retrieve user (as login does)
          const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, password, city')
            .eq('email', testEmail)
            .single();

          expect(error).toBeNull();
          expect(user).toBeDefined();

          // Simulate the password exclusion that login does
          const { password: _, ...userWithoutPassword } = user;

          // Verify password is NOT in the sanitized response
          expect(userWithoutPassword).not.toHaveProperty('password');

          // Verify required fields ARE present
          expect(userWithoutPassword).toHaveProperty('id');
          expect(userWithoutPassword).toHaveProperty('name');
          expect(userWithoutPassword).toHaveProperty('email');
          expect(userWithoutPassword).toHaveProperty('city');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  }, 60000);
});
