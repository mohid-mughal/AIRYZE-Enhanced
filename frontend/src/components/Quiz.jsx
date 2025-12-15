import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

export default function Quiz({ quiz, onComplete, userProfile }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [enhancedExplanation, setEnhancedExplanation] = useState(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [focusedOption, setFocusedOption] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [questionVisible, setQuestionVisible] = useState(true);

  const question = quiz.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quiz.questions.length - 1;

  // Reset state when question changes with transition
  useEffect(() => {
    setQuestionVisible(true);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setEnhancedExplanation(null);
    setFocusedOption(0);
  }, [currentQuestion]);

  // Keyboard navigation for quiz options
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle keyboard navigation if answer hasn't been selected
      if (selectedAnswer !== null) {
        // Allow Enter/Space to proceed to next question
        if (showExplanation && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleNext();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedOption((prev) => (prev + 1) % question.options.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedOption((prev) => (prev - 1 + question.options.length) % question.options.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleAnswerSelect(focusedOption);
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          e.preventDefault();
          const optionIndex = parseInt(e.key) - 1;
          if (optionIndex < question.options.length) {
            setFocusedOption(optionIndex);
            handleAnswerSelect(optionIndex);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedOption, selectedAnswer, showExplanation, question.options.length]);

  const handleAnswerSelect = async (selectedIndex) => {
    if (selectedAnswer !== null) return; // Already answered

    const isCorrect = selectedIndex === question.correctIndex;
    setSelectedAnswer(selectedIndex);
    setShowExplanation(true);

    // Record answer
    const answer = {
      questionId: question.id,
      selectedIndex,
      isCorrect,
      question: question.question,
      selectedOption: question.options[selectedIndex],
      correctOption: question.options[question.correctIndex]
    };

    setAnswers([...answers, answer]);

    // Announce result to screen readers
    if (isCorrect) {
      setAnnouncement(`Correct! ${question.explanation}`);
    } else {
      setAnnouncement(`Incorrect. The correct answer is: ${question.options[question.correctIndex]}. ${question.explanation}`);
    }

    // Load enhanced explanation from Gemini
    if (!isCorrect) {
      loadEnhancedExplanation(answer);
    }
  };

  const loadEnhancedExplanation = async (answer) => {
    setLoadingExplanation(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/gemini/quiz-explanation`,
        {
          question: {
            id: question.id,
            question: question.question,
            options: question.options,
            correctIndex: question.correctIndex,
            explanation: question.explanation
          },
          userProfile: userProfile || {},
          wasCorrect: answer.isCorrect
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 20000
        }
      );

      if (response.data?.explanation) {
        setEnhancedExplanation(response.data.explanation);
      }
    } catch (error) {
      console.error('Error loading enhanced explanation:', error);
      // Use basic explanation as fallback
      setEnhancedExplanation(question.explanation);
    } finally {
      setLoadingExplanation(false);
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Quiz complete - include the current answer
      const finalAnswers = [...answers];
      
      // Fade out before showing results
      setIsTransitioning(true);
      setQuestionVisible(false);
      
      setTimeout(() => {
        onComplete({
          quiz,
          answers: finalAnswers,
          score: calculateScore(finalAnswers)
        });
      }, 300);
    } else {
      // Transition to next question
      setIsTransitioning(true);
      setQuestionVisible(false);
      
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setIsTransitioning(false);
        // Announce next question to screen readers
        setAnnouncement(`Question ${currentQuestion + 2} of ${quiz.questions.length}`);
      }, 300);
    }
  };

  const calculateScore = (allAnswers) => {
    const correct = allAnswers.filter(a => a.isCorrect).length;
    const total = quiz.questions.length;
    const percentage = Math.round((correct / total) * 100);

    return {
      correct,
      total,
      percentage
    };
  };

  const getOptionStyle = (index) => {
    if (selectedAnswer === null) {
      return 'bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-400';
    }

    if (index === question.correctIndex) {
      return 'bg-green-100 border-green-500 text-green-900';
    }

    if (index === selectedAnswer && index !== question.correctIndex) {
      return 'bg-red-100 border-red-500 text-red-900';
    }

    return 'bg-gray-100 border-gray-300 text-gray-500';
  };

  const getOptionIcon = (index) => {
    if (selectedAnswer === null) return null;

    if (index === question.correctIndex) {
      return (
        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      );
    }

    if (index === selectedAnswer && index !== question.correctIndex) {
      return (
        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      );
    }

    return null;
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Screen Reader Announcements */}
      <div 
        role="status" 
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <div className={`bg-white rounded-xl shadow-lg p-8 transition-all duration-300 ${questionVisible ? 'animate-fade-in' : 'animate-fade-out'}`}>
        {/* Keyboard Navigation Hint */}
        <div className="mb-4 text-sm text-gray-500 text-center">
          <span className="sr-only">Keyboard navigation: Use arrow keys to navigate options, Enter or Space to select, or press 1-4 to select an option directly.</span>
          <span aria-hidden="true">💡 Tip: Use arrow keys ↑↓ or numbers 1-4 to navigate</span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 animate-slide-up">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600" aria-live="polite">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}%
            </span>
          </div>
          <div 
            className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={currentQuestion + 1}
            aria-valuemin={1}
            aria-valuemax={quiz.questions.length}
            aria-label={`Quiz progress: question ${currentQuestion + 1} of ${quiz.questions.length}`}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-700 ease-out"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 animate-slide-up" id="quiz-question">
            {question.question}
          </h2>

          {/* Answer Options */}
          <div className="space-y-3 animate-slide-up" role="radiogroup" aria-labelledby="quiz-question">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                onFocus={() => setFocusedOption(index)}
                disabled={selectedAnswer !== null}
                role="radio"
                aria-checked={selectedAnswer === index}
                aria-label={`Option ${index + 1}: ${option}`}
                className={`
                  w-full text-left p-4 rounded-lg border-2 transition-all duration-200
                  flex items-center justify-between gap-3
                  ${getOptionStyle(index)}
                  ${focusedOption === index && selectedAnswer === null ? 'ring-4 ring-blue-300' : ''}
                  ${selectedAnswer === null ? 'cursor-pointer focus:ring-4 focus:ring-blue-300' : 'cursor-default'}
                `}
              >
                <span className="flex-1 font-medium">
                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                  {option}
                </span>
                {getOptionIcon(index)}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="mb-6 animate-slide-up">
            <div className={`
              p-4 rounded-lg border-l-4 transition-all duration-300
              ${selectedAnswer === question.correctIndex
                ? 'bg-green-50 border-green-500'
                : 'bg-blue-50 border-blue-500'
              }
            `}>
              <h3 className="font-bold text-gray-900 mb-2">
                {selectedAnswer === question.correctIndex ? '✅ Correct!' : '💡 Explanation'}
              </h3>
              
              {/* Basic Explanation */}
              <p className="text-gray-700 mb-2">{question.explanation}</p>

              {/* Enhanced Gemini Explanation */}
              {loadingExplanation && (
                <div className="mt-3 p-3 bg-white/50 rounded animate-pulse">
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              )}

              {enhancedExplanation && !loadingExplanation && (
                <div className="mt-3 p-3 bg-white/80 rounded border border-blue-200 animate-fade-in">
                  <p className="text-sm text-gray-700 italic">{enhancedExplanation}</p>
                </div>
              )}

              {/* Tip */}
              {question.tip && (
                <p className="text-sm text-gray-600 mt-3 italic">
                  💡 <strong>Tip:</strong> {question.tip}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Next Button */}
        {showExplanation && (
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed animate-slide-up"
            aria-label={isLastQuestion ? 'See quiz results' : 'Go to next question'}
          >
            {isLastQuestion ? 'See Results 🎯' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  );
}
