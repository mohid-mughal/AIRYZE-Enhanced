# Supabase Setup Documentation

## Overview

This project uses **Supabase Cloud** (hosted at supabase.com), **NOT** local Docker/Supabase.

## Configuration

### Remote Supabase Project

- **Project ID**: `vkrfwfzpgtmwscimohsd`
- **Project URL**: `https://vkrfwfzpgtmwscimohsd.supabase.co`
- **Project Reference**: `vkrfwfzpgtmwscimohsd`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (stored in `.env`)
- **Region**: Hosted on Supabase Cloud
- **Database**: PostgreSQL 17

### Environment Variables

The backend connects to Supabase using environment variables in `backend/.env`:

```env
SUPABASE_URL=https://vkrfwfzpgtmwscimohsd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Connection Method

- **Client Library**: `@supabase/supabase-js`
- **Connection File**: `backend/db.js`
- **Authentication**: Anon key for public operations

## Supabase CLI Setup

### Installation

The Supabase CLI is already installed and configured for this project.

### Project Linking

The project is already linked to the remote Supabase instance:

```bash
# Check link status
cat supabase/.temp/project-ref
# Output: vkrfwfzpgtmwscimohsd
```

### Common Commands

```bash
# Push migrations to remote database
supabase db push

# Pull remote schema changes
supabase db pull

# View migration history
supabase migration list

# Create a new migration
supabase migration new <migration_name>
```

## Migration Workflow

### Creating Migrations

1. Create a new migration file in `supabase/migrations/`:
   ```bash
   supabase migration new add_new_feature
   ```

2. Write your SQL in the generated file:
   ```sql
   -- Migration: <timestamp>_add_new_feature.sql
   ALTER TABLE users ADD COLUMN new_field TEXT;
   ```

3. Push to remote database:
   ```bash
   supabase db push
   ```

### Migration File Naming

- **Format**: `<timestamp>_<description>.sql`
- **Example**: `20241206000005_add_badges_column.sql`
- **Note**: Files not matching this pattern are skipped

### Applied Migrations

1. `20241206000000_create_initial_tables.sql` - Initial users and aqi_data tables
2. `20241206000001_create_crowd_sourced_tables.sql` - Crowd-sourced reporting tables
3. `20241206000002_create_report_votes_table.sql` - Report voting system
4. `20241206000003_add_health_profile_and_alert_prefs.sql` - Health profiles and alert preferences
5. `20241206000005_add_badges_column.sql` - Badges gamification ✅

## Database Access

### Via Supabase Client (Recommended)

```javascript
const supabase = require('./backend/db');

// Query users
const { data, error } = await supabase
  .from('users')
  .select('*')
  .limit(10);
```

### Via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select project: `AIRYZE-intelligent-aqi-monitoring`
3. Navigate to Table Editor or SQL Editor

### Via psql (Direct Connection)

```bash
# Get connection string from Supabase dashboard
# Settings > Database > Connection string

psql "postgresql://postgres:[PASSWORD]@db.vkrfwfzpgtmwscimohsd.supabase.co:5432/postgres"
```

## Verification Scripts

### Backend Verification Scripts

Located in `backend/scripts/`:

- `verifyBadgesColumn.js` - Verify badges column migration
- `verifyMigration.js` - General migration verification
- `verifyOnboardingIntegration.js` - Onboarding feature verification
- `verifyAlertPrefs.js` - Alert preferences verification
- `verifyPolls.js` - Polls feature verification

### Running Verification

```bash
# From project root
node backend/scripts/verifyBadgesColumn.js

# Or from backend directory
cd backend
node scripts/verifyBadgesColumn.js
```

## Important Notes

### ❌ What NOT to Do

- **Don't use `supabase start`** - This requires Docker and is for local development
- **Don't use `supabase db reset`** - This is for local databases only
- **Don't use `supabase db diff`** - Requires Docker for shadow database

### ✅ What to Do

- **Use `supabase db push`** - Push migrations to remote database
- **Use `supabase db pull`** - Pull schema from remote database
- **Use Node.js scripts** - Verify migrations using backend scripts
- **Use Supabase Dashboard** - View and manage data via web interface

## Troubleshooting

### "Docker Desktop is a prerequisite"

This error appears when using commands meant for local development. Use remote commands instead:

- ❌ `supabase start` → ✅ Already connected to remote
- ❌ `supabase db reset` → ✅ Use `supabase db push`
- ❌ `supabase db diff` → ✅ Use Supabase Dashboard

### "Failed to connect to Supabase"

Check your environment variables:

```bash
# Verify .env file exists
cat backend/.env

# Check if variables are set
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY
```

### Migration Not Applied

```bash
# Check migration file naming
ls supabase/migrations/

# Files must match: <timestamp>_name.sql
# Files like README.md or verify_*.sql are skipped

# Push migrations
supabase db push
```

## Security Notes

- **Anon Key**: Safe to expose in frontend (limited permissions)
- **Service Role Key**: Never commit to git (full database access)
- **Database Password**: Required for direct psql connections
- **RLS Policies**: Ensure Row Level Security is enabled for user data

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

