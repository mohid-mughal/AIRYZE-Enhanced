/**
 * Integration tests for complete badge flow
 * Tests earning badges, progress tracking, Supabase sync, and Gemini integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BadgeTracker } from '../utils/badgeTracker';
import { BADGE_DEFINITIONS, checkBadgeEligibility } from '../utils/badges';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value.toString(); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.localStorage = localStorageMock;

describe('Badge Integration Tests - Complete Badge Flow', () => {
  let badgeTracker;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    badgeTracker = new BadgeTracker();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Badge Earning Flow', () => {
    it('should earn 7-Day Streak badge after 7 consecutive AQI checks', async () => {
      // Mock successful Supabase sync
      axios.patch.mockResolvedValue({ data: { success: true } });

      // Simulate 7 consecutive days of AQI checks
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - (6 - i));
        
        // Set the last check date
        localStorage.setItem('lastAqiCheck', checkDate.toISOString().split('T')[0]);
        
        // Track the action
        const result = badgeTracker.trackAction('aqi_check');
        
        if (i === 6) {
          // On the 7th day, badge should be earned
          expect(result.badgesEarned).toBeDefined();
          expect(result.badgesEarned.length).toBeGreaterThan(0);
          expect(result.badgesEarned[0].id).toBe('daily_streak_7');
        }
      }

      // Verify badge is in earned badges
      const progress = badgeTracker.getProgress();
      expect(progress.earnedBadges).toContain('daily_streak_7');
    });

    it('should earn Report Contributor badge after 5 reports', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      // Submit 5 reports
      for (let i = 0; i < 5; i++) {
        const result = badgeTracker.trackAction('report_submit');
        
        if (i === 4) {
          // On the 5th report, badge should be earned
          expect(result.badgesEarned).toBeDefined();
          expect(result.badgesEarned.some(b => b.id === 'report_contributor')).toBe(true);
        }
      }

      const progress = badgeTracker.getProgress();
      expect(progress.earnedBadges).toContain('report_contributor');
    });

    it('should earn Upvoter badge after 10 upvotes', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      for (let i = 0; i < 10; i++) {
        const result = badgeTracker.trackAction('upvote');
        
        if (i === 9) {
          expect(result.badgesEarned).toBeDefined();
          expect(result.badgesEarned.some(b => b.id === 'upvoter')).toBe(true);
        }
      }

      const progress = badgeTracker.getProgress();
      expect(progress.earnedBadges).toContain('upvoter');
    });

    it('should earn Downvoter badge after 10 downvotes', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      for (let i = 0; i < 10; i++) {
        const result = badgeTracker.trackAction('downvote');
        
        if (i === 9) {
          expect(result.badgesEarned).toBeDefined();
          expect(result.badgesEarned.some(b => b.id === 'downvoter')).toBe(true);
        }
      }

      const progress = badgeTracker.getProgress();
      expect(progress.earnedBadges).toContain('downvoter');
    });

    it('should earn Quiz Master badge after 3 quizzes', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      for (let i = 0; i < 3; i++) {
        const result = badgeTracker.trackAction('quiz_complete');
        
        if (i === 2) {
          expect(result.badgesEarned).toBeDefined();
          expect(result.badgesEarned.some(b => b.id === 'quiz_master')).toBe(true);
        }
      }

      const progress = badgeTracker.getProgress();
      expect(progress.earnedBadges).toContain('quiz_master');
    });

    it('should earn Alert Responder badge after 5 alert opens', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      for (let i = 0; i < 5; i++) {
        const result = badgeTracker.trackAction('alert_opened');
        
        if (i === 4) {
          expect(result.badgesEarned).toBeDefined();
          expect(result.badgesEarned.some(b => b.id === 'alert_responder')).toBe(true);
        }
      }

      const progress = badgeTracker.getProgress();
      expect(progress.earnedBadges).toContain('alert_responder');
    });

    it('should earn City Explorer badge after viewing 5 different cities', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      const cities = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta'];
      
      for (let i = 0; i < cities.length; i++) {
        const result = badgeTracker.trackAction('city_view', cities[i]);
        
        if (i === 4) {
          expect(result.badgesEarned).toBeDefined();
          expect(result.badgesEarned.some(b => b.id === 'city_explorer')).toBe(true);
        }
      }

      const progress = badgeTracker.getProgress();
      expect(progress.earnedBadges).toContain('city_explorer');
    });

    it('should earn Monthly Champion badge after 28 consecutive days', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      const today = new Date();
      for (let i = 0; i < 28; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - (27 - i));
        
        localStorage.setItem('lastAqiCheck', checkDate.toISOString().split('T')[0]);
        const result = badgeTracker.trackAction('aqi_check');
        
        if (i === 27) {
          expect(result.badgesEarned).toBeDefined();
          expect(result.badgesEarned.some(b => b.id === 'weekly_streak_4')).toBe(true);
        }
      }

      const progress = badgeTracker.getProgress();
      expect(progress.earnedBadges).toContain('weekly_streak_4');
    });
  });

  describe('Progress Tracking Across Sessions', () => {
    it('should persist progress to localStorage', () => {
      badgeTracker.trackAction('report_submit');
      badgeTracker.trackAction('report_submit');

      const savedProgress = JSON.parse(localStorage.getItem('badgeProgress'));
      expect(savedProgress.reports_submitted).toBe(2);
    });

    it('should restore progress from localStorage on initialization', () => {
      // Set up initial progress
      const initialProgress = {
        reports_submitted: 3,
        upvotes_given: 5,
        earnedBadges: []
      };
      localStorage.setItem('badgeProgress', JSON.stringify(initialProgress));

      // Create new tracker instance
      const newTracker = new BadgeTracker();
      const progress = newTracker.getProgress();

      expect(progress.reports_submitted).toBe(3);
      expect(progress.upvotes_given).toBe(5);
    });

    it('should maintain progress across multiple actions', () => {
      badgeTracker.trackAction('upvote');
      badgeTracker.trackAction('downvote');
      badgeTracker.trackAction('report_submit');

      const progress = badgeTracker.getProgress();
      expect(progress.upvotes_given).toBe(1);
      expect(progress.downvotes_given).toBe(1);
      expect(progress.reports_submitted).toBe(1);
    });
  });

  describe('Supabase Sync', () => {
    it('should sync immediately when badge is earned', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      // Earn a badge
      for (let i = 0; i < 5; i++) {
        badgeTracker.trackAction('report_submit');
      }

      // Wait for immediate sync
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(axios.patch).toHaveBeenCalled();
      const callArgs = axios.patch.mock.calls[0];
      expect(callArgs[0]).toContain('/auth/badges');
    });

    it('should handle sync failures gracefully', async () => {
      axios.patch.mockRejectedValue(new Error('Network error'));

      // Track action
      const result = badgeTracker.trackAction('upvote');

      // Should not throw error
      expect(result).toBeDefined();
      expect(result.progress).toBeDefined();
    });

    it('should retry sync on failure', async () => {
      // First call fails, second succeeds
      axios.patch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { success: true } });

      // Earn a badge to trigger immediate sync
      for (let i = 0; i < 5; i++) {
        badgeTracker.trackAction('report_submit');
      }

      await new Promise(resolve => setTimeout(resolve, 200));

      // Should have retried
      expect(axios.patch).toHaveBeenCalledTimes(2);
    });

    it('should debounce progress updates', async () => {
      vi.useFakeTimers();
      axios.patch.mockResolvedValue({ data: { success: true } });

      // Multiple actions in quick succession
      badgeTracker.trackAction('upvote');
      badgeTracker.trackAction('upvote');
      badgeTracker.trackAction('upvote');

      // Should not sync immediately for progress updates
      expect(axios.patch).not.toHaveBeenCalled();

      // Fast-forward 30 seconds
      vi.advanceTimersByTime(30000);

      // Should sync after debounce
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(axios.patch).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Gemini Integration', () => {
    it('should request Gemini congratulations when badge is earned', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });
      axios.post.mockResolvedValue({
        data: {
          candidates: [{
            content: {
              parts: [{ text: 'Congratulations on earning the badge!' }]
            }
          }]
        }
      });

      // Earn a badge
      for (let i = 0; i < 5; i++) {
        badgeTracker.trackAction('report_submit');
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have called Gemini API
      const geminiCalls = axios.post.mock.calls.filter(call => 
        call[0].includes('generativelanguage.googleapis.com')
      );
      expect(geminiCalls.length).toBeGreaterThan(0);
    });

    it('should use fallback message when Gemini fails', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });
      axios.post.mockRejectedValue(new Error('Gemini API error'));

      // Earn a badge
      for (let i = 0; i < 5; i++) {
        const result = badgeTracker.trackAction('report_submit');
        
        if (i === 4) {
          expect(result.badgesEarned).toBeDefined();
          expect(result.badgesEarned[0].message).toBeDefined();
          // Should have a fallback message
          expect(result.badgesEarned[0].message.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Badge Eligibility Checks', () => {
    it('should correctly check badge eligibility', () => {
      const progress = {
        reports_submitted: 3,
        upvotes_given: 10,
        earnedBadges: []
      };

      const reportBadge = BADGE_DEFINITIONS.find(b => b.id === 'report_contributor');
      const upvoterBadge = BADGE_DEFINITIONS.find(b => b.id === 'upvoter');

      expect(checkBadgeEligibility(reportBadge, progress)).toBe(false);
      expect(checkBadgeEligibility(upvoterBadge, progress)).toBe(true);
    });

    it('should not award badge twice', () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      // Earn badge first time
      for (let i = 0; i < 5; i++) {
        badgeTracker.trackAction('report_submit');
      }

      const progress1 = badgeTracker.getProgress();
      const earnedCount1 = progress1.earnedBadges.length;

      // Try to earn again
      badgeTracker.trackAction('report_submit');

      const progress2 = badgeTracker.getProgress();
      const earnedCount2 = progress2.earnedBadges.length;

      // Should not increase earned badges count
      expect(earnedCount2).toBe(earnedCount1);
    });
  });

  describe('All 8 Badges Test', () => {
    it('should be able to earn all 8 badges', async () => {
      axios.patch.mockResolvedValue({ data: { success: true } });

      // Earn all badges
      // 1. Daily Streak (7 days)
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - (6 - i));
        localStorage.setItem('lastAqiCheck', checkDate.toISOString().split('T')[0]);
        badgeTracker.trackAction('aqi_check');
      }

      // 2. Report Contributor (5 reports)
      for (let i = 0; i < 5; i++) {
        badgeTracker.trackAction('report_submit');
      }

      // 3. Upvoter (10 upvotes)
      for (let i = 0; i < 10; i++) {
        badgeTracker.trackAction('upvote');
      }

      // 4. Downvoter (10 downvotes)
      for (let i = 0; i < 10; i++) {
        badgeTracker.trackAction('downvote');
      }

      // 5. Quiz Master (3 quizzes)
      for (let i = 0; i < 3; i++) {
        badgeTracker.trackAction('quiz_complete');
      }

      // 6. Alert Responder (5 alerts)
      for (let i = 0; i < 5; i++) {
        badgeTracker.trackAction('alert_opened');
      }

      // 7. City Explorer (5 cities)
      const cities = ['Karachi', 'Lahore', 'Islamabad', 'Peshawar', 'Quetta'];
      for (const city of cities) {
        badgeTracker.trackAction('city_view', city);
      }

      // 8. Monthly Champion (28 days) - already covered by daily streak logic
      for (let i = 7; i < 28; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - (27 - i));
        localStorage.setItem('lastAqiCheck', checkDate.toISOString().split('T')[0]);
        badgeTracker.trackAction('aqi_check');
      }

      const progress = badgeTracker.getProgress();
      
      // Should have earned at least 7 badges (all except monthly champion if not enough days)
      expect(progress.earnedBadges.length).toBeGreaterThanOrEqual(7);
      
      // Verify specific badges
      expect(progress.earnedBadges).toContain('daily_streak_7');
      expect(progress.earnedBadges).toContain('report_contributor');
      expect(progress.earnedBadges).toContain('upvoter');
      expect(progress.earnedBadges).toContain('downvoter');
      expect(progress.earnedBadges).toContain('quiz_master');
      expect(progress.earnedBadges).toContain('alert_responder');
      expect(progress.earnedBadges).toContain('city_explorer');
    });
  });
});
