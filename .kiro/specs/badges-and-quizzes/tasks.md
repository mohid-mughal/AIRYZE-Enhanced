# Implementation Plan

- [x] 1. Extend database schema for badges




  - [x] 1.1 Add badges column to users table


    - Run SQL: ALTER TABLE users ADD COLUMN badges JSONB DEFAULT '[]'
    - Document JSON structure in migration comments
    - _Requirements: 1.1, 1.2_

- [x] 2. Create badge definitions and tracking utilities





  - [x] 2.1 Create utils/badges.js


    - Define all 8 badge types with id, name, description, icon, threshold, trackingKey
    - Export BADGE_DEFINITIONS array
    - Add helper functions: getBadgeById, checkBadgeEligibility, calculateProgress
    - _Requirements: 2.1_
  - [x] 2.2 Create utils/badgeTracker.js


    - Implement BadgeTracker class with action tracking
    - Add methods: trackAction, updateStreak, incrementCounter, addToSet
    - Implement checkBadgeUnlocks logic
    - Add localStorage persistence for progress
    - Implement debounced sync to Supabase (30s delay)
    - Add immediate sync on badge earn
    - _Requirements: 7.1-7.4, 8.1, 8.2_
  - [ ]* 2.3 Write property test for badge threshold awarding
    - **Property 3: Badge Threshold Awarding**
    - **Validates: Requirements 2.2-2.8**
    - Test that badges are awarded when thresholds are met
    - _Requirements: 2.2-2.8_
  - [ ]* 2.4 Write property test for action tracking
    - **Property 7: Action Tracking Updates Progress**
    - **Validates: Requirements 7.1-7.4**
    - Test that actions increment correct counters
    - _Requirements: 7.1-7.4_


- [x] 3. Create quiz content and utilities





  - [x] 3.1 Create utils/quizzes.js

    - Define Kids' Air Adventure quiz (8 questions)
    - Define Asthma-Smart Quiz (10 questions)
    - Define Senior Citizen Safety Quiz (9 questions)
    - Define Outdoor Athlete Quiz (10 questions)
    - Define General Knowledge Quiz (10 questions)
    - Export QUIZ_DEFINITIONS array
    - Add helper functions: getQuizById, calculateScore, getQuizRecommendation
    - _Requirements: 4.1, 4.2, 4.3, 5.1-5.5_

  - [x] 3.2 Create utils/quizScoring.js

    - Implement score calculation logic
    - Add functions: calculatePercentage, getPassingGrade, generateScoreSummary
    - _Requirements: 6.1_
  - [ ]* 3.3 Write property test for quiz structure validation
    - **Property 4: Quiz Structure Validation**
    - **Validates: Requirements 4.2, 4.3**
    - Test that all quizzes have 8-10 questions with 3-4 options
    - _Requirements: 4.2, 4.3_
  - [ ]* 3.4 Write property test for quiz score calculation
    - **Property 5: Quiz Score Calculation**
    - **Validates: Requirements 6.1**
    - Test score calculation accuracy
    - _Requirements: 6.1_

- [x] 4. Implement backend badge sync endpoints




  - [x] 4.1 Extend authControllers.js


    - Add updateBadges function (PATCH /auth/badges)
    - Add getBadges function (GET /auth/badges)
    - Add validation for badge data structure
    - _Requirements: 1.3, 1.4, 8.1, 8.2_
  - [x] 4.2 Update authRoutes.js


    - Add PATCH /auth/badges route
    - Add GET /auth/badges route
    - _Requirements: 1.3, 1.4_
  - [ ]* 4.3 Write property test for badge earning round-trip
    - **Property 2: Badge Earning Round-Trip**
    - **Validates: Requirements 1.3**
    - Test badge persistence to Supabase
    - _Requirements: 1.3_

