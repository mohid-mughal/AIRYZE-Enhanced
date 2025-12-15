# Requirements Document

## Introduction

This specification covers the implementation of a gamified user engagement system with achievement badges and educational quizzes. The feature encourages habitual AQI monitoring through psychology-backed game mechanics, rewards user actions with collectible badges, and promotes health awareness through targeted quizzes for different audiences (children, elderly, asthma patients, athletes, general users).

## Glossary

- **Badge**: A digital achievement award earned by completing specific actions or milestones
- **Badge_Collection**: User's earned badges stored as JSON array in database
- **Quiz**: An educational multiple-choice questionnaire targeting specific audiences
- **Quiz_Master**: User who has completed 3 or more quizzes
- **Streak**: Consecutive days of performing an action (e.g., checking AQI)
- **BadgesQuizzes_Page**: Frontend page component displaying badges and quizzes
- **Badge_Progress**: Current count toward earning a badge
- **AQI_System**: The Airyze AQI Monitor backend application
- **Authenticated_User**: A logged-in user with valid session credentials

## Requirements

### Requirement 1: Badge System Architecture

**User Story:** As a developer, I want badges stored in the database so that users' achievements persist across sessions.

#### Acceptance Criteria

1. WHEN the AQI_System initializes THEN the AQI_System SHALL add a badges column to the users table as JSONB type
2. WHEN storing badges THEN the AQI_System SHALL use JSON array format with objects containing: name (string), earned (timestamp), progress (number)
3. WHEN a user earns a badge THEN the AQI_System SHALL append the badge to the user's badges array in Supabase
4. WHEN fetching user data THEN the AQI_System SHALL include the badges array in the response

### Requirement 2: Badge Definitions and Tracking

**User Story:** As a user, I want to earn at least 8 different badges for various actions so that I feel motivated to engage with the app.

#### Acceptance Criteria

1. WHEN the badge system is implemented THEN the AQI_System SHALL define at least 8 badge types: Daily Streak, Weekly Streak, Report Contributor, Upvoter, Downvoter, Quiz Master, Alert Responder, City Explorer
2. WHEN a user checks AQI for 7 consecutive days THEN the AQI_System SHALL award the "7-Day Streak" badge
3. WHEN a user adds 5 or more crowd reports THEN the AQI_System SHALL award the "Report Contributor" badge
4. WHEN a user upvotes 10 or more reports THEN the AQI_System SHALL award the "Upvoter" badge
5. WHEN a user downvotes 10 or more reports THEN the AQI_System SHALL award the "Downvoter" badge
6. WHEN a user completes 3 or more quizzes THEN the AQI_System SHALL award the "Quiz Master" badge
7. WHEN a user opens 5 or more email alerts THEN the AQI_System SHALL award the "Alert Responder" badge
8. WHEN a user views AQI for 5 or more different cities THEN the AQI_System SHALL award the "City Explorer" badge

### Requirement 3: Badge Display and Progress

**User Story:** As a user, I want to see my earned badges and progress toward unearned badges so that I know what to work toward.

#### Acceptance Criteria

1. WHEN the BadgesQuizzes_Page loads THEN the AQI_System SHALL display all 8+ badges in a grid layout with icons
2. WHEN displaying earned badges THEN the AQI_System SHALL show them in full color with earned date
3. WHEN displaying unearned badges THEN the AQI_System SHALL show them in grayscale with progress indicator (e.g., "3/7 days")
4. WHEN a user earns a new badge THEN the AQI_System SHALL display a celebration animation or toast notification

### Requirement 4: Quiz Content and Structure

**User Story:** As a user, I want to complete educational quizzes tailored to different audiences so that I can learn about air quality in a relevant way.

#### Acceptance Criteria

1. WHEN the quiz system is implemented THEN the AQI_System SHALL provide at least 5 quizzes: Kids' Air Adventure, Asthma-Smart Quiz, Senior Citizen Safety Quiz, Outdoor Athlete Quiz, General Knowledge Quiz
2. WHEN a quiz is loaded THEN the AQI_System SHALL display 8-10 multiple-choice questions
3. WHEN each question is displayed THEN the AQI_System SHALL show 3-4 answer options
4. WHEN a user selects an answer THEN the AQI_System SHALL indicate if it's correct or incorrect with explanation

