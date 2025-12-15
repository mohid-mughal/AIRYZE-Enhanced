# Implementation Tasks: User Onboarding & Extended Email Alerts

## ✅ COMPLETED: Backend Implementation

All backend functionality is already implemented:
- ✅ Health profile endpoints (PATCH/GET /auth/profile/:userId)
- ✅ Alert preferences endpoints (PATCH/GET /auth/alert-prefs/:userId)
- ✅ Instant email endpoint (POST /api/alerts/instant/:userId)
- ✅ Gemini AI service with 1-hour caching
- ✅ Rule-based personalization fallback
- ✅ Email service with HTML templates
- ✅ Cron jobs for daily and change detection alerts

## ✅ COMPLETED: Frontend Implementation

All frontend components are already implemented:
- ✅ WelcomeScreen with hero section
- ✅ AuthModal with login/signup
- ✅ Onboarding page with HealthProfileForm
- ✅ AlertPreferencesModal for settings
- ✅ InstantEmailButton component
- ✅ PersonalizedWelcome component
- ✅ Dashboard with all integrations
- ✅ API services (authService, profileService, alertsService)

## Task Group 1: Testing & Verification

### Task 1.1: Test Complete Onboarding Flow
**Description:** Verify end-to-end onboarding works correctly

**Requirements:** FR-1 through FR-6

