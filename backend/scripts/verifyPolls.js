/**
 * Verify Polls Script
 * 
 * Verifies that sample polls were created correctly.
 * 
 * Usage: node backend/scripts/verifyPolls.js
 */

require('dotenv').config({ path: './backend/.env' });
const supabase = require('../db');

async function verifyPolls() {
  try {
    console.log('Verifying polls in database...\n');

    // Fetch all polls
    const { data: polls, error } = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching polls:', error);
      process.exit(1);
    }

    if (!polls || polls.length === 0) {
      console.log('No polls found in database.');
      console.log('Run "node backend/scripts/seedPolls.js" to create sample polls.');
      process.exit(0);
    }

    console.log(`Found ${polls.length} poll(s):\n`);

    polls.forEach((poll, index) => {
      console.log(`Poll ${index + 1}:`);
      console.log(`  ID: ${poll.id}`);
      console.log(`  Question: ${poll.question}`);
      console.log(`  Options: ${poll.options.join(', ')}`);
      console.log(`  Votes:`, poll.votes);
      console.log(`  Created: ${new Date(poll.created_at).toLocaleString()}`);
      console.log('');
    });

    // Verify expected polls
    const expectedQuestions = [
      "How would you describe today's air quality?",
      "What outdoor activities did you avoid due to air quality?",
      "Do you use air purifiers at home?"
    ];

    const foundQuestions = polls.map(p => p.question);
    const allExpectedFound = expectedQuestions.every(q => foundQuestions.includes(q));

    if (allExpectedFound) {
      console.log('✓ All expected sample polls are present!');
    } else {
      console.log('⚠ Some expected polls are missing:');
      expectedQuestions.forEach(q => {
        if (!foundQuestions.includes(q)) {
          console.log(`  - ${q}`);
        }
      });
    }

    // Verify vote initialization
    const allVotesInitialized = polls.every(poll => {
      return poll.options.every(option => {
        return poll.votes.hasOwnProperty(option) && poll.votes[option] === 0;
      });
    });

    if (allVotesInitialized) {
      console.log('✓ All vote counts are properly initialized to 0!');
    } else {
      console.log('⚠ Some vote counts are not properly initialized');
    }

    console.log('\nVerification complete!');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

// Run the verification
verifyPolls();
