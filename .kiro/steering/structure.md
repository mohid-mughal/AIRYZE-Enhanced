# Project Structure

## Root Layout

```
Airyze AQI/
├── backend/          # Node.js/Express API server
├── frontend/         # React/Vite application
├── node_modules/     # Root dependencies (Tailwind PostCSS)
├── package.json      # Root package config
├── README.md         # Main documentation
├── API.md            # API endpoint documentation
├── SETUP.md          # Setup instructions
└── Roadmap.txt       # Future features
```

## Backend Structure

```
backend/
├── controllers/      # Request handlers (business logic)
│   ├── aqiController.js
│   ├── authControllers.js
│   ├── historyController.js
│   └── majorCitiesController.js
├── data/             # Static data files
│   └── cities.js     # Major cities coordinates
├── jobs/             # Scheduled tasks
│   └── aqiAlerts.js  # Cron jobs for email alerts
├── routes/           # Express route definitions
│   ├── aqiRoutes.js
│   ├── authRoutes.js
│   ├── historyRoutes.js
│   └── majorCitiesRoutes.js
├── services/         # Business logic & external APIs
│   ├── alertService.js
│   ├── aqiHelper.js
│   ├── cityCoords.js
│   ├── email.js
│   ├── fetchAQI.js
│   └── openweatherService.js
├── db.js             # PostgreSQL connection
├── server.js         # Express app entry point
└── package.json
```

## Frontend Structure

```
frontend/
├── src/
│   ├── api/          # API service layer
│   │   ├── aqiService.js      # AQI data fetching
│   │   ├── authService.js     # User auth
│   │   └── historyService.js  # Historical data
│   ├── components/   # React components
│   │   ├── aqiInfo.jsx            # Current AQI display
│   │   ├── AQIMeaningCards.jsx   # AQI level explanations
│   │   ├── AuthModal.jsx          # Login/signup modal
│   │   ├── cityAQIGrid.jsx        # Major cities grid
│   │   ├── DailyAQILineChart.jsx  # 30-day trend chart
│   │   ├── FrequencyChart.jsx     # AQI category frequency
│   │   ├── MapView.jsx            # Interactive Leaflet map
│   │   └── Recommendations.jsx    # Health advice
│   ├── pages/        # Page-level components
│   │   └── Dashboard.jsx  # Main application page
│   ├── utils/        # Utility functions
│   │   └── aqiLevels.js   # AQI color/status helpers
│   ├── App.jsx       # Root component
│   ├── main.jsx      # React entry point
│   ├── App.css       # Component styles
│   └── index.css     # Global styles (Tailwind)
├── images/           # Static assets
│   ├── background.jpg
│   ├── favicon.ico
│   └── logo.png
├── public/           # Public assets
├── index.html        # HTML entry point
├── vite.config.js    # Vite configuration
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
└── package.json
```

## Architecture Patterns

### Backend

- **MVC-style**: Controllers handle requests, services contain business logic
- **Route separation**: Each feature has its own route file
- **Service layer**: External API calls and complex logic isolated in services
- **Scheduled jobs**: Cron jobs run independently in `jobs/` directory

### Frontend

- **Component-based**: Reusable React components in `components/`
- **Service layer**: API calls abstracted in `api/` directory
- **Single page**: Dashboard.jsx orchestrates all components
- **Utility functions**: Shared helpers in `utils/`

### Data Flow

1. User interaction → Component
2. Component → API service (`src/api/`)
3. API service → Backend endpoint
4. Backend controller → Service layer
5. Service → External API or Database
6. Response flows back through the chain

## File Naming Conventions

- **Backend**: camelCase for files (e.g., `aqiController.js`)
- **Frontend components**: PascalCase for React components (e.g., `MapView.jsx`)
- **Frontend services**: camelCase for service files (e.g., `aqiService.js`)
- **Config files**: lowercase with dots (e.g., `vite.config.js`)

## Key Entry Points

- **Backend**: `backend/server.js` - Express server initialization
- **Frontend**: `frontend/src/main.jsx` - React app initialization
- **Frontend root**: `frontend/src/App.jsx` - Renders Dashboard
- **Main page**: `frontend/src/pages/Dashboard.jsx` - Application logic
