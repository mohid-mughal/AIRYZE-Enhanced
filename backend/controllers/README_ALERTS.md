# Instant Email Alert Endpoint

## Overview
The instant email alert endpoint allows authenticated users to send themselves an immediate email with current AQI information and personalized health recommendations.

## Endpoint
**POST** `/api/alerts/instant/:userId`

## Implementation Details

### Controller: `alertsController.js`
Located at: `backend/controllers/alertsController.js`

#### Function: `sendInstantAlert(req, res)`

**Requirements Satisfied:**
- Requirement 6.2: Send instant email on button click
- Requirement 6.3: Personalize content based on health profile

**Process Flow:**
1. Extract `userId` from request parameters
2. Fetch user data from Supabase including:
   - Basic info (id, name, email, city)
   - `health_profile` (age, conditions, activity level)
   - `alert_prefs` (instant button enabled/disabled)
3. Validate that instant alerts are enabled for the user
4. Look up city coordinates from the cities database
5. Fetch current AQI data from OpenWeather API
6. Send personalized email using:
   - Gemini AI for content generation (primary)
   - Rule-based recommendations (fallback)
7. Return success response with AQI data

**Error Handling:**
- 404: User not found
- 403: Instant alerts disabled for user
- 400: City not found in database
- 500: Server error (API failures, email errors)

### Routes: `alertsRoutes.js`
Located at: `backend/routes/alertsRoutes.js`

**Route Definition:**
```javascript
router.post('/instant/:userId', sendInstantAlert);
```

**Mounted at:** `/api/alerts` in `server.js`

**Full URL:** `POST http://localhost:5000/api/alerts/instant/:userId`

## Usage Example

### Request
```bash
curl -X POST http://localhost:5000/api/alerts/instant/123
```

### Success Response (200)
```json
{
  "success": true,
  "message": "Instant alert sent successfully",
  "aqi": 3
}
```

### Error Response (403)
```json
{
  "error": "Instant alerts are disabled for this user"
}
```

## Personalization Features

The instant alert email includes:
1. **Personalized greeting** with user's name
2. **Current AQI** with color-coded badge
3. **Health-specific recommendations** based on:
   - Age group (elderly get special advice)
   - Health conditions (asthma, heart issues, allergies, pregnancy, young children)
   - Activity level (athletes get exercise-specific guidance)
4. **AI-generated content** using Gemini API (with rule-based fallback)

## Testing

### Manual Testing Script
Use the provided test script:
```bash
node scripts/testInstantAlert.js <userId>
```

### Prerequisites
- Server must be running on port 5000
- User must exist in database
- User must have `instant_button: true` in `alert_prefs`
- Email service must be configured

## Dependencies
- `supabase` - Database queries
- `openweatherService` - AQI data fetching
- `email` service - Email sending with personalization
- `geminiService` - AI-powered content generation
- `personalizationHelper` - Rule-based fallback recommendations

## Related Files
- Controller: `backend/controllers/alertsController.js`
- Routes: `backend/routes/alertsRoutes.js`
- Email Service: `backend/services/email.js`
- Gemini Service: `backend/services/geminiService.js`
- Personalization: `backend/services/personalizationHelper.js`
- Cities Data: `backend/data/cities.js`
