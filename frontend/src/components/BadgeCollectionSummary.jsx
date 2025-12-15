import { useState, useEffect } from 'react';
import axios from 'axios';
import { BADGE_DEFINITIONS } from '../utils/badges';

const API_URL = 'http://localhost:5000';

export default function BadgeCollectionSummary({ badges, userProfile }) {
  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const totalBadges = BADGE_DEFINITIONS.length;
  const earnedCount = badges.length;
  const completionPercentage = Math.round((earnedCount / totalBadges) * 100);
  
  // Get most recent badge
  const mostRecentBadge = badges.length > 0 
    ? badges.reduce((latest, badge) => {
        const latestDate = new Date(latest.earned);
        const currentDate = new Date(badge.earned);
        return currentDate > latestDate ? badge : latest;
      })
    : null;

  // Load Gemini summary on mount
  useEffect(() => {
    loadGeminiSummary();
  }, [earnedCount]);

  const loadGeminiSummary = async () => {
    setLoadingSummary(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/gemini/badge-summary`,
        {
          earnedBadges: badges,
          totalBadges: totalBadges,
          userProfile: userProfile || {}
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 20000
        }
      );

      if (response.data?.summary) {
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Error loading badge summary:', error);
      // Use fallback message
      setSummary(getFallbackSummary());
    } finally {
      setLoadingSummary(false);
    }
  };

  const getFallbackSummary = () => {
    if (earnedCount === 0) {
      return "Start your badge collection journey today! Complete actions throughout the app to earn your first badge.";
    } else if (earnedCount === totalBadges) {
      return "Incredible! You've earned all badges! You're a true air quality champion!";
    } else if (completionPercentage >= 75) {
      return `Amazing progress! You've earned ${earnedCount} out of ${totalBadges} badges. Just a few more to complete your collection!`;
    } else if (completionPercentage >= 50) {
      return `Great work! You're halfway there with ${earnedCount} badges earned. Keep up the momentum!`;
    } else {
      return `You've earned ${earnedCount} badge${earnedCount === 1 ? '' : 's'} so far. Keep engaging with the app to unlock more!`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getProgressColor = () => {
    if (completionPercentage >= 75) return 'from-green-400 to-emerald-500';
    if (completionPercentage >= 50) return 'from-blue-400 to-indigo-500';
    if (completionPercentage >= 25) return 'from-yellow-400 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  const getProgressIcon = () => {
    if (completionPercentage === 100) return '🏆';
    if (completionPercentage >= 75) return '⭐';
    if (completionPercentage >= 50) return '🎯';
    if (completionPercentage >= 25) return '🌟';
    return '🎪';
  };

  return (
    <div 
      className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 border-2 border-blue-100"
      role="region"
      aria-label="Badge collection summary"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span className="text-3xl" role="img" aria-label="Trophy icon">
            {getProgressIcon()}
          </span>
          Your Collection
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-700 text-sm font-semibold focus:ring-4 focus:ring-blue-300 rounded-lg px-3 py-1 transition-colors"
          aria-expanded={showDetails}
          aria-label={showDetails ? 'Hide details' : 'Show details'}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Earned Count */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-blue-600">
            {earnedCount}
          </div>
          <div className="text-sm text-gray-600">
            Badges Earned
          </div>
        </div>

        {/* Completion Percentage */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-3xl font-bold text-indigo-600">
            {completionPercentage}%
          </div>
          <div className="text-sm text-gray-600">
            Complete
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Collection Progress
          </span>
          <span className="text-sm text-gray-600">
            {earnedCount} / {totalBadges}
          </span>
        </div>
        <div 
          className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={earnedCount}
          aria-valuemin={0}
          aria-valuemax={totalBadges}
          aria-label={`Badge collection progress: ${earnedCount} out of ${totalBadges} badges earned`}
        >
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 ease-out`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Gemini Summary */}
      <div className="mb-6">
        {loadingSummary ? (
          <div className="bg-white/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-blue-500">
            <p className="text-gray-700 leading-relaxed">
              {summary || getFallbackSummary()}
            </p>
          </div>
        )}
      </div>

      {/* Most Recent Badge */}
      {mostRecentBadge && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="text-4xl" role="img" aria-label={`${mostRecentBadge.name} badge icon`}>
              {BADGE_DEFINITIONS.find(b => b.id === mostRecentBadge.id)?.icon || '🏅'}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">
                Most Recent Badge
              </div>
              <div className="font-bold text-gray-900">
                {mostRecentBadge.name}
              </div>
              <div className="text-xs text-gray-600">
                Earned {formatDate(mostRecentBadge.earned)}
              </div>
            </div>
            <div className="text-green-500">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Stats (Expandable) */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 animate-fade-in">
          <h4 className="font-semibold text-gray-900 mb-3">Badge Categories</h4>
          
          {/* Category Breakdown */}
          {['engagement', 'contribution', 'community', 'learning', 'exploration'].map(category => {
            const categoryBadges = BADGE_DEFINITIONS.filter(b => b.category === category);
            const earnedInCategory = badges.filter(earned => 
              categoryBadges.some(b => b.id === earned.id)
            ).length;
            const categoryPercentage = Math.round((earnedInCategory / categoryBadges.length) * 100);

            return (
              <div key={category} className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {category}
                  </span>
                  <span className="text-xs text-gray-600">
                    {earnedInCategory} / {categoryBadges.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                    style={{ width: `${categoryPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Motivational Message */}
          {earnedCount < totalBadges && (
            <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-700 font-medium">
                💪 Keep going! You're {totalBadges - earnedCount} badge{totalBadges - earnedCount === 1 ? '' : 's'} away from completing your collection!
              </p>
            </div>
          )}

          {/* Perfect Score Celebration */}
          {earnedCount === totalBadges && (
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-700 font-medium">
                🎉 Congratulations! You've mastered the Airyze AQI Monitor and earned every badge!
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
