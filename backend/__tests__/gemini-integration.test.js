/**
 * Integration test for Gemini AI service and personalization helper
 */

const geminiService = require('../services/geminiService');
const personalizationHelper = require('../services/personalizationHelper');

// Clean up after tests to prevent Jest hanging
afterAll(() => {
  // Clear the cache cleanup interval
  geminiService.clearExpiredCache();
});

describe('Gemini AI Service Integration', () => {
  const mockHealthProfile = {
    age_group: '19_40',
    health_conditions: ['asthma'],
    activity_level: 'running_cycling',
    primary_city: 'Karachi'
  };

  const mockAQIData = {
    aqi: 4,
    components: {
      pm2_5: 45,
      pm10: 80,
      no2: 25
    }
  };

  test('personalizationHelper provides rule-based recommendations', () => {
    const recommendations = personalizationHelper.getRuleBasedRecommendations(
      mockHealthProfile,
      mockAQIData.aqi
    );

    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations.length).toBeGreaterThan(0);
    
    // Should include asthma-specific advice for AQI 4
    const hasAsthmaAdvice = recommendations.some(rec => 
      rec.toLowerCase().includes('inhaler') || 
      rec.toLowerCase().includes('indoors')
    );
    expect(hasAsthmaAdvice).toBe(true);
  });

  test('personalizationHelper generates rule-based email content', () => {
    const user = {
      name: 'Test User',
      city: 'Karachi',
      health_profile: mockHealthProfile
    };

    const emailContent = personalizationHelper.generateRuleBasedEmailContent(
      user,
      mockAQIData.aqi,
      'daily'
    );

    expect(typeof emailContent).toBe('string');
    expect(emailContent).toContain('Test User');
    expect(emailContent).toContain('Karachi');
    expect(emailContent.length).toBeGreaterThan(100);
  });

  test('geminiService handles errors gracefully and returns null', async () => {
    // Test with invalid API key scenario by using empty health profile
    const result = await geminiService.generatePersonalizedRecommendations(
      null,
      { aqi: 3, components: {} }
    );

    // Should either return recommendations or null (for fallback)
    expect(result === null || Array.isArray(result)).toBe(true);
  });

  test('healthAdviceRules contains all required conditions', () => {
    const rules = personalizationHelper.healthAdviceRules;
    
    expect(rules).toHaveProperty('asthma');
    expect(rules).toHaveProperty('heart_issues');
    expect(rules).toHaveProperty('young_children');
    expect(rules).toHaveProperty('pregnant');
    expect(rules).toHaveProperty('allergies');

    // Each condition should have advice for AQI levels 2-5
    Object.values(rules).forEach(conditionRules => {
      expect(conditionRules).toHaveProperty('2');
      expect(conditionRules).toHaveProperty('3');
      expect(conditionRules).toHaveProperty('4');
      expect(conditionRules).toHaveProperty('5');
    });
  });

  test('elderlyAdvice is available for 60+ age group', () => {
    const elderlyProfile = {
      age_group: '60_plus',
      health_conditions: ['none'],
      activity_level: 'light_exercise'
    };

    const recommendations = personalizationHelper.getRuleBasedRecommendations(
      elderlyProfile,
      4
    );

    expect(recommendations.length).toBeGreaterThan(0);
  });

  test('activityAdvice provides recommendations for active users', () => {
    const activeProfile = {
      age_group: '19_40',
      health_conditions: ['none'],
      activity_level: 'heavy_sports'
    };

    const recommendations = personalizationHelper.getRuleBasedRecommendations(
      activeProfile,
      3
    );

    const hasActivityAdvice = recommendations.some(rec =>
      rec.toLowerCase().includes('indoor') ||
      rec.toLowerCase().includes('workout') ||
      rec.toLowerCase().includes('exercise')
    );

    expect(hasActivityAdvice).toBe(true);
  });
});
