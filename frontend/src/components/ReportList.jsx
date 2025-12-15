import { useState, useEffect } from "react";
import { upvoteReport, downvoteReport, getUserReportVote } from "../api/userReportsService";

export default function ReportList({ reports, user, onVoteUpdate }) {
  const [votingReportId, setVotingReportId] = useState(null);
  const [userVotes, setUserVotes] = useState({});

  // Fetch user's votes for all reports
  useEffect(() => {
    async function fetchUserVotes() {
      if (!user || !reports.length) return;
      
      const votes = {};
      await Promise.all(
        reports.map(async (report) => {
          try {
            const vote = await getUserReportVote(report.id);
            if (vote) {
              votes[report.id] = vote.vote_type;
            }
          } catch {
            // User hasn't voted on this report
          }
        })
      );
      setUserVotes(votes);
    }
    fetchUserVotes();
  }, [user, reports]);

  const handleUpvote = async (reportId) => {
    if (!user) {
      alert("Please log in to vote on reports");
      return;
    }

    // Prevent double-clicking
    if (votingReportId === reportId) {
      return;
    }

    try {
      setVotingReportId(reportId);
      const result = await upvoteReport(reportId);
      
      // Update user vote state
      if (result.action === 'removed') {
        setUserVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[reportId];
          return newVotes;
        });
      } else {
        setUserVotes(prev => ({ ...prev, [reportId]: 'upvote' }));
      }
      
      // Update parent with new vote counts
      if (onVoteUpdate && result.report) {
        onVoteUpdate(reportId, result.report.upvotes, result.report.downvotes, result.action === 'removed' ? null : 'upvote');
      }
    } catch (err) {
      console.error("Error upvoting report:", err);
      alert(err.response?.data?.error || "Failed to upvote report. Please try again.");
    } finally {
      setVotingReportId(null);
    }
  };

  const handleDownvote = async (reportId) => {
    if (!user) {
      alert("Please log in to vote on reports");
      return;
    }

    // Prevent double-clicking
    if (votingReportId === reportId) {
      return;
    }

    try {
      setVotingReportId(reportId);
      const result = await downvoteReport(reportId);
      
      // Update user vote state
      if (result.action === 'removed') {
        setUserVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[reportId];
          return newVotes;
        });
      } else {
        setUserVotes(prev => ({ ...prev, [reportId]: 'downvote' }));
      }
      
      // Update parent with new vote counts
      if (onVoteUpdate && result.report) {
        onVoteUpdate(reportId, result.report.upvotes, result.report.downvotes, result.action === 'removed' ? null : 'downvote');
      }
    } catch (err) {
      console.error("Error downvoting report:", err);
      alert(err.response?.data?.error || "Failed to downvote report. Please try again.");
    } finally {
      setVotingReportId(null);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    
    return date.toLocaleDateString();
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg
          className="w-16 h-16 mx-auto mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="font-medium">No reports found</p>
        <p className="text-sm mt-1">Be the first to submit a report!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all"
        >
          {/* Report Description */}
          <p className="text-gray-800 mb-3">{report.description}</p>

          {/* Photo if provided */}
          {report.photo_url && (
            <div className="mb-3 rounded-lg overflow-hidden">
              <img
                src={report.photo_url}
                alt="Report"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Metadata Row */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {formatTimestamp(report.timestamp)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {report.lat.toFixed(4)}, {report.lon.toFixed(4)}
            </span>
          </div>

          {/* Vote Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleUpvote(report.id)}
              disabled={votingReportId === report.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                userVotes[report.id] === 'upvote'
                  ? "bg-green-600 text-white border-2 border-green-700 shadow-md"
                  : user
                  ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill={userVotes[report.id] === 'upvote' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              <span className="font-semibold">{report.upvotes}</span>
            </button>

            <button
              onClick={() => handleDownvote(report.id)}
              disabled={votingReportId === report.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                userVotes[report.id] === 'downvote'
                  ? "bg-red-600 text-white border-2 border-red-700 shadow-md"
                  : user
                  ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-5 h-5" fill={userVotes[report.id] === 'downvote' ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              <span className="font-semibold">{report.downvotes}</span>
            </button>

            {!user && (
              <span className="text-xs text-gray-500 italic ml-2">Login to vote</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
