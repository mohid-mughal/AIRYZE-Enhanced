/**
 * Onboarding Page
 * 
 * Collects health profile information from new users
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HealthProfileForm from '../components/HealthProfileForm';
import { updateHealthProfile } from '../api/profileService';

export default function Onboarding({ user, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);

    try {
      // Submit health profile to backend
      await updateHealthProfile(formData);

      // Notify parent component that onboarding is complete
      if (onComplete) {
        await onComplete();
      }

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Error saving health profile:', err);
      setError(err.message || 'Failed to save your profile. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              🌬️ AIRYZE AQI MONITOR
            </h1>
            {user && (
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user.name}</span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Let's personalize your experience
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Answer a few quick questions so we can provide you with personalized air quality recommendations and health advice.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 sm:p-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Saving your profile...</p>
              </div>
            ) : (
              <HealthProfileForm
                onSubmit={handleSubmit}
                submitLabel="Complete Setup"
              />
            )}
          </div>

          {/* Privacy Note */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              🔒 Your health information is private and secure. We use it only to provide personalized recommendations.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
