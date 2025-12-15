-- Add health_profile and alert_prefs columns to users table
-- Migration for onboarding flow and personalized alerts feature

-- Add health_profile column (JSONB)
-- Structure: {
--   "age_group": "19_40" | "under_12" | "13_18" | "41_60" | "60_plus",
--   "health_conditions": ["asthma", "heart_issues", "allergies", "pregnant", "young_children", "none"],
--   "activity_level": "mostly_indoors" | "light_exercise" | "running_cycling" | "heavy_sports",
--   "primary_city": "Karachi"
-- }
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS health_profile JSONB;

-- Add alert_prefs column (JSONB) with default values
-- Structure: {
--   "on_change": true,
--   "daily_time": "08:00",
--   "instant_button": true
-- }
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS alert_prefs JSONB DEFAULT '{"on_change": true, "daily_time": "08:00", "instant_button": true}'::jsonb;

-- Update existing users to have default alert preferences
UPDATE users 
SET alert_prefs = '{"on_change": true, "daily_time": "08:00", "instant_button": true}'::jsonb
WHERE alert_prefs IS NULL;

-- Create index for health_profile queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_users_health_profile ON users USING GIN (health_profile);

-- Create index for alert_prefs queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_users_alert_prefs ON users USING GIN (alert_prefs);
