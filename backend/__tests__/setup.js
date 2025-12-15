/**
 * Jest Setup File
 * 
 * This file runs before all tests to configure the test environment.
 * It sets up global configurations and verifies the test environment is ready.
 */

require('dotenv').config();

// Set default timeout for all tests (30 seconds)
// Property-based tests may need longer timeouts
jest.setTimeout(30000);

// Verify required environment variables are present
beforeAll(() => {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables for testing: ${missingVars.join(', ')}\n` +
      'Please ensure your .env file is configured correctly.'
    );
  }
});

// Suppress console.log during tests to reduce noise
// Comment out these lines if you need to debug tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

global.console = {
  ...console,
  log: jest.fn((...args) => {
    // Only log if VERBOSE_TESTS environment variable is set
    if (process.env.VERBOSE_TESTS) {
      originalConsoleLog(...args);
    }
  }),
  error: jest.fn((...args) => {
    // Always log errors
    originalConsoleError(...args);
  })
};
