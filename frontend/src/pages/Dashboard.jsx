// ./pages/Dashboard.jsx
import { useState, useEffect } from "react";
import MapView from "../components/MapView";
import AQIInfo from "../components/aqiInfo";
import CityAQIGrid from "../components/cityAQIGrid";
import AQIMeaningCards from "../components/AQIMeaningCards";
import Recommendations from "../components/Recommendations";
import { fetchAQI } from "../api/aqiService";
import DailyAQILineChart from "../components/DailyAQILineChart";
import AQICategoryFrequencyChart from "../components/FrequencyChart";
import AuthModal from "../components/AuthModal";
import { getCurrentUser, logout as logoutUser } from "../api/authService";

export default function Dashboard() {
  const [selected, setSelected] = useState(null); // selected map area data
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check for logged in user on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  // Map click handler (MapView calls this)
  const handleMapClick = async (lat, lon, data) => {
    setCoords({ lat, lon });
    // The MapView already attempted the fetch; but in case parent wants to fetch:
    if (!data) {
      const res = await fetchAQI(lat, lon);
      setSelected(res);
      return;
    }
    setSelected(data);
  };

  // Auto-detect location
  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        const res = await fetchAQI(latitude, longitude);
        setSelected(res);
      },
      (error) => {
        alert("Unable to retrieve your location. Please allow location access.");
        console.error("Geolocation error:", error);
      }
    );
  };

  // Auth handlers
  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900">
      {/* Top title bar */}
      <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🌬️ AIRYZE AQI MONITOR
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Welcome, <span className="font-semibold">{user.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Login / Sign Up
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/background.jpg')",
        }}
      >
        <div className="backdrop-blur-[2px] bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
              <div className="col-span-1 lg:col-span-2 text-white animate-fade-in">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg mb-6">
                  Breathe Cleaner,{" "}
                  <span className="text-blue-200">Live Healthier</span>
                </h1>
                <p className="text-lg sm:text-xl text-white/95 max-w-2xl leading-relaxed">
                  Real-time air quality monitoring to help you make safer outdoor
                  decisions. Click a location on the map below to view detailed
                  pollutant levels and advice.
                </p>
              </div>

              <div className="flex justify-center lg:justify-end animate-slide-in-right">
                {/* AQI Meaning Cards */}
                <AQIMeaningCards />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 sm:space-y-16">
        {/* Real-Time AQI Section */}
        <section className="animate-fade-in-up">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></span>
              Real-Time Air Quality Monitoring
            </h2>
            <p className="text-gray-600 text-sm sm:text-base ml-4">
              Interactive map showing current air quality across regions
            </p>
          </div>

          {/* Map displayed horizontally (full width) */}
          <div className="w-full mb-8">
            <div className="relative rounded-2xl overflow-hidden h-[400px] sm:h-[500px] lg:h-[600px] bg-white shadow-2xl border border-gray-200/50 hover:shadow-2xl hover:border-blue-300 transition-all duration-300">
              <MapView onSelect={handleMapClick} />
              <button
                onClick={handleAutoDetect}
                className="absolute top-4 right-4 z-[1000] px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Use My Location
              </button>
            </div>
          </div>

          {/* Under the map: Selected Area & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Selected Area AQI Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                  Current Air Quality
                </h3>
              </div>
              <div className="mt-4">
                {selected ? (
                  <AQIInfo data={selected} />
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-medium">Click on the map to view AQI details</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Recommendations Card */}
            <div className="space-y-6 animate-fade-in">
              {/* Coordinates Display Card */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Selected Location
                  </h3>
                </div>

                {coords.lat && coords.lon ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide min-w-[80px]">
                        Latitude:
                      </span>
                      <span className="text-sm font-mono font-semibold text-gray-800">
                        {coords.lat.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide min-w-[80px]">
                        Longitude:
                      </span>
                      <span className="text-sm font-mono font-semibold text-gray-800">
                        {coords.lon.toFixed(4)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                    Click on the map to select a location
                  </div>
                )}
              </div>

              {/* Recommendations Card */}
              <div className="animate-fade-in-up">
                <Recommendations data={selected || { aqi: 0 }} />
              </div>
            </div>
          </div>
        </section>

        {/* Cities & Analytics Section */}
        <section className="animate-fade-in-up">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <span className="w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
              City Analytics & Trends
            </h2>
            <p className="text-gray-600 text-sm sm:text-base ml-4">
              Comprehensive air quality data for major cities
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* LEFT COLUMN — Major Cities */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    Major Cities
                  </h2>
                </div>
                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search cities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="mt-4">
                  <CityAQIGrid searchQuery={searchQuery} />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Two charts stacked */}
            <div className="lg:col-span-2 flex flex-col gap-6 sm:gap-8">
              {/* Line Chart Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <DailyAQILineChart />
              </div>

              {/* Category Frequency Chart Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <AQICategoryFrequencyChart />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
