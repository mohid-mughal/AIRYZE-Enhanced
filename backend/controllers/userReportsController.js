const supabase = require('../db');
const { handleSupabaseResponse } = require('../utils/supabaseErrors');

async function getAllReports(req, res) {
  try {
    const supabaseResponse = await supabase.from('user_reports').select('*').order('timestamp', { ascending: false });
    const result = handleSupabaseResponse(supabaseResponse);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    return res.status(200).json({ success: true, reports: result.data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function createReport(req, res) {
  try {
    const { user_id, lat, lon, description, photo_url } = req.body;
    if (!user_id || lat === undefined || lon === undefined || !description) {
      return res.status(400).json({ error: 'user_id, lat, lon, and description are required' });
    }
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ error: 'Invalid latitude. Must be between -90 and 90' });
    }
    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid longitude. Must be between -180 and 180' });
    }
    if (description.trim().length === 0) {
      return res.status(400).json({ error: 'Description cannot be empty' });
    }
    const reportData = { user_id: parseInt(user_id), lat: latitude, lon: longitude, description: description.trim(), upvotes: 0, downvotes: 0 };
    if (photo_url) reportData.photo_url = photo_url;
    const supabaseResponse = await supabase.from('user_reports').insert([reportData]).select().single();
    const result = handleSupabaseResponse(supabaseResponse);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    return res.status(201).json({ success: true, report: result.data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

async function upvoteReport(req, res) {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!id || isNaN(parseInt(id))) return res.status(400).json({ error: 'Valid report ID is required' });
    if (!user_id || isNaN(parseInt(user_id))) return res.status(400).json({ error: 'Valid user_id is required' });
    
    const reportId = parseInt(id);
    const userId = parseInt(user_id);
    
    // Get current report data
    const reportResponse = await supabase.from('user_reports').select('*').eq('id', reportId).single();
    if (reportResponse.error) return res.status(404).json({ error: 'Report not found' });
    const currentReport = reportResponse.data;
    
    // Check if user has already voted
    const existingVoteResponse = await supabase
      .from('report_votes')
      .select('*')
      .eq('report_id', reportId)
      .eq('user_id', userId)
      .maybeSingle();
    
    // Check if table exists (error code 42P01 means table doesn't exist)
    if (existingVoteResponse.error && existingVoteResponse.error.code === '42P01') {
      return res.status(500).json({ error: 'Voting system not initialized. Please run database migrations.' });
    }
    
    if (existingVoteResponse.data) {
      const existingVote = existingVoteResponse.data;
      
      // If same vote type, remove it (undo)
      if (existingVote.vote_type === 'upvote') {
        await supabase.from('report_votes').delete().eq('id', existingVote.id);
        const updatedReport = await supabase.from('user_reports')
          .update({ upvotes: Math.max(0, currentReport.upvotes - 1) })
          .eq('id', reportId)
          .select()
          .single();
        return res.status(200).json({ success: true, report: updatedReport.data, action: 'removed' });
      }
      
      // If different vote type, switch it
      if (existingVote.vote_type === 'downvote') {
        await supabase.from('report_votes').update({ vote_type: 'upvote' }).eq('id', existingVote.id);
        const updatedReport = await supabase.from('user_reports')
          .update({ 
            upvotes: currentReport.upvotes + 1,
            downvotes: Math.max(0, currentReport.downvotes - 1)
          })
          .eq('id', reportId)
          .select()
          .single();
        return res.status(200).json({ success: true, report: updatedReport.data, action: 'switched' });
      }
    }
    
    // No existing vote, create new upvote
    const insertVoteResponse = await supabase.from('report_votes').insert([{ report_id: reportId, user_id: userId, vote_type: 'upvote' }]);
    
    // Check for errors
    if (insertVoteResponse.error) {
      // Unique constraint violation (user already voted)
      if (insertVoteResponse.error.code === '23505') {
        return res.status(409).json({ error: "You've already voted on this report" });
      }
      // Table doesn't exist
      if (insertVoteResponse.error.code === '42P01') {
        return res.status(500).json({ error: 'Voting system not initialized. Please run database migrations.' });
      }
      console.error('Insert vote error:', insertVoteResponse.error);
      return res.status(500).json({ error: 'Failed to record vote' });
    }
    
    const updatedReport = await supabase.from('user_reports')
      .update({ upvotes: currentReport.upvotes + 1 })
      .eq('id', reportId)
      .select()
      .single();
    const result = handleSupabaseResponse(updatedReport);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    return res.status(200).json({ success: true, report: result.data, action: 'added' });
  } catch (err) {
    console.error('Upvote error:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function downvoteReport(req, res) {
  try {
    const { id } = req.params;
    const { user_id } = req.body;
    
    if (!id || isNaN(parseInt(id))) return res.status(400).json({ error: 'Valid report ID is required' });
    if (!user_id || isNaN(parseInt(user_id))) return res.status(400).json({ error: 'Valid user_id is required' });
    
    const reportId = parseInt(id);
    const userId = parseInt(user_id);
    
    // Get current report data
    const reportResponse = await supabase.from('user_reports').select('*').eq('id', reportId).single();
    if (reportResponse.error) return res.status(404).json({ error: 'Report not found' });
    const currentReport = reportResponse.data;
    
    // Check if user has already voted
    const existingVoteResponse = await supabase
      .from('report_votes')
      .select('*')
      .eq('report_id', reportId)
      .eq('user_id', userId)
      .maybeSingle();
    
    // Check if table exists (error code 42P01 means table doesn't exist)
    if (existingVoteResponse.error && existingVoteResponse.error.code === '42P01') {
      return res.status(500).json({ error: 'Voting system not initialized. Please run database migrations.' });
    }
    
    if (existingVoteResponse.data) {
      const existingVote = existingVoteResponse.data;
      
      // If same vote type, remove it (undo)
      if (existingVote.vote_type === 'downvote') {
        await supabase.from('report_votes').delete().eq('id', existingVote.id);
        const updatedReport = await supabase.from('user_reports')
          .update({ downvotes: Math.max(0, currentReport.downvotes - 1) })
          .eq('id', reportId)
          .select()
          .single();
        return res.status(200).json({ success: true, report: updatedReport.data, action: 'removed' });
      }
      
      // If different vote type, switch it
      if (existingVote.vote_type === 'upvote') {
        await supabase.from('report_votes').update({ vote_type: 'downvote' }).eq('id', existingVote.id);
        const updatedReport = await supabase.from('user_reports')
          .update({ 
            downvotes: currentReport.downvotes + 1,
            upvotes: Math.max(0, currentReport.upvotes - 1)
          })
          .eq('id', reportId)
          .select()
          .single();
        return res.status(200).json({ success: true, report: updatedReport.data, action: 'switched' });
      }
    }
    
    // No existing vote, create new downvote
    const insertVoteResponse = await supabase.from('report_votes').insert([{ report_id: reportId, user_id: userId, vote_type: 'downvote' }]);
    
    // Check for errors
    if (insertVoteResponse.error) {
      // Unique constraint violation (user already voted)
      if (insertVoteResponse.error.code === '23505') {
        return res.status(409).json({ error: "You've already voted on this report" });
      }
      // Table doesn't exist
      if (insertVoteResponse.error.code === '42P01') {
        return res.status(500).json({ error: 'Voting system not initialized. Please run database migrations.' });
      }
      console.error('Insert vote error:', insertVoteResponse.error);
      return res.status(500).json({ error: 'Failed to record vote' });
    }
    
    const updatedReport = await supabase.from('user_reports')
      .update({ downvotes: currentReport.downvotes + 1 })
      .eq('id', reportId)
      .select()
      .single();
    const result = handleSupabaseResponse(updatedReport);
    if (!result.success) return res.status(result.status).json({ error: result.error });
    return res.status(200).json({ success: true, report: result.data, action: 'added' });
  } catch (err) {
    console.error('Downvote error:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function getUserReportVote(req, res) {
  try {
    const { id } = req.params;
    const { user_id } = req.query;
    
    if (!id || isNaN(parseInt(id))) return res.status(400).json({ error: 'Valid report ID is required' });
    if (!user_id || isNaN(parseInt(user_id))) return res.status(400).json({ error: 'Valid user_id is required' });
    
    const reportId = parseInt(id);
    const userId = parseInt(user_id);
    
    const voteResponse = await supabase
      .from('report_votes')
      .select('*')
      .eq('report_id', reportId)
      .eq('user_id', userId)
      .maybeSingle();
    
    // Check if table exists
    if (voteResponse.error && voteResponse.error.code === '42P01') {
      console.error('report_votes table does not exist');
      return res.status(200).json({ success: true, vote: null });
    }
    
    if (voteResponse.error) {
      console.error('Get user report vote error:', voteResponse.error);
      return res.status(500).json({ error: voteResponse.error.message });
    }
    
    return res.status(200).json({ success: true, vote: voteResponse.data });
  } catch (err) {
    console.error('Get user report vote error:', err.message, err.stack);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllReports, createReport, upvoteReport, downvoteReport, getUserReportVote };
