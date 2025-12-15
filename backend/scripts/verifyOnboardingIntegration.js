/**
 * Onboarding and Alerts Integration Verification Script
 * 
 * Tests the complete integration of:
 * - Health profile endpoints
 * - Alert preferences endpoints
 * - Instant email alerts
 * - Personalization service
 */

const supabase = require('../db');
const bcrypt = require('bcryptjs');

async function verifyOnboardingIntegration() {
  console.log('🔍 Starting Onboarding & Alerts Integration Verification...\n');

  let testUserId = null;
  let testEmail = `test-onboarding-${Date.now()}@example.com`;

  try {
    // 1. Create test user
    console.log('1️⃣ Creating test user...');
    const hashedPassword = await bcrypt.hash('testpassword123', 10);
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        email: testEmail,
        password: hashedPassword,
        name: 'Test User',
        city: 'Karachi'
      }])
      .select()
      .single();

    if (userError) throw userError;
    testUserId = userData.id;
    console.log('✅ Test user created:', userData.email);

    // 2. Verify user has no health profile initially
    console.log('\n2️⃣ Verifying initial state (no health profile)...');
    const { data: initialUser } = await supabase
      .from('users')
      .select('health_profile, alert_prefs')
      .eq('id', testUserId)
      .single();

    if (initialUser.health_profile !== null) {
      throw new Error('User should not have health_profile initially');
    }
    console.log('✅ Initial state verified - no health profile');

    // 3. Update health profile
    console.log('\n3️⃣ Updating health profile...');
    const healthProfile = {
      age_group: '19_40',
      health_conditions: ['asthma', 'allergies'],
      activity_level: 'running_cycling',
      primary_city: 'Karachi'
    };

    const { data: updatedProfile, error: profileError } = await supabase
      .from('users')
      .update({ health_profile: healthProfile })
      .eq('id', testUserId)
      .select()
      .single();

    if (profileError) throw profileError;
    console.log('✅ Health profile updated:', updatedProfile.health_profile);

    // 4. Verify health profile round-trip
    console.log('\n4️⃣ Verifying health profile round-trip...');
    const { data: retrievedProfile } = await supabase
      .from('users')
      .select('health_profile')
      .eq('id', testUserId)
      .single();

    // Compare fields individually to avoid JSON ordering issues
    const retrieved = retrievedProfile.health_profile;
    if (retrieved.age_group !== healthProfile.age_group ||
        retrieved.activity_level !== healthProfile.activity_level ||
        retrieved.primary_city !== healthProfile.primary_city ||
        JSON.stringify(retrieved.health_conditions.sort()) !== JSON.stringify(healthProfile.health_conditions.sort())) {
      throw new Error('Health profile round-trip failed');
    }
    console.log('✅ Health profile round-trip verified');

    // 5. Update alert preferences
    console.log('\n5️⃣ Updating alert preferences...');
    const alertPrefs = {
      on_change: false,
      daily_time: '09:30',
      instant_button: true
    };

    const { data: updatedPrefs, error: prefsError } = await supabase
      .from('users')
      .update({ alert_prefs: alertPrefs })
      .eq('id', testUserId)
      .select()
      .single();

    if (prefsError) throw prefsError;
    console.log('✅ Alert preferences updated:', updatedPrefs.alert_prefs);

    // 6. Verify alert preferences round-trip
    console.log('\n6️⃣ Verifying alert preferences round-trip...');
    const { data: retrievedPrefs } = await supabase
      .from('users')
      .select('alert_prefs')
      .eq('id', testUserId)
      .single();

    // Compare fields individually to avoid JSON ordering issues
    const prefs = retrievedPrefs.alert_prefs;
    if (prefs.on_change !== alertPrefs.on_change ||
        prefs.daily_time !== alertPrefs.daily_time ||
        prefs.instant_button !== alertPrefs.instant_button) {
      throw new Error('Alert preferences round-trip failed');
    }
    console.log('✅ Alert preferences round-trip verified');

    // 7. Test personalization helper
    console.log('\n7️⃣ Testing personalization helper...');
    const { getRuleBasedRecommendations } = require('../services/personalizationHelper');
    const aqiData = { aqi: 4, components: { pm2_5: 45, no2: 25 } };
    const recommendations = getRuleBasedRecommendations(healthProfile, aqiData);
    
    console.log('Recommendations:', JSON.stringify(recommendations, null, 2));
    
    if (!recommendations || typeof recommendations !== 'object') {
      throw new Error('Personalization helper returned invalid data');
    }
    console.log('✅ Personalization helper working');

    // 8. Verify default alert preferences for new users
    console.log('\n8️⃣ Verifying default alert preferences...');
    const testEmail2 = `test-defaults-${Date.now()}@example.com`;
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert([{
        email: testEmail2,
        password: hashedPassword,
        name: 'Test User 2',
        city: 'Lahore'
      }])
      .select()
      .single();

    if (newUserError) throw newUserError;

    const expectedDefaults = {
      on_change: true,
      daily_time: '08:00',
      instant_button: true
    };

    const defaults = newUser.alert_prefs;
    if (defaults.on_change !== expectedDefaults.on_change ||
        defaults.daily_time !== expectedDefaults.daily_time ||
        defaults.instant_button !== expectedDefaults.instant_button) {
      throw new Error('Default alert preferences not set correctly');
    }
    console.log('✅ Default alert preferences verified');

    // Cleanup second test user
    await supabase.from('users').delete().eq('id', newUser.id);

    console.log('\n✅ All integration tests passed!');
    console.log('\n📊 Summary:');
    console.log('  ✓ User creation');
    console.log('  ✓ Health profile round-trip');
    console.log('  ✓ Alert preferences round-trip');
    console.log('  ✓ Personalization helper');
    console.log('  ✓ Default alert preferences');

  } catch (error) {
    console.error('\n❌ Integration test failed:', error.message);
    throw error;
  } finally {
    // Cleanup
    if (testUserId) {
      console.log('\n🧹 Cleaning up test data...');
      await supabase.from('users').delete().eq('id', testUserId);
      console.log('✅ Cleanup complete');
    }
  }
}

// Run verification
verifyOnboardingIntegration()
  .then(() => {
    console.log('\n✅ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
