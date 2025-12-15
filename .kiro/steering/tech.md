# Technology Stack

## Frontend

- **React 19.2.0** - UI framework
- **Vite** (rolldown-vite@7.2.5) - Build tool and dev server with React Compiler enabled
- **Tailwind CSS 4.1.17** - Utility-first styling
- **React Leaflet** - Interactive maps (OpenStreetMap tiles)
- **Chart.js** with react-chartjs-2 - Data visualization
- **Axios** - HTTP client for API calls

### Frontend Build System

Vite is configured with:
- React plugin with Babel React Compiler enabled
- ESLint for code quality
- PostCSS with Tailwind CSS

## Backend

- **Node.js** - Runtime environment
- **Express 5.1.0** - Web framework
- **PostgreSQL** - Relational database
- **bcryptjs** - Password hashing
- **node-cron** - Scheduled tasks (alerts)
- **nodemailer** - Email service
- **dotenv** - Environment variable management

## External APIs

- **OpenWeather API** - Real-time air quality data
- **Open-Meteo API** - Historical air quality data

## Common Commands

### Frontend

```bash
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend

```bash
cd backend
npm install          # Install dependencies
npm start            # Start server (http://localhost:5000)
npm run dev          # Start with nodemon (development)
```

### Database Setup

PostgreSQL tables required:
- `users` - User accounts with email, password (hashed), city, last_aqi
- `aqi_data` - Historical AQI measurements with location, pollutants, timestamp

## Environment Variables

Backend requires `.env` file with:
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection string
- `OPENWEATHER_API_KEY` / `OPENWEATHER_KEY` - API key for OpenWeather
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM` - Email service config

## CORS Configuration

Backend accepts requests from:
- http://localhost:5173 (Vite dev)
- http://localhost:3000 (alternative React port)

Update CORS settings in `backend/server.js` for production.
