/**
 * Authentication Middleware
 * 
 * Middleware to verify user authentication for protected routes.
 * Checks for user_id in request body or query parameters.
 */

/**
 * Verify that the request includes a valid user_id
 * This is a simple authentication check for the current implementation.
 * 
 * In a production environment, this should be replaced with proper
 * JWT token validation or session-based authentication.
 */
function requireAuth(req, res, next) {
  try {
    // Safely check for user_id in body or query params
    const userId = (req.body && req.body.user_id) || (req.query && req.query.user_id);

    if (!userId) {
      return res.status(401).json({ 
        error: 'Authentication required. Please provide user_id.' 
      });
    }

    // Validate user_id is a number
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      return res.status(401).json({ 
        error: 'Invalid user_id provided.' 
      });
    }

    // Attach user_id to request for use in controllers
    req.userId = parsedUserId;
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err.message);
    return res.status(500).json({ 
      error: 'Authentication error occurred.' 
    });
  }
}

module.exports = {
  requireAuth
};
