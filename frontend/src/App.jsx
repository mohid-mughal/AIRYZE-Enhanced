import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import CrowdSourced from "./pages/CrowdSourced";
import BadgesQuizzes from "./pages/BadgesQuizzes";
import WelcomeScreen from "./pages/WelcomeScreen";
import Onboarding from "./pages/Onboarding";
import { useState, useEffect } from "react";
import { getCurrentUser, logout as logoutUser } from "./api/authService";
import { getHealthProfile } from "./api/profileService";
import AuthModal from "./components/AuthModal";

function App() {
  const [user, setUser] = useState(() => getCurrentUser());
  const [healthProfile, setHealthProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Check authentication and health profile on mount
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        try {
          const profileData = await getHealthProfile();
          setHealthProfile(profileData.health_profile);
        } catch (error) {
          console.error('Error fetching health profile:', error);
        }
      }

      setLoading(false);
    };

    checkAuthAndProfile();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        try {
          const profileData = await getHealthProfile();
          setHealthProfile(profileData.health_profile);
        } catch (error) {
          console.error('Error fetching health profile:', error);
        }
      } else {
        setHealthProfile(null);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    // Dispatch custom event to notify all components
    window.dispatchEvent(new Event('authChange'));
  };

  const handleOnboardingComplete = async () => {
    // Refresh health profile after onboarding
    if (user) {
      try {
        const profileData = await getHealthProfile();
        setHealthProfile(profileData.health_profile);
      } catch (error) {
        console.error('Error fetching health profile:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setHealthProfile(null);
      // Dispatch custom event to notify all components
      window.dispatchEvent(new Event('authChange'));
    } catch (error) {
      console.error('Error during logout:', error);
      // Still clear state even if sync fails
      setUser(null);
      setHealthProfile(null);
      window.dispatchEvent(new Event('authChange'));
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  // Determine which page to show based on auth and profile status
  const getHomePage = () => {
    if (!user) {
      return <WelcomeScreen onAuthSuccess={handleAuthSuccess} />;
    }
    if (!healthProfile) {
      return <Onboarding user={user} onComplete={handleOnboardingComplete} />;
    }
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <Router>
      {/* Routes */}
      <Routes>
        {/* Home route - shows WelcomeScreen, Onboarding, or redirects to Dashboard */}
        <Route path="/" element={getHomePage()} />

        {/* Dashboard route - requires auth and health profile */}
        <Route
          path="/dashboard"
          element={
            user && healthProfile ? (
              <>
                {/* Top Navigation Bar */}
                <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-gray-200/50 sticky top-0 z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Link
                        to="/dashboard"
                        className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        🌬️ AIRYZE AQI MONITOR
                      </Link>
                      <nav className="hidden md:flex items-center gap-4">
                        <Link
                          to="/dashboard"
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/crowd-sourced"
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Crowd Sourced
                        </Link>
                      </nav>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 hidden sm:inline">
                        Welcome, <span className="font-semibold">{user.name}</span>
                      </span>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </header>
                <Dashboard user={user} healthProfile={healthProfile} />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Crowd Sourced route - requires auth */}
        <Route
          path="/crowd-sourced"
          element={
            user ? (
              <>
                {/* Top Navigation Bar */}
                <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-gray-200/50 sticky top-0 z-50">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Link
                        to="/dashboard"
                        className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 transition-all"
                      >
                        🌬️ AIRYZE AQI MONITOR
                      </Link>
                      <nav className="hidden md:flex items-center gap-4">
                        <Link
                          to="/dashboard"
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/crowd-sourced"
                          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Crowd Sourced
                        </Link>
                      </nav>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 hidden sm:inline">
                        Welcome, <span className="font-semibold">{user.name}</span>
                      </span>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </header>
                <CrowdSourced />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Badges & Quizzes route - requires auth and health profile */}
        <Route
          path="/badges"
          element={
            user && healthProfile ? (
              <BadgesQuizzes user={user} healthProfile={healthProfile} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </Router>
  );
}

export default App;
