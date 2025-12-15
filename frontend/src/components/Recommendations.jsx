// ./components/Recommendations.jsx
import { useState, useEffect } from "react";
import { getAQIStatus } from "../utils/aqiLevels";
import { getPersonalizedRecommendations } from "../api/personalizationService";
import { getQuizById } from "../utils/quizzes";
import { MarkdownContent } from "../utils/markdownFormatter.jsx";

export default function Recommendations({ data, healthProfile }) {
  const { aqi = 0 } = data || {};
  const status = getAQIStatus(aqi) || {};
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [quizScores, setQuizScores] = useState({});
  
  console.log("AQI in Recommendations:", aqi);
  
  const tipsByLevel = {
    0: [
      "Be aware of your body's signals. Symptoms like coughing, burning eyes, or difficulty breathing are strong indicators that the air quality is poor.",
      "Consider wearing a mask if you experience any discomfort while outdoors.",
      "Stay hydrated and eat healthy.",
      "Avoid high-traffic areas.",
    ],
    1: [
      "Enjoy outdoor activities freely.",
      "Keep indoor spaces naturally ventilated.",
      "A great day for exercise and sports.",
    ],
    2: [
      "Sensitive groups should monitor symptoms.",
      "Light outdoor exercise is okay.",
      "Keep windows open for fresh air.",
    ],
    3: [
      "Limit extended outdoor activities.",
      "Use masks if you feel discomfort.",
      "Reduce exposure for children and elderly.",
    ],
    4: [
      "Avoid outdoor exercise as much as possible.",
      "Use N95 masks when stepping outside.",
      "Keep windows closed to reduce indoor pollution.",
      "Use air purifiers if available.",
    ],
    5: [
      "Stay indoors unless absolutely necessary.",
      "Use N95/KN95 masks outdoors.",
      "Keep all windows closed and seal openings.",
      "Avoid driving during peak smog hours.",
      "People with breathing issues should avoid going out completely.",
    ],
  };

  const tips = tipsByLevel[aqi] || tipsByLevel[0];

  // Load completed quizzes from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('completed_quizzes');
      const completed = stored ? JSON.parse(stored) : [];
      setCompletedQuizzes(completed);

      const scoresStored = localStorage.getItem('quiz_scores');
      const scores = scoresStored ? JSON.parse(scoresStored) : {};
      setQuizScores(scores);
    } catch (error) {
      console.error('Error loading quiz data:', error);
    }
  }, []);

  // Fetch personalized recommendations when data, healthProfile, or quizzes change
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!data || !data.aqi) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Include quiz data in the request
        const result = await getPersonalizedRecommendations(
          healthProfile, 
          data,
          completedQuizzes,
          quizScores
        );
        setRecommendations(result);
      } catch (err) {
        console.error('Failed to fetch personalized recommendations:', err);
        setError(err);
        // Will fall back to default tips
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [data, healthProfile, completedQuizzes, quizScores]);

  // Determine which tips to display
  const displayTips = recommendations 
    ? [...(recommendations.general || []), ...(recommendations.health_specific || [])]
    : tips;

  return (
    <div
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 sm:p-8 shadow-xl min-h-[260px] border-2 transition-all duration-300 hover:shadow-2xl"
      style={{ borderColor: `${status.color || "#999"}40` }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="w-2 h-8 rounded-full"
          style={{ background: `linear-gradient(to bottom, ${status.color || "#999"}, ${status.color || "#999"}dd)` }}
        ></div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
          {healthProfile ? 'Personalized' : 'Preventive'} Tips for <span style={{ color: status.color || "#999" }}>{status.label || "Unknown"}</span> Air Quality
        </h3>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-3 text-gray-600">Loading personalized recommendations...</span>
        </div>
      )}

      {!loading && recommendations && recommendations.general && recommendations.general.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">General Recommendations</h4>
          <ul className="space-y-3">
            {recommendations.general.map((t, i) => (
              <li
                key={i}
                className="p-4 bg-white rounded-xl shadow-sm border-2 flex gap-4 items-start transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                style={{
                  borderLeft: `4px solid ${status.color || "#999"}`,
                  borderColor: `${status.color || "#999"}30`,
                  backgroundColor: `${status.color || "#999"}08`,
                  animationDelay: `${i * 100}ms`
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-sm"
                  style={{ 
                    backgroundColor: status.color || "#999999",
                    boxShadow: `0 0 8px ${status.color || "#999"}60`
                  }}
                />
                <MarkdownContent 
                  content={t} 
                  className="text-sm sm:text-base text-gray-700 leading-relaxed flex-1"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && recommendations && recommendations.health_specific && recommendations.health_specific.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3">Health-Specific Advice</h4>
          <ul className="space-y-3">
            {recommendations.health_specific.map((t, i) => (
              <li
                key={i}
                className="p-4 bg-white rounded-xl shadow-sm border-2 flex gap-4 items-start transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                style={{
                  borderLeft: `4px solid ${status.color || "#999"}`,
                  borderColor: `${status.color || "#999"}30`,
                  backgroundColor: `${status.color || "#999"}08`,
                  animationDelay: `${(recommendations.general?.length || 0 + i) * 100}ms`
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-sm"
                  style={{ 
                    backgroundColor: status.color || "#999999",
                    boxShadow: `0 0 8px ${status.color || "#999"}60`
                  }}
                />
                <MarkdownContent 
                  content={t} 
                  className="text-sm sm:text-base text-gray-700 leading-relaxed flex-1"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && recommendations && recommendations.quiz_insights && recommendations.quiz_insights.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-xl">🎓</span>
            Based on Your Quiz Results
          </h4>
          <ul className="space-y-3">
            {recommendations.quiz_insights.map((t, i) => (
              <li
                key={i}
                className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-sm border-2 border-purple-200 flex gap-4 items-start transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
                style={{
                  animationDelay: `${((recommendations.general?.length || 0) + (recommendations.health_specific?.length || 0) + i) * 100}ms`
                }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-sm bg-purple-500"
                  style={{ 
                    boxShadow: '0 0 8px rgba(168, 85, 247, 0.6)'
                  }}
                />
                <MarkdownContent 
                  content={t} 
                  className="text-sm sm:text-base text-gray-700 leading-relaxed flex-1"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && (!recommendations || (recommendations.general?.length === 0 && recommendations.health_specific?.length === 0)) && (
        <ul className="space-y-3 sm:space-y-4">
          {displayTips.map((t, i) => (
          <li
            key={i}
            className="p-4 bg-white rounded-xl shadow-sm border-2 flex gap-4 items-start transition-all duration-300 hover:shadow-md hover:scale-[1.02]"
            style={{
              borderLeft: `4px solid ${status.color || "#999"}`,
              borderColor: `${status.color || "#999"}30`,
              backgroundColor: `${status.color || "#999"}08`,
              animationDelay: `${i * 100}ms`
            }}
          >
            <div
              className="w-2 h-2 rounded-full mt-2 flex-shrink-0 shadow-sm"
              style={{ 
                backgroundColor: status.color || "#999999",
                boxShadow: `0 0 8px ${status.color || "#999"}60`
              }}
            />
            <MarkdownContent 
              content={t} 
              className="text-sm sm:text-base text-gray-700 leading-relaxed flex-1"
            />
          </li>
        ))}
        </ul>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 italic">
        💡 {recommendations && healthProfile && completedQuizzes.length > 0
          ? `Recommendations personalized based on your health profile, current AQI, and ${completedQuizzes.length} completed quiz${completedQuizzes.length > 1 ? 'es' : ''}.`
          : recommendations && healthProfile 
          ? 'Recommendations personalized based on your health profile and current AQI.' 
          : 'Tips are based on AQI category and may vary by region.'}
      </div>
    </div>
  );
}
