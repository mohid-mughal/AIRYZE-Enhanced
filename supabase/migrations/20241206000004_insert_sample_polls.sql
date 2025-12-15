-- Insert sample polls for crowd-sourced reporting feature
-- Requirements: 5.1, 7.4

-- Poll 1: Air quality perception
INSERT INTO polls (question, options, votes) VALUES (
  'How would you describe today''s air quality?',
  '["Very Good", "Good", "Moderate", "Poor", "Very Poor"]'::jsonb,
  '{"Very Good": 0, "Good": 0, "Moderate": 0, "Poor": 0, "Very Poor": 0}'::jsonb
);

-- Poll 2: Activity avoidance
INSERT INTO polls (question, options, votes) VALUES (
  'What outdoor activities did you avoid due to air quality?',
  '["Exercise", "Walking", "Cycling", "None", "All"]'::jsonb,
  '{"Exercise": 0, "Walking": 0, "Cycling": 0, "None": 0, "All": 0}'::jsonb
);

-- Poll 3: Air purifier usage
INSERT INTO polls (question, options, votes) VALUES (
  'Do you use air purifiers at home?',
  '["Yes always", "Yes sometimes", "No but planning to", "No"]'::jsonb,
  '{"Yes always": 0, "Yes sometimes": 0, "No but planning to": 0, "No": 0}'::jsonb
);
