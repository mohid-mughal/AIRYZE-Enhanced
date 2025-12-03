# 📡 API Documentation

Complete API reference for Airyze AQI Monitor backend.

## Base URL

```
http://localhost:5000
```

Production URL will vary based on deployment.

---

## Authentication

Currently, authentication is only required for user-specific operations (signup/login). AQI data endpoints are publicly accessible.

---

## Endpoints

### 1. Get AQI by Coordinates

Get real-time air quality data for any location using latitude and longitude.

**Endpoint:** `GET /api/aqi`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude (-90 to 90) |
| `lon` | number | Yes | Longitude (-180 to 180) |

**Example Request:**
```bash
curl "http://localhost:5000/api/aqi?lat=24.8607&lon=67.0011"
```

**Example Response:**
```json
{
  "success": true,
  "aqi": 3,
  "components": {
    "co": 250.5,
    "no": 0.1,
    "no2": 15.2,
    "o3": 85.3,
    "so2": 2.5,
    "pm2_5": 25.8,
    "pm10": 45.2,
    "nh3": 0.5
  }
}
```

**AQI Scale:**
- `1` = Good (Green)
- `2` = Fair (Light Green)
- `3` = Moderate (Yellow)
- `4` = Poor (Orange)
- `5` = Very Poor (Red)

**Error Responses:**
```json
// Missing parameters
{
  "error": "lat & lon are required"
}

// API error
{
  "error": "Failed to fetch AQI from OpenWeather: ..."
}
```

---

### 2. Get Major Cities AQI

Get real-time air quality data for all major Pakistani cities.

**Endpoint:** `GET /api/pak_cities`

**Example Request:**
```bash
curl "http://localhost:5000/api/pak_cities"
```

**Example Response:**
```json
[
  {
    "name": "Karachi",
    "aqi": 4,
    "components": {
      "co": 300.5,
      "no": 0.2,
      "no2": 20.1,
      "o3": 90.5,
      "so2": 5.2,
      "pm2_5": 35.8,
      "pm10": 55.2,
      "nh3": 1.2
    },
    "updatedAt": 1704067200
  },
  {
    "name": "Lahore",
    "aqi": 3,
    "components": { ... },
    "updatedAt": 1704067200
  },
  ...
]
```

**Cities Included:**
- Karachi
- Lahore
- Islamabad
- Rawalpindi
- Peshawar
- Quetta
- Faisalabad
- Multan

**Error Response:**
```json
{
  "error": "Failed to fetch major cities AQI",
  "message": "Error details..."
}
```

---

### 3. Get City History

Retrieve historical AQI data for a specific city (last 30 days).

**Endpoint:** `GET /api/history`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `city` | string | Yes | City name (e.g., "Karachi") |

**Example Request:**
```bash
curl "http://localhost:5000/api/history?city=Karachi"
```

**Example Response:**
```json
[
  {
    "location_name": "Karachi",
    "aqi": 3,
    "pm2_5": 25.5,
    "pm10": 45.2,
    "o3": 85.3,
    "no2": 15.2,
    "so2": 2.5,
    "date": "2024-01-15"
  },
  {
    "location_name": "Karachi",
    "aqi": 4,
    "pm2_5": 35.8,
    "pm10": 55.2,
    "o3": 90.5,
    "no2": 20.1,
    "so2": 5.2,
    "date": "2024-01-14"
  },
  ...
]
```

**Error Responses:**
```json
// Missing city parameter
{
  "error": "City name is required"
}

// Database error
{
  "error": "Error message..."
}
```

---

### 4. Fetch Historical Data

Fetch and store 30 days of historical AQI data for all major cities from Open-Meteo API.

**Endpoint:** `POST /api/history/fetch`

**Example Request:**
```bash
curl -X POST "http://localhost:5000/api/history/fetch"
```

**Example Response:**
```json
{
  "message": "Historical AQI stored successfully"
}
```

**Note:** This endpoint may take several minutes to complete as it fetches data for all cities.

**Error Response:**
```json
{
  "error": "Error message..."
}
```

---

### 5. User Registration

Register a new user account.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "city": "Karachi"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "city": "Karachi"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "city": "Karachi"
  }
}
```

**Error Responses:**
```json
// Missing fields
{
  "error": "All fields are required"
}

// Email already exists
{
  "error": "User with this email already exists"
}

// Server error
{
  "error": "Error message..."
}
```

---

### 6. User Login

Authenticate a user and return user data.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:5000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "city": "Karachi"
  }
}
```

**Error Responses:**
```json
// Missing fields
{
  "error": "Email and password are required"
}

// Invalid credentials
{
  "error": "Invalid email or password"
}

// Server error
{
  "error": "Error message..."
}
```

---

## Pollutant Units

All pollutant values are in **micrograms per cubic meter (μg/m³)**:

| Pollutant | Description | Typical Range |
|------------|-------------|---------------|
| `co` | Carbon Monoxide | 0-5000 |
| `no` | Nitrogen Monoxide | 0-50 |
| `no2` | Nitrogen Dioxide | 0-200 |
| `o3` | Ozone | 0-200 |
| `so2` | Sulphur Dioxide | 0-100 |
| `pm2_5` | PM2.5 Particles | 0-500 |
| `pm10` | PM10 Particles | 0-600 |
| `nh3` | Ammonia | 0-200 |

---

## Rate Limiting

Currently, there are no rate limits implemented. However, please use the API responsibly:

- OpenWeather API has rate limits (check your plan)
- Avoid making excessive requests
- Consider caching responses on the client side

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (invalid credentials)
- `404` - Route not found
- `500` - Internal Server Error

---

## CORS

The API is configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (common React port)

For production, update CORS settings in `backend/server.js`.

---

## Data Sources

- **Real-time AQI**: OpenWeather Air Pollution API
- **Historical Data**: Open-Meteo Air Quality API

---

## Example Integration

### JavaScript/React

```javascript
// Fetch AQI for coordinates
const fetchAQI = async (lat, lon) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/aqi?lat=${lat}&lon=${lon}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching AQI:', error);
  }
};

// Get major cities AQI
const fetchCitiesAQI = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/pak_cities');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching cities AQI:', error);
  }
};
```

### Python

```python
import requests

# Fetch AQI for coordinates
def get_aqi(lat, lon):
    url = f"http://localhost:5000/api/aqi?lat={lat}&lon={lon}"
    response = requests.get(url)
    return response.json()

# Get major cities AQI
def get_cities_aqi():
    url = "http://localhost:5000/api/pak_cities"
    response = requests.get(url)
    return response.json()
```

---

## Support

For API issues or questions:
1. Check the main [README.md](./README.md) for setup instructions
2. Verify your API key is valid
3. Check backend server logs for detailed error messages

---

**Last Updated:** 2024

