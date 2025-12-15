import { useState, useEffect } from 'react';
import axios from 'axios';
import { MarkdownContent } from '../utils/markdownFormatter.jsx';

const API_URL = 'http://localhost:5000';

export default function BadgeCard({ badge, earned, progress, userProfile }) {
  const isEarned = earned !== null;
  const [congratsMessage, setCongratsMessage] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Load Gemini congratulations message when badge is earned
  useEffect(() => {
    if (isEarned && !congratsMessage) {
      loadCongratsMessage();
    }
  }, [isEarned]);

  const loadCongratsMessage = async () => {
    setLoadingMessage(true);
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
          userProfile: userProfile || {},
          progress: progress.current
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 20000
        }
      );

      if (response.data?.message) {
        setCongratsMessage(response.data.message);
      }
    } catch (error) {
      console.error('Error loading congratulations message:', error);
      // Use fallback message
      setCongratsMessage(getFallbackMessage());
    } finally {
      setLoadingMessage(false);
    }
  };

  const getFallbackMessage = () => {
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div
      className={`
        relative rounded-xl p-6 transition-all duration-300 transform hover:scale-105 focus-within:scale-105 focus-within:ring-4 focus-within:ring-blue-300
        ${isEarned 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg' 
          : 'bg-white border-2 border-gray-200 opacity-75'
        }
      `}
      tabIndex={0}
      role="article"
      aria-label={`${badge.name} badge. ${badge.description}. ${isEarned ? `Earned on ${formatDate(earned)}` : `Progress: ${progress.current} out of ${progress.threshold}`}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
    >
      {/* Badge Icon */}
      <div className="text-center mb-4">
        <div 
          className={`
            text-6xl mb-2 transition-all duration-300
            ${isEarned ? 'animate-pulse-slow' : 'grayscale opacity-50'}
          `}
          role="img"
          aria-label={`${badge.name} icon`}
        >
          {badge.icon}
        </div>
        
        {/* Badge Name */}
        <h3 className={`text-lg font-bold mb-1 ${isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
          {badge.name}
        </h3>
        
        {/* Badge Description */}
        <p className={`text-sm ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
          {badge.description}
        </p>
      </div>

      {/* Earned Badge Info */}
      {isEarned && (
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 font-semibold">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Earned {formatDate(earned)}</span>
          </div>

          {/* Gemini Congratulations Message */}
          {loadingMessage && (
            <div className="bg-white/50 rounded-lg p-3 animate-pulse">
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-2 w-5/6"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          )}

          {congratsMessage && !loadingMessage && (
            <div className="bg-white/80 rounded-lg p-3 text-sm text-gray-700 italic border-l-4 border-blue-500">
              <MarkdownContent 
                content={congratsMessage} 
                className="text-sm"
              />
            </div>
          )}
        </div>
      )}

      {/* Locked Badge Progress */}
      {!isEarned && (
        <div className="space-y-2">
          {/* Progress Bar */}
          <div 
            className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress.current}
            aria-valuemin={0}
            aria-valuemax={progress.threshold}
            aria-label={`Badge progress: ${progress.current} out of ${progress.threshold}`}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          
          {/* Progress Text */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">
              {progress.current} / {progress.threshold}
            </span>
            <span className="text-blue-600 font-semibold">
              {progress.percentage}%
            </span>
          </div>

          {/* Motivational Text */}
          {progress.percentage >= 80 && (
            <p className="text-xs text-center text-blue-600 font-semibold animate-bounce">
              Almost there! Keep going! 🎯
            </p>
          )}
        </div>
      )}

      {/* Tooltip on Hover */}
      {showTooltip && !isEarned && (
        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10">
          {progress.threshold - progress.current} more to unlock!
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-2 right-2">
        <span className={`
          text-xs px-2 py-1 rounded-full font-semibold
          ${isEarned 
            ? 'bg-blue-100 text-blue-700' 
            : 'bg-gray-100 text-gray-500'
          }
        `}>
          {badge.category}
        </span>
      </div>
    </div>
  );
}
