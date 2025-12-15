# Badges Column Migration

## Overview

This migration adds a `badges` column to the `users` table to support the gamification feature with achievement badges and quizzes.

**Note**: This project uses **Supabase Cloud** (hosted on supabase.com), not local Docker/Supabase.

## Migration File

- **File**: `20241206000005_add_badges_column.sql`
- **Purpose**: Add JSONB column to store user badges
- **Status**: ✅ Successfully applied to remote database

## Badge Data Structure

The `badges` column stores a JSONB array with the following structure:

```json
[
  {
    "name": "7-Day Streak",
    "earned": "2024-01-15T10:30:00Z",
    "progress": 7
  },
  {
    "name": "Quiz Master",
    "earned": "2024-01-20T14:30:00Z",
    "progress": 3
  }
]
```

### Field Descriptions

- **name** (string): Display name of the badge (e.g., "7-Day Streak", "Report Contributor")
- **earned** (timestamp): ISO 8601 timestamp when the badge was earned
- **progress** (number): Progress value when badge was earned (matches the badge threshold)

## How to Apply Migration

### Prerequisites

1. Supabase CLI installed
2. Project linked to remote Supabase (project ref: `vkrfwfzpgtmwscimohsd`)
3. Database password (if required)

### Steps to Push Migration to Remote Database

```bash
# Push migration to remote Supabase database
supabase db push

# The CLI will show which migrations will be applied
# Confirm with 'y' when prompted
```

### Verification

Run the verification script to test the migration:

```bash
# From project root
node backend/scripts/verifyBadgesColumn.js

# This will:
# - Check if badges column exists
# - Test inserting users with badges
# - Test updating badges
# - Test JSONB query operations
# - Clean up test data
```

## Database Schema Changes

### Column Added

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;
```

### Index Created

```sql
CREATE INDEX IF NOT EXISTS idx_users_badges ON users USING GIN (badges);
```

The GIN index enables efficient JSONB operations for querying and filtering badges.

## Requirements Satisfied

- **Requirement 1.1**: System initializes with badges column in users table ✅
- **Requirement 1.2**: Badges stored in JSON array format with name, earned timestamp, and progress ✅

## Supabase Configuration

This project uses **Supabase Cloud** (not local Docker):

- **Project ID**: `vkrfwfzpgtmwscimohsd`
- **Project URL**: `https://vkrfwfzpgtmwscimohsd.supabase.co`
- **Project Ref**: `vkrfwfzpgtmwscimohsd`
- **Anon Key**: Configured in `backend/.env`
- **Connection**: Via Supabase JavaScript client (`@supabase/supabase-js`)
- **Environment**: Backend uses `.env` file with `SUPABASE_URL` and `SUPABASE_ANON_KEY`

## Notes

- Default value is an empty array `[]`
- Uses JSONB type for efficient querying and indexing
- GIN index supports fast JSONB operations
- Column includes documentation comment for future reference
- Migration is idempotent (safe to run multiple times)
- **No Docker required** - all operations use remote Supabase database

