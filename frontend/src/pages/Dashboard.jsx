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
import Sidebar from "../components/Sidebar";
import PersonalizedWelcome from "../components/PersonalizedWelcome";
import InstantEmailButton from "../components/InstantEmailButton";
import AlertPreferencesModal from "../components/AlertPreferencesModal";
import AIChatbot from "../components/AIChatbot";
import { getHealthProfile, getAlertPreferences } from "../api/profileService";
import { badgeTracker } from "../utils/badgeTracker";

export default function Dashboard({ user, healthProfile: initialHealthProfile }) {
  const [selected, setSelected] = useState(null); // selected map area data
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [healthProfile, setHealthProfile] = useState(initialHealthProfile);
  const [alertPrefs, setAlertPrefs] = useState(null);
  const [showAlertPrefs, setShowAlertPrefs] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [badgeNotification, setBadgeNotification] = useState(null);

  // Load health profile and alert preferences on mount
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        try {
          // Load health profile if not provided
          if (!healthProfile) {
            const profileData = await getHealthProfile();
            setHealthProfile(profileData.health_profile);
          }

          // Load alert preferences
          const prefsData = await getAlertPreferences();
          setAlertPrefs(prefsData.alert_prefs);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user, healthProfile]);

  // Track AQI check on page load and set up badge unlock callback
  useEffect(() => {
    if (user) {
      // Set up badge unlock callback
      badgeTracker.onBadgeEarned = (badge) => {
        setBadgeNotification({
          badge,
          timestamp: Date.now()
        });
        
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
          setBadgeNotification(null);
        }, 5000);
      };

      // Track AQI check
      badgeTracker.trackAction('aqi_check');

      // Check if user came from email alert tracking link
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('alert_opened') === 'true') {
        badgeTracker.trackAction('alert_opened');
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Cleanup callback on unmount
    return () => {
      if (badgeTracker.onBadgeEarned) {
        badgeTracker.onBadgeEarned = null;
      }
    };
  }, [user]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-x-hidden">

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
          {/* Personalized Welcome Section */}
          {user && healthProfile && (
            <section className="animate-fade-in-up">
              <PersonalizedWelcome 
                user={user} 
                healthProfile={healthProfile} 
                currentAQI={selected} 
              />
            </section>
          )}

          {/* Instant Email and Alert Preferences Section */}
          {user && alertPrefs && (
            <section className="animate-fade-in-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instant Email Button */}
                {alertPrefs.instant_button && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                    <InstantEmailButton user={user} />
                  </div>
                )}

                {/* Alert Preferences Button */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Settings</h3>
                  <button
                    onClick={() => setShowAlertPrefs(true)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Manage Alert Preferences</span>
                  </button>
                </div>
              </div>
            </section>
          )}

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
            <div className="relative rounded-2xl overflow-visible h-[400px] sm:h-[500px] lg:h-[600px] bg-white shadow-2xl border border-gray-200/50 hover:shadow-2xl hover:border-blue-300 transition-all duration-300">
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <MapView onSelect={handleMapClick} />
              </div>
              <button
                onClick={handleAutoDetect}
                className="absolute bottom-4 right-4 z-[500] px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-white transition-all flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600"
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
                <Recommendations data={selected || { aqi: 0 }} healthProfile={healthProfile} />
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
                <DailyAQILineChart lat={coords.lat} lon={coords.lon} />
              </div>

              {/* Category Frequency Chart Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <AQICategoryFrequencyChart lat={coords.lat} lon={coords.lon} />
              </div>
            </div>
          </div>
        </section>
        </main>

        {/* Alert Preferences Modal */}
        <AlertPreferencesModal
          isOpen={showAlertPrefs}
          onClose={() => setShowAlertPrefs(false)}
          user={user}
        />

        {/* AI Chatbot */}
        {showChatbot && (
          <AIChatbot
            currentAQI={selected?.aqi}
            city={user?.city}
            pollutants={selected?.components}
            onClose={() => setShowChatbot(false)}
          />
        )}

        {/* Floating Chat Button */}
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center z-40 group"
          title="Ask AI Assistant"
        >
          <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></span>
        </button>

        {/* Badge Unlock Notification */}
        {badgeNotification && (
          <div className="fixed top-20 right-6 z-50 animate-slide-in-right">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-yellow-400 p-6 max-w-sm">
              <div className="flex items-start gap-4">
                <div className="text-5xl animate-bounce">
                  {badgeNotification.badge.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🎉</span>
                    <h3 className="text-lg font-bold text-gray-800">Badge Unlocked!</h3>
                  </div>
                  <p className="text-xl font-bold text-indigo-600 mb-1">
                    {badgeNotification.badge.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {badgeNotification.badge.description}
                  </p>
                </div>
                <button
                  onClick={() => setBadgeNotification(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
