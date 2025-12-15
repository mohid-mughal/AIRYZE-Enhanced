import { useState, useEffect, useRef } from 'react';
import { badgeTracker } from '../utils/badgeTracker';
import BadgeGrid from '../components/BadgeGrid';
import BadgeCollectionSummary from '../components/BadgeCollectionSummary';
import QuizSelector from '../components/QuizSelector';
import Quiz from '../components/Quiz';
import QuizResults from '../components/QuizResults';
import Sidebar from '../components/Sidebar';
import Confetti from '../components/Confetti';
import { BadgeGridSkeleton, QuizSelectorSkeleton, BadgeSyncSpinner } from '../components/SkeletonLoader';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default function BadgesQuizzes({ user, healthProfile }) {
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState({});
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizInProgress, setQuizInProgress] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [geminiMessage, setGeminiMessage] = useState(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loadingBadges, setLoadingBadges] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const audioRef = useRef(null);

  // Load badges and progress on mount
  useEffect(() => {
    loadBadgesAndProgress();

    // Set up badge earned callback
    badgeTracker.onBadgeEarned = handleBadgeEarned;

    // Set up sync callbacks
    badgeTracker.onSyncStart = () => setSyncing(true);
    badgeTracker.onSyncComplete = () => setSyncing(false);

    return () => {
      badgeTracker.onBadgeEarned = null;
      badgeTracker.onSyncStart = null;
      badgeTracker.onSyncComplete = null;
    };
  }, []);

  const loadBadgesAndProgress = () => {
    setLoadingBadges(true);
    
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      const earnedBadges = badgeTracker.earnedBadges;
      const allProgress = badgeTracker.getAllProgress();
      
      setBadges(earnedBadges);
      setProgress(allProgress);
      setLoadingBadges(false);
    }, 300);
  };

  const handleBadgeEarned = (badge) => {
    setNewlyEarnedBadge(badge);
    setShowCelebration(true);
    setShowConfetti(true);
    loadBadgesAndProgress();

    // Play sound effect if enabled
    if (soundEnabled) {
      playBadgeSound();
    }

    // Load Gemini congratulations message
    loadGeminiCongratulations(badge);

    // Announce to screen readers
    setAnnouncement(`Congratulations! You've earned the ${badge.name} badge. ${badge.description}`);

    // Auto-hide celebration after 8 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 8000);
  };

  const playBadgeSound = () => {
    // Create a simple success sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 523.25; // C5
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);

      // Play a second note
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.frequency.value = 659.25; // E5
        osc2.type = 'sine';
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        osc2.start(audioContext.currentTime);
        osc2.stop(audioContext.currentTime + 0.5);
      }, 150);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const loadGeminiCongratulations = async (badge) => {
    setLoadingGemini(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/gemini/badge-congrats`,
        {
          badge: {
            id: badge.id,
            name: badge.name,
            description: badge.description,
            icon: badge.icon
          },
          userProfile: healthProfile || {},
          progress: badge.threshold
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 15000
        }
      );

      if (response.data?.message) {
        setGeminiMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error loading Gemini message:', error);
      // Use fallback message
      setGeminiMessage(getFallbackMessage(badge));
    } finally {
      setLoadingGemini(false);
    }
  };

  const getFallbackMessage = (badge) => {
    const messages = {
      'daily_streak_7': 'Amazing! You\'ve checked AQI for 7 days straight! Keep up this healthy habit! 🔥',
      'weekly_streak_4': 'Incredible dedication! A full month of AQI monitoring shows real commitment to your health! 👑',
      'report_contributor': 'Thank you for contributing to the community! Your reports help everyone stay informed! 📝',
      'upvoter': 'Your positive engagement makes our community better! Keep spreading good vibes! 👍',
      'downvoter': 'Thanks for keeping our data quality high! Your vigilance is appreciated! 👎',
      'quiz_master': 'Congratulations! You\'re now an air quality expert! Your knowledge will keep you safe! 🎓',
      'alert_responder': 'You\'re staying on top of air quality changes! Great job being proactive! 📧',
      'city_explorer': 'You\'re a true explorer! Understanding air quality across cities is valuable! 🌍'
    };

    return messages[badge.id] || `Congratulations on earning the ${badge.name} badge! ${badge.icon}`;
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    setQuizInProgress(true);
    setQuizResults(null);
    
    // Announce quiz start to screen readers
    setAnnouncement(`Starting ${quiz.title}. ${quiz.questions.length} questions.`);
  };

  const handleQuizComplete = (results) => {
    setQuizResults(results);
    setQuizInProgress(false);
    
    // Announce quiz completion to screen readers
    setAnnouncement(`Quiz complete! You scored ${results.score.percentage}%. ${results.score.correct} out of ${results.score.total} correct.`);
    
    // Track quiz completion for badge progress
    badgeTracker.trackAction('quiz_complete');
    loadBadgesAndProgress();
  };

  const handleRetakeQuiz = () => {
    setQuizResults(null);
    setQuizInProgress(true);
  };

  const handleChooseAnotherQuiz = () => {
    setSelectedQuiz(null);
    setQuizResults(null);
    setQuizInProgress(false);
  };

  const closeCelebration = () => {
    setShowCelebration(false);
    setShowConfetti(false);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Screen Reader Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Badges & Quizzes
            </h1>
            <p className="text-gray-600">
              Earn badges by engaging with the app and test your air quality knowledge!
            </p>
          </header>

          {/* Confetti Effect */}
          <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

          {/* Badge Unlock Celebration Modal */}
          {showCelebration && newlyEarnedBadge && (
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
              role="dialog"
              aria-modal="true"
              aria-labelledby="badge-unlock-title"
              aria-describedby="badge-unlock-description"
            >
              <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-2xl max-w-md w-full p-8 text-center relative animate-bounce-in animate-glow border-4 border-blue-300">
                {/* Sound Toggle */}
                <button
                  onClick={toggleSound}
                  className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 focus:ring-4 focus:ring-blue-300 rounded-lg p-2"
                  aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
                  title={soundEnabled ? 'Mute sound' : 'Enable sound'}
                >
                  {soundEnabled ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>

                {/* Close Button */}
                <button
                  onClick={closeCelebration}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:ring-4 focus:ring-blue-300 rounded-lg p-2"
                  aria-label="Close celebration modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {/* Badge Icon with Pulse */}
                <div className="text-7xl mb-4 animate-scale-pulse" role="img" aria-label={`${newlyEarnedBadge.name} badge icon`}>
                  {newlyEarnedBadge.icon}
                </div>

                {/* Title */}
                <h2 id="badge-unlock-title" className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3 animate-slide-up">
                  Badge Unlocked! 🎉
                </h2>

                {/* Badge Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-slide-up">
                  {newlyEarnedBadge.name}
                </h3>

                {/* Badge Description */}
                <p id="badge-unlock-description" className="text-gray-600 mb-6 animate-slide-up">
                  {newlyEarnedBadge.description}
                </p>

                {/* Gemini Congratulations Message */}
                {loadingGemini && (
                  <div className="mb-6 bg-white/50 rounded-lg p-4 animate-pulse">
                    <div className="h-3 bg-blue-200 rounded mb-2"></div>
                    <div className="h-3 bg-blue-200 rounded w-5/6 mb-2"></div>
                    <div className="h-3 bg-blue-200 rounded w-4/6"></div>
                  </div>
                )}

                {geminiMessage && !loadingGemini && (
                  <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500 animate-slide-up">
                    <p className="text-gray-700 italic leading-relaxed">{geminiMessage}</p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  onClick={closeCelebration}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all focus:ring-4 focus:ring-blue-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  aria-label="Close celebration and return to badges page"
                >
                  Awesome! 🚀
                </button>
              </div>
            </div>
          )}

          {/* Badges Section */}
          <section className="mb-12" aria-labelledby="badges-heading">
            <div className="flex items-center justify-between mb-6">
              <h2 id="badges-heading" className="text-2xl font-bold text-gray-900">Your Badge Collection</h2>
              {syncing && <BadgeSyncSpinner />}
            </div>
            
            {loadingBadges ? (
              <>
                {/* Loading Skeleton */}
                <div className="mb-8">
                  <div className="bg-white rounded-xl p-6 border-2 border-gray-200 animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <BadgeGridSkeleton />
              </>
            ) : (
              <>
                {/* Badge Collection Summary */}
                <div className="mb-8">
                  <BadgeCollectionSummary badges={badges} userProfile={healthProfile} />
                </div>

                {/* Badge Grid */}
                <BadgeGrid badges={badges} progress={progress} userProfile={healthProfile} />
              </>
            )}
          </section>

          {/* Quizzes Section */}
          <section aria-labelledby="quizzes-heading">
            <h2 id="quizzes-heading" className="text-2xl font-bold text-gray-900 mb-6">Educational Quizzes</h2>
            
            {loadingBadges ? (
              <QuizSelectorSkeleton />
            ) : (
              <>
                {!quizInProgress && !quizResults && (
                  <QuizSelector 
                    onSelect={handleQuizSelect} 
                    userProfile={healthProfile}
                  />
                )}

                {quizInProgress && selectedQuiz && (
                  <Quiz 
                    quiz={selectedQuiz} 
                    onComplete={handleQuizComplete}
                    userProfile={healthProfile}
                  />
                )}

                {quizResults && selectedQuiz && (
                  <QuizResults
                    quiz={selectedQuiz}
                    results={quizResults}
                    userProfile={healthProfile}
                    onRetake={handleRetakeQuiz}
                    onChooseAnother={handleChooseAnotherQuiz}
                  />
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
