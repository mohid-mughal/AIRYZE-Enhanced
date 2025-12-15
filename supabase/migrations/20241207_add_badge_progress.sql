-- Add badge_progress column to users table
-- This column stores progress tracking data for badge achievements

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS badge_progress JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN users.badge_progress IS 'Tracks user progress towards earning badges (aqi_checks, quizzes_completed, etc.)';
