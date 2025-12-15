import axios from "axios";

const API_BASE = "http://localhost:5000/api/user-reports";

/**
 * Get all user reports
 * @returns {Promise<Array>} Array of user reports
 */
export async function getAllReports() {
  const response = await axios.get(API_BASE);
  return response.data.reports || [];
}

/**
 * Create a new user report
 * @param {Object} reportData - Report data
 * @param {number} reportData.lat - Latitude
 * @param {number} reportData.lon - Longitude
 * @param {string} reportData.description - Report description
 * @param {string} [reportData.photo_url] - Optional photo URL
 * @returns {Promise<Object>} Created report
 */
export async function createReport(reportData) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !user.id) {
    throw new Error("Authentication required");
  }

  const response = await axios.post(API_BASE, {
    ...reportData,
    user_id: user.id
  });
  
  return response.data.report;
}

/**
 * Upvote a report
 * @param {number} reportId - Report ID
 * @returns {Promise<Object>} Updated report
 */
export async function upvoteReport(reportId) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !user.id) {
    throw new Error("Authentication required");
  }

  const response = await axios.patch(
    `${API_BASE}/${reportId}/upvote`,
    {
      user_id: user.id
    }
  );
  
  return response.data;
}

/**
 * Downvote a report
 * @param {number} reportId - Report ID
 * @returns {Promise<Object>} Updated report
 */
export async function downvoteReport(reportId) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !user.id) {
    throw new Error("Authentication required");
  }

  const response = await axios.patch(
    `${API_BASE}/${reportId}/downvote`,
    {
      user_id: user.id
    }
  );
  
  return response.data;
}

/**
 * Get user's vote for a specific report
 * @param {number} reportId - Report ID
 * @returns {Promise<Object>} User's vote or null
 */
export async function getUserReportVote(reportId) {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !user.id) {
    throw new Error("Authentication required");
  }

  const response = await axios.get(`${API_BASE}/${reportId}/user-vote`, {
    params: {
      user_id: user.id
    }
  });
  
  return response.data.vote;
}
