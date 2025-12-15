# Requirements Document

## Introduction

This specification covers the implementation of a crowd-sourced reporting system that allows users to submit subjective air quality reports and participate in community polls. This feature enables hyper-local insights by collecting user observations about air quality conditions that may not be captured by sensor data alone. The system includes a dedicated "Crowd Sourced" page with report submission forms, interactive map overlays, search functionality, and dynamic polls with visualization.

## Glossary

- **User_Report**: A subjective observation submitted by a user about local air quality conditions
- **Report_Form**: Web form for submitting user reports with description, optional photo, and location
- **Poll**: A community question with multiple choice options for gathering collective insights
- **Poll_Vote**: A user's response to a poll question
- **Upvote**: Positive endorsement of a user report indicating agreement or usefulness
- **Downvote**: Negative endorsement of a user report indicating disagreement or lack of usefulness
- **CrowdSourced_Page**: Frontend page component displaying reports, polls, and map overlay
- **AQI_System**: The Airyze AQI Monitor backend application
- **Authenticated_User**: A logged-in user with valid session credentials

## Requirements

### Requirement 1

**User Story:** As a user, I want to submit subjective air quality reports on a dedicated "Crowd Sourced" page so that I can contribute hyper-local insights about conditions in my area.

#### Acceptance Criteria

1. WHEN a user navigates to the Crowd Sourced page THEN the AQI_System SHALL display a report submission form with fields for description, optional photo URL, and location selection
2. WHEN an Authenticated_User submits a report THEN the AQI_System SHALL store the report in Supabase with user_id, lat, lon, description, photo_url, timestamp, upvotes (default 0), and downvotes (default 0)
3. WHEN a user clicks on the map THEN the AQI_System SHALL capture the coordinates and populate the location fields in the report form
4. IF a non-authenticated user attempts to submit a report THEN the AQI_System SHALL return an error indicating authentication is required

### Requirement 2

**User Story:** As a user, I want to view all submitted reports on an interactive map so that I can see hyper-local air quality observations from my community.

#### Acceptance Criteria

1. WHEN the Crowd Sourced page loads THEN the AQI_System SHALL fetch and display all user reports as markers on the map overlay
2. WHEN a user clicks on a report marker THEN the AQI_System SHALL display a popup showing the description, photo (if provided), timestamp, and upvote/downvote counts
3. WHEN displaying report markers THEN the AQI_System SHALL color-code markers based on report age (e.g., recent reports in green, older reports in gray)
4. WHEN reports are displayed THEN the AQI_System SHALL order them by timestamp in descending order (most recent first)

### Requirement 3

**User Story:** As a user, I want to upvote or downvote reports so that I can indicate which observations are helpful or accurate.

#### Acceptance Criteria

1. WHEN an Authenticated_User clicks the upvote button on a report THEN the AQI_System SHALL increment the upvotes count by 1 and update the display
2. WHEN an Authenticated_User clicks the downvote button on a report THEN the AQI_System SHALL increment the downvotes count by 1 and update the display
3. WHEN updating vote counts THEN the AQI_System SHALL persist the changes to Supabase immediately
4. IF a non-authenticated user attempts to vote THEN the AQI_System SHALL return an error indicating authentication is required

### Requirement 4

**User Story:** As a user, I want to search reports by keywords so that I can find specific observations relevant to my interests.

#### Acceptance Criteria

1. WHEN a user enters keywords in the search bar THEN the AQI_System SHALL filter displayed reports to show only those containing the keywords in their description
2. WHEN the search bar is empty THEN the AQI_System SHALL display all reports without filtering
3. WHEN filtering reports THEN the AQI_System SHALL perform case-insensitive matching on the description field
4. WHEN search results update THEN the AQI_System SHALL update both the list view and map markers to reflect filtered results

### Requirement 5

**User Story:** As a user, I want to participate in community polls so that I can contribute to collective insights about local air quality.

#### Acceptance Criteria

1. WHEN the Crowd Sourced page loads THEN the AQI_System SHALL display all active polls with their questions and options
2. WHEN an Authenticated_User selects an option and submits a poll vote THEN the AQI_System SHALL record the vote in Supabase with poll_id, user_id, and selected option
3. WHEN a poll vote is submitted THEN the AQI_System SHALL increment the vote count for the selected option
4. IF a user has already voted on a poll THEN the AQI_System SHALL prevent duplicate votes and display the user's previous selection

### Requirement 6

**User Story:** As a user, I want to see poll results visualized in charts so that I can understand community consensus on air quality topics.

#### Acceptance Criteria

1. WHEN poll results are displayed THEN the AQI_System SHALL show a pie chart with percentages for each option
2. WHEN a user votes on a poll THEN the AQI_System SHALL update the pie chart immediately to reflect the new vote
3. WHEN displaying poll results THEN the AQI_System SHALL show the total number of votes received
4. WHEN no votes have been cast THEN the AQI_System SHALL display a message indicating no data is available yet

### Requirement 7

**User Story:** As an administrator, I want polls to be stored in the database so that they can be managed and updated dynamically.

#### Acceptance Criteria

1. WHEN the AQI_System initializes THEN the AQI_System SHALL create polls table with id, question, options (JSON array), and votes (JSON object)
2. WHEN the AQI_System initializes THEN the AQI_System SHALL create poll_votes table with id, poll_id, user_id, and option
3. WHEN fetching polls THEN the AQI_System SHALL retrieve all polls with their current vote counts
4. WHEN a new poll is created THEN the AQI_System SHALL initialize the votes JSON object with zero counts for each option
