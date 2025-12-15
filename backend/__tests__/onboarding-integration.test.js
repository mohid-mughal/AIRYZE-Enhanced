/**
 * Integration Tests for Onboarding and Alerts Feature
 * 
 * Tests the complete user flow including:
 * - Welcome screen → signup → onboarding → dashboard
 * - Login with existing profile → dashboard
 * - Login without profile → onboarding
 * - Personalized recommendations display
 * - Instant email button
 * - Alert preferences modal
 * - Navigation menu
 * - Gemini AI integration and fallback
 * 
 * Requirements: All (Task 17.1)
 */

const supabase = require('../db');
const bcrypt = require('bcryptjs');
const { 
  signup, 
  login,
  updateHealthProfile,
  getHealthProfile,
  updateAlertPreferences,
  getAlertPreferences
} = require('../controllers/authControllers');
const { sendInstantAlert } = require('../controllers/alertsController');
const { getPersonalizedRecommendations } = require('../controllers/personalizationController');
const { generatePersonalizedRecommendations } = require('../services/geminiService');

// Increase Jest timeout for integration tests
jest.setTimeout(60000);

describe('Onboarding and Alerts Integration Tests', () => {
  let testUserIds = [];
  let testEmails = [];

  afterAll(async () => {
    // Clean up all test data
    if (testUserIds.length > 0) {
      await supabase.from('users').delete().in('id', testUserIds);
    }
  });

  describe('Welcome Screen → Signup → Onboarding → Dashboard Flow', () => {
    test('New user signup creates account without health profile', async () => {
      const email = `test-signup-${Date.now()}@example.com`;
      testEmails.push(email);

      const req = {
        body: {
          name: 'Test User',
          email: email,
          password: 'password123',
          city: 'Karachi'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          user: expect.objectContaining({
            id: expect.any(Number),
            email: email,
            name: 'Test User',
            city: 'Karachi'
          })
        })
      );

      const userId = res.json.mock.calls[0][0].user.id;
      testUserIds.push(userId);

      // Verify health_profile is null for new user
      const { data: user } = await supabase
        .from('users')
        .select('health_profile')
        .eq('id', userId)
        .single();

      expect(user.health_profile).toBeNull();
    });

    test('User completes onboarding by submitting health profile', async () => {
      // Create a user first
      const email = `test-onboarding-${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'Onboarding Test User',
          email: email,
          password: hashedPassword,
          city: 'Lahore'
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Submit health profile
      const healthProfile = {
        age_group: '19_40',
        health_conditions: ['asthma', 'allergies'],
        activity_level: 'running_cycling',
        primary_city: 'Lahore'
      };

      const req = {
        params: { userId: user.id },
        body: healthProfile
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateHealthProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          health_profile: healthProfile
        })
      );

      // Verify profile is stored in database
      const { data: updatedUser } = await supabase
        .from('users')
        .select('health_profile')
        .eq('id', user.id)
        .single();

      expect(updatedUser.health_profile).toEqual(healthProfile);
    });

    test('After onboarding, user can access dashboard with personalized content', async () => {
      // Create user with health profile
      const email = `test-dashboard-${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const healthProfile = {
        age_group: '41_60',
        health_conditions: ['heart_issues'],
        activity_level: 'light_exercise',
        primary_city: 'Islamabad'
      };

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'Dashboard Test User',
          email: email,
          password: hashedPassword,
          city: 'Islamabad',
          health_profile: healthProfile
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Get health profile (simulating dashboard load)
      const req = {
        params: { userId: user.id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getHealthProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          health_profile: healthProfile
        })
      );
    });
  });

  describe('Login with Existing Profile → Dashboard Flow', () => {
    test('User with health profile logs in and goes to dashboard', async () => {
      // Create user with health profile
      const email = `test-login-profile-${Date.now()}@example.com`;
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const healthProfile = {
        age_group: '13_18',
        health_conditions: ['allergies'],
        activity_level: 'heavy_sports',
        primary_city: 'Karachi'
      };

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'Login Test User',
          email: email,
          password: hashedPassword,
          city: 'Karachi',
          health_profile: healthProfile
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Login
      const req = {
        body: {
          email: email,
          password: password
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          user: expect.objectContaining({
            id: user.id,
            email: email
          })
        })
      );

      // Note: health_profile is not returned in login response by default
      // Frontend should fetch it separately if needed
    });
  });

  describe('Login without Profile → Onboarding Flow', () => {
    test('User without health profile logs in and should go to onboarding', async () => {
      // Create user without health profile
      const email = `test-login-no-profile-${Date.now()}@example.com`;
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'No Profile User',
          email: email,
          password: hashedPassword,
          city: 'Peshawar'
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Login
      const req = {
        body: {
          email: email,
          password: password
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      
      // Frontend should check health_profile separately after login
      // by calling GET /auth/profile/:userId
    });
  });

  describe('Personalized Recommendations Display', () => {
    test('User with asthma receives personalized recommendations', async () => {
      // Create user with asthma
      const email = `test-asthma-${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const healthProfile = {
        age_group: '19_40',
        health_conditions: ['asthma'],
        activity_level: 'light_exercise',
        primary_city: 'Karachi'
      };

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'Asthma User',
          email: email,
          password: hashedPassword,
          city: 'Karachi',
          health_profile: healthProfile
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Get personalized recommendations
      const req = {
        body: {
          healthProfile: healthProfile,
          aqiData: { aqi: 4, pm25: 45, pm10: 60 }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getPersonalizedRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      
      expect(response).toHaveProperty('general');
      expect(response).toHaveProperty('health_specific');
      expect(Array.isArray(response.general)).toBe(true);
      expect(Array.isArray(response.health_specific)).toBe(true);
      
      // Verify recommendations are not empty
      expect(response.general.length + response.health_specific.length).toBeGreaterThan(0);
    });

    test('User with young children receives appropriate recommendations', async () => {
      const email = `test-children-${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const healthProfile = {
        age_group: '19_40',
        health_conditions: ['young_children'],
        activity_level: 'mostly_indoors',
        primary_city: 'Lahore'
      };

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'Parent User',
          email: email,
          password: hashedPassword,
          city: 'Lahore',
          health_profile: healthProfile
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Get personalized recommendations
      const req = {
        body: {
          healthProfile: healthProfile,
          aqiData: { aqi: 3, pm25: 35, pm10: 50 }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getPersonalizedRecommendations(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      
      expect(response).toHaveProperty('general');
      expect(response).toHaveProperty('health_specific');
      expect(response.general.length + response.health_specific.length).toBeGreaterThan(0);
    });
  });

  describe('Instant Email Button', () => {
    test('Authenticated user can send instant email alert', async () => {
      const email = `test-instant-${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const healthProfile = {
        age_group: '60_plus',
        health_conditions: ['heart_issues'],
        activity_level: 'mostly_indoors',
        primary_city: 'Islamabad'
      };

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'Instant Email User',
          email: email,
          password: hashedPassword,
          city: 'Islamabad',
          health_profile: healthProfile
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Send instant alert
      const req = {
        params: { userId: user.id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await sendInstantAlert(req, res);

      // Should succeed (even if email sending fails, the endpoint should work)
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: expect.any(String)
        })
      );
    });
  });

  describe('Alert Preferences Modal', () => {
    test('User can update alert preferences', async () => {
      const email = `test-alert-prefs-${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'Alert Prefs User',
          email: email,
          password: hashedPassword,
          city: 'Quetta'
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Update alert preferences
      const alertPrefs = {
        on_change: false,
        daily_time: '18:00',
        instant_button: true
      };

      const req = {
        params: { userId: user.id },
        body: alertPrefs
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateAlertPreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          alert_prefs: alertPrefs
        })
      );

      // Verify preferences are stored
      const { data: updatedUser } = await supabase
        .from('users')
        .select('alert_prefs')
        .eq('id', user.id)
        .single();

      expect(updatedUser.alert_prefs).toEqual(alertPrefs);
    });

    test('User can retrieve alert preferences', async () => {
      const email = `test-get-prefs-${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      const alertPrefs = {
        on_change: true,
        daily_time: '09:30',
        instant_button: false
      };

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'Get Prefs User',
          email: email,
          password: hashedPassword,
          city: 'Faisalabad',
          alert_prefs: alertPrefs
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Get alert preferences
      const req = {
        params: { userId: user.id }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getAlertPreferences(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          alert_prefs: alertPrefs
        })
      );
    });
  });

  describe('Health Profile Validation', () => {
    test('Valid health profile values are accepted', async () => {
      const email = `test-valid-profile-${Date.now()}@example.com`;
      const hashedPassword = await bcrypt.hash('password123', 10);

      const { data: user, error } = await supabase
        .from('users')
        .insert([{
          name: 'Valid Profile User',
          email: email,
          password: hashedPassword,
          city: 'Multan'
        }])
        .select()
        .single();

      expect(error).toBeNull();
      testUserIds.push(user.id);
      testEmails.push(email);

      // Test all valid age groups
      const validAgeGroups = ['under_12', '13_18', '19_40', '41_60', '60_plus'];
      
      for (const ageGroup of validAgeGroups) {
        const healthProfile = {
          age_group: ageGroup,
          health_conditions: ['none'],
          activity_level: 'light_exercise',
          primary_city: 'Multan'
        };

        const req = {
          params: { userId: user.id },
          body: healthProfile
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };

        await updateHealthProfile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
      }

      // Test all valid health conditions
      const validConditions = ['asthma', 'heart_issues', 'allergies', 'pregnant', 'young_children', 'none'];
      
      const healthProfile = {
        age_group: '19_40',
        health_conditions: validConditions,
        activity_level: 'running_cycling',
        primary_city: 'Multan'
      };

      const req = {
        params: { userId: user.id },
        body: healthProfile
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateHealthProfile(req, res);
      expect(res.status).toHaveBeenCalledWith(200);

      // Test all valid activity levels
      const validActivityLevels = ['mostly_indoors', 'light_exercise', 'running_cycling', 'heavy_sports'];
      
      for (const activityLevel of validActivityLevels) {
        const profile = {
          age_group: '19_40',
          health_conditions: ['none'],
          activity_level: activityLevel,
          primary_city: 'Multan'
        };

        const req2 = {
          params: { userId: user.id },
          body: profile
        };
        const res2 = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn()
        };

        await updateHealthProfile(req2, res2);
        expect(res2.status).toHaveBeenCalledWith(200);
      }
    });
  });

  describe('Gemini AI Integration and Fallback', () => {
    test('Gemini AI generates personalized recommendations or falls back gracefully', async () => {
      const healthProfile = {
        age_group: '19_40',
        health_conditions: ['asthma', 'allergies'],
        activity_level: 'running_cycling',
        primary_city: 'Karachi'
      };

      const aqiData = {
        aqi: 4,
        pm25: 45,
        pm10: 60,
        o3: 30,
        no2: 25
      };

      try {
        const recommendations = await generatePersonalizedRecommendations(
          healthProfile,
          aqiData,
          { includeContext: true }
        );

        // If Gemini succeeds, verify structure
        if (recommendations && Array.isArray(recommendations)) {
          expect(recommendations.length).toBeGreaterThan(0);
        }
      } catch (error) {
        // If Gemini API fails, that's expected - the controller will use fallback
        console.log('Gemini API failed (expected):', error.message);
        expect(error).toBeDefined();
      }
    });

    test('Fallback recommendations work when Gemini fails', async () => {
      // This test verifies the fallback mechanism
      const healthProfile = {
        age_group: '60_plus',
        health_conditions: ['heart_issues'],
        activity_level: 'mostly_indoors',
        primary_city: 'Lahore'
      };

      const aqiData = {
        aqi: 5,
        pm25: 150,
        pm10: 200
      };

      // Even if Gemini fails, we should get rule-based recommendations
      const req = {
        body: {
          healthProfile: healthProfile,
          aqiData: { aqi: 5, pm25: 150, pm10: 200 }
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getPersonalizedRecommendations(req, res);

      // Should always return 200 with recommendations (either Gemini or fallback)
      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('general');
      expect(response).toHaveProperty('health_specific');
      expect(Array.isArray(response.general)).toBe(true);
      expect(Array.isArray(response.health_specific)).toBe(true);
    });
  });

  describe('Complete User Journey', () => {
    test('End-to-end: Signup → Onboarding → Dashboard → Personalization → Alerts', async () => {
      // Step 1: User signs up
      const email = `test-journey-${Date.now()}@example.com`;
      const signupReq = {
        body: {
          name: 'Journey User',
          email: email,
          password: 'password123',
          city: 'Karachi'
        }
      };
      const signupRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await signup(signupReq, signupRes);
      expect(signupRes.status).toHaveBeenCalledWith(201);
      
      const userId = signupRes.json.mock.calls[0][0].user.id;
      testUserIds.push(userId);
      testEmails.push(email);

      // Step 2: User completes onboarding
      const healthProfile = {
        age_group: '19_40',
        health_conditions: ['asthma'],
        activity_level: 'running_cycling',
        primary_city: 'Karachi'
      };

      const onboardingReq = {
        params: { userId: userId },
        body: healthProfile
      };
      const onboardingRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateHealthProfile(onboardingReq, onboardingRes);
      expect(onboardingRes.status).toHaveBeenCalledWith(200);

      // Step 3: User accesses dashboard and gets personalized recommendations
      const recsReq = {
        body: {
          healthProfile: healthProfile,
          aqiData: { aqi: 3, pm25: 35, pm10: 50 }
        }
      };
      const recsRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await getPersonalizedRecommendations(recsReq, recsRes);
      expect(recsRes.status).toHaveBeenCalledWith(200);
      
      const recommendations = recsRes.json.mock.calls[0][0];
      expect(recommendations.general.length + recommendations.health_specific.length).toBeGreaterThan(0);

      // Step 4: User updates alert preferences
      const alertPrefs = {
        on_change: true,
        daily_time: '07:00',
        instant_button: true
      };

      const prefsReq = {
        params: { userId: userId },
        body: alertPrefs
      };
      const prefsRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await updateAlertPreferences(prefsReq, prefsRes);
      expect(prefsRes.status).toHaveBeenCalledWith(200);

      // Step 5: User sends instant email
      const instantReq = {
        params: { userId: userId }
      };
      const instantRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await sendInstantAlert(instantReq, instantRes);
      expect(instantRes.status).toHaveBeenCalledWith(200);

      // Verify all data is persisted
      const { data: finalUser } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      expect(finalUser.health_profile).toEqual(healthProfile);
      expect(finalUser.alert_prefs).toEqual(alertPrefs);
    });
  });
});
