/**
 * Polls Controller
 * 
 * Handles community poll operations for crowd-sourced air quality insights.
 * Allows users to view polls, submit votes, and administrators to create new polls.
 */

const supabase = require('../db');
const { handleSupabaseResponse } = require('../utils/supabaseErrors');

/**
 * Get all polls with vote counts
 * GET /api/polls
 * 
 * Requirements: 5.1, 7.3
 */
async function getAllPolls(req, res) {
  try {
    const supabaseResponse = await supabase
      .from('polls')
      .select('*')
      .order('created_at', { ascending: false });

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({
      success: true,
      polls: result.data
    });
  } catch (err) {
    console.error('Get all polls error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Submit a vote for a poll
 * POST /api/polls/:id/vote
 * Body: { user_id, option }
 * 
 * Requirements: 5.2, 5.3, 5.4
 */
async function submitVote(req, res) {
  try {
    const { id } = req.params;
    const { user_id, option } = req.body;

    // Validate required fields
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid poll ID is required' });
    }

    if (!user_id || !option) {
      return res.status(400).json({ 
        error: 'user_id and option are required' 
      });
    }

    const pollId = parseInt(id);
    const userId = parseInt(user_id);

    // Check if user has already voted on this poll
    const existingVoteResponse = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .single();

    // If vote exists (no error or error is not PGRST116), user has already voted
    if (existingVoteResponse.data) {
      return res.status(409).json({ 
        error: "You can't add more than 1 vote in a poll"
      });
    }

    // Get the poll to validate option and update votes
    const pollResponse = await supabase
      .from('polls')
      .select('*')
      .eq('id', pollId)
      .single();

    const pollResult = handleSupabaseResponse(pollResponse);

    if (!pollResult.success) {
      if (pollResponse.error && pollResponse.error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Poll not found' });
      }
      return res.status(pollResult.status).json({ error: pollResult.error });
    }

    const poll = pollResult.data;

    // Validate that the option exists in the poll
    if (!poll.options.includes(option)) {
      return res.status(400).json({ 
        error: 'Invalid option. Must be one of: ' + poll.options.join(', ')
      });
    }

    // Insert vote record
    const voteData = {
      poll_id: pollId,
      user_id: userId,
      option: option
    };

    const insertVoteResponse = await supabase
      .from('poll_votes')
      .insert([voteData])
      .select()
      .single();

    const insertResult = handleSupabaseResponse(insertVoteResponse);

    if (!insertResult.success) {
      // Check for unique constraint violation
      if (insertVoteResponse.error && insertVoteResponse.error.code === '23505') {
        return res.status(409).json({ 
          error: "You can't add more than 1 vote in a poll"
        });
      }
      return res.status(insertResult.status).json({ error: insertResult.error });
    }

    // Update vote count in polls table
    const currentVotes = poll.votes || {};
    const newVotes = { ...currentVotes };
    newVotes[option] = (newVotes[option] || 0) + 1;

    const updatePollResponse = await supabase
      .from('polls')
      .update({ votes: newVotes })
      .eq('id', pollId)
      .select()
      .single();

    const updateResult = handleSupabaseResponse(updatePollResponse);

    if (!updateResult.success) {
      return res.status(updateResult.status).json({ error: updateResult.error });
    }

    return res.status(201).json({
      success: true,
      vote: insertResult.data,
      poll: updateResult.data
    });
  } catch (err) {
    console.error('Submit vote error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Get user's vote for a specific poll
 * GET /api/polls/:id/user-vote
 * Query: ?user_id=<user_id>
 * 
 * Requirements: 5.4
 */
async function getUserVote(req, res) {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    // Validate required fields
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Valid poll ID is required' });
    }

    if (!user_id || isNaN(parseInt(user_id))) {
      return res.status(400).json({ error: 'Valid user_id is required' });
    }

    const pollId = parseInt(id);
    const userId = parseInt(user_id);

    // Get user's vote for this poll - use maybeSingle() instead of single()
    const supabaseResponse = await supabase
      .from('poll_votes')
      .select('*')
      .eq('poll_id', pollId)
      .eq('user_id', userId)
      .maybeSingle();

    // Check if table exists (error code 42P01 means table doesn't exist)
    if (supabaseResponse.error && supabaseResponse.error.code === '42P01') {
      console.error('poll_votes table does not exist');
      return res.status(200).json({
        success: true,
        vote: null
      });
    }

    // If other error, log and return
    if (supabaseResponse.error) {
      console.error('Get user vote error:', supabaseResponse.error);
      return res.status(500).json({ error: supabaseResponse.error.message });
    }

    // Return the vote (null if not found)
    return res.status(200).json({
      success: true,
      vote: supabaseResponse.data
    });
  } catch (err) {
    console.error('Get user vote error:', err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * Create a new poll (admin only)
 * POST /api/polls
 * Body: { question, options }
 * 
 * Requirements: 7.1, 7.4
 */
async function createPoll(req, res) {
  try {
    const { question, options } = req.body;

    // Validate required fields
    if (!question || !options) {
      return res.status(400).json({ 
        error: 'question and options are required' 
      });
    }

    // Validate options is an array with at least 2 options
    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ 
        error: 'options must be an array with at least 2 options' 
      });
    }

    // Validate question is not empty
    if (question.trim().length === 0) {
      return res.status(400).json({ 
        error: 'question cannot be empty' 
      });
    }

    // Initialize votes object with 0 for each option
    const votes = {};
    options.forEach(option => {
      votes[option] = 0;
    });

    // Prepare poll data
    const pollData = {
      question: question.trim(),
      options: options,
      votes: votes
    };

    // Insert poll into database
    const supabaseResponse = await supabase
      .from('polls')
      .insert([pollData])
      .select()
      .single();

    const result = handleSupabaseResponse(supabaseResponse);

    if (!result.success) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(201).json({
      success: true,
      poll: result.data
    });
  } catch (err) {
    console.error('Create poll error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllPolls,
  submitVote,
  getUserVote,
  createPoll
};
