/**
 * Seed Sample Polls Script
 * 
 * Creates initial polls for the crowd-sourced reporting feature.
 * Requirements: 5.1, 7.4
 * 
 * Usage: node backend/scripts/seedPolls.js
 */

require('dotenv').config({ path: './backend/.env' });
const supabase = require('../db');

const samplePolls = [
  {
    question: "How would you describe today's air quality?",
    options: ["Very Good", "Good", "Moderate", "Poor", "Very Poor"],
    votes: {
      "Very Good": 0,
      "Good": 0,
      "Moderate": 0,
      "Poor": 0,
      "Very Poor": 0
    }
  },
  {
    question: "What outdoor activities did you avoid due to air quality?",
    options: ["Exercise", "Walking", "Cycling", "None", "All"],
    votes: {
      "Exercise": 0,
      "Walking": 0,
      "Cycling": 0,
      "None": 0,
      "All": 0
    }
  },
  {
    question: "Do you use air purifiers at home?",
    options: ["Yes always", "Yes sometimes", "No but planning to", "No"],
    votes: {
      "Yes always": 0,
      "Yes sometimes": 0,
      "No but planning to": 0,
      "No": 0
    }
  }
];

async function seedPolls() {
  try {
    console.log('Starting poll seeding...');

    // Check if polls already exist
    const { data: existingPolls, error: fetchError } = await supabase
      .from('polls')
      .select('question');

    if (fetchError) {
      console.error('Error checking existing polls:', fetchError);
      process.exit(1);
    }

    if (existingPolls && existingPolls.length > 0) {
      console.log(`Found ${existingPolls.length} existing poll(s).`);
      console.log('Skipping seed to avoid duplicates.');
      console.log('If you want to re-seed, please delete existing polls first.');
      process.exit(0);
    }

    // Insert sample polls
    const { data, error } = await supabase
      .from('polls')
      .insert(samplePolls)
      .select();

    if (error) {
      console.error('Error inserting polls:', error);
      process.exit(1);
    }

    console.log(`Successfully created ${data.length} polls:`);
    data.forEach((poll, index) => {
      console.log(`  ${index + 1}. ${poll.question}`);
      console.log(`     Options: ${poll.options.join(', ')}`);
    });

    console.log('\nPoll seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the seed function
seedPolls();
