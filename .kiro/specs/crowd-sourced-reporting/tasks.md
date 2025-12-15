# Implementation Plan

- [x] 1. Create database tables in Supabase





  - [x] 1.1 Create user_reports table


    - Define columns: id, user_id (fk), lat, lon, description, photo_url, timestamp, upvotes, downvotes, created_at
    - Add indexes for location, timestamp, and user_id
    - Set up foreign key constraint to users table
    - _Requirements: 1.2, 2.1_
  - [x] 1.2 Create polls table


    - Define columns: id, question, options (JSONB), votes (JSONB), created_at
    - Initialize votes as empty JSON object
    - _Requirements: 5.1, 7.1_
  - [x] 1.3 Create poll_votes table


    - Define columns: id, poll_id (fk), user_id (fk), option, created_at
    - Add unique constraint on (poll_id, user_id) to prevent duplicate votes
    - Add indexes for poll_id and user_id
    - _Requirements: 5.2, 5.4, 7.2_

- [x] 2. Implement backend user reports controller and routes




  - [x] 2.1 Create userReportsController.js



    - Implement getAllReports function (GET all reports ordered by timestamp desc)
    - Implement createReport function (POST new report with validation)
    - Implement upvoteReport function (PATCH increment upvotes)
    - Implement downvoteReport function (PATCH increment downvotes)
    - Add authentication middleware checks
    - _Requirements: 1.2, 1.4, 2.1, 2.4, 3.1, 3.2, 3.3, 3.4_
  - [x] 2.2 Create userReportsRoutes.js




    - Define GET /api/user-reports route
    - Define POST /api/user-reports route (auth required)
    - Define PATCH /api/user-reports/:id/upvote route (auth required)
    - Define PATCH /api/user-reports/:id/downvote route (auth required)
    - Mount routes in server.js
    - _Requirements: 1.2, 2.1, 3.1, 3.2_
  - [ ]* 2.3 Write property test for report submission round-trip
    - **Property 1: Report Submission Round-Trip**
    - **Validates: Requirements 1.2**
    - Generate random report data and verify all fields preserved
    - _Requirements: 1.2_
  - [ ]* 2.4 Write property test for report retrieval and ordering
    - **Property 3: Report Retrieval and Display**
    - **Validates: Requirements 2.1, 2.4**
    - Insert multiple reports with different timestamps, verify ordering
    - _Requirements: 2.1, 2.4_
  - [ ]* 2.5 Write property test for upvote increment
    - **Property 5: Upvote Increment**
    - **Validates: Requirements 3.1, 3.3**
    - Upvote report and verify count increases by 1
    - _Requirements: 3.1, 3.3_
  - [ ]* 2.6 Write property test for downvote increment
    - **Property 6: Downvote Increment**
    - **Validates: Requirements 3.2, 3.3**
    - Downvote report and verify count increases by 1
    - _Requirements: 3.2, 3.3_

