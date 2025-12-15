import { useState, useEffect } from 'react';
import axios from 'axios';

export default function PersonalizedWelcome({ user, healthProfile, currentAQI }) {
  const [message, setMessage] = useState('');
  const [emoji, setEmoji] = useState('🌤️');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAQIEmoji = (aqi) => {
      if (!aqi || aqi === 0) return '🌤️';
      if (aqi === 1) return '😊';
      if (aqi === 2) return '🙂';
      if (aqi === 3) return '😐';
      if (aqi === 4) return '😷';
      return '⚠️';
    };

    const generateFallbackMessage = (profile, aqi) => {
      if (!aqi || !aqi.aqi) {
        return 'Welcome back! Select a location on the map to check air quality.';
      }

      const aqiLevel = aqi.aqi;
      const conditions = profile?.health_conditions || [];
      const hasHealthConditions = conditions.length > 0 && !conditions.includes('none');

      // Base message on AQI level
      let msg = '';
      
      if (aqiLevel === 1) {
        msg = 'Great news! The air quality is excellent today. ';
        if (hasHealthConditions) {
          msg += 'Perfect conditions for outdoor activities!';
        } else {
          msg += 'Enjoy your outdoor activities!';
        }
      } else if (aqiLevel === 2) {
        msg = 'Air quality is fair today. ';
        if (hasHealthConditions) {
          msg += 'Most activities are fine, but stay aware of how you feel.';
        } else {
          msg += 'Good conditions for most outdoor activities.';
        }
      } else if (aqiLevel === 3) {
        msg = 'Air quality is moderate today. ';
        if (conditions.includes('asthma') || conditions.includes('allergies')) {
          msg += 'Consider limiting prolonged outdoor activities and keep your medication handy.';
        } else if (hasHealthConditions) {
          msg += 'Sensitive individuals should consider reducing outdoor activities.';
        } else {
          msg += 'Most people can enjoy outdoor activities, but sensitive groups should be cautious.';
        }
      } else if (aqiLevel === 4) {
        msg = 'Air quality is poor today. ';
        if (conditions.includes('asthma')) {
          msg += 'Avoid outdoor exercise and wear a mask if you must go outside.';
        } else if (conditions.includes('young_children')) {
          msg += 'Keep children indoors and limit outdoor playtime.';
        } else if (hasHealthConditions) {
          msg += 'Stay indoors and avoid strenuous activities.';
        } else {
          msg += 'Consider limiting outdoor activities and wearing a mask if needed.';
        }
      } else {
        msg = 'Air quality is very poor today. ';
        if (hasHealthConditions) {
          msg += 'Stay indoors, use air purifiers, and monitor your symptoms closely.';
        } else {
          msg += 'Avoid all outdoor activities and stay indoors with windows closed.';
        }
      }

      return msg;
    };

    const generateWelcomeMessage = async () => {
      try {
        setLoading(true);
        
        // Set emoji based on AQI
        const aqiLevel = currentAQI?.aqi || 0;
        setEmoji(getAQIEmoji(aqiLevel));

        // Try to get AI-generated message from backend
        if (healthProfile && currentAQI) {
          try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
              'http://localhost:5000/api/personalization/welcome',
              {
                healthProfile,
                currentAQI
              },
              {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 10000
              }
            );

            if (response.data?.message) {
              setMessage(response.data.message);
              setLoading(false);
              return;
            }
          } catch {
            console.log('AI message unavailable, using fallback');
          }
        }

        // Fallback to rule-based message
        const fallbackMessage = generateFallbackMessage(healthProfile, currentAQI);
        setMessage(fallbackMessage);
        setLoading(false);
      } catch {
        setMessage('Welcome back! Check the air quality data below to plan your day.');
        setLoading(false);
      }
    };

    generateWelcomeMessage();
  }, [healthProfile, currentAQI]);

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-6 shadow-lg border border-blue-100">
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">
          {emoji}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h2>
          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Personalizing your message...</span>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
