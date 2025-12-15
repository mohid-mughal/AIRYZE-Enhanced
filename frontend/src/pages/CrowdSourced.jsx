import { useState, useEffect } from "react";
import { getCurrentUser } from "../api/authService";
import { getAllReports } from "../api/userReportsService";
import { getAllPolls } from "../api/pollsService";
import ReportForm from "../components/ReportForm";
import ReportList from "../components/ReportList";
import MapView from "../components/MapView";
import Poll from "../components/Poll";
import PollForm from "../components/PollForm";
import { badgeTracker } from "../utils/badgeTracker";

export default function CrowdSourced() {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [polls, setPolls] = useState([]);
  const [filteredPolls, setFilteredPolls] = useState([]);
  const [pollSearchQuery, setPollSearchQuery] = useState("");
  const [isPollsExpanded, setIsPollsExpanded] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for logged in user on mount and listen for auth changes
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);

    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  // Fetch reports and polls on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [reportsData, pollsData] = await Promise.all([
          getAllReports(),
          getAllPolls(),
        ]);
        setReports(reportsData);
        setFilteredReports(reportsData);
        setPolls(pollsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Implement search filtering logic for reports (case-insensitive)
  useEffect(() => {
    if (!reportSearchQuery.trim()) {
      setFilteredReports(reports);
    } else {
      const query = reportSearchQuery.toLowerCase();
      const filtered = reports.filter((report) =>
        report.description.toLowerCase().includes(query)
      );
      setFilteredReports(filtered);
    }
  }, [reportSearchQuery, reports]);

  // Implement search filtering logic for polls (case-insensitive)
  useEffect(() => {
    if (!pollSearchQuery.trim()) {
      setFilteredPolls(polls);
    } else {
      const query = pollSearchQuery.toLowerCase();
      const filtered = polls.filter((poll) =>
        poll.question.toLowerCase().includes(query)
      );
      setFilteredPolls(filtered);
    }
  }, [pollSearchQuery, polls]);

  // Handle map click for location selection
  const handleMapClick = (lat, lon) => {
    setSelectedLocation({ lat, lon });
  };

  // Handle successful report submission
  const handleReportSubmitted = (newReport) => {
    setReports([newReport, ...reports]);
    setSelectedLocation(null);
    
    // Track report submission for badge progress
    if (user) {
      badgeTracker.trackAction('report_submit');
    }
  };

  // Handle successful poll creation
  const handlePollCreated = (newPoll) => {
    setPolls([newPoll, ...polls]);
  };

  // Handle vote updates
  const handleVoteUpdate = (reportId, upvotes, downvotes, voteType) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === reportId ? { ...report, upvotes, downvotes } : report
      )
    );
    
    // Track vote for badge progress
    if (user && voteType) {
      badgeTracker.trackAction(voteType);
    }
  };

  // Handle poll vote submission
  const handlePollVoted = (pollId, updatedVotes) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) =>
        poll.id === pollId ? { ...poll, votes: updatedVotes } : poll
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🌍 Crowd Sourced Reports
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500 font-medium">Loading...</div>
          </div>
        ) : (
          <>
            {/* Report Submission Section */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Submit Air Quality Report
                </h2>
              </div>
              <ReportForm
                user={user}
                selectedLocation={selectedLocation}
                onReportSubmitted={handleReportSubmitted}
              />
            </section>

            {/* Map and Reports Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map */}
              <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Report Locations
                  </h3>
                </div>
                <div className="h-[500px] rounded-xl overflow-hidden">
                  <MapView
                    onSelect={handleMapClick}
                    reports={filteredReports}
                    mode="reports"
                  />
                </div>
              </section>

              {/* Reports List */}
              <section className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Community Reports
                  </h3>
                </div>
                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={reportSearchQuery}
                    onChange={(e) => setReportSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <ReportList
                  reports={filteredReports}
                  user={user}
                  onVoteUpdate={handleVoteUpdate}
                />
              </section>
            </div>

            {/* Poll Creation Section */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Create Community Poll
                </h2>
              </div>
              <PollForm user={user} onPollCreated={handlePollCreated} />
            </section>

            {/* Polls Section - Collapsible */}
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Community Polls ({filteredPolls.length})
                  </h2>
                </div>
                <button
                  onClick={() => setIsPollsExpanded(!isPollsExpanded)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  {isPollsExpanded ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Hide Polls
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show Polls
                    </>
                  )}
                </button>
              </div>

              {isPollsExpanded && (
                <>
                  {/* Search Bar */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Search polls..."
                      value={pollSearchQuery}
                      onChange={(e) => setPollSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {filteredPolls.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {pollSearchQuery ? `No polls found matching "${pollSearchQuery}"` : "No polls available yet. Be the first to create one!"}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPolls.map((poll) => (
                        <Poll
                          key={poll.id}
                          poll={poll}
                          user={user}
                          onVoted={handlePollVoted}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