**Testing Steps:**
- [ ] Open app in browser (http://localhost:5173)
- [ ] Verify WelcomeScreen displays
- [ ] Click "Get Started" button
- [ ] Sign up with new email/password
- [ ] Verify redirect to Onboarding page
- [ ] Complete all 4 steps of health profile
- [ ] Verify redirect to Dashboard
- [ ] Check health profile saved in Supabase

---

### Task 1.2: Test Instant Email Functionality
**Description:** Verify instant email button works end-to-end

**Requirements:** FR-13

**Testing Steps:**
- [ ] Login to dashboard
- [ ] Locate "Send me today's report by email" button
- [ ] Click button and verify loading state
- [ ] Wait for success message
- [ ] Check email inbox for instant report
- [ ] Verify email contains:
  - Current AQI data
  - Personalized recommendations
  - Health-specific advice (if applicable)
- [ ] Test error handling (disable instant_button in preferences)

---

### Task 1.3: Test Alert Preferences
**Description:** Verify alert preferences can be configured

**Requirements:** FR-9, FR-10

**Testing Steps:**
- [ ] Click "Manage Alert Preferences" button
- [ ] Verify modal opens with current settings
- [ ] Toggle "AQI Change Alerts" off
- [ ] Change "Daily Report Time" to different hour
- [ ] Toggle "Instant Email Button" off
- [ ] Click "Save Preferences"
- [ ] Verify success message
- [ ] Refresh page and verify settings persisted
- [ ] Check instant email button hidden (if toggled off)

---

### Task 1.4: Test Personalized Welcome Message
**Description:** Verify personalized welcome displays correctly

**Requirements:** FR-7

**Testing Steps:**
- [ ] Login with user that has health profile
- [ ] Verify PersonalizedWelcome component displays
- [ ] Check message includes user's name
- [ ] Select location on map with different AQI levels
- [ ] Verify message updates based on AQI
- [ ] Check emoji changes with AQI level
- [ ] Test with different health conditions (asthma, heart issues, etc.)
- [ ] Verify health-specific advice appears

---

## Task Group 2: Backend Verification

### Task 2.1: Verify Gemini AI Integration
**Description:** Test Gemini AI service with real API calls

**Requirements:** FR-7, FR-16

**Testing Steps:**
- [ ] Check GEMINI_API_KEY in backend/.env
- [ ] Start backend server
- [ ] Monitor console for Gemini API calls
- [ ] Send instant email and check for AI-generated content
- [ ] Verify cache working (second call should be instant)
- [ ] Test with invalid API key (should fallback to rules)
- [ ] Check console logs for cache hits/misses

---

### Task 2.2: Test Email Alert Cron Jobs
**Description:** Verify cron jobs respect user preferences

**Requirements:** FR-11, FR-12

**Testing Steps:**
- [ ] Check backend console for cron job initialization messages
- [ ] Create test user with daily_time = current hour + 1
- [ ] Wait for next hour and verify daily email sent
- [ ] Create test user with on_change = true
- [ ] Manually change AQI in database (update last_aqi)
- [ ] Wait 30 minutes for change detection cron
- [ ] Verify change alert email sent
- [ ] Check rate limiting (1 second delay between emails)

---

### Task 2.3: Test Instant Email API Endpoint
**Description:** Verify instant email API works correctly

**Requirements:** FR-13

**Testing Steps:**
- [ ] Use Postman or curl to test endpoint
- [ ] POST to http://localhost:5000/api/alerts/instant/:userId
- [ ] Verify 200 response with success message
- [ ] Check email received in inbox
- [ ] Test with instant_button = false (should return 403)
- [ ] Test with invalid userId (should return 400/404)
- [ ] Test with email service down (should return 503)

---

## Task Group 3: Database Verification

### Task 3.1: Verify Supabase Schema
**Description:** Ensure database has required columns

**Requirements:** FR-5, FR-10

**Testing Steps:**
- [ ] Open Supabase dashboard
- [ ] Navigate to Table Editor > users
- [ ] Verify columns exist:
  - health_profile (JSONB)
  - alert_prefs (JSONB)
  - last_aqi (INTEGER)
- [ ] Check sample user data
- [ ] Verify health_profile structure matches spec
- [ ] Verify alert_prefs structure matches spec
- [ ] Test updating columns via SQL editor

---

## Task Group 4: Documentation

### Task 4.1: Update API Documentation
**Description:** Document new API endpoints

**Requirements:** All FR

**Implementation:**
- [ ] Open `API.md`
- [ ] Add documentation for health profile endpoints
- [ ] Add documentation for alert preferences endpoints
- [ ] Add documentation for instant email endpoint
- [ ] Include request/response examples
- [ ] Document error codes and messages

---

### Task 4.2: Update README
**Description:** Document onboarding and alert features

**Requirements:** All FR

**Implementation:**
- [ ] Open `README.md`
- [ ] Add "User Onboarding" section
- [ ] Add "Email Alerts & Personalization" section
- [ ] Document Gemini AI integration
- [ ] Update environment variables section
- [ ] Update feature list with new capabilities

---

## Task Group 5: Performance & Quality

### Task 5.1: Performance Testing
**Description:** Verify performance requirements met

**Requirements:** NFR-1, NFR-2, NFR-3

**Testing Steps:**
- [ ] Measure onboarding completion time (target: <2 min)
- [ ] Monitor Gemini API calls (should see cache hits)
- [ ] Measure instant email response time (target: <5 sec)
- [ ] Test with multiple users (10+)
- [ ] Check memory usage with cache
- [ ] Monitor backend console for performance issues

---

### Task 5.2: Responsive Design Testing
**Description:** Ensure all components work on mobile

**Requirements:** NFR-1

**Testing Steps:**
- [ ] Test WelcomeScreen on mobile (320px-768px)
- [ ] Test AuthModal on mobile
- [ ] Test Onboarding form on mobile (all 4 steps)
- [ ] Test Dashboard on mobile
- [ ] Test AlertPreferencesModal on mobile
- [ ] Test InstantEmailButton on mobile
- [ ] Check landscape orientation
- [ ] Verify touch interactions work

---

### Task 5.3: Error Handling Testing
**Description:** Test all error scenarios

**Requirements:** NFR-4

**Testing Steps:**
- [ ] Stop backend and test frontend (should show errors)
- [ ] Test with invalid Gemini API key
- [ ] Test with email service down (EMAIL_MOCK_MODE=true)
- [ ] Test with invalid user ID
- [ ] Test signup with existing email
- [ ] Test login with wrong password
- [ ] Test onboarding with network interruption
- [ ] Verify graceful degradation in all cases

---

## Task Group 6: End-to-End Testing

### Task 6.1: Complete User Journey Test
**Description:** Test entire flow from signup to email alerts

**Test Scenario:**
1. **New User Signup:**
   - [ ] Visit http://localhost:5173
   - [ ] Click "Get Started"
   - [ ] Sign up with: test@example.com / password123 / Karachi
   - [ ] Complete onboarding:
     - Age: 19-40
     - Conditions: Asthma
     - Activity: Running/Cycling
     - City: Karachi
   - [ ] Verify redirect to dashboard

2. **Dashboard Interaction:**
   - [ ] Verify PersonalizedWelcome shows user name
   - [ ] Click map location
   - [ ] Verify AQI data displays
   - [ ] Check recommendations mention asthma
   - [ ] Verify instant email button visible

3. **Alert Configuration:**
   - [ ] Click "Manage Alert Preferences"
   - [ ] Set daily_time to current hour + 1
   - [ ] Enable on_change alerts
   - [ ] Save preferences
   - [ ] Verify success message

4. **Instant Email:**
   - [ ] Click "Send me today's report by email"
   - [ ] Wait for success message
   - [ ] Check email inbox
   - [ ] Verify personalized content with asthma advice

5. **Cron Job Verification:**
   - [ ] Wait for next hour
   - [ ] Check email for daily report
   - [ ] Verify personalized content

---

## Completion Checklist

### Implementation Status
- [x] All frontend components created and integrated
- [x] All backend services implemented
- [x] Database schema configured
- [ ] API endpoints documented
- [ ] End-to-end flows tested
- [ ] Error handling verified
- [ ] Performance requirements met
- [ ] Responsive design confirmed
- [ ] Documentation updated
- [ ] Code reviewed and approved

### Component Status
- [x] WelcomeScreen.jsx - Complete
- [x] AuthModal.jsx - Complete
- [x] Onboarding.jsx - Complete
- [x] HealthProfileForm.jsx - Complete
- [x] AlertPreferencesModal.jsx - Complete
- [x] InstantEmailButton.jsx - Complete
- [x] PersonalizedWelcome.jsx - Complete
- [x] Dashboard.jsx - Complete with all integrations
- [x] alertsService.js - Complete
- [x] profileService.js - Complete

### Backend Status
- [x] authControllers.js - Complete with health profile & alert prefs
- [x] alertsController.js - Complete with instant email
- [x] geminiService.js - Complete with caching
- [x] personalizationHelper.js - Complete with rule-based fallback
- [x] email.js - Complete with personalization
- [x] aqiAlerts.js - Complete with user preferences
- [x] authRoutes.js - Complete with all endpoints
- [x] alertsRoutes.js - Complete

## Notes

### Configuration
- **Gemini API Key:** AIzaSyCKJyIHAcY7m4OseWJSWYf6UShVtLqOYr0 (configured in .env)
- **Email Service:** Gmail SMTP configured (temp.test.raty.edu@gmail.com)
- **Supabase:** Connected and working
- **OpenWeather API:** Configured for AQI data

### Implementation Highlights
1. **Complete Onboarding Flow:** 4-step wizard with validation
2. **Gemini AI Integration:** 1-hour caching, automatic fallback
3. **Personalized Emails:** Health-specific advice, AI-generated content
4. **Flexible Alerts:** User-configurable triggers (daily time, on change, instant)
5. **Responsive Design:** Mobile-first approach with Tailwind CSS

### Next Steps
1. Run end-to-end tests (Task Group 6)
2. Update API documentation (Task 4.1)
3. Update README with new features (Task 4.2)
4. Performance testing (Task 5.1)
5. Mobile testing (Task 5.2)

### Known Issues
- None currently - all core functionality implemented

### Future Enhancements
- Push notifications (browser/mobile)
- Multiple city monitoring
- Custom alert thresholds
- Weekly/monthly email summaries
- Social sharing of AQI data
