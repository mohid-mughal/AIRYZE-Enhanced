# System Flows: User Onboarding & Email Alerts

## 🔄 Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                    AIRYZE AQI MONITOR                           │
│                   User Journey Flow                             │
└─────────────────────────────────────────────────────────────────┘

1. FIRST VISIT
   │
   ├─> WelcomeScreen.jsx
   │   ├─> Hero section with features
   │   ├─> "Get Started" button
   │   └─> Click → AuthModal opens
   │
2. AUTHENTICATION
   │
   ├─> AuthModal.jsx
   │   ├─> Tab: Login | Sign Up
   │   ├─> Form validation
   │   ├─> POST /auth/signup or /auth/login
   │   └─> Success → Store user in localStorage
   │
3. ONBOARDING (New Users Only)
   │
   ├─> Onboarding.jsx
   │   ├─> HealthProfileForm.jsx (4 steps)
   │   │   ├─> Step 1: Age Group
   │   │   ├─> Step 2: Health Conditions
   │   │   ├─> Step 3: Activity Level
   │   │   └─> Step 4: Primary City
   │   ├─> PATCH /auth/profile/:userId
   │   └─> Success → Redirect to Dashboard
   │
4. DASHBOARD (Main App)
   │
   ├─> Dashboard.jsx
   │   ├─> PersonalizedWelcome (AI-generated)
   │   ├─> InstantEmailButton
   │   ├─> AlertPreferencesModal
   │   ├─> MapView (interactive)
   │   ├─> AQI Info & Recommendations
   │   └─> Analytics & Charts
   │
5. ONGOING USAGE
   │
   ├─> Instant Emails (on-demand)
   ├─> Daily Emails (scheduled)
   ├─> Change Alerts (automated)
   └─> Profile Updates (anytime)
```

---

## 📧 Email Alert Flows

### Flow 1: Instant Email (User-Triggered)

```
USER ACTION
   │
   ├─> Clicks "Send Email Now" button
   │   └─> InstantEmailButton.jsx
   │
FRONTEND
   │
   ├─> POST /api/alerts/instant/:userId
   │   └─> alertsService.sendInstantAlert()
   │
BACKEND
   │
   ├─> alertsController.sendInstantAlert()
   │   ├─> Fetch user from Supabase
   │   │   └─> Get: health_profile, alert_prefs, city
   │   ├─> Check: alert_prefs.instant_button === true
   │   ├─> Fetch current AQI from OpenWeather
   │   │   └─> openweatherService.fetchAQIFromOpenWeather()
   │   ├─> Generate personalized content
   │   │   ├─> Try: geminiService.generatePersonalizedRecommendations()
   │   │   │   ├─> Check cache (1-hour TTL)
   │   │   │   ├─> If cached → Return immediately
   │   │   │   └─> If not → Call Gemini API
   │   │   └─> Fallback: personalizationHelper.getRuleBasedRecommendations()
   │   ├─> Send email
   │   │   └─> email.sendAQIAlert()
   │   │       ├─> Build HTML template
   │   │       ├─> Add personalized sections
   │   │       └─> Send via Nodemailer (Gmail SMTP)
   │   └─> Return success response
   │
FRONTEND
   │
   └─> Display success message
       └─> "Email sent successfully! Check your inbox."

TIME: ~3-5 seconds (with cache: <1 second)
```

---

### Flow 2: Daily Email (Cron-Triggered)

```
CRON JOB (Every Hour)
   │
   ├─> aqiAlerts.js - Daily Alert Job
   │   └─> Schedule: '0 * * * *'
   │
EXECUTION
   │
   ├─> Get current hour (e.g., 08:00)
   ├─> Fetch all users from Supabase
   │   └─> SELECT id, name, email, city, health_profile, alert_prefs, last_aqi
   │
