# 🚀 Quick Setup Guide

This guide will help you get Airyze AQI Monitor up and running quickly.

## Prerequisites Checklist

- [ ] Node.js (v18+) installed
- [ ] PostgreSQL database created
- [ ] OpenWeather API key obtained
- [ ] Email service credentials (for alerts)

## Step-by-Step Setup

### 1. Database Setup

```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE airyze_aqi;

-- Connect to the database
\c airyze_aqi

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    city VARCHAR(255),
    last_aqi INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create aqi_data table
CREATE TABLE aqi_data (
    id SERIAL PRIMARY KEY,
    location_name VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8),
    lon DECIMAL(11, 8),
    aqi INTEGER,
    co DECIMAL(10, 2),
    no DECIMAL(10, 2),
    no2 DECIMAL(10, 2),
    o3 DECIMAL(10, 2),
    so2 DECIMAL(10, 2),
    pm2_5 DECIMAL(10, 2),
    pm10 DECIMAL(10, 2),
    nh3 DECIMAL(10, 2),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

Add to `backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/airyze_aqi
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_KEY=your_api_key_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 4. Update API Base URL (if needed)

If your backend runs on a different port, update `frontend/src/api/*.js` files:

```javascript
// Example: frontend/src/api/aqiService.js
const API_BASE_URL = 'http://localhost:5000';
```

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# or for development
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Getting API Keys

### OpenWeather API Key

1. Visit https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to "API keys" section
4. Copy your API key
5. Add to `backend/.env` as `OPENWEATHER_API_KEY`

### Gmail App Password (for email alerts)

1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account Settings → Security
3. Under "2-Step Verification", click "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Add to `backend/.env` as `EMAIL_PASS`

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format in `.env`
- Ensure database exists and tables are created

### API Key Errors
- Verify OpenWeather API key is valid
- Check API key has "Air Pollution API" access
- Ensure no extra spaces in `.env` file

### Email Not Sending
- Verify Gmail app password is correct
- Check `EMAIL_USER` matches the account
- Ensure 2FA is enabled on Google account

### Frontend Can't Connect to Backend
- Verify backend is running on correct port
- Check CORS settings in `backend/server.js`
- Update API base URL in frontend service files

## Testing the Setup

1. **Test Backend:**
   ```bash
   curl http://localhost:5000/api/aqi?lat=24.8607&lon=67.0011
   ```

2. **Test Frontend:**
   - Open http://localhost:5173
   - Click on the map
   - Verify AQI data appears

3. **Test Database:**
   ```sql
   SELECT * FROM users;
   SELECT * FROM aqi_data LIMIT 5;
   ```

## Next Steps

- Register a user account
- Set up your preferred city for alerts
- Explore the map and city data
- Check email alerts (if configured)

For detailed documentation, see [README.md](./README.md)

