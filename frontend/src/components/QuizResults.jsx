import { useState, useEffect } from 'react';
import { calculateScore } from '../utils/quizzes';
import axios from 'axios';
import { MarkdownContent } from '../utils/markdownFormatter.jsx';

const API_URL = 'http://localhost:5000';

export default function QuizResults({ quiz, results, userProfile, onRetake, onChooseAnother }) {
  const [feedback, setFeedback] = useState(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showBadgeUnlock, setShowBadgeUnlock] = useState(false);
  const [scoreRevealed, setScoreRevealed] = useState(false);

  const score = results.score || calculateScore(results.answers, quiz);
  const incorrectAnswers = results.answers.filter(a => !a.isCorrect);

  useEffect(() => {
    // Reveal score with delay for dramatic effect
    setTimeout(() => {
      setScoreRevealed(true);
    }, 300);

    loadPersonalizedFeedback();
    saveQuizCompletion();
    checkBadgeUnlock();
  }, []);

  const loadPersonalizedFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/gemini/quiz-feedback`,
        {
          quiz: {
            id: quiz.id,
            title: quiz.title,
            questions: quiz.questions
          },
          score: score.percentage,
          incorrectQuestions: incorrectAnswers.map(a => ({
            question: a.question,
            selectedOption: a.selectedOption,
            correctOption: a.correctOption
          })),
          userProfile: userProfile || {},
          currentAqi: 3 // Could be fetched from context
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 20000
        }
      );

      if (response.data?.feedback) {
        setFeedback(response.data.feedback);
      }
    } catch (error) {
      console.error('Error loading quiz feedback:', error);
      // Use fallback feedback
      setFeedback(getFallbackFeedback());
    } finally {
      setLoadingFeedback(false);
    }
  };

  const getFallbackFeedback = () => {
    if (score.percentage === 100) {
      return "Perfect score! You have excellent knowledge of air quality. Keep using this knowledge to protect your health!";
    } else if (score.percentage >= 80) {
      return "Great job! You have a strong understanding of air quality. Review the questions you missed to become an expert!";
    } else if (score.percentage >= 60) {
      return "Good effort! You're on the right track. Review the explanations to strengthen your knowledge.";
    } else {
      return "Thanks for taking the quiz! Review the explanations carefully and try again to improve your score.";
    }
  };

  const saveQuizCompletion = () => {
    try {
      const stored = localStorage.getItem('completed_quizzes');
      const completed = stored ? JSON.parse(stored) : [];
      
      if (!completed.includes(quiz.id)) {
        completed.push(quiz.id);
        localStorage.setItem('completed_quizzes', JSON.stringify(completed));
      }

      // Save quiz score
      const scoresKey = 'quiz_scores';
      const scoresStored = localStorage.getItem(scoresKey);
      const scores = scoresStored ? JSON.parse(scoresStored) : {};
      scores[quiz.id] = {
        score: score.percentage,
        date: new Date().toISOString(),
        correct: score.correct,
        total: score.total
      };
      localStorage.setItem(scoresKey, JSON.stringify(scores));
    } catch (error) {
      console.error('Error saving quiz completion:', error);
    }
  };

  const checkBadgeUnlock = () => {
    try {
      const stored = localStorage.getItem('completed_quizzes');
      const completed = stored ? JSON.parse(stored) : [];
      
      // Check if Quiz Master badge should be unlocked (3+ quizzes)
      if (completed.length >= 3) {
        setShowBadgeUnlock(true);
      }
    } catch (error) {
      console.error('Error checking badge unlock:', error);
    }
  };

  const getScoreColor = () => {
    if (score.percentage === 100) return 'text-green-600';
    if (score.percentage >= 80) return 'text-blue-600';
    if (score.percentage >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreEmoji = () => {
    if (score.percentage === 100) return '🏆';
    if (score.percentage >= 80) return '🌟';
    if (score.percentage >= 60) return '👍';
    return '📚';
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Score Display */}
        <div className="text-center mb-8" role="region" aria-label="Quiz results">
          <div className="text-6xl mb-4 animate-bounce-in" role="img" aria-label={`Score emoji: ${getScoreEmoji()}`}>
            {getScoreEmoji()}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 animate-slide-up">Quiz Complete!</h2>
          <div 
            className={`text-5xl font-bold mb-2 transition-all duration-500 ${getScoreColor()} ${scoreRevealed ? 'animate-zoom-in' : 'opacity-0 scale-50'}`} 
            aria-label={`Your score: ${score.percentage} percent`}
          >
            {score.percentage}%
          </div>
          <p className="text-xl text-gray-600 animate-slide-up" aria-label={`You answered ${score.correct} out of ${score.total} questions correctly`}>
            {score.correct} out of {score.total} correct
          </p>
        </div>

        {/* Badge Unlock Notification */}
        {showBadgeUnlock && (
          <div 
            className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 text-center animate-bounce-in animate-glow"
            role="alert"
            aria-live="assertive"
          >
            <div className="text-4xl mb-2" role="img" aria-label="Quiz Master badge icon">🎓</div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Badge Unlocked: Quiz Master!
            </h3>
            <p className="text-gray-700">
              You've completed 3 or more quizzes. You're an air quality expert!
            </p>
          </div>
        )}

        {/* Personalized Feedback */}
        <div className="mb-8 animate-slide-up">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Personalized Feedback</h3>
          
          {loadingFeedback && (
            <div className="bg-blue-50 rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-blue-200 rounded mb-3"></div>
              <div className="h-4 bg-blue-200 rounded mb-3 w-5/6"></div>
              <div className="h-4 bg-blue-200 rounded w-4/6"></div>
            </div>
          )}

          {feedback && !loadingFeedback && (
            <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500 animate-fade-in">
              <MarkdownContent 
                content={feedback} 
                className="text-gray-700 leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Question Review */}
        <div className="mb-8 animate-slide-up">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Question Review</h3>
          <div className="space-y-4" role="list" aria-label="Review of quiz questions and answers">
            {results.answers.map((answer, index) => (
              <div
                key={index}
                className={`
                  p-4 rounded-lg border-2
                  ${answer.isCorrect
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                  }
                `}
                role="listitem"
                aria-label={`Question ${index + 1}: ${answer.isCorrect ? 'Correct' : 'Incorrect'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {answer.isCorrect ? (
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">
                      Question {index + 1}: {answer.question}
                    </p>
                    {!answer.isCorrect && (
                      <div className="text-sm space-y-1">
                        <p className="text-red-700">
                          <span className="font-semibold">Your answer:</span> {answer.selectedOption}
                        </p>
                        <p className="text-green-700">
                          <span className="font-semibold">Correct answer:</span> {answer.correctOption}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Health Tips */}
        {userProfile && (
          <div className="mb-8 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Health Tips for You</h3>
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border-l-4 border-indigo-500 animate-fade-in">
              <ul className="space-y-2 text-gray-700">
                {getHealthTips().map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <button
            onClick={onRetake}
            className="flex-1 bg-white border-2 border-blue-500 text-blue-600 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all duration-200 focus:ring-4 focus:ring-blue-300 transform hover:scale-105"
            aria-label="Retake this quiz"
          >
            🔄 Retake Quiz
          </button>
          <button
            onClick={onChooseAnother}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-300 transform hover:scale-105"
            aria-label="Choose another quiz to take"
          >
            📚 Choose Another Quiz
          </button>
        </div>
      </div>
    </div>
  );

  function getHealthTips() {
    const tips = [];
    
    // Quiz-specific tips
    if (quiz.id === 'asthma_smart') {
      tips.push('Always carry your rescue inhaler when AQI is moderate or higher');
      tips.push('Use an N95 mask when outdoor air quality is poor');
      tips.push('Keep windows closed and use an air purifier with HEPA filter indoors');
    } else if (quiz.id === 'senior_safety') {
      tips.push('Check AQI daily before planning outdoor activities');
      tips.push('Schedule walks for early morning when air is typically cleaner');
      tips.push('Stay well-hydrated to help your body cope with air pollution');
    } else if (quiz.id === 'athlete_quiz') {
      tips.push('Train indoors when AQI is 4 or higher');
      tips.push('Eat antioxidant-rich foods to combat pollution effects');
      tips.push('Allow extra recovery time after training in moderate AQI');
    } else if (quiz.id === 'kids_adventure') {
      tips.push('Play outside when the AQI is green (good)');
      tips.push('Stay inside when the AQI is red (very poor)');
      tips.push('Tell an adult if you have trouble breathing');
    } else {
      tips.push('Monitor AQI daily to plan your activities');
      tips.push('Reduce outdoor exercise when AQI is moderate or higher');
      tips.push('Use air purifiers indoors during poor air quality days');
    }

    return tips;
  }
}
