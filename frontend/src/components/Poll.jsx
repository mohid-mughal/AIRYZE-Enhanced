import { useState, useEffect } from "react";
import { submitVote, getUserVote } from "../api/pollsService";
import PollChart from "./PollChart";

export default function Poll({ poll, user, onVoted }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [userVote, setUserVote] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // Check if user has already voted on this poll
  useEffect(() => {
    async function checkUserVote() {
      if (user && poll.id) {
        try {
          const vote = await getUserVote(poll.id);
          if (vote) {
            setUserVote(vote.option);
            setSelectedOption(vote.option);
          }
        } catch {
          // User hasn't voted yet, which is fine
          console.log("No previous vote found");
        }
      }
    }
    checkUserVote();
  }, [user, poll.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setMessage("Please log in to vote");
      return;
    }

    if (!selectedOption) {
      setMessage("Please select an option");
      return;
    }

    if (userVote) {
      setMessage("You have already voted on this poll");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const result = await submitVote(poll.id, selectedOption);
      
      setUserVote(selectedOption);
      setMessage("Vote submitted successfully!");

      // Notify parent component to update poll votes
      if (onVoted && result.poll) {
        onVoted(poll.id, result.poll.votes);
      }

      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (error) {
      // Handle different error types
      if (error.response?.status === 409) {
        setMessage("Sorry, You can only Vote Once");
      } else if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage(error.message || "Failed to submit vote. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total votes
  const totalVotes = poll.votes
    ? Object.values(poll.votes).reduce((sum, count) => sum + count, 0)
    : 0;

  const hasVotes = totalVotes > 0;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all">
      {/* Poll Question */}
      <h3 className="text-lg font-bold text-gray-800 mb-4">{poll.question}</h3>

      {/* Voting Form */}
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        {poll.options.map((option) => (
          <label
            key={option}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedOption === option
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            } ${userVote ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <input
              type="radio"
              name={`poll-${poll.id}`}
              value={option}
              checked={selectedOption === option}
              onChange={(e) => setSelectedOption(e.target.value)}
              disabled={!!userVote || isSubmitting}
              className="w-4 h-4 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{option}</span>
            {userVote === option && (
              <span className="ml-auto text-xs font-semibold text-blue-600">
                Your vote
              </span>
            )}
          </label>
        ))}

        {/* Submit Button */}
        {!userVote && (
          <button
            type="submit"
            disabled={isSubmitting || !user || !selectedOption}
            className={`w-full px-4 py-2 text-white font-medium rounded-lg transition-all ${
              isSubmitting || !user || !selectedOption
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            }`}
          >
            {isSubmitting ? "Submitting..." : user ? "Submit Vote" : "Login to Vote"}
          </button>
        )}
      </form>

      {/* Message Display */}
      {message && (
        <div
          className={`p-2 rounded-lg text-sm mb-4 ${
            message.includes("success")
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-yellow-50 text-yellow-800 border border-yellow-200"
          }`}
        >
          {message}
        </div>
      )}

      {/* Poll Results */}
      {hasVotes ? (
        <PollChart poll={poll} />
      ) : (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <svg
            className="w-12 h-12 mx-auto mb-2 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm font-medium">No data yet</p>
          <p className="text-xs mt-1">Be the first to vote!</p>
        </div>
      )}
    </div>
  );
}
