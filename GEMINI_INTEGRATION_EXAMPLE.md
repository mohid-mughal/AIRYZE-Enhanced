# Gemini Service Integration Examples

This document provides practical examples of how to integrate the enhanced Gemini service with the Badges & Quizzes feature.

## Backend Integration (Node.js/Express)

### Example 1: Badge Congratulations Endpoint

```javascript
// In a controller or route handler
const geminiService = require('./services/geminiService');
const { getBadgeCongratulations } = require('../frontend/src/utils/staticFallbacks');

async function handleBadgeEarned(req, res) {
  const { badgeId, userId } = req.body;
  
  // Get badge and user data
  const badge = getBadgeById(badgeId);
  const user = await getUserById(userId);
  const userProfile = user.health_profile;
  const progress = badge.threshold; // They just earned it
  
  // Try Gemini first
  let congratsMessage = await geminiService.generateBadgeCongratulations(
    badge,
    userProfile,
    progress
  );
  
  // Fallback to static if Gemini fails
  if (!congratsMessage) {
    congratsMessage = getBadgeCongratulations(badgeId);
  }
  
  res.json({
    success: true,
    badge,
    message: congratsMessage
  });
}
```

### Example 2: Quiz Completion Endpoint

```javascript
const geminiService = require('./services/geminiService');
const { getQuizFeedback } = require('../frontend/src/utils/staticFallbacks');

async function handleQuizCompletion(req, res) {
  const { quizId, answers, userId } = req.body;
  
  // Calculate score
  const quiz = getQuizById(quizId);
  const score = calculateScore(answers, quiz);
  const incorrectQuestions = getIncorrectQuestions(answers, quiz);
  
  // Get user data and current AQI
  const user = await getUserById(userId);
  const currentAqi = await getCurrentAQI(user.city);
  
  // Try Gemini first
  let feedback = await geminiService.generateQuizFeedback(
    quiz,
    score.percentage,
    incorrectQuestions,
    user.health_profile,
    currentAqi
  );
  
  // Fallback to static if Gemini fails
  if (!feedback) {
    feedback = getQuizFeedback(score.percentage);
  }
  
  res.json({
    success: true,
    score,
    feedback,
    incorrectQuestions
  });
}
```

## Frontend Integration (React)

### Example 3: Badge Card Component with Gemini

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getBadgeCongratulations } from '../utils/staticFallbacks';

