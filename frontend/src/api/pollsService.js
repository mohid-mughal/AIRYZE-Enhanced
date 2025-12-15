import axios from "axios";

const API_BASE = "http://localhost:5000/api/polls";

/**
 * Get all polls with vote counts
 * @returns {Promise<Array>} Array of polls
 */
export async function getAllPolls() {
  const response = await axios.get(API_BASE);
  return response.data.polls || [];
}

/**
 * Submit a vote for a poll
 * @param {number} pollId - Poll ID
 * @param {string} option - Selected option
 * @returns {Promise<Object>} Vote result
 */
export async function submitVote(pollId, option) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !user.id) {
    throw new Error("Authentication required");
  }

  const response = await axios.post(
    `${API_BASE}/${pollId}/vote`,
    { 
      option,
      user_id: user.id
    }
  );
  
  return response.data;
}

/**
 * Get user's vote for a specific poll
 * @param {number} pollId - Poll ID
 * @returns {Promise<Object>} User's vote or null
 */
export async function getUserVote(pollId) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !user.id) {
    throw new Error("Authentication required");
  }

  const response = await axios.get(`${API_BASE}/${pollId}/user-vote`, {
    params: {
      user_id: user.id
    }
  });
  
  return response.data.vote;
}

/**
 * Create a new poll
 * @param {Object} pollData - Poll data
 * @param {string} pollData.question - Poll question
 * @param {Array<string>} pollData.options - Poll options
 * @returns {Promise<Object>} Created poll
 */
export async function createPoll(pollData) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !user.id) {
    throw new Error("Authentication required");
  }

  const response = await axios.post(API_BASE, {
    ...pollData,
    user_id: user.id
  });
  
  return response.data.poll;
}
