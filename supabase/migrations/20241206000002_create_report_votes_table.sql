-- Create report_votes table to track user votes on reports
CREATE TABLE IF NOT EXISTS report_votes (
  id SERIAL PRIMARY KEY,
  report_id INTEGER NOT NULL REFERENCES user_reports(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

-- Create indexes for report_votes table
CREATE INDEX IF NOT EXISTS idx_report_votes_report ON report_votes(report_id);
CREATE INDEX IF NOT EXISTS idx_report_votes_user ON report_votes(user_id);
