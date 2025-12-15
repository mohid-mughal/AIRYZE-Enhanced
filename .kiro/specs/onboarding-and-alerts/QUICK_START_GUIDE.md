# Quick Start Guide: Testing Onboarding & Email Alerts

## 🚀 Getting Started

### Prerequisites
- Node.js installed
- Backend and frontend running
- Supabase configured
- Email service configured

### Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📝 Test Scenario 1: New User Onboarding

### Step 1: Welcome Screen
1. Open http://localhost:5173
2. You should see the welcome screen with:
   - Hero section with "Breathe Cleaner, Live Healthier"
   - 4 feature cards
   - "Get Started" button

### Step 2: Sign Up
1. Click "Get Started" button
2. AuthModal opens
3. Click "Sign Up" tab
4. Fill in:
   - **Name:** Test User
   - **Email:** test@example.com
   - **Password:** password123
   - **City:** Karachi
5. Click "Sign Up"
6. Wait for success message
7. Should redirect to Onboarding page

### Step 3: Complete Onboarding
**Step 1/4 - Age Group:**
- Select "19-40"
- Click "Next"

**Step 2/4 - Health Conditions:**
- Select "Asthma" and "Allergies"
- Click "Next"

**Step 3/4 - Activity Level:**
- Select "Running/Cycling"
- Click "Next"

**Step 4/4 - Primary City:**
- Select "Karachi"
- Click "Complete Setup"

### Step 4: Verify Dashboard
- Should redirect to Dashboard
- PersonalizedWelcome should display: "Welcome back, Test User!"
- Instant email button should be visible
- Alert preferences button should be visible

**✅ Expected Result:** User successfully onboarded with health profile saved

---

## 📧 Test Scenario 2: Instant Email Alert

### Step 1: Send Instant Email
1. On Dashboard, locate "Quick Actions" card
2. Click "Send me today's report by email" button
3. Button shows loading spinner
4. Wait for success message: "Email sent successfully! Check your inbox."

### Step 2: Check Email
1. Open email inbox for test@example.com
2. Look for email from temp.test.raty.edu@gmail.com
3. Subject: "Your AQI Report for Karachi"

### Step 3: Verify Email Content
Email should contain:
- ✅ Personalized greeting: "Hello Test User"
- ✅ Current AQI badge with color
- ✅ AQI level and description
- ✅ Personalized recommendations (mentions asthma/allergies)
- ✅ Health-specific advice sections
- ✅ Professional HTML formatting

**✅ Expected Result:** Email received with personalized content

---

## ⚙️ Test Scenario 3: Alert Preferences

### Step 1: Open Preferences
1. On Dashboard, locate "Settings" card
2. Click "Manage Alert Preferences" button
3. Modal opens with current settings

### Step 2: Modify Settings
1. **AQI Change Alerts:** Toggle OFF
2. **Daily Report Time:** Change to "14:00" (2 PM)
3. **Instant Email Button:** Keep ON
4. Click "Save Preferences"
5. Wait for success message
6. Modal closes automatically

### Step 3: Verify Settings Persisted
1. Refresh the page
2. Click "Manage Alert Preferences" again
3. Verify settings match what you saved:
   - AQI Change Alerts: OFF
   - Daily Report Time: 14:00
   - Instant Email Button: ON

**✅ Expected Result:** Settings saved and persisted

---

## 🎯 Test Scenario 4: Personalized Recommendations

### Step 1: Select Location
1. On Dashboard, click anywhere on the map
2. Wait for AQI data to load
3. "Current Air Quality" card updates

### Step 2: Check Recommendations
1. Scroll to "Health Recommendations" card
2. Recommendations should mention:
   - Your health conditions (asthma, allergies)
   - Your activity level (running/cycling)
   - Specific advice based on current AQI

### Step 3: Test Different AQI Levels
1. Click different locations on map
2. Notice recommendations change based on AQI
3. Higher AQI = more cautious advice
4. Lower AQI = more permissive advice

**✅ Expected Result:** Recommendations personalized to health profile and AQI

---

## 🤖 Test Scenario 5: Gemini AI Integration

### Step 1: Monitor Backend Console
1. Open terminal running backend
2. Look for Gemini AI logs

### Step 2: Trigger AI Calls
1. Send instant email (triggers AI)
2. Check backend console for:
   ```
   Returning cached Gemini response
   ```
   OR
   ```
   Using Gemini AI recommendations
   ```

