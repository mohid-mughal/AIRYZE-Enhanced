/**
 * Supabase Error Handling Utilities
 * Maps Supabase error codes to HTTP status codes and user-friendly messages
 */

/**
 * PostgreSQL error codes that we handle
 */
const ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
};

/**
 * Maps Supabase/PostgreSQL error codes to HTTP status codes
 * @param {string} errorCode - PostgreSQL error code
 * @returns {number} HTTP status code
 */
function getHttpStatusCode(errorCode) {
  switch (errorCode) {
    case ERROR_CODES.UNIQUE_VIOLATION:
      return 409; // Conflict
    case ERROR_CODES.FOREIGN_KEY_VIOLATION:
    case ERROR_CODES.NOT_NULL_VIOLATION:
    case ERROR_CODES.CHECK_VIOLATION:
      return 400; // Bad Request
    default:
      return 500; // Internal Server Error
  }
}

/**
 * Creates user-friendly error messages based on error code and context
 * @param {string} errorCode - PostgreSQL error code
 * @param {string} errorMessage - Original error message from Supabase
 * @returns {string} User-friendly error message
 */
function getUserFriendlyMessage(errorCode, errorMessage) {
  switch (errorCode) {
    case ERROR_CODES.UNIQUE_VIOLATION:
      if (errorMessage.includes('email')) {
        return 'Email already registered';
      }
      return 'Resource already exists';
    
    case ERROR_CODES.FOREIGN_KEY_VIOLATION:
      return 'Referenced resource does not exist';
    
    case ERROR_CODES.NOT_NULL_VIOLATION:
      return 'Required field is missing';
    
    case ERROR_CODES.CHECK_VIOLATION:
      return 'Invalid data provided';
    
    default:
      return 'An error occurred while processing your request';
  }
}

/**
 * Handles Supabase operation responses
 * Checks for errors and returns standardized response object
 * @param {Object} supabaseResponse - Response from Supabase operation
 * @param {*} supabaseResponse.data - Data returned from operation
 * @param {Object} supabaseResponse.error - Error object if operation failed
 * @returns {Object} Standardized response with status, data, and error
 */
function handleSupabaseResponse(supabaseResponse) {
  const { data, error } = supabaseResponse;
  
  // Success case
  if (!error) {
    return {
      success: true,
      status: 200,
      data: data
    };
  }
  
  // Error case
  console.error('Supabase error:', {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint
  });
  
  const statusCode = getHttpStatusCode(error.code);
  const userMessage = getUserFriendlyMessage(error.code, error.message);
  
  return {
    success: false,
    status: statusCode,
    error: userMessage,
    details: error.message // Include technical details for debugging
  };
}

/**
 * Wraps an async Supabase operation with error handling
 * @param {Function} operation - Async function that performs Supabase operation
 * @returns {Promise<Object>} Standardized response object
 */
async function withErrorHandling(operation) {
  try {
    const result = await operation();
    return handleSupabaseResponse(result);
  } catch (err) {
    console.error('Unexpected error:', err);
    return {
      success: false,
      status: 500,
      error: 'Internal server error',
      details: err.message
    };
  }
}

module.exports = {
  ERROR_CODES,
  getHttpStatusCode,
  getUserFriendlyMessage,
  handleSupabaseResponse,
  withErrorHandling
};