### Requirement 5: Quiz Personalization and Content

**User Story:** As a user with specific health needs, I want quizzes that address my concerns so that I learn relevant information.

#### Acceptance Criteria

1. WHEN the Kids' Air Adventure quiz is selected THEN the AQI_System SHALL use simple language and ask questions like "What is AQI?" and "What color means good air?"
2. WHEN the Asthma-Smart Quiz is selected THEN the AQI_System SHALL ask questions about high AQI risks, trigger avoidance, and protective measures
3. WHEN the Senior Citizen Safety Quiz is selected THEN the AQI_System SHALL ask questions about activities to avoid and health monitoring
4. WHEN the Outdoor Athlete Quiz is selected THEN the AQI_System SHALL ask questions about exercise timing and performance impacts
5. WHEN the General Knowledge Quiz is selected THEN the AQI_System SHALL ask questions about pollutants, AQI categories, and health impacts

### Requirement 6: Quiz Completion and Results

**User Story:** As a user, I want to see my quiz score and receive personalized tips after completion so that I understand my performance and learn more.

#### Acceptance Criteria

1. WHEN a user completes a quiz THEN the AQI_System SHALL calculate and display the score as percentage and fraction (e.g., "8/10 - 80%")
2. WHEN quiz results are displayed THEN the AQI_System SHALL show which questions were answered correctly and incorrectly
3. WHEN quiz results are displayed THEN the AQI_System SHALL provide personalized health tips based on the quiz topic and user's health profile
4. WHEN a user completes a quiz THEN the AQI_System SHALL increment their quiz completion count for badge tracking

### Requirement 7: Badge Trigger Integration

**User Story:** As a user, I want badges to be automatically awarded when I perform actions throughout the app so that I don't have to manually claim them.

#### Acceptance Criteria

1. WHEN a user checks AQI on the Dashboard THEN the AQI_System SHALL track the check date and update streak progress
2. WHEN a user submits a crowd report THEN the AQI_System SHALL increment their report count for badge tracking
3. WHEN a user upvotes or downvotes a report THEN the AQI_System SHALL increment the respective vote count for badge tracking
4. WHEN a user views a different city's AQI THEN the AQI_System SHALL add the city to their viewed cities list for badge tracking

### Requirement 8: Badge Persistence and Sync

**User Story:** As a user, I want my badge progress to be saved so that I don't lose my achievements if I log out or switch devices.

#### Acceptance Criteria

1. WHEN a user earns a badge THEN the AQI_System SHALL immediately save it to Supabase
2. WHEN a user's badge progress updates THEN the AQI_System SHALL sync the progress to Supabase within 30 seconds
3. WHEN a user logs in THEN the AQI_System SHALL fetch their badges and progress from Supabase
4. WHEN a user logs out THEN the AQI_System SHALL ensure all badge progress is synced to Supabase before clearing local state

### Requirement 9: Quiz Results Integration with Recommendations

**User Story:** As a user, I want quiz results to enhance my personalized recommendations so that I receive more relevant health advice.

#### Acceptance Criteria

1. WHEN a user completes a quiz THEN the AQI_System SHALL store the quiz topic and score in the user's profile
2. WHEN generating recommendations THEN the AQI_System SHALL consider completed quizzes to provide more targeted advice
3. WHEN a user completes the Asthma-Smart Quiz THEN the AQI_System SHALL prioritize asthma-related recommendations
4. WHEN a user completes multiple quizzes THEN the AQI_System SHALL combine insights from all completed quizzes

### Requirement 10: Navigation and Accessibility

**User Story:** As a user, I want easy access to the Badges & Quizzes page from the main navigation so that I can quickly check my progress.

#### Acceptance Criteria

1. WHEN the Dashboard displays THEN the AQI_System SHALL show "Badges & Quizzes" in the sidebar navigation menu
2. WHEN a user clicks "Badges & Quizzes" in the menu THEN the AQI_System SHALL navigate to the BadgesQuizzes_Page
3. WHEN on the BadgesQuizzes_Page THEN the AQI_System SHALL highlight "Badges & Quizzes" in the navigation menu
4. WHEN displaying badges and quizzes THEN the AQI_System SHALL ensure all elements are keyboard accessible and screen-reader friendly
