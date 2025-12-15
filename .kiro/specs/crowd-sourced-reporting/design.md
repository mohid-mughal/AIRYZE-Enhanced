# Design Document

## Overview

This design document outlines the technical approach for implementing a crowd-sourced reporting system with community polls. The feature adds a new "Crowd Sourced" page where authenticated users can submit subjective air quality observations, view reports from others on an interactive map, vote on report usefulness, search reports by keywords, and participate in community polls with real-time visualization.

The implementation extends the existing MVC architecture by adding new database tables, backend routes/controllers, frontend pages/components, and integrating with the existing MapView component for location selection and report display.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  CrowdSourced.jsx (New Page)                         │   │
│  │  ├─ Report Form Component                            │   │
│  │  ├─ Report List with Search                          │   │
│  │  ├─ Extended MapView with Report Markers             │   │
│  │  └─ Poll Component with Chart.js Visualization       │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼ Axios API Calls               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Express)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  New Routes                                           │   │
│  │  ├─ /api/user-reports (GET, POST, PATCH)            │   │
│  │  └─ /api/polls (GET, POST)                           │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  New Controllers                                      │   │
│  │  ├─ userReportsController.js                         │   │
│  │  └─ pollsController.js                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│                              ▼                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase Database                        │
│  ├─ user_reports table                                      │
│  ├─ polls table                                             │
│  └─ poll_votes table                                        │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Tables

#### user_reports Table
```sql
CREATE TABLE user_reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  lat DECIMAL(10, 8) NOT NULL,
  lon DECIMAL(11, 8) NOT NULL,
  description TEXT NOT NULL,
  photo_url VARCHAR(500),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_reports_location ON user_reports(lat, lon);
CREATE INDEX idx_user_reports_timestamp ON user_reports(timestamp DESC);
CREATE INDEX idx_user_reports_user ON user_reports(user_id);
```

#### polls Table
```sql
CREATE TABLE polls (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  votes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### poll_votes Table
```sql
CREATE TABLE poll_votes (
  id SERIAL PRIMARY KEY,
  poll_id INTEGER REFERENCES polls(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  option TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(poll_id, user_id)
);

CREATE INDEX idx_poll_votes_poll ON poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);
```



### 2. Backend API Endpoints

#### User Reports Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/user-reports` | Get all user reports | No |
| POST | `/api/user-reports` | Create new report | Yes |
| PATCH | `/api/user-reports/:id/upvote` | Upvote a report | Yes |
| PATCH | `/api/user-reports/:id/downvote` | Downvote a report | Yes |

#### Polls Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/polls` | Get all polls with vote counts | No |
| POST | `/api/polls/:id/vote` | Submit vote for a poll | Yes |
| GET | `/api/polls/:id/user-vote` | Check if user has voted | Yes |

### 3. Frontend Components

#### CrowdSourced.jsx (New Page)
Main page component that orchestrates all sub-components:
- Report submission form
- Report list with search functionality
- Extended MapView with report markers
- Poll display with voting interface

**State Management:**
```javascript
const [reports, setReports] = useState([]);
const [filteredReports, setFilteredReports] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [polls, setPolls] = useState([]);
const [selectedLocation, setSelectedLocation] = useState(null);
const [user, setUser] = useState(null);
```

#### ReportForm Component
Form for submitting new reports:
- Description textarea
- Photo URL input (optional)
- Location display (from map click)
- Submit button

#### ReportList Component
Displays reports with search:
- Search input field
- List of report cards
- Each card shows: description, photo, timestamp, votes
- Upvote/downvote buttons

#### Extended MapView Component
Reuses existing MapView.jsx with additions:
- Custom layer for report markers
- Marker click handlers for popups
- Location selection for new reports
- Color-coded markers by age

#### Poll Component
Displays polls and handles voting:
- Poll question display
- Radio buttons for options
- Submit vote button
- Chart.js pie chart for results
- Total vote count display

### 4. API Service Layer

#### userReportsService.js (New)
```javascript
export async function getAllReports();
export async function createReport(reportData);
export async function upvoteReport(reportId);
export async function downvoteReport(reportId);
```

#### pollsService.js (New)
```javascript
export async function getAllPolls();
export async function submitVote(pollId, option);
export async function getUserVote(pollId);
```

## Data Models

### User Report Model
```javascript
{
  id: number,
  user_id: number,
  lat: number,
  lon: number,
  description: string,
  photo_url: string | null,
  timestamp: Date,
  upvotes: number,
  downvotes: number,
  created_at: Date
}
```

### Poll Model
```javascript
{
  id: number,
  question: string,
  options: string[],
  votes: { [option: string]: number },
  created_at: Date
}
```

### Poll Vote Model
```javascript
{
  id: number,
  poll_id: number,
  user_id: number,
  option: string,
  created_at: Date
}
```



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis and after eliminating redundancy, the following properties have been identified:

### Property 1: Report Submission Round-Trip
*For any* valid report data (user_id, lat, lon, description, optional photo_url), after submission the report should be retrievable from the database with all fields matching and upvotes/downvotes initialized to 0.
**Validates: Requirements 1.2**

### Property 2: Map Click Location Capture
*For any* valid map coordinates clicked, the location fields in the report form should be populated with those exact coordinates.
**Validates: Requirements 1.3**

### Property 3: Report Retrieval and Display
*For any* set of reports in the database, fetching all reports should return them ordered by timestamp in descending order with all fields intact.
**Validates: Requirements 2.1, 2.4**

### Property 4: Report Marker Color Coding
*For any* report with a timestamp, the marker color should be determined by the age calculation (recent = green, old = gray) consistently.
**Validates: Requirements 2.3**

