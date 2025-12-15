# Design Document

## Overview

This design document outlines the technical approach for implementing a gamified badge system and educational quiz platform. The implementation uses client-side logic for badge tracking with Supabase persistence, static quiz content in JavaScript modules, and React components for display and interaction. The feature is designed to be lightweight, requiring minimal backend changes while maximizing user engagement through psychology-backed game mechanics.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  BadgesQuizzes.jsx (New Page)                        │   │
│  │  ├─ BadgeGrid Component (displays all badges)        │   │
│  │  ├─ BadgeCard Component (individual badge display)   │   │
│  │  ├─ QuizSelector Component (choose quiz)             │   │
│  │  ├─ Quiz Component (question display & logic)        │   │
│  │  └─ QuizResults Component (score & tips)             │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Utils (Client-side Logic)                           │   │
│  │  ├─ badges.js (badge definitions & unlock logic)     │   │
│  │  ├─ quizzes.js (quiz content & questions)            │   │
│  │  └─ badgeTracker.js (action tracking & sync)         │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼ Axios (badge sync only)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Minimal)                        │
│  ├─ PATCH /auth/badges (update user badges)                 │
│  └─ GET /auth/badges (fetch user badges)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Database                        │
│  └─ users.badges (JSONB column)                             │
└─────────────────────────────────────────────────────────────┘
```

### Badge Tracking Flow

```
User Action (e.g., check AQI)
      │
      ▼
Component calls badgeTracker.trackAction('aqi_check')
      │
      ▼
badgeTracker updates local state & localStorage
      │
      ▼
Check if any badge thresholds met
      │
      ├─ Yes → Award badge, show celebration
      │         Sync to Supabase immediately
      │
      └─ No → Update progress
                Sync to Supabase after 30s debounce
```

## Components and Interfaces

### 1. Database Schema Extension

#### Users Table Modification
```sql
ALTER TABLE users 
ADD COLUMN badges JSONB DEFAULT '[]';

