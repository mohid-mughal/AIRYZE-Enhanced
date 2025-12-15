/**
 * Add badge_progress column to users table
 * Run this script to apply the migration: node backend/scripts/addBadgeProgressColumn.js
 */

const supabase = require('../db');

async function addBadgeProgressColumn() {
  try {
    console.log('Adding badge_progress column to users table...');

    // Execute the migration SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS badge_progress JSONB DEFAULT '{}'::jsonb;
      `
    });

    if (error) {
      // Try alternative approach using direct query
      console.log('Trying alternative approach...');
      const { error: altError } = await supabase
        .from('users')
        .select('badge_progress')
        .limit(1);

      if (altError && altError.message.includes('column "badge_progress" does not exist')) {
        console.error('\n⚠️  Migration needed!');
        console.error('Please run this SQL in your Supabase SQL Editor:');
        console.error('\nALTER TABLE users ADD COLUMN IF NOT EXISTS badge_progress JSONB DEFAULT \'{}\'::jsonb;\n');
        process.exit(1);
      } else if (!altError) {
        console.log('✅ Column badge_progress already exists!');
        process.exit(0);
      } else {
        throw altError;
      }
    }

    console.log('✅ Successfully added badge_progress column!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error adding badge_progress column:', err.message);
    console.error('\nPlease run this SQL manually in your Supabase SQL Editor:');
    console.error('\nALTER TABLE users ADD COLUMN IF NOT EXISTS badge_progress JSONB DEFAULT \'{}\'::jsonb;\n');
    process.exit(1);
  }
}

addBadgeProgressColumn();
