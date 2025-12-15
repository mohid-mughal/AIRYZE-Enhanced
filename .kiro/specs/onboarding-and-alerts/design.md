# Design: User Onboarding & Extended Email Alerts

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  WelcomeScreen → AuthModal → Onboarding → Dashboard             │
│       │              │            │             │                │
│       └──────────────┴────────────┴─────────────┘                │
│                          │                                       │
│                    API Services                                  │
│              (authService, profileService)                       │
└──────────────────────────┬───────────────────────────────────────┘
                           │ HTTP/REST
┌──────────────────────────┴───────────────────────────────────────┐
│                      Backend (Express)                           │
├─────────────────────────────────────────────────────────────────┤
│  Routes: /auth, /api/alerts                                     │
│     │                                                            │
│  Controllers: authControllers, alertsController                 │
│     │                                                            │
│  Services: email, geminiService, personalizationHelper          │
│     │                                                            │
│  Jobs: aqiAlerts (cron)                                         │
└──────────────────────────┬───────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼──────┐    ┌─────▼─────┐
   │Supabase │      │Gemini AI API│    │OpenWeather│
   │(Postgres)│      │(2.5-Flash)  │    │    API    │
   └─────────┘      └─────────────┘    └───────────┘
```

## Component Architecture

### Frontend Components

#### 1. WelcomeScreen.jsx
- **Purpose:** Landing page for unauthenticated users
- **State:** `showAuthModal` (boolean)
- **Props:** `onAuthSuccess` (callback)
- **Features:**
  - Hero section with background image
  - Feature cards (4 key features)
  - "Get Started" CTA button
  - Triggers AuthModal on click

#### 2. AuthModal.jsx
- **Purpose:** Login/Signup modal with validation
- **State:** `isLogin`, `formData`, `errors`, `loading`
- **Props:** `isOpen`, `onClose`, `onAuthSuccess`
- **Features:**
  - Tab navigation (Login/Signup)
  - Form validation (email, password, name, city)
  - Error handling with user-friendly messages
  - Success feedback with auto-redirect

#### 3. Onboarding.jsx
- **Purpose:** Health profile collection page
- **State:** `loading`, `error`
- **Props:** `user`, `onComplete`
- **Features:**
  - Renders HealthProfileForm
  - Handles form submission
  - Saves to backend via profileService
  - Redirects to dashboard on success

#### 4. HealthProfileForm.jsx
- **Purpose:** Multi-step form for health data
- **State:** `formData`, `errors`, `currentStep`
- **Props:** `initialData`, `onSubmit`, `submitLabel`
- **Features:**
  - 4-step wizard with progress indicator
  - Step 1: Age group selection (5 options)
  - Step 2: Health conditions (multi-select, 6 options)
  - Step 3: Activity level (4 options)
  - Step 4: Primary city (8 Pakistani cities)
  - Back/Next navigation with validation
  - Visual feedback with icons and colors

#### 5. Dashboard.jsx (Enhanced)
- **New Features:**
  - Alert preferences settings section
  - "Send Email Now" instant alert button
  - Display personalized recommendations
  - Show current health profile summary

#### 6. AlertSettings.jsx (NEW)
- **Purpose:** Configure email alert preferences
- **State:** `preferences`, `loading`, `saved`
- **Features:**
  - Toggle for change detection alerts
  - Time picker for daily alert time
  - Toggle for instant email button
  - Save button with success feedback

### Backend Services

#### 1. geminiService.js
- **Purpose:** Integrate Gemini AI for personalization
- **Functions:**
  - `generatePersonalizedRecommendations(healthProfile, aqiData)`
  - `generateEmailContent(user, aqiData, alertType)`
  - `callGeminiAPI(prompt)`
  - `getCachedResponse(cacheKey)` / `setCachedResponse(cacheKey, data)`
- **Features:**
  - 1-hour in-memory cache (Map)
  - Automatic cache expiration
  - Error handling with fallback
  - Prompt engineering for health context

#### 2. personalizationHelper.js
- **Purpose:** Rule-based fallback recommendations
- **Data Structures:**
  - `healthAdviceRules` - Condition-specific advice by AQI level
  - `elderlyAdvice` - Age-specific advice for 60+
  - `activityAdvice` - Activity-level specific guidance
  - `generalRecommendations` - Default advice by AQI
- **Functions:**
  - `getRuleBasedRecommendations(healthProfile, aqi)`
  - `generateRuleBasedEmailContent(user, aqi, alertType)`

#### 3. email.js (Enhanced)
- **Purpose:** Send personalized email alerts
- **Function:** `sendAQIAlert(email, name, city, aqi, alertType, healthProfile, aqiData)`
- **Features:**
  - HTML email templates with inline CSS
  - Personalized greeting based on health profile
  - Health-specific advice sections
  - Gemini AI content integration
  - Fallback to rule-based content
  - Mock mode for development (EMAIL_MOCK_MODE=true)

#### 4. aqiAlerts.js (Enhanced)
- **Purpose:** Cron jobs for scheduled alerts
- **Jobs:**
  - **Daily Alerts:** Runs every hour, checks user preferences
    - Compares current hour with user's `daily_time`
    - Sends email if time matches
  - **Change Detection:** Runs every 30 minutes
    - Checks if `on_change` is enabled
    - Compares current AQI with `last_aqi`
    - Sends email if category changed
- **Features:**
  - Respects user preferences
  - Rate limiting (1 second delay between emails)
  - Error handling per user (continues on failure)

## Data Flow

### Onboarding Flow
```
1. User signs up → AuthModal
2. Signup success → Store user in localStorage
3. App.jsx detects no health_profile → Redirect to Onboarding
4. User completes 4-step form → HealthProfileForm
5. Form submits → profileService.updateHealthProfile()
6. Backend saves to Supabase users.health_profile
7. Success → App.jsx refetches profile → Redirect to Dashboard
```

### Email Alert Flow
```
1. Cron job triggers (daily or change detection)
2. Fetch all users from Supabase
3. For each user:
   a. Check alert_prefs (on_change, daily_time)
   b. Fetch current AQI from OpenWeather
   c. Generate recommendations:
      - Try Gemini AI first (with cache)
      - Fallback to rule-based if Gemini fails
   d. Generate email content:
      - Try Gemini AI for personalized message
      - Fallback to template if Gemini fails
   e. Send email via Nodemailer
   f. Update last_aqi in Supabase