-- Badge Structure
-- [
--   {
--     "name": "7-Day Streak",
--     "earned": "2024-01-15T10:30:00Z",
--     "progress": 7
--   },
--   ...
-- ]
```

### 2. Badge Definitions

#### Badge Types and Criteria

```javascript
const BADGE_DEFINITIONS = [
  {
    id: 'daily_streak_7',
    name: '7-Day Streak',
    description: 'Check AQI for 7 consecutive days',
    icon: '🔥',
    threshold: 7,
    trackingKey: 'aqi_checks',
    category: 'engagement'
  },
  {
    id: 'weekly_streak_4',
    name: 'Monthly Champion',
    description: 'Check AQI for 4 consecutive weeks',
    icon: '👑',
    threshold: 28,
    trackingKey: 'aqi_checks',
    category: 'engagement'
  },
  {
    id: 'report_contributor',
    name: 'Helpful Citizen',
    description: 'Submit 5 crowd reports',
    icon: '📝',
    threshold: 5,
    trackingKey: 'reports_submitted',
    category: 'contribution'
  },
  {
    id: 'upvoter',
    name: 'Positive Vibes',
    description: 'Upvote 10 reports',
    icon: '👍',
    threshold: 10,
    trackingKey: 'upvotes_given',
    category: 'community'
  },
  {
    id: 'downvoter',
    name: 'Quality Keeper',
    description: 'Downvote 10 reports',
    icon: '👎',
    threshold: 10,
    trackingKey: 'downvotes_given',
    category: 'community'
  },
  {
    id: 'quiz_master',
    name: 'Quiz Master',
    description: 'Complete 3 quizzes',
    icon: '🎓',
    threshold: 3,
    trackingKey: 'quizzes_completed',
    category: 'learning'
  },
  {
    id: 'alert_responder',
    name: 'Alert Pro',
    description: 'Open 5 email alerts',
    icon: '📧',
    threshold: 5,
    trackingKey: 'alerts_opened',
    category: 'engagement'
  },
  {
    id: 'city_explorer',
    name: 'City Explorer',
    description: 'View AQI for 5 different cities',
    icon: '🌍',
    threshold: 5,
    trackingKey: 'cities_viewed',
    category: 'exploration'
  }
];
```

### 3. Quiz Content Structure

#### Quiz Data Model
```javascript
{
  id: 'kids_adventure',
  title: "Kids' Air Adventure",
  description: 'Learn about air quality in a fun way!',
  audience: 'children',
  difficulty: 'easy',
  icon: '🎈',
  questions: [
    {
      id: 1,
      question: 'What is AQI?',
      options: [
        'Air Quality Index - tells us how clean the air is',
        'A type of weather',
        'A kind of cloud',
        'The temperature outside'
      ],
      correctIndex: 0,
      explanation: 'AQI stands for Air Quality Index. It tells us if the air is clean and safe to breathe!',
      tip: 'When AQI is low (green), it means the air is super clean and great for playing outside!'
    },
    // ... more questions
  ]
}
```



### 4. Complete Quiz Definitions

#### Kids' Air Adventure Quiz (8 questions)
```javascript
{
  id: 'kids_adventure',
  title: "Kids' Air Adventure 🎈",
  questions: [
    {
      question: 'What is AQI?',
      options: ['Air Quality Index', 'A type of weather', 'A kind of cloud', 'Temperature'],
      correctIndex: 0,
      tip: 'AQI tells us if air is clean!'
    },
    {
      question: 'What color means the air is GOOD and safe?',
      options: ['Green', 'Red', 'Yellow', 'Purple'],
      correctIndex: 0,
      tip: 'Green means GO play outside!'
    },
    {
      question: 'When should you NOT play outside?',
      options: ['When AQI is red (5)', 'When it\'s sunny', 'When it\'s cloudy', 'In the morning'],
      correctIndex: 0,
      tip: 'Red AQI means stay inside!'
    },
    {
      question: 'What can help clean the air indoors?',
      options: ['Air purifier', 'Opening all windows', 'Turning on TV', 'Playing music'],
      correctIndex: 0,
      tip: 'Air purifiers filter bad stuff!'
    },
    {
      question: 'PM2.5 is...',
      options: ['Tiny particles in air', 'A type of game', 'A TV channel', 'A snack'],
      correctIndex: 0,
      tip: 'PM2.5 are super tiny dust particles!'
    },
    {
      question: 'What should you do when AQI is yellow (3)?',
      options: ['Play less outside', 'Play more outside', 'Eat more candy', 'Watch more TV'],
      correctIndex: 0,
      tip: 'Yellow means be careful outside!'
    },
    {
      question: 'Who should be extra careful about air quality?',
      options: ['Kids with asthma', 'Only adults', 'Only teachers', 'Only doctors'],
      correctIndex: 0,
      tip: 'Kids with asthma need clean air!'
    },
    {
      question: 'What makes air dirty?',
      options: ['Car smoke and factories', 'Rain', 'Wind', 'Sunshine'],
      correctIndex: 0,
      tip: 'Smoke from cars pollutes air!'
    }
  ]
}
```

#### Asthma-Smart Quiz (10 questions)
```javascript
{
  id: 'asthma_smart',
  title: 'Asthma-Smart Quiz 🫁',
  questions: [
    {
      question: 'At what AQI level should people with asthma start limiting outdoor activities?',
      options: ['AQI 3 (Moderate)', 'AQI 1 (Good)', 'AQI 5 (Very Poor)', 'Never'],
      correctIndex: 0,
      tip: 'Start being cautious at AQI 3!'
    },
    {
      question: 'Which pollutant is most dangerous for asthma patients?',
      options: ['PM2.5', 'Water vapor', 'Oxygen', 'Nitrogen'],
      correctIndex: 0,
      tip: 'PM2.5 can trigger asthma attacks!'
    },
    {
      question: 'What should you ALWAYS carry when AQI is high?',
      options: ['Rescue inhaler', 'Umbrella', 'Sunglasses', 'Water bottle'],
      correctIndex: 0,
      tip: 'Keep your rescue inhaler handy!'
    },
    {
      question: 'Best time to exercise outdoors when you have asthma?',
      options: ['When AQI is 1-2 (Good/Fair)', 'Anytime', 'When AQI is 5', 'At night only'],
      correctIndex: 0,
      tip: 'Exercise when air is cleanest!'
    },
    {
      question: 'What type of mask is best for asthma patients in poor AQI?',
      options: ['N95 mask', 'Cloth mask', 'Surgical mask', 'No mask needed'],
      correctIndex: 0,
      tip: 'N95 filters small particles!'
    },
    {
      question: 'Indoor air quality tip for asthma patients?',
      options: ['Use air purifier with HEPA filter', 'Open all windows', 'Use incense', 'Smoke indoors'],
      correctIndex: 0,
      tip: 'HEPA filters remove allergens!'
    },
    {
      question: 'Warning signs to stop outdoor activity?',
      options: ['Wheezing or chest tightness', 'Feeling energetic', 'Mild sweating', 'Normal breathing'],
      correctIndex: 0,
      tip: 'Stop if breathing becomes difficult!'
    },
    {
      question: 'How does ozone (O3) affect asthma?',
      options: ['Irritates airways', 'Helps breathing', 'No effect', 'Cures asthma'],
      correctIndex: 0,
      tip: 'Ozone can trigger symptoms!'
    },
    {
      question: 'Best indoor activity when AQI is 4-5?',
      options: ['Yoga or light stretching', 'Running in place', 'Heavy lifting', 'Intense cardio'],
      correctIndex: 0,
      tip: 'Gentle exercise is safer indoors!'
    },
    {
      question: 'When should you consult a doctor?',
      options: ['If symptoms worsen despite precautions', 'Only once a year', 'Never', 'Only in emergencies'],
      correctIndex: 0,
      tip: 'Regular check-ups are important!'
    }
  ]
}
```

#### Senior Citizen Safety Quiz (9 questions)
```javascript
{
  id: 'senior_safety',
  title: 'Senior Citizen Safety Quiz 👴👵',
  questions: [
    {
      question: 'At what AQI should seniors limit outdoor activities?',
      options: ['AQI 3 (Moderate) or higher', 'AQI 5 only', 'Never limit', 'AQI 1'],
      correctIndex: 0,
      tip: 'Seniors are more sensitive to pollution!'
    },
    {
      question: 'Best time for morning walks when AQI is moderate?',
      options: ['Early morning (6-7 AM)', 'Noon', 'Evening rush hour', 'Late night'],
      correctIndex: 0,
      tip: 'Air is usually cleaner early morning!'
    },
    {
      question: 'What should seniors monitor when AQI is high?',
      options: ['Heart rate and breathing', 'Only temperature', 'Only blood pressure', 'Nothing special'],
      correctIndex: 0,
      tip: 'Watch for unusual symptoms!'
    },
    {
      question: 'Indoor air quality for seniors with heart conditions?',
      options: ['Keep windows closed, use purifier', 'Open all windows', 'Use fans only', 'No special care needed'],
      correctIndex: 0,
      tip: 'Protect indoor air quality!'
    },
    {
      question: 'Medication reminder when AQI is poor?',
      options: ['Take prescribed medications on time', 'Skip medications', 'Double the dose', 'Take only if symptoms appear'],
      correctIndex: 0,
      tip: 'Stay consistent with medications!'
    },
    {
      question: 'Safe indoor exercises for seniors?',
      options: ['Chair yoga, stretching, walking indoors', 'Heavy weightlifting', 'Running', 'Jumping'],
      correctIndex: 0,
      tip: 'Gentle movement is best!'
    },
    {
      question: 'Hydration importance in poor air quality?',
      options: ['Drink more water to help body cope', 'Drink less water', 'Only drink coffee', 'No change needed'],
      correctIndex: 0,
      tip: 'Stay well hydrated!'
    },
    {
      question: 'When to seek medical attention?',
      options: ['Chest pain, severe shortness of breath', 'Mild tiredness', 'Normal breathing', 'After exercise'],
      correctIndex: 0,
      tip: 'Don\'t ignore serious symptoms!'
    },
    {
      question: 'Best way to stay informed about AQI?',
      options: ['Check app daily, set up alerts', 'Guess by looking outside', 'Ask neighbors', 'Check once a month'],
      correctIndex: 0,
      tip: 'Daily monitoring helps planning!'
    }
  ]
}
```

#### Outdoor Athlete Quiz (10 questions)
```javascript
{
  id: 'athlete_quiz',
  title: 'Outdoor Athlete Quiz 🏃‍♂️',
  questions: [
    {
      question: 'Best AQI level for intense outdoor training?',
      options: ['AQI 1-2 (Good/Fair)', 'AQI 4-5', 'Any AQI', 'AQI 3'],
      correctIndex: 0,
      tip: 'Train hard when air is clean!'
    },
    {
      question: 'How does poor AQI affect athletic performance?',
      options: ['Reduces oxygen intake, decreases endurance', 'Improves performance', 'No effect', 'Increases speed'],
      correctIndex: 0,
      tip: 'Pollution limits oxygen delivery!'
    },
    {
      question: 'What to do if AQI is 3 (Moderate) on race day?',
      options: ['Reduce intensity, take breaks', 'Push harder', 'Cancel race', 'Ignore it'],
      correctIndex: 0,
      tip: 'Adjust effort to conditions!'
    },
    {
      question: 'Best alternative when AQI is 4-5?',
      options: ['Indoor gym workout', 'Outdoor sprint training', 'Long outdoor run', 'Outdoor cycling'],
      correctIndex: 0,
      tip: 'Move training indoors!'
    },
    {
      question: 'Breathing technique in moderate AQI?',
      options: ['Breathe through nose, slower pace', 'Mouth breathing only', 'Hyperventilate', 'Hold breath'],
      correctIndex: 0,
      tip: 'Nose filters some particles!'
    },
    {
      question: 'Recovery after training in poor AQI?',
      options: ['Extra rest, hydration, monitor symptoms', 'Train harder next day', 'No special care', 'Immediate intense workout'],
      correctIndex: 0,
      tip: 'Body needs more recovery time!'
    },
    {
      question: 'Pre-workout check for athletes?',
      options: ['Check AQI, adjust plan accordingly', 'Only check weather', 'No checks needed', 'Only check temperature'],
      correctIndex: 0,
      tip: 'Plan workouts around air quality!'
    },
    {
      question: 'Nutrition tip for training in moderate AQI?',
      options: ['Antioxidant-rich foods (berries, greens)', 'Fast food', 'Skip meals', 'Only protein'],
      correctIndex: 0,
      tip: 'Antioxidants help fight pollution!'
    },
    {
      question: 'Warning signs to stop outdoor workout?',
      options: ['Unusual fatigue, chest tightness, dizziness', 'Normal sweating', 'Mild tiredness', 'Increased heart rate'],
      correctIndex: 0,
      tip: 'Listen to your body!'
    },
    {
      question: 'Long-term training strategy?',
      options: ['Mix indoor/outdoor based on AQI', 'Always train outdoors', 'Never train outdoors', 'Ignore AQI'],
      correctIndex: 0,
      tip: 'Flexibility is key to consistency!'
    }
  ]
}
```

#### General Knowledge Quiz (10 questions)
```javascript
{
  id: 'general_knowledge',
  title: 'General Knowledge Quiz 🧠',
  questions: [
    {
      question: 'What does AQI measure?',
      options: ['Air pollution levels', 'Temperature', 'Humidity', 'Wind speed'],
      correctIndex: 0,
      tip: 'AQI shows how polluted the air is!'
    },
    {
      question: 'AQI scale used in this app?',
      options: ['1-5 (US EPA standard)', '0-100', '0-500', '1-10'],
      correctIndex: 0,
      tip: 'We use 1-5 scale for simplicity!'
    },
    {
      question: 'What does PM2.5 mean?',
      options: ['Particles smaller than 2.5 micrometers', 'Pollution at 2:5 PM', 'A type of gas', 'Temperature measure'],
      correctIndex: 0,
      tip: 'PM2.5 are tiny particles!'
    },
    {
      question: 'Main sources of air pollution in cities?',
      options: ['Vehicle emissions, factories, construction', 'Trees', 'Rain', 'Wind'],
      correctIndex: 0,
      tip: 'Human activities cause most pollution!'
    },
    {
      question: 'What is ozone (O3)?',
      options: ['A pollutant at ground level', 'Always good for health', 'A type of oxygen', 'Water vapor'],
      correctIndex: 0,
      tip: 'Ground-level ozone is harmful!'
    },
    {
      question: 'Best way to reduce personal pollution exposure?',
      options: ['Check AQI daily, adjust activities', 'Ignore air quality', 'Always stay indoors', 'Move to another city'],
      correctIndex: 0,
      tip: 'Awareness and adaptation help!'
    },
    {
      question: 'What does NO2 (Nitrogen Dioxide) come from?',
      options: ['Vehicle exhaust, power plants', 'Plants', 'Ocean', 'Mountains'],
      correctIndex: 0,
      tip: 'NO2 mainly from combustion!'
    },
    {
      question: 'How does weather affect AQI?',
      options: ['Wind disperses, rain cleans pollutants', 'No effect', 'Always makes it worse', 'Only temperature matters'],
      correctIndex: 0,
      tip: 'Weather can help or trap pollution!'
    },
    {
      question: 'Who is most vulnerable to air pollution?',
      options: ['Children, elderly, people with health conditions', 'Only adults', 'Only men', 'Only women'],
      correctIndex: 0,
      tip: 'Some groups need extra protection!'
    },
    {
      question: 'Long-term exposure to poor AQI can cause?',
      options: ['Respiratory diseases, heart problems', 'Better health', 'No effects', 'Improved immunity'],
      correctIndex: 0,
      tip: 'Chronic exposure is serious!'
    }
  ]
}
```

### 5. Frontend Components

#### BadgesQuizzes.jsx (Main Page)
```javascript
const BadgesQuizzes = () => {
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState({});
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizInProgress, setQuizInProgress] = useState(false);
  
  return (
    <div className="badges-quizzes-page">
      <section className="badges-section">
        <h2>Your Badge Collection</h2>
        <BadgeGrid badges={badges} progress={progress} />
      </section>
      
      <section className="quizzes-section">
        <h2>Fun Quizzes</h2>
        {!quizInProgress ? (
          <QuizSelector onSelect={setSelectedQuiz} />
        ) : (
          <Quiz quiz={selectedQuiz} onComplete={handleQuizComplete} />
        )}
      </section>
    </div>
  );
};
```

#### BadgeCard Component
```javascript
const BadgeCard = ({ badge, earned, progress }) => {
  const isEarned = earned !== null;
  
  return (
    <div className={`badge-card ${isEarned ? 'earned' : 'locked'}`}>
      <div className="badge-icon">{badge.icon}</div>
      <h3>{badge.name}</h3>
      <p>{badge.description}</p>
      {isEarned ? (
        <span className="earned-date">
          Earned {new Date(earned).toLocaleDateString()}
        </span>
      ) : (
        <div className="progress-bar">
          <div className="progress-fill" style={{width: `${(progress/badge.threshold)*100}%`}} />
          <span>{progress}/{badge.threshold}</span>
        </div>
      )}
    </div>
  );
};
```

#### Quiz Component
```javascript
const Quiz = ({ quiz, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  
  const handleAnswer = (selectedIndex) => {
    const isCorrect = selectedIndex === quiz.questions[currentQuestion].correctIndex;
    setAnswers([...answers, { questionId: currentQuestion, selectedIndex, isCorrect }]);
    
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };
  
  if (showResult) {
    return <QuizResults quiz={quiz} answers={answers} onComplete={onComplete} />;
  }
  
  const question = quiz.questions[currentQuestion];
  
  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        Question {currentQuestion + 1} of {quiz.questions.length}
      </div>
      <h3>{question.question}</h3>
      <div className="quiz-options">
        {question.options.map((option, index) => (
          <button
            key={index}
            className="quiz-option"
            onClick={() => handleAnswer(index)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 6. Badge Tracking Logic

#### badgeTracker.js
```javascript
class BadgeTracker {
  constructor() {
    this.progress = this.loadProgress();
    this.syncTimeout = null;
  }
  
  trackAction(actionType) {
    switch(actionType) {
      case 'aqi_check':
        this.updateStreak();
        break;
      case 'report_submit':
        this.incrementCounter('reports_submitted');
        break;
      case 'upvote':
        this.incrementCounter('upvotes_given');
        break;
      case 'downvote':
        this.incrementCounter('downvotes_given');
        break;
      case 'quiz_complete':
        this.incrementCounter('quizzes_completed');
        break;
      case 'city_view':
        this.addToSet('cities_viewed');
        break;
    }
    
    this.checkBadgeUnlocks();
    this.scheduleSyncToSupabase();
  }
  
  checkBadgeUnlocks() {
    BADGE_DEFINITIONS.forEach(badge => {
      if (!this.hasBadge(badge.id)) {
        const progress = this.progress[badge.trackingKey] || 0;
        if (progress >= badge.threshold) {
          this.awardBadge(badge);
        }
      }
    });
  }
  
  awardBadge(badge) {
    // Show celebration animation
    // Add to earned badges
    // Sync immediately to Supabase
  }
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Badge Data Structure Validation
*For any* badge stored in the database, it should have the correct JSON structure with name (string), earned (timestamp), and progress (number) fields.
**Validates: Requirements 1.2**

### Property 2: Badge Earning Round-Trip
*For any* badge earned by a user, after awarding it should be retrievable from Supabase with all fields intact.
**Validates: Requirements 1.3**

### Property 3: Badge Threshold Awarding
*For any* badge with a threshold, when a user's progress reaches or exceeds that threshold, the badge should be automatically awarded.
**Validates: Requirements 2.2-2.8**

### Property 4: Quiz Structure Validation
*For any* quiz, it should contain 8-10 questions, and each question should have 3-4 answer options with one correct answer.
**Validates: Requirements 4.2, 4.3**

### Property 5: Quiz Score Calculation
*For any* completed quiz, the score should equal the number of correct answers divided by total questions, expressed as a percentage.
**Validates: Requirements 6.1**

### Property 6: Quiz Completion Counter Increment
*For any* quiz completion, the user's quiz_completed count should increase by exactly 1.
**Validates: Requirements 6.4**

### Property 7: Action Tracking Updates Progress
*For any* tracked action (AQI check, report submit, vote, etc.), the corresponding progress counter should increment.
**Validates: Requirements 7.1-7.4**

### Property 8: Badge Immediate Persistence
*For any* badge earned, it should be saved to Supabase immediately (within 1 second).
**Validates: Requirements 8.1**

### Property 9: Progress Debounced Sync
*For any* progress update, it should be synced to Supabase within 30 seconds unless another update occurs.
**Validates: Requirements 8.2**

### Property 10: Login Badge Retrieval
*For any* user login, their badges and progress should be fetched from Supabase and loaded into local state.
**Validates: Requirements 8.3**

### Property 11: Logout Sync Guarantee
*For any* user logout, all pending badge progress should be synced to Supabase before clearing local state.
**Validates: Requirements 8.4**

### Property 12: Quiz Completion Storage
*For any* completed quiz, the quiz topic and score should be stored in the user's profile and be retrievable.
**Validates: Requirements 9.1**

### Property 13: Quiz-Based Recommendation Enhancement
*For any* user with completed quizzes, recommendations should include insights relevant to those quiz topics.
**Validates: Requirements 9.2-9.4**

## Error Handling

### Badge System Errors
- If Supabase sync fails, retry up to 3 times with exponential backoff
- If all retries fail, queue the update in localStorage for next sync attempt
- Show user-friendly error message but don't block badge display

### Quiz System Errors
- If quiz data is malformed, show error message and prevent quiz start
- If answer submission fails, allow retry without losing progress
- Validate quiz completion data before storing

### Progress Tracking Errors
- If action tracking fails, log error but don't block user action
- Ensure progress is never decremented (only increments)
- Handle race conditions with optimistic locking

## Testing Strategy

### Dual Testing Approach

1. **Unit Tests**: Verify badge logic, quiz scoring, UI components
2. **Property-Based Tests**: Verify universal properties across generated inputs

### Property-Based Testing Library

**Library**: fast-check (already installed)

**Configuration**: Each property test should run a minimum of 100 iterations.

### Test Categories

#### 1. Badge System Tests (Property-Based)
- **Property 1**: Badge data structure validation
- **Property 2**: Badge earning round-trip
- **Property 3**: Badge threshold awarding
- **Property 7**: Action tracking updates progress
- **Property 8**: Badge immediate persistence
- **Property 9**: Progress debounced sync

#### 2. Quiz System Tests (Property-Based)
- **Property 4**: Quiz structure validation
- **Property 5**: Quiz score calculation
- **Property 6**: Quiz completion counter increment
- **Property 12**: Quiz completion storage

#### 3. Integration Tests (Unit)
- **Property 10**: Login badge retrieval
- **Property 11**: Logout sync guarantee
- **Property 13**: Quiz-based recommendation enhancement
- Test badge unlock animations
- Test quiz navigation flow

#### 4. UI Component Tests (Unit)
- Test BadgeCard rendering (earned vs locked)
- Test Quiz component question flow
- Test QuizResults display
- Test progress bar calculations

### Test File Structure

```
frontend/
├── src/
│   ├── __tests__/
│   │   ├── BadgesQuizzes.test.jsx
│   │   ├── BadgeCard.test.jsx
│   │   ├── Quiz.test.jsx
│   │   ├── badgeTracker.test.js
│   │   ├── badgeTracker.property.test.js
│   │   ├── quizScoring.test.js
│   │   └── quizScoring.property.test.js
```

### Integration Test Requirements

- Tests should use a separate Supabase project or test schema
- Mock localStorage for badge progress tests
- Test badge unlock animations with React Testing Library
- Verify quiz completion triggers badge checks
- Test sync behavior on logout


## Gemini AI Integration for Enhanced Gamification

### Purpose
Use Google's Gemini 2.5-Flash model aggressively throughout the Badges & Quizzes feature to create dynamic, personalized, and engaging content that adapts to user behavior and health profiles.

### API Configuration
```javascript
// Reuse existing geminiService.js
const GEMINI_API_KEY = 'AIzaSyCKJyIHAcY7m4OseWJSWYf6UShVtLqOYr0';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
```

### Gemini Use Cases in Badges & Quizzes

#### 1. Dynamic Badge Congratulations Messages
When a user earns a badge, use Gemini to generate personalized congratulations:

**Prompt Template:**
```
Generate a short, enthusiastic congratulations message (2-3 sentences) for a user who just earned the "{badge_name}" badge in an air quality monitoring app.

User context:
- Health profile: {age_group}, {health_conditions}
- Badge earned: {badge_name} - {badge_description}
- Progress: {progress}/{threshold}

Make it personal, motivating, and relevant to their health profile. Keep it under 50 words.
```

**Example Output:**
"Amazing work! You've checked the AQI for 7 days straight! 🔥 For someone with asthma like you, staying informed about air quality is crucial for your health. Keep up this healthy habit!"

#### 2. Personalized Quiz Feedback
After quiz completion, use Gemini to generate personalized feedback based on:
- Quiz score
- Incorrect answers
- User's health profile
- Current AQI in their city

**Prompt Template:**
```
Generate personalized feedback for a user who completed the "{quiz_title}" quiz.

User profile:
- Age: {age_group}
- Health conditions: {health_conditions}
- Activity level: {activity_level}
- City: {primary_city}

Quiz results:
- Score: {score}%
- Questions answered incorrectly: {incorrect_questions}
- Current AQI in their city: {current_aqi}

Provide:
1. Encouraging feedback on their score
2. Brief explanation of concepts they missed
3. 2-3 actionable health tips relevant to their profile and current AQI
4. Motivation to apply what they learned

Keep it friendly, educational, and under 150 words.
```

#### 3. Dynamic Quiz Question Explanations
Enhance static quiz explanations with Gemini-generated context:

**Prompt Template:**
```
A user just answered a quiz question {correctly/incorrectly}.

Question: {question_text}
Their answer: {selected_option}
Correct answer: {correct_option}
User's health profile: {health_conditions}

Generate a brief, friendly explanation (2-3 sentences) that:
- Explains why the answer is correct/incorrect
- Relates it to their health conditions if relevant
- Provides a memorable tip

Keep it under 60 words.
```

#### 4. Badge Progress Motivational Messages
When users are close to earning a badge (e.g., 80% progress), use Gemini to generate motivational nudges:

**Prompt Template:**
```
Generate a short motivational message for a user who is close to earning a badge.

Badge: {badge_name}
Progress: {current_progress}/{threshold} ({percentage}%)
User's health profile: {health_conditions}

Create an encouraging message (1-2 sentences) that motivates them to complete the badge. Make it specific to what they need to do.

Keep it under 40 words.
```

**Example Output:**
"You're almost there! Just 2 more AQI checks to earn your 7-Day Streak badge. 🔥 Daily monitoring helps you plan your activities better, especially with your asthma."

#### 5. Quiz Recommendation Engine
Use Gemini to recommend which quiz a user should take next based on:
- Completed quizzes
- Health profile
- Recent AQI patterns in their city
- Badge progress

**Prompt Template:**
```
Recommend which quiz a user should take next from this list:
{available_quizzes}

User context:
- Completed quizzes: {completed_quizzes}
- Health profile: {health_profile}
- Recent AQI in their city: {recent_aqi_pattern}
- Current badge progress: {badge_progress}

Provide:
1. Recommended quiz name
2. Brief reason (1-2 sentences) why this quiz is most relevant for them now

Keep it under 50 words.
```

#### 6. Badge Collection Summary
Generate a personalized summary of the user's badge collection:

**Prompt Template:**
```
Generate an encouraging summary of a user's badge collection progress.

Earned badges: {earned_badges}
In-progress badges: {in_progress_badges}
User's health profile: {health_profile}

Create a motivational summary (2-3 sentences) that:
- Celebrates their achievements
- Highlights their engagement level
- Encourages them to earn more badges

Keep it under 60 words.
```

#### 7. Quiz Difficulty Adaptation
Use Gemini to dynamically adjust quiz difficulty based on user performance:

**Prompt Template:**
```
A user scored {score}% on the "{quiz_title}" quiz.

Based on their performance, should we:
1. Recommend an easier quiz to build confidence
2. Recommend a similar difficulty quiz
3. Recommend a harder quiz to challenge them

User context:
- Completed quizzes: {completed_quizzes}
- Average score: {average_score}%

Provide recommendation with brief reasoning (1 sentence).
```

### Implementation Strategy

#### Caching Strategy
- Cache Gemini responses for identical inputs for 1 hour
- Use existing cache implementation from geminiService.js
- Cache key format: `badges_quiz_{type}_{user_id}_{context_hash}`

#### Fallback Mechanism
- Always have static fallback content for each Gemini use case
- If Gemini API fails, use static messages
- Log failures but never block user experience
- Show generic but friendly messages

#### Performance Optimization
- Call Gemini API asynchronously (don't block UI)
- Show loading skeleton while waiting for Gemini response
- Timeout after 3 seconds and use fallback
- Batch multiple Gemini calls when possible

#### Example Implementation
```javascript
// In BadgeCard component
const [congratsMessage, setCongratsMessage] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  if (justEarned) {
    setLoading(true);
    generateBadgeCongrats(badge, userProfile)
      .then(message => setCongratsMessage(message))
      .catch(() => setCongratsMessage(getStaticCongrats(badge)))
      .finally(() => setLoading(false));
  }
}, [justEarned]);

// Show Gemini message or fallback
{congratsMessage && (
  <div className="congrats-message">
    {loading ? <Skeleton /> : congratsMessage}
  </div>
)}
```

### Privacy Considerations
- Never send PII (names, emails, exact locations) to Gemini
- Only send: age group, health conditions (generic), badge names, quiz scores
- City names are acceptable (public information)
- Sanitize all user inputs before sending to Gemini

### Cost Optimization
- Gemini 2.5-Flash is cost-effective for high-volume requests
- Aggressive caching reduces API calls by ~70%
- Batch requests where possible
- Use shorter prompts (under 500 tokens) for faster responses
