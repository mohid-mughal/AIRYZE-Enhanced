import { useState, useEffect } from 'react';
import { QUIZ_DEFINITIONS, getQuizRecommendation } from '../utils/quizzes';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default function QuizSelector({ onSelect, userProfile }) {
  const [completedQuizzes, setCompletedQuizzes] = useState([]);
  const [recommendedQuiz, setRecommendedQuiz] = useState(null);
  const [loadingRecommendation, setLoadingRecommendation] = useState(false);

  useEffect(() => {
    loadCompletedQuizzes();
    loadRecommendation();
  }, []);

  const loadCompletedQuizzes = () => {
    try {
      const stored = localStorage.getItem('completed_quizzes');
      if (stored) {
        setCompletedQuizzes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading completed quizzes:', error);
    }
  };

  const loadRecommendation = async () => {
    setLoadingRecommendation(true);
    try {
      const token = localStorage.getItem('token');
      const stored = localStorage.getItem('completed_quizzes');
      const completed = stored ? JSON.parse(stored) : [];

      const response = await axios.post(
        `${API_URL}/api/gemini/quiz-recommendation`,
        {
          userProfile: userProfile || {},
          completedQuizzes: completed,
          currentAqi: 3 // Default, could be fetched from context
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 22000
        }
      );

      if (response.data?.recommendation) {
        setRecommendedQuiz(response.data.recommendation);
      }
    } catch (error) {
      console.error('Error loading quiz recommendation:', error);
      // Use fallback recommendation
      const fallback = getQuizRecommendation(userProfile);
      if (fallback) {
        setRecommendedQuiz({
          quizId: fallback.id,
          reason: 'This quiz matches your profile and interests.'
        });
      }
    } finally {
      setLoadingRecommendation(false);
    }
  };

  const isCompleted = (quizId) => {
    return completedQuizzes.includes(quizId);
  };

  const isRecommended = (quizId) => {
    return recommendedQuiz?.quizId === quizId;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'hard':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Recommendation Banner */}
      {loadingRecommendation && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-blue-200 rounded w-1/2"></div>
        </div>
      )}

      {recommendedQuiz && !loadingRecommendation && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-1">Recommended for You</h3>
              <p className="text-sm text-blue-700">{recommendedQuiz.reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Available quizzes">
        {QUIZ_DEFINITIONS.map((quiz) => {
          const completed = isCompleted(quiz.id);
          const recommended = isRecommended(quiz.id);

          return (
            <div
              key={quiz.id}
              className={`
                relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer overflow-hidden focus-within:scale-105 focus-within:ring-4 focus-within:ring-blue-300
                ${recommended ? 'ring-2 ring-blue-500' : ''}
              `}
              onClick={() => onSelect(quiz)}
              role="listitem"
            >
              {/* Recommended Badge */}
              {recommended && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Recommended
                </div>
              )}

              {/* Completed Badge */}
              {completed && (
                <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Completed
                </div>
              )}

              <div className="p-6">
                {/* Quiz Icon */}
                <div className="text-5xl mb-4 text-center">{quiz.icon}</div>

                {/* Quiz Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {quiz.title}
                </h3>

                {/* Quiz Description */}
                <p className="text-sm text-gray-600 mb-4 text-center">
                  {quiz.description}
                </p>

                {/* Quiz Info */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className={`px-2 py-1 rounded-full font-semibold ${getDifficultyColor(quiz.difficulty)}`}>
                    {quiz.difficulty}
                  </span>
                  <span className="text-gray-500">
                    {quiz.questions.length} questions
                  </span>
                </div>

                {/* Start Button */}
                <button
                  className={`
                    w-full py-3 rounded-lg font-semibold transition-all duration-200 focus:ring-4 focus:ring-blue-300
                    ${recommended
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(quiz);
                  }}
                  aria-label={`${completed ? 'Retake' : 'Start'} ${quiz.title} quiz. ${quiz.description}. ${quiz.questions.length} questions. Difficulty: ${quiz.difficulty}.${recommended ? ' Recommended for you.' : ''}${completed ? ' Already completed.' : ''}`}
                >
                  {completed ? 'Retake Quiz' : 'Start Quiz'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Your Progress</h3>
            <p className="text-sm text-gray-600">
              You've completed {completedQuizzes.length} out of {QUIZ_DEFINITIONS.length} quizzes
            </p>
          </div>
          <div className="text-4xl">
            {completedQuizzes.length >= 3 ? '🎓' : '📚'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
            style={{ width: `${(completedQuizzes.length / QUIZ_DEFINITIONS.length) * 100}%` }}
          />
        </div>

        {completedQuizzes.length >= 3 && (
          <p className="mt-3 text-sm text-green-600 font-semibold text-center">
            🎉 Congratulations! You've earned the Quiz Master badge!
          </p>
        )}
      </div>
    </div>
  );
}
