# Supabase Project Information

## Quick Reference

This document contains the essential information about the Supabase project used by this application.

## Project Details

| Property | Value |
|----------|-------|
| **Project ID** | `vkrfwfzpgtmwscimohsd` |
| **Project URL** | `https://vkrfwfzpgtmwscimohsd.supabase.co` |
| **Project Name** | AIRYZE Intelligent AQI Monitoring |
| **Database** | PostgreSQL 17 |
| **Hosting** | Supabase Cloud |

## API Keys

### Anon Key (Public)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcmZ3ZnpwZ3Rtd3NjaW1vaHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDkzNTEsImV4cCI6MjA4MDUyNTM1MX0.x9Qh5SD4S0DP7-HRsAcP96-nWSrSlHpw85pXDEF6G5c
```

**Usage**: Safe to use in frontend and backend for public operations.

**Configured in**:
- `backend/.env` as `SUPABASE_ANON_KEY`
- `backend/.env.example` (template)

## Environment Configuration

### Backend `.env` File

```env
# Supabase Configuration
SUPABASE_URL=https://vkrfwfzpgtmwscimohsd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrcmZ3ZnpwZ3Rtd3NjaW1vaHNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDkzNTEsImV4cCI6MjA4MDUyNTM1MX0.x9Qh5SD4S0DP7-HRsAcP96-nWSrSlHpw85pXDEF6G5c
```

## Database Connection

### Via Supabase Client (Recommended)

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://vkrfwfzpgtmwscimohsd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);
```

**Implementation**: `backend/db.js`

### Via Supabase Dashboard

1. Go to: https://supabase.com/dashboard
2. Select project: `vkrfwfzpgtmwscimohsd`
3. Access:
   - **Table Editor**: View and edit data
   - **SQL Editor**: Run SQL queries
   - **Database**: Manage schema and migrations

## CLI Configuration

### Project Linking

The project is already linked to the remote Supabase instance:

```bash
# Verify link
cat supabase/.temp/project-ref
# Output: vkrfwfzpgtmwscimohsd
```

### Common Commands

```bash
# Push migrations to remote database
supabase db push

# Pull schema from remote database
supabase db pull

# List migrations
supabase migration list

# Create new migration
supabase migration new <name>
```

## Database Schema

### Current Tables

1. **users** - User accounts and profiles
   - Columns: id, name, email, password, city, last_aqi, health_profile, alert_prefs, badges, created_at
   
2. **aqi_data** - Historical AQI measurements
   - Columns: id, location_name, lat, lon, aqi, pollutants, timestamp, created_at

3. **user_reports** - Crowd-sourced reports
   - Columns: id, user_id, location, report_type, description, created_at

4. **report_votes** - Voting on reports
   - Columns: id, report_id, user_id, vote_type, created_at

5. **polls** - Community polls
   - Columns: id, question, options, created_at

### Recent Migrations

1. `20241206000000_create_initial_tables.sql` - Initial schema
2. `20241206000001_create_crowd_sourced_tables.sql` - Crowd-sourcing
3. `20241206000002_create_report_votes_table.sql` - Voting system
4. `20241206000003_add_health_profile_and_alert_prefs.sql` - Health profiles
5. `20241206000005_add_badges_column.sql` - Badges gamification ✅

## Important Notes

### ⚠️ This is NOT a Local Setup

- **No Docker required** - All operations use remote Supabase
- **No local database** - Data is stored in Supabase Cloud
- **No `supabase start`** - Project is already running remotely

### ✅ What to Use

- `supabase db push` - Push migrations
- `supabase db pull` - Pull schema
- Supabase Dashboard - View/edit data
- Node.js scripts - Verify migrations

### ❌ What NOT to Use

- `supabase start` - Requires Docker (not needed)
- `supabase db reset` - For local only
- `supabase db diff` - Requires Docker

## Access Links

- **Dashboard**: https://supabase.com/dashboard/project/vkrfwfzpgtmwscimohsd
- **Table Editor**: https://supabase.com/dashboard/project/vkrfwfzpgtmwscimohsd/editor
- **SQL Editor**: https://supabase.com/dashboard/project/vkrfwfzpgtmwscimohsd/sql
- **API Docs**: https://supabase.com/dashboard/project/vkrfwfzpgtmwscimohsd/api

## Support

For detailed information, see:
- `supabase/SUPABASE_SETUP.md` - Complete setup guide
- `supabase/migrations/MIGRATION_GUIDE.md` - Migration instructions
- `backend/db.js` - Database connection implementation

