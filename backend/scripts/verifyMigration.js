/**
 * Verify that health_profile and alert_prefs columns exist
 */

const supabase = require('../db');

async function verifyMigration() {
  console.log('Verifying migration...\n');
  
  try {
    // Try to query with the new columns
    const { data, error } = await supabase
      .from('users')
      .select('id, email, health_profile, alert_prefs')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Migration successful! Columns exist.');
    console.log('Sample query result:', data);
    process.exit(0);
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

verifyMigration();
