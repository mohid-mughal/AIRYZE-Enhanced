# Feature: User Onboarding & Extended Email Alerts

## Overview

This feature implements a complete user onboarding flow with health profile collection and extends the existing email alert system to support customizable triggers and personalized content using Gemini AI.

## User Stories

### 1. Welcome & Authentication
**As a** new visitor  
**I want to** see a welcoming landing page with clear call-to-action  
**So that** I understand the value proposition and can easily sign up

**Acceptance Criteria:**
- Welcome screen displays hero section with key features
- "Get Started" button triggers authentication modal
- Modal supports both login and signup flows
- Email and password validation with clear error messages

### 2. Health Profile Onboarding
**As a** newly registered user  
**I want to** complete a quick health profile questionnaire  
**So that** I receive personalized air quality recommendations

**Acceptance Criteria:**
- 4-step onboarding form appears immediately after signup
- Questions cover: age group, health conditions, activity level, primary city
- Progress indicator shows current step (1/4, 2/4, etc.)
- Form validates each step before proceeding
- Profile data is saved to Supabase upon completion

### 3. Personalized Recommendations
**As a** user with a health profile  
**I want to** receive AI-powered recommendations tailored to my conditions  
**So that** I can make informed decisions about outdoor activities

**Acceptance Criteria:**
- Gemini AI generates personalized recommendations based on health profile
- Fallback to rule-based recommendations if Gemini fails
- Recommendations consider age, health conditions, activity level, and current AQI
- Displayed in dashboard and included in email alerts

### 4. Customizable Email Alerts
**As a** registered user  
**I want to** customize when I receive email alerts  
**So that** I only get notifications that matter to me

**Acceptance Criteria:**
- Settings page allows configuring alert preferences:
  - Enable/disable change detection alerts (every 30 min)
  - Set custom daily alert time (HH:MM format)
  - Enable/disable instant email button
- Preferences saved to Supabase `alert_prefs` JSON field
- Cron jobs respect user preferences when sending alerts

### 5. Instant Email Button
**As a** user  
**I want to** send myself an immediate AQI report  
**So that** I can check air quality on-demand

**Acceptance Criteria:**
- Dashboard displays "Send Email Now" button
- Button triggers instant email with current AQI data
- Email includes personalized recommendations
- Success/error feedback displayed to user

### 6. Personalized Email Content
**As a** user with health conditions  
**I want to** receive emails with health-specific advice  
**So that** I know exactly what precautions to take

**Acceptance Criteria:**
- Emails include Gemini AI-generated personalized messages
- Health-specific advice sections for each condition
- Age-appropriate recommendations for elderly users
- Activity-level specific guidance for athletes
- Fallback to rule-based content if Gemini fails

## Requirements (EARS Notation)

### Functional Requirements

**FR-1:** The system **shall** display a welcome screen with authentication modal when user is not logged in.

**FR-2:** The system **shall** redirect newly registered users to onboarding page immediately after signup.

**FR-3:** The system **shall** collect health profile data through a 4-step form covering age group, health conditions, activity level, and primary city.

**FR-4:** The system **shall** validate each onboarding step before allowing progression to next step.

**FR-5:** The system **shall** save health profile to Supabase `users.health_profile` JSON field upon completion.

**FR-6:** The system **shall** redirect users to dashboard after completing onboarding.

**FR-7:** The system **shall** generate personalized recommendations using Gemini AI **when** health profile exists.

**FR-8:** The system **shall** fall back to rule-based recommendations **when** Gemini AI fails or is unavailable.

**FR-9:** The system **shall** allow users to configure alert preferences including on_change, daily_time, and instant_button.

**FR-10:** The system **shall** save alert preferences to Supabase `users.alert_prefs` JSON field.

**FR-11:** The system **shall** send daily email alerts at user's preferred time **when** daily_time is configured.

**FR-12:** The system **shall** send change detection alerts every 30 minutes **when** on_change is enabled and AQI category changes.

**FR-13:** The system **shall** send instant email alert **when** user clicks "Send Email Now" button.

**FR-14:** The system **shall** include personalized recommendations in all email alerts based on user's health profile.

**FR-15:** The system **shall** include health-specific advice sections in emails **when** user has health conditions.

**FR-16:** The system **shall** use Gemini AI to generate email content **when** available, otherwise use rule-based templates.

### Non-Functional Requirements

**NFR-1:** Onboarding form **shall** complete in under 2 minutes for average user.

**NFR-2:** Gemini AI responses **shall** be cached for 1 hour to reduce API calls.

**NFR-3:** Email alerts **shall** be sent within 5 seconds of trigger event.

**NFR-4:** System **shall** gracefully degrade to rule-based recommendations when Gemini AI is unavailable.

**NFR-5:** Health profile data **shall** be stored securely in Supabase with proper access controls.

## Data Models

### Health Profile (JSON in users.health_profile)
```json
{
  "age_group": "19_40" | "under_12" | "13_18" | "41_60" | "60_plus",
  "health_conditions": ["asthma", "heart_issues", "allergies", "pregnant", "young_children", "none"],
  "activity_level": "mostly_indoors" | "light_exercise" | "running_cycling" | "heavy_sports",
  "primary_city": "Karachi" | "Lahore" | "Islamabad" | ...
}
```

### Alert Preferences (JSON in users.alert_prefs)
```json
{
  "on_change": true | false,
  "daily_time": "08:00" | "HH:MM",
  "instant_button": true | false
}
```

## API Endpoints

### Health Profile
- `PATCH /auth/profile/:userId` - Update health profile
- `GET /auth/profile/:userId` - Get health profile

### Alert Preferences
- `PATCH /auth/alert-prefs/:userId` - Update alert preferences
- `GET /auth/alert-prefs/:userId` - Get alert preferences

### Instant Alerts
- `POST /api/alerts/instant/:userId` - Send instant email alert

## Dependencies

- **Backend:** Express, Supabase, Nodemailer, node-cron, axios, bcryptjs
- **Frontend:** React 19, React Router, Axios
- **AI:** Gemini 2.5-Flash API
- **External APIs:** OpenWeather (AQI data)

## Success Metrics

1. **Onboarding Completion Rate:** >80% of signups complete health profile
2. **Email Delivery Rate:** >95% of alerts delivered successfully
3. **Gemini AI Success Rate:** >90% of requests succeed (with cache)
4. **User Engagement:** >60% of users customize alert preferences
5. **Instant Email Usage:** Average 2+ instant emails per user per week
