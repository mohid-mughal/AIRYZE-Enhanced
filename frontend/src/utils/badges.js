/**
 * Badge Definitions and Utilities
 * Defines all badge types and provides helper functions for badge management
 */

export const BADGE_DEFINITIONS = [
  {
    id: 'daily_streak_7',
    name: '7-Day Streak',
    description: 'Check AQI for 7 consecutive days',
    icon: '🔥',
    threshold: 7,
    trackingKey: 'aqi_checks',
    category: 'engagement'
  },
  {
    id: 'weekly_streak_4',
    name: 'Monthly Champion',
    description: 'Check AQI for 4 consecutive weeks',
    icon: '👑',
    threshold: 28,
    trackingKey: 'aqi_checks',
    category: 'engagement'
  },
  {
    id: 'report_contributor',
    name: 'Helpful Citizen',
    description: 'Submit 5 crowd reports',
    icon: '📝',
    threshold: 5,
    trackingKey: 'reports_submitted',
    category: 'contribution'
  },
  {
    id: 'upvoter',
    name: 'Positive Vibes',
    description: 'Upvote 10 reports',
    icon: '👍',
    threshold: 10,
    trackingKey: 'upvotes_given',
    category: 'community'
  },
  {
    id: 'downvoter',
    name: 'Quality Keeper',
    description: 'Downvote 10 reports',
    icon: '👎',
    threshold: 10,
    trackingKey: 'downvotes_given',
    category: 'community'
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Complete 3 quizzes',
    icon: '🎓',
    threshold: 3,
    trackingKey: 'quizzes_completed',
    category: 'learning'
  },
  {
    id: 'alert_responder',
    name: 'Alert Pro',
    description: 'Open 5 email alerts',
    icon: '📧',
    threshold: 5,
    trackingKey: 'alerts_opened',
    category: 'engagement'
  },
  {
    id: 'city_explorer',
    name: 'City Explorer',
    description: 'View AQI for 5 different cities',
    icon: '🌍',
    threshold: 5,
    trackingKey: 'cities_viewed',
    category: 'exploration'
  }
];

/**
 * Get badge definition by ID
 * @param {string} badgeId - The unique identifier of the badge
 * @returns {Object|null} Badge definition object or null if not found
 */
export const getBadgeById = (badgeId) => {
  return BADGE_DEFINITIONS.find(badge => badge.id === badgeId) || null;
};

/**
 * Check if a user is eligible for a badge based on their progress
 * @param {string} badgeId - The unique identifier of the badge
 * @param {Object} progress - User's progress object with tracking keys
 * @returns {boolean} True if user meets the threshold, false otherwise
 */
export const checkBadgeEligibility = (badgeId, progress) => {
  const badge = getBadgeById(badgeId);
  if (!badge) {
    return false;
  }

  const userProgress = progress[badge.trackingKey];
  
  // Handle different progress types
  if (Array.isArray(userProgress)) {
    // For sets (like cities_viewed), check the length
    return userProgress.length >= badge.threshold;
  } else if (typeof userProgress === 'number') {
    // For counters, check if it meets threshold
    return userProgress >= badge.threshold;
  }
  
  return false;
};

/**
 * Calculate progress percentage for a badge
 * @param {string} badgeId - The unique identifier of the badge
 * @param {Object} progress - User's progress object with tracking keys
 * @returns {Object} Object with current progress, threshold, and percentage
 */
export const calculateProgress = (badgeId, progress) => {
  const badge = getBadgeById(badgeId);
  if (!badge) {
    return { current: 0, threshold: 0, percentage: 0 };
  }

  const userProgress = progress[badge.trackingKey];
  let current = 0;

  // Handle different progress types
  if (Array.isArray(userProgress)) {
    current = userProgress.length;
  } else if (typeof userProgress === 'number') {
    current = userProgress;
  }

  const percentage = Math.min(100, Math.round((current / badge.threshold) * 100));

  return {
    current,
    threshold: badge.threshold,
    percentage
  };
};
