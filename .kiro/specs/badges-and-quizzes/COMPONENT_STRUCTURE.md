# BadgesQuizzes Component Structure

## Component Hierarchy

```
App.jsx
└── Route: /badges
    └── BadgesQuizzes.jsx (Main Page)
        ├── Sidebar (Navigation)
        ├── Badge Unlock Celebration Modal
        │   └── Shows when badge is earned
        │
        ├── Badges Section
        │   └── BadgeGrid.jsx
        │       └── BadgeCard.jsx (x8 badges)
        │           ├── Badge Icon
        │           ├── Badge Name & Description
        │           ├── Earned Date (if earned)
        │           ├── Progress Bar (if locked)
        │           └── Gemini Congratulations (if earned)
        │
        └── Quizzes Section
            ├── QuizSelector.jsx (Initial State)
            │   ├── Recommendation Banner (Gemini)
            │   ├── Quiz Cards (x5)
            │   └── Progress Stats
            │
            ├── Quiz.jsx (During Quiz)
            │   ├── Progress Bar
            │   ├── Question Display
            │   ├── Answer Options
            │   ├── Explanation (after answer)
            │   └── Gemini Enhanced Explanation
            │
            └── QuizResults.jsx (After Completion)
                ├── Score Display
                ├── Badge Unlock Notification
                ├── Gemini Personalized Feedback
                ├── Question Review
                ├── Health Tips
                └── Action Buttons
```

## Data Flow

```
BadgesQuizzes.jsx
    │
    ├─→ badgeTracker.loadProgress()
    │   └─→ localStorage → badges & progress
    │
    ├─→ BadgeGrid
    │   └─→ BadgeCard (for each badge)
    │       └─→ Gemini API (if earned)
    │           └─→ /api/gemini/badge-congrats
    │
    └─→ Quiz Flow
        │
        ├─→ QuizSelector
        │   └─→ Gemini API
        │       └─→ /api/gemini/quiz-recommendation
        │
        ├─→ Quiz
        │   └─→ Gemini API (on incorrect answer)
        │       └─→ /api/gemini/quiz-explanation
        │
        └─→ QuizResults
            ├─→ Gemini API
            │   └─→ /api/gemini/quiz-feedback
            │
            └─→ badgeTracker.trackAction('quiz_complete')
                └─→ Check for Quiz Master badge unlock
```

## State Management

### BadgesQuizzes.jsx State
```javascript
{
  badges: [],              // Earned badges from badgeTracker
  progress: {},            // Progress for all badges
  selectedQuiz: null,      // Currently selected quiz
  quizInProgress: false,   // Quiz state flag
  quizResults: null,       // Quiz completion results
  newlyEarnedBadge: null,  // Badge just earned
  showCelebration: false   // Show celebration modal
}
```

### Quiz.jsx State
```javascript
{
  currentQuestion: 0,           // Current question index
  answers: [],                  // Array of answer objects
  selectedAnswer: null,         // Selected answer index
  showExplanation: false,       // Show explanation flag
  enhancedExplanation: null,    // Gemini explanation
  loadingExplanation: false     // Loading state
}
```

### QuizResults.jsx State
```javascript
{
  feedback: null,           // Gemini feedback
  loadingFeedback: false,   // Loading state
  showBadgeUnlock: false    // Quiz Master badge unlock
}
```

## API Endpoints

### Gemini Endpoints
- `POST /api/gemini/badge-congrats`
  - Input: badge, userProfile, progress
  - Output: { message: string }

- `POST /api/gemini/quiz-feedback`
  - Input: quiz, score, incorrectQuestions, userProfile, currentAqi
  - Output: { feedback: string }

- `POST /api/gemini/quiz-explanation`
  - Input: question, userProfile, wasCorrect
  - Output: { explanation: string }

- `POST /api/gemini/quiz-recommendation`
  - Input: userProfile, completedQuizzes, currentAqi
  - Output: { recommendation: { quizId, reason } }

- `POST /api/gemini/badge-motivation`
  - Input: badge, currentProgress, userProfile
  - Output: { motivation: string }

- `POST /api/gemini/badge-summary`
  - Input: earnedBadges, totalBadges, userProfile
  - Output: { summary: string }

## LocalStorage Keys

```javascript
{
  'badge_progress': {
    aqi_checks: number,
    last_check_date: string,
    reports_submitted: number,
    upvotes_given: number,
    downvotes_given: number,
    quizzes_completed: number,
    alerts_opened: number,
    cities_viewed: string[]
  },
  
  'earned_badges': [
    {
      id: string,
      name: string,
      earned: ISO timestamp,
      progress: number
    }
  ],
  
  'completed_quizzes': string[],  // Array of quiz IDs
  
  'quiz_scores': {
    [quizId]: {
      score: number,
      date: ISO timestamp,
      correct: number,
      total: number
    }
  }
}
```

## Styling Classes

### Custom Animations
- `.animate-bounce-in` - Badge unlock celebration
- `.animate-pulse-slow` - Badge icon pulse
- `.animate-fade-in` - Smooth fade in

### Gradient Backgrounds
- `bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50` - Page background
- `bg-gradient-to-r from-blue-500 to-indigo-500` - Primary buttons
- `bg-gradient-to-r from-blue-600 to-indigo-600` - Headers

### Badge States
- Earned: `bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200`
- Locked: `bg-white border-2 border-gray-200 opacity-75 grayscale`

## Error Handling

### Gemini API Failures
1. 3-second timeout on all requests
2. Catch errors and log to console
3. Fallback to static messages
4. Never block user experience

### Badge Tracking Failures
1. Log errors to console
2. Continue with cached data
3. Retry sync with exponential backoff
4. Queue updates for next sync

### Quiz Completion Failures
1. Save to localStorage even if API fails
2. Show results with static feedback
3. Allow retake or selection of another quiz

## Performance Considerations

### Gemini API
- 1-hour cache TTL
- 3-second timeout
- Async loading with skeletons
- Batch requests where possible

### Badge Tracking
- 30-second debounced sync
- Immediate sync on badge earn
- localStorage for offline support
- Optimistic UI updates

### Quiz System
- Questions loaded from static data
- No API calls during quiz
- Results calculated client-side
- Gemini enhancement is optional

## Accessibility (To be implemented in Task 11)

### Keyboard Navigation
- Tab through badges
- Arrow keys in quiz
- Enter to select answers
- Escape to close modals

### Screen Readers
- ARIA labels on all interactive elements
- Alt text on badge icons
- Progress announcements
- Badge unlock announcements

### Visual
- High contrast mode support
- Focus indicators
- Color-blind friendly colors
- Sufficient text size
