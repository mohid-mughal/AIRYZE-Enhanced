-- Add badges column to users table
-- Migration for badges and quizzes gamification feature

-- Add badges column (JSONB) with default empty array
-- Structure: [
--   {
--     "name": "7-Day Streak",
--     "earned": "2024-01-15T10:30:00Z",
--     "progress": 7
--   },
--   ...
-- ]
-- 
-- Badge object fields:
-- - name (string): The display name of the badge (e.g., "7-Day Streak", "Quiz Master")
-- - earned (timestamp): ISO 8601 timestamp when the badge was earned
-- - progress (number): Current progress toward earning the badge (matches threshold when earned)
--
-- The badges array stores all earned badges for a user. Progress tracking for
-- unearned badges is handled client-side and synced periodically.
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb;

-- Create GIN index for badges queries (for efficient JSONB operations)
CREATE INDEX IF NOT EXISTS idx_users_badges ON users USING GIN (badges);

-- Add comment to document the column
COMMENT ON COLUMN users.badges IS 'JSONB array storing earned badges with structure: [{"name": string, "earned": timestamp, "progress": number}]';