FOR EACH USER
   │
   ├─> Check: alert_prefs.daily_time
   │   └─> Example: "08:00"
   ├─> Compare with current hour
   │   └─> If match → Continue
   │   └─> If no match → Skip user
   │
   ├─> Fetch city coordinates
   │   └─> cities.js lookup
   │
   ├─> Fetch current AQI
   │   └─> openweatherService.fetchAQIFromOpenWeather()
   │
   ├─> Generate personalized content
   │   ├─> Try: geminiService.generateEmailContent()
   │   │   └─> With cache check
   │   └─> Fallback: personalizationHelper.generateRuleBasedEmailContent()
   │
   ├─> Send email
   │   └─> email.sendAQIAlert(email, name, city, aqi, 'daily', health_profile, aqiData)
   │
   ├─> Update last_aqi in database
   │   └─> alertService.updateLastAQI(userId, currentAQI)
   │
   └─> Wait 1 second (rate limiting)
       └─> Continue to next user

FREQUENCY: Once per day per user (at their preferred time)
```

---

### Flow 3: Change Detection Email (Cron-Triggered)

```
CRON JOB (Every 30 Minutes)
   │
   ├─> aqiAlerts.js - Change Detection Job
   │   └─> Schedule: '*/30 * * * *'
   │
EXECUTION
   │
   ├─> Fetch all users from Supabase
   │   └─> SELECT id, name, email, city, health_profile, alert_prefs, last_aqi
   │
FOR EACH USER
   │
   ├─> Check: alert_prefs.on_change === true
   │   └─> If false → Skip user
   │
   ├─> Check: last_aqi exists
   │   └─> If null → Skip user (no baseline)
   │
   ├─> Fetch city coordinates
   │   └─> cities.js lookup
   │
   ├─> Fetch current AQI
   │   └─> openweatherService.fetchAQIFromOpenWeather()
   │
   ├─> Compare AQI levels
   │   ├─> Old: user.last_aqi (e.g., 2)
   │   ├─> New: currentAQI (e.g., 3)
   │   └─> If changed → Continue
   │       └─> If same → Skip user
   │
   ├─> Generate personalized content
   │   ├─> Try: geminiService.generateEmailContent()
   │   └─> Fallback: personalizationHelper.generateRuleBasedEmailContent()
   │
   ├─> Send email
   │   └─> email.sendAQIAlert(email, name, city, aqi, 'change', health_profile, aqiData)
   │
   ├─> Update last_aqi in database
   │   └─> alertService.updateLastAQI(userId, currentAQI)
   │
   └─> Wait 1 second (rate limiting)
       └─> Continue to next user

FREQUENCY: Every 30 minutes (only when AQI changes)
```

---

## 🤖 Gemini AI Integration Flow

```
REQUEST FOR RECOMMENDATIONS
   │
   ├─> geminiService.generatePersonalizedRecommendations()
   │
CACHE CHECK
   │
   ├─> Generate cache key
   │   └─> JSON.stringify({age, conditions, activity, aqi, type})
   │
   ├─> Check in-memory cache (Map)
   │   ├─> If found AND not expired (< 1 hour)
   │   │   └─> Return cached data (instant)
   │   └─> If not found OR expired
   │       └─> Continue to API call
   │
API CALL
   │
   ├─> Build prompt
   │   └─> Include: age, conditions, activity, AQI, pollutants
   │
   ├─> POST to Gemini API
   │   ├─> URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent
   │   ├─> Headers: x-goog-api-key
   │   ├─> Body: { contents, generationConfig }
   │   └─> Timeout: 10 seconds
   │
   ├─> Parse response
   │   └─> Extract text from candidates[0].content.parts[0].text
   │
   ├─> Parse recommendations
   │   └─> Extract numbered list or bullet points
   │
   ├─> Store in cache
   │   └─> cache.set(key, { data, timestamp })
   │
   └─> Return recommendations

ERROR HANDLING
   │
   ├─> If API fails (timeout, error, invalid key)
   │   └─> Log error
   │   └─> Return null
   │
   └─> Calling code handles fallback
       └─> personalizationHelper.getRuleBasedRecommendations()

PERFORMANCE
   │
   ├─> First call: ~2-3 seconds (API call)
   ├─> Cached calls: <100ms (instant)
   └─> Cache hit rate: >80% (expected)