- [x] 3. Checkpoint - Verify user reports backend works





  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement backend polls controller and routes





  - [x] 4.1 Create pollsController.js


    - Implement getAllPolls function (GET all polls with vote counts)
    - Implement submitVote function (POST vote with duplicate prevention)
    - Implement getUserVote function (GET user's vote for a poll)
    - Implement createPoll function (POST new poll with options initialization)
    - Add authentication middleware checks
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.3, 7.4_
  - [x] 4.2 Create pollsRoutes.js


    - Define GET /api/polls route
    - Define POST /api/polls/:id/vote route (auth required)
    - Define GET /api/polls/:id/user-vote route (auth required)
    - Define POST /api/polls route (admin only, for creating polls)
    - Mount routes in server.js
    - _Requirements: 5.1, 5.2_
  - [ ]* 4.3 Write property test for poll vote submission round-trip
    - **Property 9: Poll Vote Submission Round-Trip**
    - **Validates: Requirements 5.2**
    - Submit vote and verify it's retrievable with all fields
    - _Requirements: 5.2_
  - [ ]* 4.4 Write property test for poll vote count increment
    - **Property 10: Poll Vote Count Increment**
    - **Validates: Requirements 5.3**
    - Submit vote and verify option count increases by 1
    - _Requirements: 5.3_
  - [ ]* 4.5 Write property test for new poll initialization
    - **Property 13: New Poll Initialization**
    - **Validates: Requirements 7.4**
    - Create poll with N options, verify all have 0 votes
    - _Requirements: 7.4_
  - [ ]* 4.6 Write property test for poll results accuracy
    - **Property 11: Poll Results Accuracy**
    - **Validates: Requirements 6.1, 6.3, 7.3**
    - Verify displayed counts match database and total is correct
    - _Requirements: 6.1, 6.3, 7.3_

- [x] 5. Checkpoint - Verify polls backend works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Create frontend API service layer






  - [x] 6.1 Create userReportsService.js

    - Implement getAllReports() function
    - Implement createReport(reportData) function
    - Implement upvoteReport(reportId) function
    - Implement downvoteReport(reportId) function
    - Use Axios for HTTP requests
    - _Requirements: 1.2, 2.1, 3.1, 3.2_
  - [x] 6.2 Create pollsService.js


    - Implement getAllPolls() function
    - Implement submitVote(pollId, option) function
    - Implement getUserVote(pollId) function
    - Use Axios for HTTP requests
    - _Requirements: 5.1, 5.2_

- [ ] 7. Implement frontend CrowdSourced page and components





  - [x] 7.1 Create CrowdSourced.jsx page component


    - Set up state management for reports, polls, search, location
    - Fetch reports and polls on component mount
    - Implement search filtering logic (case-insensitive)
    - Integrate authentication check (getCurrentUser)
    - Add navigation link in Dashboard.jsx menu
    - _Requirements: 1.1, 2.1, 4.1, 4.3, 5.1_
  - [x] 7.2 Create ReportForm component


    - Build form with description textarea, photo URL input
    - Display selected location from map click
    - Handle form submission with validation
    - Show success/error messages
    - Clear form after successful submission
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 7.3 Create ReportList component


    - Display reports as cards with description, photo, timestamp, votes
    - Add upvote/downvote buttons with click handlers
    - Show authentication prompt for non-logged-in users
    - Update vote counts optimistically in UI
    - _Requirements: 2.1, 3.1, 3.2_
  - [x] 7.4 Extend MapView component for reports


    - Add custom layer for report markers
    - Implement marker color coding by age (recent=green, old=gray)
    - Add marker click handlers to show popups
    - Display description, photo, timestamp, votes in popup
    - Enable location selection for new reports
    - Sync markers with filtered reports from search
    - _Requirements: 1.3, 2.1, 2.2, 2.3, 4.4_
  - [x] 7.5 Create Poll component


    - Display poll question and options as radio buttons
    - Handle vote submission with authentication check
    - Show user's previous vote if already voted
    - Disable voting if user has already voted
    - Display "No data yet" message for polls with 0 votes
    - _Requirements: 5.1, 5.2, 5.4, 6.4_
  - [x] 7.6 Create PollChart component using Chart.js


    - Render pie chart with vote percentages for each option
    - Display total vote count
    - Update chart when new votes are submitted
    - Use existing Tailwind color scheme
    - _Requirements: 6.1, 6.2, 6.3_
  - [ ]* 7.7 Write property test for report search filtering
    - **Property 7: Report Search Filtering**
    - **Validates: Requirements 4.1, 4.3**
    - Test case-insensitive filtering with various queries
    - _Requirements: 4.1, 4.3_
  - [ ]* 7.8 Write property test for search result consistency
    - **Property 8: Search Result Consistency**
    - **Validates: Requirements 4.4**
    - Verify list and map show same filtered reports
    - _Requirements: 4.4_
  - [ ]* 7.9 Write unit test for map click location capture
    - **Property 2: Map Click Location Capture**
    - **Validates: Requirements 1.3**
    - Test that map clicks populate form fields
    - _Requirements: 1.3_
  - [ ]* 7.10 Write unit test for marker color coding
    - **Property 4: Report Marker Color Coding**
    - **Validates: Requirements 2.3**
    - Test age-based color calculation
    - _Requirements: 2.3_

- [x] 8. Checkpoint - Verify frontend integration works





  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Add sample polls to database






  - [x] 9.1 Create initial polls via SQL or admin endpoint

    - Poll 1: "How would you describe today's air quality?" (Options: Very Good, Good, Moderate, Poor, Very Poor)
    - Poll 2: "What outdoor activities did you avoid due to air quality?" (Options: Exercise, Walking, Cycling, None, All)
    - Poll 3: "Do you use air purifiers at home?" (Options: Yes always, Yes sometimes, No but planning to, No)
    - Initialize all vote counts to 0
    - _Requirements: 5.1, 7.4_

- [-] 10. Final integration testing and polish


  - [x] 10.1 Test complete user flow



    - Test report submission with map location selection
    - Test report display on map and list
    - Test upvote/downvote functionality
    - Test search filtering
    - Test poll voting and chart updates
    - Verify authentication requirements
    - _Requirements: All_
  - [ ]* 10.2 Update documentation
    - Add Crowd Sourced page to README
    - Document new API endpoints in API.md
    - Add screenshots or usage examples
    - _Requirements: All_
