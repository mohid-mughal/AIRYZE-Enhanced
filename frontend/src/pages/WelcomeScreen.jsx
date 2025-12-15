/**
 * WelcomeScreen Component
 * 
 * Landing page for non-authenticated users
 * Shows hero section and triggers authentication modal
 * Requirements: 1.1, 1.2
 */

import { useState } from 'react';
import AuthModal from '../components/AuthModal';

function WelcomeScreen({ onAuthSuccess }) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center bg-no-repeat min-h-screen flex items-center"
        style={{
          backgroundImage: "url('/images/background.jpg')",
        }}
      >
        <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-r from-blue-900/70 via-indigo-900/70 to-purple-900/70"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
          <div className="text-center text-white animate-fade-in">
            {/* Main Heading */}
            <div className="mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight drop-shadow-2xl mb-4 sm:mb-6">
                🌬️ Breathe Cleaner,{" "}
                <span className="text-blue-200">Live Healthier</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed mb-8 sm:mb-10 px-4">
                Real-time air quality monitoring to help you make safer outdoor
                decisions. Get personalized health recommendations based on your profile.
              </p>
              
              {/* CTA Button */}
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold text-lg sm:text-xl px-8 sm:px-12 py-3 sm:py-4 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-green-500/50 inline-flex items-center gap-3"
              >
                <span>Get Started – Check Your Air Today</span>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto mt-12 sm:mt-16 px-4">
              {/* Feature 1 */}
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl mb-3">🗺️</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">Interactive Map</h3>
                <p className="text-white/90 text-sm">
                  Click anywhere to get real-time AQI data with auto-location detection
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl mb-3">📊</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">Historical Analytics</h3>
                <p className="text-white/90 text-sm">
                  Track 30-day AQI trends with detailed charts and frequency analysis
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl mb-3">📧</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">Personalized Alerts</h3>
                <p className="text-white/90 text-sm">
                  Get customized email alerts based on your health profile and preferences
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl sm:text-5xl mb-3">💡</div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">Health Recommendations</h3>
                <p className="text-white/90 text-sm">
                  Receive AI-powered advice tailored to your age, conditions, and activity level
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-12 sm:mt-16 text-white/80 text-sm sm:text-base space-y-2 px-4">
              <p className="font-medium">Monitor air quality across Pakistan and worldwide</p>
              <p>Track PM2.5, PM10, O3, NO2, SO2, CO and more pollutants</p>
              <p className="text-xs sm:text-sm mt-4 text-white/60">
                Join thousands of users making informed decisions about their health
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={onAuthSuccess}
      />
    </div>
  );
}

export default WelcomeScreen;
