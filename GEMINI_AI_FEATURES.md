# Gemini AI Integration in Airyze AQI Monitor

## Overview
This project uses Google's Gemini AI API extensively to provide intelligent, personalized air quality guidance and conversational assistance.

## Current Gemini AI Features

### 1. **Personalized Health Recommendations** 
**Location:** `backend/services/geminiService.js` → `generatePersonalizedRecommendations()`

**Usage:**
- Generates 3-5 tailored health recommendations based on:
  - User's age group (18-40, 41-60, 60+)
  - Health conditions (asthma, heart issues, allergies, pregnancy, etc.)
  - Activity level (sedentary, moderate, active)
  - Current AQI level and pollutant concentrations
  
**Where it's used:**
- Email alerts (daily reports, instant reports)
- Personalization API endpoint
- Alert service for scheduled notifications

**Fallback:** Rule-based recommendations in `personalizationHelper.js`

---

### 2. **Personalized Email Content Generation**
**Location:** `backend/services/geminiService.js` → `generateEmailContent()`

**Usage:**
- Creates friendly, personalized email messages for:
  - Daily AQI reports (8:00 AM)
  - Instant email alerts (on-demand)
  - AQI change notifications
  
**Features:**
- Warm, conversational tone
- Health-specific advice based on user profile
- Simple language, no medical jargon
- 2-3 paragraph format

**Where it's used:**
- `backend/services/email.js` → `sendAQIAlert()`

---

### 3. **AI Chatbot Assistant** ✨ NEW
**Location:** `backend/services/chatbotService.js`

**Features:**
- **Conversational AI** for air quality questions
- **Context-aware** responses using current AQI data
- **Conversation history** (30-minute sessions)
- **Quick suggestions** for common questions
- **Real-time assistance** with air quality concerns

**Topics the chatbot can help with:**
- Explaining AQI levels and meanings
- Health effects of different pollutants (PM2.5, PM10, O3, NO2, SO2, CO)
- Protective measures for different AQI levels
- Understanding air quality data
- Tips for reducing pollution exposure
- Airyze app features and usage

**Frontend Component:** `frontend/src/components/AIChatbot.jsx`
- Beautiful floating chat button
- Full-screen modal interface
- Message history with smooth scrolling
- Quick question suggestions
- Loading states and error handling

**API Endpoints:**
- `POST /api/chatbot/message` - Send message to AI
- `POST /api/chatbot/clear` - Clear conversation history

---

## Technical Implementation

### Caching Strategy
All Gemini responses are cached for 1 hour to:
- Reduce API costs
- Improve response times
- Handle rate limits gracefully

**Cache Key:** Based on health profile + AQI level (rounded)

### Error Handling
- Graceful fallbacks to rule-based systems
- User-friendly error messages
- Automatic retry logic
- Timeout protection (10-15 seconds)

### API Configuration
```javascript
// Gemini Pro model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Generation settings
{
  temperature: 0.7-0.8,  // Balanced creativity
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 800-1024
}
```

---

## How to Use More AI Features

### Ideas for Aggressive AI Usage:

1. **Predictive AQI Forecasting**
   - Use Gemini to analyze historical patterns
   - Predict next day's AQI based on trends
   - Provide proactive health advice

2. **Smart Location Recommendations**
   - Suggest best times for outdoor activities
   - Recommend cleaner air locations nearby
   - Personalized route planning

3. **Health Impact Analysis**
   - Long-term exposure risk assessment
   - Personalized health reports
   - Trend analysis with AI insights

4. **Natural Language AQI Queries**
   - "Is it safe to jog tomorrow morning?"
   - "Should I keep my windows open today?"
   - "What mask should I wear?"

5. **AI-Powered Notifications**
   - Smart notification timing
   - Personalized alert thresholds
   - Context-aware reminders

6. **Image Analysis** (Future: Gemini Vision)
   - Analyze sky photos for air quality
   - Visual pollution detection
   - Smoke/haze identification

---

## Environment Setup

```env
# Gemini AI API Key
GEMINI_API_KEY=your_api_key_here
```

Get your API key from: https://makersuite.google.com/app/apikey

---

## Testing

Run Gemini integration tests:
```bash
cd backend
npm test -- gemini-integration.test.js
```

---

## Cost Optimization

- **Caching:** 1-hour TTL reduces redundant calls
- **Fallbacks:** Rule-based systems when AI unavailable
- **Batching:** Group similar requests
- **Rate limiting:** Built-in request throttling

---

## Future Enhancements

1. **Multi-language Support** - Gemini can respond in Urdu, Punjabi, etc.
2. **Voice Assistant** - Integrate with speech-to-text
3. **Gemini Vision** - Analyze pollution photos
4. **Advanced Analytics** - AI-powered data insights
5. **Personalized Learning** - Adapt to user preferences over time

---

## Files Modified/Created

### Backend
- `backend/services/geminiService.js` - Core AI service
- `backend/services/chatbotService.js` - Chatbot logic ✨ NEW
- `backend/controllers/chatbotController.js` - Chatbot API ✨ NEW
- `backend/routes/chatbotRoutes.js` - Chatbot routes ✨ NEW
- `backend/services/email.js` - Uses Gemini for emails
- `backend/services/alertService.js` - Uses Gemini for recommendations

### Frontend
- `frontend/src/components/AIChatbot.jsx` - Chat UI ✨ NEW
- `frontend/src/api/chatbotService.js` - Chat API client ✨ NEW
- `frontend/src/pages/Dashboard.jsx` - Integrated chatbot button

### Tests
- `backend/__tests__/gemini-integration.test.js` - AI tests

---

## Summary

Gemini AI is now deeply integrated into Airyze AQI Monitor:
- ✅ Personalized health recommendations
- ✅ Dynamic email content generation
- ✅ Interactive AI chatbot assistant
- ✅ Context-aware responses
- ✅ Conversation memory
- ✅ Graceful fallbacks

The chatbot provides 24/7 AI assistance for air quality questions, making the app more interactive and helpful!
