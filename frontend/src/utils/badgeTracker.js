/**
 * BadgeTracker - Tracks user actions and manages badge progress
 * Handles local storage persistence and syncing to Supabase
 */

import { BADGE_DEFINITIONS, checkBadgeEligibility } from './badges.js';
import axios from 'axios';

const API_URL = 'http://localhost:5000';
const SYNC_DELAY = 30000; // 30 seconds
const STORAGE_KEY = 'badge_progress';
const EARNED_BADGES_KEY = 'earned_badges';

class BadgeTracker {
  constructor() {
    this.progress = this.loadProgress();
    this.earnedBadges = this.loadEarnedBadges();
    this.syncTimeout = null;
    this.onBadgeEarned = null; // Callback for badge unlock celebrations
    this.onSyncStart = null; // Callback when sync starts
    this.onSyncComplete = null; // Callback when sync completes
  }

  /**
   * Load progress from localStorage
   * @returns {Object} Progress object with tracking keys
   */
  loadProgress() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading badge progress:', error);
    }

    // Default progress structure
    return {
      aqi_checks: 0,
      last_check_date: null,
      reports_submitted: 0,
      upvotes_given: 0,
      downvotes_given: 0,
      quizzes_completed: 0,
      alerts_opened: 0,
      cities_viewed: []
    };
  }

  /**
   * Load earned badges from localStorage
   * @returns {Array} Array of earned badge objects
   */
  loadEarnedBadges() {
    try {
      const stored = localStorage.getItem(EARNED_BADGES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading earned badges:', error);
    }
    return [];
  }

  /**
   * Save progress to localStorage
   */
  saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch (error) {
      console.error('Error saving badge progress:', error);
    }
  }

  /**
   * Save earned badges to localStorage
   */
  saveEarnedBadges() {
    try {
      localStorage.setItem(EARNED_BADGES_KEY, JSON.stringify(this.earnedBadges));
    } catch (error) {
      console.error('Error saving earned badges:', error);
    }
  }

  /**
   * Initialize tracker with data from Supabase (called on login)
   * @param {Object} userData - User data from backend including badges
   */
  initialize(userData) {
    if (userData.badges && Array.isArray(userData.badges)) {
      this.earnedBadges = userData.badges;
      this.saveEarnedBadges();
    }

    // Initialize progress from earned badges if available
    if (userData.progress) {
      this.progress = { ...this.progress, ...userData.progress };
      this.saveProgress();
    }
  }

  /**
   * Track a user action and update progress
   * @param {string} actionType - Type of action (aqi_check, report_submit, etc.)
   * @param {*} data - Additional data for the action (e.g., city name)
   */
  trackAction(actionType, data = null) {
    switch (actionType) {
      case 'aqi_check':
        this.updateStreak();
        break;
      case 'report_submit':
        this.incrementCounter('reports_submitted');
        break;
      case 'upvote':
        this.incrementCounter('upvotes_given');
        break;
      case 'downvote':
        this.incrementCounter('downvotes_given');
        break;
      case 'quiz_complete':
        this.incrementCounter('quizzes_completed');
        break;
      case 'alert_opened':
        this.incrementCounter('alerts_opened');
        break;
      case 'city_view':
        if (data) {
          this.addToSet('cities_viewed', data);
        }
        break;
      default:
        console.warn(`Unknown action type: ${actionType}`);
        return;
    }

    this.saveProgress();
    this.checkBadgeUnlocks();
    this.scheduleSyncToSupabase();
  }

  /**
   * Update streak for consecutive AQI checks
   */
  updateStreak() {
    const today = new Date().toDateString();
    const lastCheck = this.progress.last_check_date;

    if (lastCheck) {
      const lastCheckDate = new Date(lastCheck);
      const todayDate = new Date(today);
      const diffTime = todayDate - lastCheckDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        // Consecutive day - increment streak
        this.progress.aqi_checks += 1;
      } else if (diffDays > 1) {
        // Streak broken - reset to 1
        this.progress.aqi_checks = 1;
      }
      // If diffDays === 0, same day - don't increment
    } else {
      // First check ever
      this.progress.aqi_checks = 1;
    }

    this.progress.last_check_date = today;
  }

  /**
   * Increment a counter in progress
   * @param {string} key - The tracking key to increment
   */
  incrementCounter(key) {
    if (typeof this.progress[key] === 'number') {
      this.progress[key] += 1;
    } else {
      this.progress[key] = 1;
    }
  }

  /**
   * Add an item to a set (array with unique values)
   * @param {string} key - The tracking key for the set
   * @param {*} value - The value to add to the set
   */
  addToSet(key, value) {
    if (!Array.isArray(this.progress[key])) {
      this.progress[key] = [];
    }

    // Only add if not already in the set
    if (!this.progress[key].includes(value)) {
      this.progress[key].push(value);
    }
  }

  /**
   * Check if any badges should be unlocked based on current progress
   */
  checkBadgeUnlocks() {
    const newlyEarned = [];

    BADGE_DEFINITIONS.forEach(badge => {
      // Skip if already earned
      if (this.hasBadge(badge.id)) {
        return;
      }

      // Check if eligible
      if (checkBadgeEligibility(badge.id, this.progress)) {
        this.awardBadge(badge);
        newlyEarned.push(badge);
      }
    });

    return newlyEarned;
  }

  /**
   * Check if user has earned a specific badge
   * @param {string} badgeId - The badge ID to check
   * @returns {boolean} True if badge is earned
   */
  hasBadge(badgeId) {
    return this.earnedBadges.some(badge => badge.name === badgeId || badge.id === badgeId);
  }

  /**
   * Award a badge to the user
   * @param {Object} badge - The badge definition object
   */
  awardBadge(badge) {
    const earnedBadge = {
      id: badge.id,
      name: badge.name,
      earned: new Date().toISOString(),
      progress: this.progress[badge.trackingKey]
    };

    this.earnedBadges.push(earnedBadge);
    this.saveEarnedBadges();

    // Trigger celebration callback if set
    if (this.onBadgeEarned) {
      this.onBadgeEarned(badge);
    }

    // Sync immediately when badge is earned
    this.syncToSupabase(true);
  }

  /**
   * Schedule a sync to Supabase with debouncing
   * @param {boolean} immediate - If true, sync immediately without delay
   */
  scheduleSyncToSupabase(immediate = false) {
    // Clear existing timeout
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }

    if (immediate) {
      this.syncToSupabase();
    } else {
      // Schedule sync after delay
      this.syncTimeout = setTimeout(() => {
        this.syncToSupabase();
      }, SYNC_DELAY);
    }
  }

  /**
   * Sync badges and progress to Supabase
   * @param {boolean} immediate - If true, this is an immediate sync (badge earned)
   * @returns {Promise} Promise that resolves when sync is complete
   */
  async syncToSupabase(immediate = false) {
    // Notify sync start
    if (this.onSyncStart) {
      this.onSyncStart();
    }

    try {
      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        console.warn('No user found, skipping badge sync');
        if (this.onSyncComplete) {
          this.onSyncComplete();
        }
        return;
      }

      const user = JSON.parse(userStr);
      if (!user.id) {
        console.warn('No user ID found, skipping badge sync');
        if (this.onSyncComplete) {
          this.onSyncComplete();
        }
        return;
      }

      const response = await axios.patch(
        `${API_URL}/auth/badges/${user.id}`,
        {
          badges: this.earnedBadges,
          progress: this.progress
        }
      );

      if (immediate) {
        console.log('Badge earned - synced immediately to Supabase');
      }

      // Notify sync complete
      if (this.onSyncComplete) {
        this.onSyncComplete();
      }

      return response.data;
    } catch (error) {
      console.error('Error syncing badges to Supabase:', error);
      
      // Notify sync complete even on error
      if (this.onSyncComplete) {
        this.onSyncComplete();
      }
      
      // Retry logic with exponential backoff
      if (error.response?.status !== 401) {
        // Don't retry on auth errors
        this.retrySync();
      }
      
      throw error;
    }
  }

  /**
   * Retry sync with exponential backoff (up to 3 attempts)
   */
  retrySync(attempt = 1) {
    if (attempt > 3) {
      console.error('Max retry attempts reached for badge sync');
      return;
    }

    const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
    setTimeout(() => {
      this.syncToSupabase()
        .catch(() => this.retrySync(attempt + 1));
    }, delay);
  }

  /**
   * Get current progress for all badges
   * @returns {Object} Object mapping badge IDs to progress info
   */
  getAllProgress() {
    const progressMap = {};
    
    BADGE_DEFINITIONS.forEach(badge => {
      const userProgress = this.progress[badge.trackingKey];
      let current = 0;

      if (Array.isArray(userProgress)) {
        current = userProgress.length;
      } else if (typeof userProgress === 'number') {
        current = userProgress;
      }

      progressMap[badge.id] = {
        current,
        threshold: badge.threshold,
        percentage: Math.min(100, Math.round((current / badge.threshold) * 100)),
        earned: this.hasBadge(badge.id)
      };
    });

    return progressMap;
  }

  /**
   * Clear all local data (called on logout)
   */
  clear() {
    this.progress = this.loadProgress(); // Reset to defaults
    this.earnedBadges = [];
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(EARNED_BADGES_KEY);
    
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
    }
  }
}

// Export singleton instance
export const badgeTracker = new BadgeTracker();
export default BadgeTracker;