- [x] 5. Enhance Gemini service for badges and quizzes





  - [x] 5.1 Extend geminiService.js


    - Add generateBadgeCongratulations function
    - Add generateQuizFeedback function
    - Add generateQuizExplanation function
    - Add generateBadgeMotivation function
    - Add generateQuizRecommendation function
    - Add generateBadgeCollectionSummary function
    - Implement caching for all new functions (1 hour TTL)
    - Add fallback to static messages on API failure
    - _Requirements: All Gemini-related_
  - [x] 5.2 Create utils/staticFallbacks.js


    - Define static congratulations messages for each badge
    - Define static quiz feedback templates
    - Define static motivational messages
    - Export fallback functions
    - _Requirements: All Gemini-related_


- [x] 6. Create BadgesQuizzes page and components




  - [x] 6.1 Create pages/BadgesQuizzes.jsx


    - Set up page layout with two sections (badges and quizzes)
    - Fetch user badges and progress on mount
    - Implement badge unlock celebration animation
    - Add navigation link in Dashboard sidebar
    - _Requirements: 3.1, 10.1, 10.2_
  - [x] 6.2 Create components/BadgeGrid.jsx


    - Display all badges in responsive grid layout
    - Show earned badges in full color
    - Show locked badges in grayscale
    - Display progress bars for locked badges
    - _Requirements: 3.1, 3.2, 3.3_
  - [x] 6.3 Create components/BadgeCard.jsx


    - Display badge icon, name, description
    - Show earned date for earned badges
    - Show progress indicator for locked badges
    - Integrate Gemini congratulations message on earn
    - Add loading skeleton for Gemini response
    - Implement celebration animation (confetti, pulse effect)
    - _Requirements: 3.2, 3.3, 3.4_
  - [x] 6.4 Create components/QuizSelector.jsx


    - Display all 5 quizzes with icons and descriptions
    - Show completion status for each quiz
    - Integrate Gemini quiz recommendation
    - Add "Recommended for you" badge on suggested quiz
    - _Requirements: 4.1, 5.1-5.5_
  - [x] 6.5 Create components/Quiz.jsx


    - Display quiz questions one at a time
    - Show progress indicator (Question X of Y)
    - Implement answer selection with visual feedback
    - Show correct/incorrect indication after selection
    - Display explanation with Gemini enhancement
    - Add "Next Question" button
    - Track answers for scoring
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 6.6 Create components/QuizResults.jsx

    - Display final score (percentage and fraction)
    - Show which questions were correct/incorrect
    - Integrate Gemini personalized feedback
    - Display health tips based on quiz topic and health profile
    - Add "Retake Quiz" and "Choose Another Quiz" buttons
    - Show badge unlock if Quiz Master threshold reached
    - _Requirements: 6.1, 6.2, 6.3_


- [x] 7. Integrate badge tracking across the app




  - [x] 7.1 Update Dashboard.jsx


    - Track AQI checks on page load
    - Update streak tracking with date comparison
    - Call badgeTracker.trackAction('aqi_check')
    - Show badge unlock notification if earned
    - _Requirements: 7.1_
  - [x] 7.2 Update CrowdSourced.jsx (when implemented)


    - Track report submissions
    - Track upvotes and downvotes
    - Call badgeTracker.trackAction('report_submit')
    - Call badgeTracker.trackAction('upvote')
    - Call badgeTracker.trackAction('downvote')
    - _Requirements: 7.2_
  - [x] 7.3 Update majorCitiesController or city view component


    - Track unique cities viewed
    - Call badgeTracker.trackAction('city_view', cityName)
    - _Requirements: 7.4_
  - [x] 7.4 Update email alert system


    - Track alert opens (add tracking pixel or link parameter)
    - Call badgeTracker.trackAction('alert_opened')
    - _Requirements: 7.3_

