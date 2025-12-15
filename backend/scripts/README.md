# Backend Scripts

This directory contains utility scripts for database seeding and verification.

## Available Scripts

### seedPolls.js

Seeds the database with sample polls for the crowd-sourced reporting feature.

**Usage:**
```bash
node backend/scripts/seedPolls.js
```

**What it does:**
- Creates 3 sample polls with predefined questions and options
- Initializes all vote counts to 0
- Checks for existing polls to avoid duplicates

**Sample Polls Created:**
1. "How would you describe today's air quality?" (Very Good, Good, Moderate, Poor, Very Poor)
2. "What outdoor activities did you avoid due to air quality?" (Exercise, Walking, Cycling, None, All)
3. "Do you use air purifiers at home?" (Yes always, Yes sometimes, No but planning to, No)

### verifyPolls.js

Verifies that polls were created correctly in the database.

**Usage:**
```bash
node backend/scripts/verifyPolls.js
```

**What it does:**
- Fetches all polls from the database
- Displays poll details (ID, question, options, votes, created date)
- Verifies that expected sample polls are present
- Confirms that all vote counts are initialized to 0

## Requirements

- Node.js installed
- `.env` file configured in the backend directory with Supabase credentials
- Database tables created (run migrations first)

## Notes

- These scripts use the Supabase client configured in `backend/db.js`
- The seed script will skip seeding if polls already exist to prevent duplicates
- Both scripts will exit with appropriate status codes for CI/CD integration
