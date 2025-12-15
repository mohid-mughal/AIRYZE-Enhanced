/**
 * Feature: supabase-migration, Property 9: Supabase Response Handling
 * Validates: Requirements 7.4
 * 
 * Property: For any Supabase query response, the system should correctly
 * distinguish between success (data present, no error) and failure (error present)
 * states and handle each appropriately.
 */

const fc = require('fast-check');
const {
  handleSupabaseResponse,
  getHttpStatusCode,
  getUserFriendlyMessage,
  ERROR_CODES
} = require('../utils/supabaseErrors');

// Increase Jest timeout
jest.setTimeout(30000);

describe('Property 9: Supabase Response Handling', () => {
  /**
   * Feature: supabase-migration, Property 9: Supabase Response Handling
   * Validates: Requirements 7.4
   * 
   * Test that success responses (data present, no error) are handled correctly
   */
  test('success responses are correctly identified and handled', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary data payloads
        fc.oneof(
          fc.object(),
          fc.array(fc.object()),
          fc.record({
            id: fc.integer(),
            name: fc.string(),
            email: fc.emailAddress()
          }),
          fc.constant(null),
          fc.constant([])
        ),
        async (data) => {
          // Create a success response (data present, no error)
          const supabaseResponse = {
            data: data,
            error: null
          };

          const result = handleSupabaseResponse(supabaseResponse);

          // Verify success is correctly identified
          expect(result.success).toBe(true);
          expect(result.status).toBe(200);
          expect(result.data).toEqual(data);
          expect(result.error).toBeUndefined();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: supabase-migration, Property 9: Supabase Response Handling
   * Validates: Requirements 7.4
   * 
   * Test that error responses (error present) are handled correctly
   */
  test('error responses are correctly identified and handled', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate error codes and messages
        fc.record({
          code: fc.oneof(
            fc.constant(ERROR_CODES.UNIQUE_VIOLATION),
            fc.constant(ERROR_CODES.FOREIGN_KEY_VIOLATION),
            fc.constant(ERROR_CODES.NOT_NULL_VIOLATION),
            fc.constant(ERROR_CODES.CHECK_VIOLATION),
            fc.string() // Unknown error codes
          ),
          message: fc.string({ minLength: 1 }),
          details: fc.option(fc.string(), { nil: null }),
          hint: fc.option(fc.string(), { nil: null })
        }),
        async (errorData) => {
          // Create an error response (error present, data may be null)
          const supabaseResponse = {
            data: null,
            error: errorData
          };

          const result = handleSupabaseResponse(supabaseResponse);

          // Verify error is correctly identified
          expect(result.success).toBe(false);
          expect(result.status).toBeGreaterThanOrEqual(400);
          expect(result.status).toBeLessThanOrEqual(599);
          expect(result.error).toBeDefined();
          expect(typeof result.error).toBe('string');
          expect(result.details).toBe(errorData.message);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: supabase-migration, Property 9: Supabase Response Handling
   * Validates: Requirements 7.4
   * 
   * Test that HTTP status codes are correctly mapped from error codes
   */
  test('error codes are correctly mapped to HTTP status codes', () => {
    // Test known error codes
    expect(getHttpStatusCode(ERROR_CODES.UNIQUE_VIOLATION)).toBe(409);
    expect(getHttpStatusCode(ERROR_CODES.FOREIGN_KEY_VIOLATION)).toBe(400);
    expect(getHttpStatusCode(ERROR_CODES.NOT_NULL_VIOLATION)).toBe(400);
    expect(getHttpStatusCode(ERROR_CODES.CHECK_VIOLATION)).toBe(400);
    
    // Test unknown error codes default to 500
    expect(getHttpStatusCode('UNKNOWN_CODE')).toBe(500);
    expect(getHttpStatusCode(null)).toBe(500);
    expect(getHttpStatusCode(undefined)).toBe(500);
  });

  /**
   * Feature: supabase-migration, Property 9: Supabase Response Handling
   * Validates: Requirements 7.4
   * 
   * Test that user-friendly messages are generated for error codes
   */
  test('user-friendly messages are generated for all error codes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant(ERROR_CODES.UNIQUE_VIOLATION),
          fc.constant(ERROR_CODES.FOREIGN_KEY_VIOLATION),
          fc.constant(ERROR_CODES.NOT_NULL_VIOLATION),
          fc.constant(ERROR_CODES.CHECK_VIOLATION),
          fc.string()
        ),
        fc.string(),
        async (errorCode, errorMessage) => {
          const userMessage = getUserFriendlyMessage(errorCode, errorMessage);
          
          // Verify a message is always returned
          expect(userMessage).toBeDefined();
          expect(typeof userMessage).toBe('string');
          expect(userMessage.length).toBeGreaterThan(0);
          
          // Verify message doesn't expose technical details
          expect(userMessage).not.toContain('PGRST');
          expect(userMessage).not.toContain('23505');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: supabase-migration, Property 9: Supabase Response Handling
   * Validates: Requirements 7.4
   * 
   * Test that unique violation errors with email are handled specially
   */
  test('unique violation with email returns specific message', () => {
    const errorMessage = 'duplicate key value violates unique constraint "users_email_key"';
    const userMessage = getUserFriendlyMessage(ERROR_CODES.UNIQUE_VIOLATION, errorMessage);
    
    expect(userMessage).toBe('Email already registered');
  });

  /**
   * Feature: supabase-migration, Property 9: Supabase Response Handling
   * Validates: Requirements 7.4
   * 
   * Test that responses with both data and error are handled (error takes precedence)
   */
  test('responses with both data and error prioritize error handling', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.object(),
        fc.record({
          code: fc.string(),
          message: fc.string({ minLength: 1 })
        }),
        async (data, error) => {
          // Create a response with both data and error (unusual but possible)
          const supabaseResponse = {
            data: data,
            error: error
          };

          const result = handleSupabaseResponse(supabaseResponse);

          // Verify error takes precedence
          expect(result.success).toBe(false);
          expect(result.error).toBeDefined();

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