- [x] 8. Implement badge sync on login/logout




  - [x] 8.1 Update authService.js


    - Fetch badges on login
    - Store badges in localStorage
    - Initialize badgeTracker with fetched data
    - _Requirements: 8.3_
  - [x] 8.2 Update logout flow


    - Call badgeTracker.syncToSupabase() before logout
    - Wait for sync completion
    - Clear localStorage
    - _Requirements: 8.4_
  - [ ]* 8.3 Write property test for login badge retrieval
    - **Property 10: Login Badge Retrieval**
    - **Validates: Requirements 8.3**
    - Test that badges are loaded on login
    - _Requirements: 8.3_
  - [ ]* 8.4 Write property test for logout sync guarantee
    - **Property 11: Logout Sync Guarantee**
    - **Validates: Requirements 8.4**
    - Test that progress syncs before logout
    - _Requirements: 8.4_


- [x] 9. Integrate quiz completion with recommendations



  - [x] 9.1 Update Recommendations.jsx



    - Fetch user's completed quizzes
    - Use Gemini to enhance recommendations based on quiz history
    - Prioritize topics from completed quizzes
    - Display "Based on your quiz results" section
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  - [ ]* 9.2 Write property test for quiz completion storage
    - **Property 12: Quiz Completion Storage**
    - **Validates: Requirements 9.1**
    - Test that quiz data is stored in profile
    - _Requirements: 9.1_
  - [ ]* 9.3 Write property test for quiz-based recommendations
    - **Property 13: Quiz-Based Recommendation Enhancement**
    - **Validates: Requirements 9.2-9.4**
    - Test that recommendations include quiz insights
    - _Requirements: 9.2-9.4_


- [x] 10. Add badge collection summary feature






  - [x] 10.1 Create components/BadgeCollectionSummary.jsx


    - Display total badges earned vs available
    - Show completion percentage
    - Integrate Gemini collection summary
    - Add motivational message
    - Display most recent badge earned
    - _Requirements: 3.1_


- [x] 11. Implement accessibility features



  - [x] 11.1 Add keyboard navigation


    - Ensure all badges are keyboard accessible
    - Add focus indicators
    - Implement arrow key navigation in quiz
    - _Requirements: 10.4_
  - [x] 11.2 Add screen reader support


    - Add ARIA labels to all interactive elements
    - Add alt text to badge icons
    - Announce badge unlocks to screen readers
    - Add quiz progress announcements
    - _Requirements: 10.4_

- [x] 12. Checkpoint - Verify badges and quizzes work




  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Polish and animations





  - [x] 13.1 Add badge unlock animation


    - Implement confetti effect using canvas or library
    - Add badge pulse/glow animation
    - Add sound effect (optional, with mute option)
    - Show Gemini congratulations message in modal
    - _Requirements: 3.4_
  - [x] 13.2 Add quiz transitions


    - Smooth transitions between questions
    - Fade in/out effects for explanations
    - Progress bar animation
    - Results reveal animation
    - _Requirements: 4.4, 6.2_
  - [x] 13.3 Add loading states


    - Skeleton loaders for Gemini responses
    - Spinner for badge sync
    - Quiz loading animation
    - _Requirements: All_


- [x] 14. Final integration testing





  - [x] 14.1 Test complete badge flow

    - Test earning each of the 8 badges
    - Test progress tracking across sessions
    - Test sync to Supabase
    - Test Gemini congratulations messages
    - Test fallback when Gemini fails
    - _Requirements: All badge-related_

  - [x] 14.2 Test complete quiz flow

    - Test all 5 quizzes
    - Test score calculation
    - Test Gemini feedback generation
    - Test quiz completion badge unlock
    - Test quiz-based recommendations
    - _Requirements: All quiz-related_

  - [x] 14.3 Test cross-feature integration

    - Test badge tracking from Dashboard
    - Test badge tracking from CrowdSourced
    - Test badge tracking from city views
    - Test badge tracking from email alerts
    - _Requirements: 7.1-7.4_
  - [ ]* 14.4 Update documentation
    - Add Badges & Quizzes section to README
    - Document badge types and requirements
    - Document quiz content and topics
    - Document Gemini integration
    - Add screenshots of badge collection and quizzes
    - _Requirements: All_