```

---

## 🗄️ Data Flow: Health Profile

```
USER COMPLETES ONBOARDING
   │
   ├─> HealthProfileForm.jsx
   │   └─> formData = {
   │       age_group: "19_40",
   │       health_conditions: ["asthma", "allergies"],
   │       activity_level: "running_cycling",
   │       primary_city: "Karachi"
   │     }
   │
FRONTEND
   │
   ├─> profileService.updateHealthProfile(formData)
   │   └─> PATCH /auth/profile/:userId
   │
BACKEND
   │
   ├─> authControllers.updateHealthProfile()
   │   ├─> Validate fields
   │   │   ├─> age_group: enum check
   │   │   ├─> health_conditions: array validation
   │   │   ├─> activity_level: enum check
   │   │   └─> primary_city: string check
   │   ├─> Build health_profile object
   │   └─> Update Supabase
   │       └─> UPDATE users SET health_profile = $1 WHERE id = $2
   │
DATABASE
   │
   ├─> Supabase (PostgreSQL)
   │   └─> users table
   │       └─> health_profile JSONB column
   │           └─> {
   │               "age_group": "19_40",
   │               "health_conditions": ["asthma", "allergies"],
   │               "activity_level": "running_cycling",
   │               "primary_city": "Karachi"
   │             }
   │
USAGE
   │
   ├─> Email alerts (personalization)
   ├─> Dashboard recommendations
   ├─> PersonalizedWelcome message
   └─> Gemini AI prompts
```

---

## ⚙️ Data Flow: Alert Preferences

```
USER CONFIGURES PREFERENCES
   │
   ├─> AlertPreferencesModal.jsx
   │   └─> preferences = {
   │       on_change: true,
   │       daily_time: "08:00",
   │       instant_button: true
   │     }
   │
FRONTEND
   │
   ├─> profileService.updateAlertPreferences(preferences)
   │   └─> PATCH /auth/alert-prefs/:userId
   │
BACKEND
   │
   ├─> authControllers.updateAlertPreferences()
   │   ├─> Validate fields
   │   │   ├─> on_change: boolean
   │   │   ├─> daily_time: HH:MM format
   │   │   └─> instant_button: boolean
   │   ├─> Build alert_prefs object
   │   └─> Update Supabase
   │       └─> UPDATE users SET alert_prefs = $1 WHERE id = $2
   │
DATABASE
   │
   ├─> Supabase (PostgreSQL)
   │   └─> users table
   │       └─> alert_prefs JSONB column
   │           └─> {
   │               "on_change": true,
   │               "daily_time": "08:00",
   │               "instant_button": true
   │             }
   │
USAGE
   │
   ├─> Daily alert cron (checks daily_time)
   ├─> Change detection cron (checks on_change)
   ├─> Dashboard (shows/hides instant_button)
   └─> Instant email endpoint (validates instant_button)
```

---

## 🔐 Authentication Flow

```
USER SIGNS UP
   │
   ├─> AuthModal.jsx (Sign Up tab)
   │   └─> formData = { name, email, password, city }
   │
FRONTEND
   │
   ├─> authService.signup(name, email, password, city)
   │   └─> POST /auth/signup
   │
BACKEND
   │
   ├─> authControllers.signup()
   │   ├─> Validate fields
   │   ├─> Hash password (bcryptjs, 10 rounds)
   │   ├─> Insert into Supabase
   │   │   └─> INSERT INTO users (name, email, password, city)
   │   └─> Return user data (without password)
   │
FRONTEND
   │
   ├─> Store user in localStorage
   │   └─> localStorage.setItem('user', JSON.stringify(user))
   │
   ├─> Dispatch 'authChange' event
   │   └─> window.dispatchEvent(new Event('authChange'))
   │
APP.JSX
   │
   ├─> Detect no health_profile
   │   └─> Redirect to /onboarding
   │
ONBOARDING
   │
   ├─> User completes health profile
   │   └─> Redirect to /dashboard
   │
