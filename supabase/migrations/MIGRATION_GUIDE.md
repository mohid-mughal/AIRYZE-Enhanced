# Migration Guide for Remote Supabase

## Quick Reference

This project uses **Supabase Cloud** (not Docker). All migrations are pushed to the remote database.

## Creating a New Migration

### Step 1: Create Migration File

```bash
# Create a new migration with timestamp
supabase migration new <description>

# Example:
supabase migration new add_user_preferences
```

This creates: `supabase/migrations/<timestamp>_add_user_preferences.sql`

### Step 2: Write Your SQL

Edit the generated file:

```sql
-- Migration: Add user preferences
-- Description: Adds preferences column for user settings

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add index if needed
CREATE INDEX IF NOT EXISTS idx_users_preferences 
ON users USING GIN (preferences);

-- Add comments for documentation
COMMENT ON COLUMN users.preferences IS 'User preferences stored as JSONB';
```

### Step 3: Push to Remote Database

```bash
# Push migration to remote Supabase
supabase db push

# Confirm when prompted
# Output will show which migrations are being applied
```

### Step 4: Verify Migration

Create a verification script in `backend/scripts/`:

```javascript
// backend/scripts/verifyYourMigration.js
const supabase = require('../db');

async function verify() {
  console.log('Verifying migration...');
  
  // Test your new column/table
  const { data, error } = await supabase
    .from('users')
    .select('preferences')
    .limit(1);
    
  if (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
  
  console.log('✅ Migration successful!');
  return true;
}

verify().then(success => process.exit(success ? 0 : 1));
```

Run verification:

```bash
node backend/scripts/verifyYourMigration.js
```

## Migration Best Practices

### File Naming

✅ **Correct:**
- `20241206000005_add_badges_column.sql`
- `20241207120000_create_notifications_table.sql`

❌ **Incorrect (will be skipped):**
- `README.md`
- `verify_migration.sql`
- `add_badges.sql` (missing timestamp)

### SQL Best Practices

1. **Use IF NOT EXISTS:**
   ```sql
   ALTER TABLE users 
   ADD COLUMN IF NOT EXISTS new_field TEXT;
   ```

2. **Add Comments:**
   ```sql
   COMMENT ON COLUMN users.new_field IS 'Description of field';
   ```

3. **Create Indexes:**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_table_column 
   ON table_name(column_name);
   ```

4. **Use JSONB for flexible data:**
   ```sql
   ALTER TABLE users 
   ADD COLUMN data JSONB DEFAULT '{}'::jsonb;
   
   -- GIN index for JSONB
   CREATE INDEX idx_users_data ON users USING GIN (data);
   ```

5. **Document structure in comments:**
   ```sql
   -- Structure: {
   --   "key": "value",
   --   "nested": { "field": "value" }
   -- }
   ```

## Common Migration Patterns

### Adding a Column

```sql
ALTER TABLE table_name 
ADD COLUMN IF NOT EXISTS column_name TYPE DEFAULT value;
```

### Adding a JSONB Column

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_users_settings 
ON users USING GIN (settings);
```

### Creating a New Table

```sql
CREATE TABLE IF NOT EXISTS table_name (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_table_user_id 
ON table_name(user_id);
```

### Adding a Foreign Key

```sql
ALTER TABLE child_table
ADD CONSTRAINT fk_parent
FOREIGN KEY (parent_id) 
REFERENCES parent_table(id) 
ON DELETE CASCADE;
```

## Viewing Migration History

```bash
# List all migrations
supabase migration list

# View applied migrations on remote
supabase db remote list
```

## Rolling Back Migrations

⚠️ **Warning:** Supabase doesn't support automatic rollbacks for remote databases.

To rollback:

1. Create a new migration that reverses the changes:
   ```bash
   supabase migration new rollback_feature_name
   ```

2. Write SQL to undo the changes:
   ```sql
   -- Rollback: Remove column added in previous migration
   ALTER TABLE users DROP COLUMN IF EXISTS column_name;
   ```

3. Push the rollback migration:
   ```bash
   supabase db push
   ```

## Troubleshooting

### "Docker Desktop is a prerequisite"

You're using a local-only command. Use remote commands instead:

- ❌ `supabase start` → Already connected to remote
- ❌ `supabase db reset` → Use `supabase db push`
- ❌ `supabase db diff` → Use Supabase Dashboard

### "Migration file not found"

Check file naming:
```bash
ls supabase/migrations/
# Files must match: <timestamp>_name.sql
```

### "Permission denied"

You may need database password:
```bash
supabase db push --password YOUR_DB_PASSWORD
```

### "Migration already applied"

The migration was already pushed. To re-apply:

1. Remove from remote history (via Supabase Dashboard)
2. Or create a new migration with different changes

## Verification Checklist

After pushing a migration:

- [ ] Run verification script
- [ ] Check Supabase Dashboard → Table Editor
- [ ] Test affected API endpoints
- [ ] Update backend code to use new schema
- [ ] Update frontend if schema affects UI
- [ ] Document changes in README or design docs

## Resources

- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL ALTER TABLE](https://www.postgresql.org/docs/current/sql-altertable.html)
- [JSONB in PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)