### Property 5: Upvote Increment
*For any* report, after an upvote operation, the upvotes count should increase by exactly 1 and be persisted to the database.
**Validates: Requirements 3.1, 3.3**

### Property 6: Downvote Increment
*For any* report, after a downvote operation, the downvotes count should increase by exactly 1 and be persisted to the database.
**Validates: Requirements 3.2, 3.3**

### Property 7: Report Search Filtering
*For any* search query and set of reports, the filtered results should contain only reports whose description contains the query string (case-insensitive).
**Validates: Requirements 4.1, 4.3**

### Property 8: Search Result Consistency
*For any* search query, the filtered reports displayed in the list view should match exactly the reports shown as markers on the map.
**Validates: Requirements 4.4**

### Property 9: Poll Vote Submission Round-Trip
*For any* valid poll vote (poll_id, user_id, option), after submission the vote should be retrievable with all fields matching.
**Validates: Requirements 5.2**

### Property 10: Poll Vote Count Increment
*For any* poll option, after a vote is submitted for that option, the vote count for that option should increase by exactly 1.
**Validates: Requirements 5.3**

### Property 11: Poll Results Accuracy
*For any* poll, the displayed vote counts should match the actual votes stored in the database, and the total should equal the sum of all option votes.
**Validates: Requirements 6.1, 6.3, 7.3**

### Property 12: Poll Chart Update Reactivity
*For any* poll, after a vote is submitted, the pie chart should update to reflect the new vote distribution within a reasonable time (< 1 second).
**Validates: Requirements 6.2**

### Property 13: New Poll Initialization
*For any* newly created poll with N options, the votes object should contain N entries, each initialized to 0.
**Validates: Requirements 7.4**

## Error Handling

### Authentication Errors
- Non-authenticated users attempting to submit reports or vote should receive 401 Unauthorized
- Frontend should redirect to login modal when authentication is required

### Validation Errors
- Empty description fields should return 400 Bad Request
- Invalid coordinates (out of range) should return 400 Bad Request
- Missing required fields should return 400 Bad Request with specific field names

### Duplicate Vote Prevention
- Users attempting to vote twice on the same poll should receive 409 Conflict
- Frontend should display user's previous vote and disable voting

### Database Errors
- Foreign key violations (invalid user_id, poll_id) should return 404 Not Found
- Unique constraint violations should return 409 Conflict

## Testing Strategy

### Dual Testing Approach

1. **Unit Tests**: Verify specific examples, edge cases, and UI interactions
2. **Property-Based Tests**: Verify universal properties across generated inputs

### Property-Based Testing Library

**Library**: fast-check (already installed in backend)

**Configuration**: Each property test should run a minimum of 100 iterations.

### Test Categories

#### 1. Report Operations Tests (Property-Based)
- **Property 1**: Report submission round-trip
- **Property 3**: Report retrieval and ordering
- **Property 5**: Upvote increment
- **Property 6**: Downvote increment
- Edge case: Unauthenticated submission

#### 2. Search and Filtering Tests (Property-Based)
- **Property 7**: Report search filtering
- **Property 8**: Search result consistency
- Edge case: Empty search query

#### 3. Map Integration Tests (Unit)
- **Property 2**: Map click location capture
- **Property 4**: Report marker color coding
- Test marker popup display

#### 4. Poll Operations Tests (Property-Based)
- **Property 9**: Poll vote submission round-trip
- **Property 10**: Poll vote count increment
- **Property 13**: New poll initialization
- Edge case: Duplicate vote prevention

#### 5. Poll Visualization Tests (Property-Based)
- **Property 11**: Poll results accuracy
- **Property 12**: Poll chart update reactivity
- Edge case: Empty poll results

### Test File Structure

```
backend/
├── __tests__/
│   ├── userReports.test.js
│   ├── userReports.property.test.js
│   ├── polls.test.js
│   └── polls.property.test.js

frontend/
├── src/
│   ├── __tests__/
│   │   ├── CrowdSourced.test.jsx
│   │   ├── ReportForm.test.jsx
│   │   ├── Poll.test.jsx
│   │   └── reportSearch.test.js
```

### Property Test Format

Each property-based test must be tagged with the property it implements:

```javascript
/**
 * Feature: crowd-sourced-reporting, Property 1: Report Submission Round-Trip
 * Validates: Requirements 1.2
 */
test('report submission round-trip preserves data', () => {
  fc.assert(
    fc.property(
      fc.record({
        user_id: fc.integer({ min: 1 }),
        lat: fc.double({ min: -90, max: 90 }),
        lon: fc.double({ min: -180, max: 180 }),
        description: fc.string({ minLength: 1, maxLength: 500 }),
        photo_url: fc.option(fc.webUrl())
      }),
      async (reportData) => {
        // Submit report
        const created = await createReport(reportData);
        
        // Retrieve report
        const retrieved = await getReportById(created.id);
        
        // Verify all fields match
        expect(retrieved.user_id).toBe(reportData.user_id);
        expect(retrieved.lat).toBeCloseTo(reportData.lat, 6);
        expect(retrieved.lon).toBeCloseTo(reportData.lon, 6);
        expect(retrieved.description).toBe(reportData.description);
        expect(retrieved.photo_url).toBe(reportData.photo_url);
        expect(retrieved.upvotes).toBe(0);
        expect(retrieved.downvotes).toBe(0);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Test Requirements

- Tests should use a separate Supabase project or test schema
- Each test should clean up created data after execution
- Tests should be idempotent and runnable in any order
- Frontend tests should use React Testing Library with mocked API calls