4. Add 1-second delay before next user
```

### Instant Email Flow
```
1. User clicks "Send Email Now" → Dashboard
2. Frontend calls alertService.sendInstantAlert()
3. Backend /api/alerts/instant/:userId:
   a. Fetch user data (health_profile, alert_prefs)
   b. Check if instant_button is enabled
   c. Fetch current AQI from OpenWeather
   d. Generate personalized content (Gemini + fallback)
   e. Send email via Nodemailer
4. Return success/error to frontend
5. Display toast notification
```

## UI/UX Design

### Color Scheme
- **Primary:** Blue gradient (#2563EB to #4F46E5)
- **Success:** Green (#10B981)
- **Warning:** Yellow (#F59E0B)
- **Danger:** Red (#EF4444)
- **Neutral:** Gray shades

### Typography
- **Headings:** Bold, 2xl-4xl
- **Body:** Regular, base-lg
- **Labels:** Medium, sm

### Spacing
- **Sections:** 8-12 spacing units
- **Cards:** 6-8 padding units
- **Buttons:** 3-4 padding units

### Animations
- **Fade-in:** 300ms ease-in-out
- **Slide:** 200ms ease-out
- **Hover:** 150ms ease

## Security Considerations

1. **Password Hashing:** bcryptjs with 10 salt rounds
2. **Input Validation:** Server-side validation for all inputs
3. **SQL Injection:** Supabase client handles parameterization
4. **XSS Prevention:** React escapes by default
5. **Email Security:** TLS encryption for SMTP
6. **API Keys:** Stored in .env, never committed
7. **CORS:** Restricted to localhost:5173 and localhost:3000

## Performance Optimizations

1. **Gemini AI Caching:** 1-hour TTL reduces API calls by ~90%
2. **Lazy Loading:** Components loaded on-demand
3. **Debouncing:** Form validation debounced by 300ms
4. **Rate Limiting:** 1-second delay between email sends
5. **Connection Pooling:** Supabase client reuses connections
6. **Timeout Handling:** 10-second timeout for Gemini API

## Error Handling

### Frontend
- Form validation errors displayed inline
- Network errors shown in toast notifications
- Loading states prevent duplicate submissions
- Graceful degradation for missing data

### Backend
- Try-catch blocks around all async operations
- Specific error codes (EMAIL_NOT_CONFIGURED, EMAIL_NETWORK_ERROR, etc.)
- User-friendly error messages
- Logging for debugging (console.error)

### Email Service
- Mock mode for development (EMAIL_MOCK_MODE=true)
- Fallback to rule-based content if Gemini fails
- Retry logic for transient failures
- Detailed logging for troubleshooting

## Testing Strategy

### Unit Tests
- Form validation logic
- Recommendation generation (rule-based)
- Cache key generation
- Email template rendering

### Integration Tests
- Auth flow (signup → onboarding → dashboard)
- Profile update API
- Alert preferences API
- Instant email API

### E2E Tests
- Complete onboarding flow
- Email alert customization
- Instant email button
- Gemini AI integration (with mocks)

## Deployment Considerations

1. **Environment Variables:**
   - SUPABASE_URL, SUPABASE_ANON_KEY
   - GEMINI_API_KEY
   - EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
   - EMAIL_MOCK_MODE (false in production)

2. **Database Migrations:**
   - Add `health_profile` JSONB column to users table
   - Add `alert_prefs` JSONB column to users table
   - Add `last_aqi` INTEGER column to users table

3. **Cron Jobs:**
   - Ensure node-cron runs in production
   - Monitor cron job execution logs
   - Set up alerts for failed email sends

4. **Monitoring:**
   - Track Gemini API success rate
   - Monitor email delivery rate
   - Log onboarding completion rate
   - Alert on high error rates