DASHBOARD
   │
   └─> User sees personalized content
```

---

## 📊 Recommendation Generation Flow

```
USER SELECTS LOCATION ON MAP
   │
   ├─> MapView.jsx
   │   └─> onClick → handleMapClick(lat, lon)
   │
FETCH AQI DATA
   │
   ├─> aqiService.fetchAQI(lat, lon)
   │   └─> GET /api/aqi?lat=X&lon=Y
   │
BACKEND
   │
   ├─> aqiController.getAQI()
   │   └─> openweatherService.fetchAQIFromOpenWeather()
   │       └─> GET https://api.openweathermap.org/data/2.5/air_pollution
   │
RETURN AQI DATA
   │
   └─> { aqi: 3, components: { pm2_5, pm10, no2, ... } }
   │
GENERATE RECOMMENDATIONS
   │
   ├─> Recommendations.jsx
   │   └─> useEffect([data, healthProfile])
   │
   ├─> If healthProfile exists
   │   ├─> Try: Gemini AI
   │   │   └─> geminiService.generatePersonalizedRecommendations()
   │   │       ├─> Check cache
   │   │       └─> Call API if needed
   │   └─> Fallback: Rule-based
   │       └─> personalizationHelper.getRuleBasedRecommendations()
   │
   └─> If no healthProfile
       └─> aqiHelper.getHealthRecommendations()
           └─> Generic recommendations by AQI level
   │
DISPLAY
   │
   └─> Recommendations.jsx renders list
       ├─> Health-specific advice
       ├─> Activity-level guidance
       └─> AQI-appropriate actions
```

---

## 🎯 Key Decision Points

### 1. Show Onboarding?
```
User logged in?
├─> No → Show WelcomeScreen
└─> Yes → Has health_profile?
    ├─> No → Show Onboarding
    └─> Yes → Show Dashboard
```

### 2. Send Daily Email?
```
Cron runs every hour
├─> For each user:
    ├─> alert_prefs.daily_time === current_hour?
    │   ├─> Yes → Send email
    │   └─> No → Skip
    └─> Rate limit: 1 second delay
```

### 3. Send Change Email?
```
Cron runs every 30 minutes
├─> For each user:
    ├─> alert_prefs.on_change === true?
    │   ├─> No → Skip
    │   └─> Yes → Continue
    ├─> last_aqi exists?
    │   ├─> No → Skip
    │   └─> Yes → Continue
    ├─> current_aqi !== last_aqi?
    │   ├─> No → Skip
    │   └─> Yes → Send email
    └─> Rate limit: 1 second delay
```

### 4. Use Gemini AI?
```
Generate recommendations
├─> Check cache
│   ├─> Found & not expired → Use cached
│   └─> Not found → Continue
├─> Call Gemini API
│   ├─> Success → Cache & return
│   └─> Fail → Use rule-based
└─> Always have fallback
```

### 5. Show Instant Button?
```
Dashboard renders
├─> User logged in?
│   ├─> No → Hide
│   └─> Yes → Continue
├─> alert_prefs loaded?
│   ├─> No → Hide
│   └─> Yes → Continue
└─> alert_prefs.instant_button === true?
    ├─> Yes → Show button
    └─> No → Hide button
```

---

## 📈 Performance Optimization Points

### 1. Gemini AI Caching
- **Cache Key:** age + conditions + activity + AQI level
- **TTL:** 1 hour (3600 seconds)
- **Hit Rate:** >80% expected
- **Benefit:** 90% reduction in API calls

### 2. Rate Limiting
- **Cron Jobs:** 1 second delay between users
- **Benefit:** Avoid email service throttling

### 3. Lazy Loading
- **Components:** Load on-demand
- **Benefit:** Faster initial page load

### 4. Database Indexing
- **Columns:** email, id, city
- **Benefit:** Faster user lookups

### 5. Connection Pooling
- **Supabase:** Reuse connections
- **Benefit:** Reduced latency

---

**This document provides a comprehensive view of all system flows. Use it as a reference for understanding how data moves through the application.**
