/**
 * Authentication Controllers
 * 
 * Handles user signup and login operations using Supabase database.
 * Uses bcrypt for password hashing and verification.
 */

const supabase = require('../db');
const bcrypt = require('bcryptjs');
const { handleSupabaseResponse } = require('../utils/supabaseErrors');

/**
 * Signup - Register a new user
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user data
 * @param {string} req.body.name - User's name
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {string} req.body.city - User's city
 * @param {Object} res - Express response object
 * 
 * Requirements: 3.1, 3.3, 3.4
 */
async function signup(req, res) {
  try {
    const { name, email, password, city } = req.body;

    // Validate required fields
    if (!name || !email || !password || !city) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user into Supabase
    const supabaseResponse = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, city }])
      .select('id, name, email, city, created_at')
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    // Return success with user data (password excluded via select)
    return res.status(201).json({
      success: true,
      user: result.data
    });
  } catch (err) {
    console.error('Signup error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}


/**
 * Login - Authenticate a user
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing credentials
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * 
 * Requirements: 3.2, 3.4
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Retrieve user from Supabase by email
    const supabaseResponse = await supabase
      .from('users')
      .select('id, name, email, password, city')
      .eq('email', email)
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      // PGRST116 means no rows returned (user not found)
      if (supabaseResponse.error && supabaseResponse.error.code === 'PGRST116') {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      return res.status(result.status).json({ error: result.error });
    }

    const user = result.data;

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return success with user data (exclude password)
    const { password: _, ...userWithoutPassword } = user;
    return res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Update Health Profile - Update user's health profile
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Health profile data
 * @param {string} req.body.age_group - Age group
 * @param {Array<string>} req.body.health_conditions - Health conditions
 * @param {string} req.body.activity_level - Activity level
 * @param {string} req.body.primary_city - Primary city
 * @param {Object} res - Express response object
 * 
 * Requirements: 2.3, 3.2, 3.3, 3.4
 */
async function updateHealthProfile(req, res) {
  try {
    const { userId } = req.params;
    const { age_group, health_conditions, activity_level, primary_city } = req.body;

    // Validate required fields
    if (!age_group || !health_conditions || !activity_level || !primary_city) {
      return res.status(400).json({ error: 'All health profile fields are required' });
    }

    // Validate age_group enum
    const validAgeGroups = ['under_12', '13_18', '19_40', '41_60', '60_plus'];
    if (!validAgeGroups.includes(age_group)) {
      return res.status(400).json({ error: 'Invalid age_group value' });
    }

    // Validate health_conditions array
    const validConditions = ['asthma', 'heart_issues', 'allergies', 'pregnant', 'young_children', 'none'];
    if (!Array.isArray(health_conditions) || !health_conditions.every(c => validConditions.includes(c))) {
      return res.status(400).json({ error: 'Invalid health_conditions values' });
    }

    // Validate activity_level enum
    const validActivityLevels = ['mostly_indoors', 'light_exercise', 'running_cycling', 'heavy_sports'];
    if (!validActivityLevels.includes(activity_level)) {
      return res.status(400).json({ error: 'Invalid activity_level value' });
    }

    const healthProfile = {
      age_group,
      health_conditions,
      activity_level,
      primary_city
    };

    // Update health profile in Supabase
    const supabaseResponse = await supabase
      .from('users')
      .update({ health_profile: healthProfile })
      .eq('id', userId)
      .select('id, name, email, city, health_profile')
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      health_profile: result.data.health_profile
    });
  } catch (err) {
    console.error('Update health profile error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get Health Profile - Retrieve user's health profile
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Requirements: 2.3, 3.1
 */
async function getHealthProfile(req, res) {
  try {
    const { userId } = req.params;

    const supabaseResponse = await supabase
      .from('users')
      .select('health_profile')
      .eq('id', userId)
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      health_profile: result.data.health_profile
    });
  } catch (err) {
    console.error('Get health profile error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Update Alert Preferences - Update user's alert preferences
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Alert preferences
 * @param {boolean} req.body.on_change - Enable change detection alerts
 * @param {string} req.body.daily_time - Daily alert time (HH:MM format)
 * @param {boolean} req.body.instant_button - Enable instant email button
 * @param {Object} res - Express response object
 * 
 * Requirements: 5.4
 */
async function updateAlertPreferences(req, res) {
  try {
    const { userId } = req.params;
    const { on_change, daily_time, instant_button } = req.body;

    // Validate daily_time format (HH:MM)
    if (daily_time && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(daily_time)) {
      return res.status(400).json({ error: 'Invalid daily_time format. Use HH:MM (e.g., 08:00)' });
    }

    const alertPrefs = {
      on_change: on_change !== undefined ? on_change : true,
      daily_time: daily_time || '08:00',
      instant_button: instant_button !== undefined ? instant_button : true
    };

    // Update alert preferences in Supabase
    const supabaseResponse = await supabase
      .from('users')
      .update({ alert_prefs: alertPrefs })
      .eq('id', userId)
      .select('id, alert_prefs')
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      alert_prefs: result.data.alert_prefs
    });
  } catch (err) {
    console.error('Update alert preferences error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get Alert Preferences - Retrieve user's alert preferences
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Requirements: 5.4
 */
async function getAlertPreferences(req, res) {
  try {
    const { userId } = req.params;

    const supabaseResponse = await supabase
      .from('users')
      .select('alert_prefs')
      .eq('id', userId)
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      alert_prefs: result.data.alert_prefs
    });
  } catch (err) {
    console.error('Get alert preferences error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Update Badges - Update user's badge collection
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Badge data
 * @param {Array<Object>} req.body.badges - Array of badge objects
 * @param {Object} req.body.progress - Optional progress tracking data
 * @param {Object} res - Express response object
 * 
 * Requirements: 1.3, 1.4, 8.1, 8.2
 */
async function updateBadges(req, res) {
  try {
    const { userId } = req.params;
    const { badges } = req.body;

    // Validate badges data structure
    if (!Array.isArray(badges)) {
      return res.status(400).json({ error: 'Badges must be an array' });
    }

    // Validate each badge object structure
    for (let i = 0; i < badges.length; i++) {
      const badge = badges[i];
      if (!badge.name || typeof badge.name !== 'string') {
        return res.status(400).json({ error: `Badge at index ${i} must have a name (string)` });
      }
      if (!badge.earned || typeof badge.earned !== 'string') {
        return res.status(400).json({ error: `Badge at index ${i} must have an earned timestamp (string)` });
      }
      // Progress can be a number or an array (for set-based tracking like cities_viewed)
      if (badge.progress === undefined || 
          (typeof badge.progress !== 'number' && !Array.isArray(badge.progress))) {
        return res.status(400).json({ error: `Badge at index ${i} must have a progress value (number or array)` });
      }
    }

    // Update only badges in Supabase (badge_progress column may not exist)
    const supabaseResponse = await supabase
      .from('users')
      .update({ badges: badges })
      .eq('id', userId)
      .select('id, badges')
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      badges: result.data.badges
    });
  } catch (err) {
    console.error('Update badges error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get Badges - Retrieve user's badge collection
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * Requirements: 1.3, 1.4
 */
async function getBadges(req, res) {
  try {
    const { userId } = req.params;

    const supabaseResponse = await supabase
      .from('users')
      .select('badges')
      .eq('id', userId)
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      badges: result.data.badges || []
    });
  } catch (err) {
    console.error('Get badges error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Track email alert open
 * GET /auth/track-alert/:userId
 * This endpoint is called when a user clicks a link in an email alert
 */
async function trackAlertOpen(req, res) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Log the tracking event
    console.log(`Alert opened by user ${userId}`);

    // Redirect to dashboard with a tracking parameter
    res.redirect(`http://localhost:5173?alert_opened=true&user_id=${userId}`);
  } catch (err) {
    console.error('Unexpected error in trackAlertOpen:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  signup,
  login,
  updateHealthProfile,
  getHealthProfile,
  updateAlertPreferences,
  getAlertPreferences,
  updateBadges,
  getBadges,
  trackAlertOpen
};