### Step 3: Verify Caching
1. Send instant email again immediately
2. Should see "Returning cached Gemini response"
3. Response should be instant (<1 second)

### Step 4: Test Fallback
1. Stop backend
2. Edit backend/.env
3. Set GEMINI_API_KEY to invalid value
4. Restart backend
5. Send instant email
6. Should still work with rule-based recommendations
7. Check console for "Gemini AI failed, falling back to rule-based"

**✅ Expected Result:** AI works with caching, fallback works when AI fails

---

## ⏰ Test Scenario 6: Cron Jobs (Advanced)

### Daily Alert Test

**Setup:**
1. Create test user with daily_time = current hour + 1
2. Wait for next hour
3. Check email inbox

**Expected:**
- Email received at specified time
- Subject: "Daily AQI Report for [City]"
- Personalized content

### Change Detection Test

**Setup:**
1. Create test user with on_change = true
2. Note current AQI in database (last_aqi column)
3. Wait 30 minutes for cron to run
4. If AQI changed, email should be sent

**Expected:**
- Email received when AQI category changes
- Subject: "AQI Alert: Air Quality Changed in [City]"
- Shows old and new AQI

**Note:** Cron jobs run automatically. Check backend console for:
```
Running daily AQI alert job...
Running AQI change detection job...
```

---

## 🐛 Troubleshooting

### Issue: Email not received

**Check:**
1. Backend console for email send logs
2. EMAIL_MOCK_MODE in .env (should be false)
3. Email credentials in .env
4. Spam folder in email inbox
5. Gmail SMTP settings

**Solution:**
```bash
# Test email service
cd backend
node test-email.js
```

### Issue: Gemini AI not working

**Check:**
1. GEMINI_API_KEY in .env
2. Internet connection
3. API quota limits
4. Backend console for errors

**Solution:**
- Verify API key at https://makersuite.google.com/app/apikey
- Check quota at Google Cloud Console
- Fallback to rule-based should work automatically

### Issue: Onboarding not saving

**Check:**
1. Supabase connection
2. Browser console for errors
3. Network tab for API calls
4. Backend console for errors

**Solution:**
```bash
# Check Supabase connection
cd backend
node -e "const supabase = require('./db'); console.log('Connected:', !!supabase)"
```

### Issue: Dashboard not loading

**Check:**
1. User logged in (check localStorage)
2. Health profile exists
3. Browser console for errors
4. Backend running

**Solution:**
```javascript
// Check localStorage in browser console
console.log(localStorage.getItem('user'));
```

---

## 📊 Success Indicators

### ✅ All Tests Passing
- [ ] New user can sign up
- [ ] Onboarding completes successfully
- [ ] Health profile saved to database
- [ ] Dashboard loads with personalized content
- [ ] Instant email sends successfully
- [ ] Email contains personalized content
- [ ] Alert preferences can be configured
- [ ] Settings persist after refresh
- [ ] Recommendations change based on AQI
- [ ] Gemini AI works with caching
- [ ] Fallback works when AI fails

### 📈 Performance Metrics
- Onboarding completion: <2 minutes
- Instant email response: <5 seconds
- Gemini cache hit rate: >80%
- Email delivery rate: >95%

---

## 🎓 Tips for Testing

1. **Use Real Email:** Test with actual email address you can access
2. **Clear Cache:** Clear browser cache between tests
3. **Monitor Console:** Keep backend console visible
4. **Check Database:** Use Supabase dashboard to verify data
5. **Test Edge Cases:** Try invalid inputs, network errors, etc.
6. **Mobile Testing:** Test on mobile devices or responsive mode
7. **Different Profiles:** Test with various health conditions
8. **Multiple Users:** Create several test users

---

## 📞 Need Help?

### Backend Issues
- Check `backend/server.js` logs
- Verify environment variables
- Test database connection
- Check API keys

### Frontend Issues
- Check browser console
- Verify API endpoints
- Check network tab
- Clear browser cache

### Email Issues
- Check Gmail SMTP settings
- Verify email credentials
- Test with EMAIL_MOCK_MODE=true
- Check spam folder

---

**Happy Testing! 🎉**

If you encounter any issues not covered here, check the IMPLEMENTATION_SUMMARY.md for detailed technical information.
