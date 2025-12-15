/**
 * Verification script for alert_prefs column
 * Checks if the alert_prefs column exists in the users table
 */

const supabase = require('../db');

async function verifyAlertPrefsColumn() {
  console.log('Verifying alert_prefs column...\n');

  try {
    // Try to query the users table with alert_prefs column
    const { data, error } = await supabase
      .from('users')
      .select('id, email, alert_prefs')
      .limit(5);

    if (error) {
      console.error('❌ Error querying users table:', error.message);
      console.error('Error code:', error.code);
      
      if (error.message.includes('alert_prefs')) {
        console.log('\n⚠️  The alert_prefs column does not exist yet.');
        console.log('Please run the migration: supabase/migrations/20241206000003_add_health_profile_and_alert_prefs.sql');
      }
      
      process.exit(1);
    }

    console.log('✅ alert_prefs column exists in users table');
    
    if (data && data.length > 0) {
      console.log(`\nFound ${data.length} user(s):`);
      data.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Alert Prefs: ${JSON.stringify(user.alert_prefs, null, 2)}`);
      });
    } else {
      console.log('\nNo users found in the database.');
      console.log('The column exists and is ready to use.');
    }

    console.log('\n✅ Verification complete!');
    process.exit(0);

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

verifyAlertPrefsColumn();