function BadgeCard({ badge, earned, progress, userProfile }) {
  const [congratsMessage, setCongratsMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  
  useEffect(() => {
    if (earned && !congratsMessage) {
      fetchCongratulations();
    }
  }, [earned]);
  
  const fetchCongratulations = async () => {
    try {
      // Try to get Gemini-generated message from backend
      const response = await axios.post('/api/badges/congratulations', {
        badgeId: badge.id,
        userProfile
      });
      
      setCongratsMessage(response.data.message);
      setShowCelebration(true);
    } catch (error) {
      // Fallback to static message
      const fallbackMessage = getBadgeCongratulations(badge.id);
      setCongratsMessage(fallbackMessage);
      setShowCelebration(true);
    }
  };
  
  return (
    <div className={`badge-card ${earned ? 'earned' : 'locked'}`}>
      <div className="badge-icon">{badge.icon}</div>
      <h3>{badge.name}</h3>
      <p>{badge.description}</p>
      
      {earned && (
        <div className="earned-info">
          <span className="earned-date">
            Earned {new Date(earned).toLocaleDateString()}
          </span>
        </div>
      )}
      
      {!earned && (
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{width: `${(progress/badge.threshold)*100}%`}} 
          />
          <span>{progress}/{badge.threshold}</span>
        </div>
      )}
      
      {showCelebration && (
        <div className="celebration-modal">
          <h2>🎉 Congratulations! 🎉</h2>
          <p>{congratsMessage}</p>
          <button onClick={() => setShowCelebration(false)}>
            Awesome!
          </button>
        </div>
      )}
    </div>
  );
}
```

### Example 4: Quiz Results Component

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getQuizFeedback, getEnhancedQuizExplanation } from '../utils/staticFallbacks';

function QuizResults({ quiz, answers, userProfile, currentAqi }) {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  
  const score = calculateScore(answers, quiz);
  const incorrectQuestions = getIncorrectQuestions(answers, quiz);
  
  useEffect(() => {
    fetchFeedback();
  }, []);
  
  const fetchFeedback = async () => {
    try {
      // Try to get Gemini-generated feedback
      const response = await axios.post('/api/quiz/feedback', {
        quizId: quiz.id,
        score: score.percentage,
        incorrectQuestions,
        userProfile,
        currentAqi
      });
      
      setFeedback(response.data.feedback);
    } catch (error) {
      // Fallback to static feedback
      const fallbackFeedback = getQuizFeedback(score.percentage);
      setFeedback(fallbackFeedback);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="quiz-results">
      <h2>Quiz Complete!</h2>
      
      <div className="score-display">
        <div className="score-circle">
          <span className="score-number">{score.percentage}%</span>
          <span className="score-fraction">{score.correct}/{score.total}</span>
        </div>
      </div>
      
      <div className="feedback-section">
        {loading ? (
          <div className="loading-skeleton">Loading feedback...</div>
        ) : (
          <p className="feedback-text">{feedback}</p>
        )}
      </div>
      
      <div className="questions-review">
        <h3>Review Your Answers</h3>
        {quiz.questions.map((question, index) => {
          const userAnswer = answers[index];
          const isCorrect = userAnswer.isCorrect;
          
          return (
            <div key={question.id} className={`question-review ${isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className={`result-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                  {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </div>
              
              <p className="question-text">{question.question}</p>
              
              {!isCorrect && (
                <div className="explanation">
                  <p className="correct-answer">
                    Correct answer: {question.options[question.correctIndex]}
                  </p>
                  <p className="explanation-text">
                    {getEnhancedQuizExplanation(question.explanation, quiz.audience)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="action-buttons">
        <button onClick={() => window.location.reload()}>
          Retake Quiz
        </button>
        <button onClick={() => navigate('/badges-quizzes')}>
          Choose Another Quiz
        </button>
      </div>
    </div>
  );
}
```

### Example 5: Badge Progress with Motivation

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getBadgeMotivation } from '../utils/staticFallbacks';

function BadgeProgressCard({ badge, currentProgress, userProfile }) {
  const [motivation, setMotivation] = useState('');
  
  useEffect(() => {
    if (currentProgress > 0 && currentProgress < badge.threshold) {
      fetchMotivation();
    }
  }, [currentProgress]);
  
  const fetchMotivation = async () => {
    try {
      // Try Gemini first
      const response = await axios.post('/api/badges/motivation', {
        badgeId: badge.id,
        currentProgress,
        userProfile
      });
      
      setMotivation(response.data.message);
    } catch (error) {
      // Fallback to static
      const fallbackMotivation = getBadgeMotivation(badge, currentProgress);
      setMotivation(fallbackMotivation);
    }
  };
  
  const percentage = Math.round((currentProgress / badge.threshold) * 100);
  
  return (
    <div className="badge-progress-card">
      <div className="badge-icon-small">{badge.icon}</div>
      <div className="progress-info">
        <h4>{badge.name}</h4>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{width: `${percentage}%`}}
          />
        </div>
        <span className="progress-text">
          {currentProgress}/{badge.threshold}
        </span>
        {motivation && (
          <p className="motivation-text">{motivation}</p>
        )}
      </div>
    </div>
  );
}
```

### Example 6: Quiz Recommendation

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getQuizRecommendation } from '../utils/staticFallbacks';

function QuizSelector({ userProfile, completedQuizzes, currentAqi }) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecommendation();
  }, []);
  
  const fetchRecommendation = async () => {
    try {
      // Try Gemini first
      const response = await axios.post('/api/quiz/recommend', {
        userProfile,
        completedQuizzes,
        currentAqi
      });
      
      setRecommendation(response.data.recommendation);
    } catch (error) {
      // Fallback to static
      const fallbackRec = getQuizRecommendation(userProfile, completedQuizzes);
      setRecommendation(fallbackRec);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="quiz-selector">
      <h2>Choose a Quiz</h2>
      
      {!loading && recommendation && (
        <div className="recommended-quiz">
          <span className="recommended-badge">Recommended for you</span>
          <QuizCard 
            quiz={getQuizById(recommendation.quizId)} 
            reason={recommendation.reason}
            highlighted={true}
          />
        </div>
      )}
      
      <div className="all-quizzes">
        {QUIZ_DEFINITIONS
          .filter(q => !completedQuizzes.includes(q.id))
          .map(quiz => (
            <QuizCard 
              key={quiz.id} 
              quiz={quiz}
              highlighted={quiz.id === recommendation?.quizId}
            />
          ))}
      </div>
    </div>
  );
}
```

## API Endpoint Examples

### Badge Congratulations Endpoint

```javascript
// routes/badgeRoutes.js
router.post('/badges/congratulations', async (req, res) => {
  try {
    const { badgeId, userProfile } = req.body;
    const badge = getBadgeById(badgeId);
    
    const message = await geminiService.generateBadgeCongratulations(
      badge,
      userProfile,
      badge.threshold
    );
    
    res.json({
      success: true,
      message: message || getBadgeCongratulations(badgeId)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Quiz Feedback Endpoint

```javascript
// routes/quizRoutes.js
router.post('/quiz/feedback', async (req, res) => {
  try {
    const { quizId, score, incorrectQuestions, userProfile, currentAqi } = req.body;
    const quiz = getQuizById(quizId);
    
    const feedback = await geminiService.generateQuizFeedback(
      quiz,
      score,
      incorrectQuestions,
      userProfile,
      currentAqi
    );
    
    res.json({
      success: true,
      feedback: feedback || getQuizFeedback(score)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Best Practices

1. **Always Use Fallbacks**: Never rely solely on Gemini - always have static fallbacks
2. **Cache Aggressively**: The service already caches for 1 hour - leverage this
3. **Handle Errors Gracefully**: Don't show error messages to users - use fallbacks
4. **Loading States**: Show loading skeletons while waiting for Gemini responses
5. **Progressive Enhancement**: Start with static, enhance with Gemini when available
6. **Monitor Performance**: Track Gemini response times and fallback usage

## Testing

```javascript
// Test with Gemini
const message = await geminiService.generateBadgeCongratulations(badge, profile, progress);
console.log('Gemini:', message);

// Test fallback
const fallback = getBadgeCongratulations(badge.id);
console.log('Fallback:', fallback);

// Verify they're both appropriate
assert(message || fallback, 'Should always have a message');
```
