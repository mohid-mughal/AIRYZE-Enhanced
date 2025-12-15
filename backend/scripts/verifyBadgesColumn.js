/**
 * Verification script for badges column migration
 * Checks if the badges column was successfully added to the users table
 * 
 * Usage: Run from backend directory
 *   cd backend && node scripts/verifyBadgesColumn.js
 */

const supabase = require('../db');

async function verifyBadgesColumn() {
  console.log('Verifying badges column migration...\n');

  try {
    // Test 1: Check if we can query the badges column
    console.log('Test 1: Querying badges column...');
    const { data: users, error: queryError } = await supabase
      .from('users')
      .select('id, email, badges')
      .limit(1);

    if (queryError) {
      console.error('❌ Failed to query badges column:', queryError.message);
      return false;
    }
    console.log('✅ Badges column exists and is queryable');

    // Test 2: Insert a test user with badges
    console.log('\nTest 2: Inserting test user with badges...');
    const testEmail = `test_badges_${Date.now()}@example.com`;
    const testBadges = [
      {
        name: '7-Day Streak',
        earned: new Date().toISOString(),
        progress: 7
      }
    ];

    const { data: insertedUser, error: insertError } = await supabase
      .from('users')
      .insert({
        name: 'Test Badges User',
        email: testEmail,
        password: 'test_password_hash',
        city: 'Karachi',
        badges: testBadges
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert user with badges:', insertError.message);
      return false;
    }
    console.log('✅ Successfully inserted user with badges');
    console.log('   User ID:', insertedUser.id);
    console.log('   Badges:', JSON.stringify(insertedUser.badges, null, 2));

    // Test 3: Update badges
    console.log('\nTest 3: Updating badges...');
    const updatedBadges = [
      ...testBadges,
      {
        name: 'Quiz Master',
        earned: new Date().toISOString(),
        progress: 3
      }
    ];

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ badges: updatedBadges })
      .eq('id', insertedUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update badges:', updateError.message);
      return false;
    }
    console.log('✅ Successfully updated badges');
    console.log('   Updated badges count:', updatedUser.badges.length);

    // Test 4: Query with JSONB operations
    console.log('\nTest 4: Testing JSONB query operations...');
    const { data: usersWithBadges, error: jsonbError } = await supabase
      .from('users')
      .select('id, email, badges')
      .not('badges', 'eq', '[]')
      .limit(5);

    if (jsonbError) {
      console.error('❌ Failed JSONB query:', jsonbError.message);
      return false;
    }
    console.log('✅ JSONB queries working correctly');
    console.log(`   Found ${usersWithBadges.length} users with badges`);

    // Cleanup: Delete test user
    console.log('\nCleaning up test data...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', insertedUser.id);

    if (deleteError) {
      console.error('⚠️  Warning: Failed to delete test user:', deleteError.message);
    } else {
      console.log('✅ Test user deleted successfully');
    }

    console.log('\n✅ All tests passed! Badges column migration successful.');
    return true;

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

// Run verification
verifyBadgesColumn()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

