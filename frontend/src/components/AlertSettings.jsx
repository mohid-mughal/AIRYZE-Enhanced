/**
 * AlertSettings Component
 * 
 * Allows users to configure email alert preferences
 * Requirements: FR-9, FR-10
 */

import { useState, useEffect } from 'react';
import { getAlertPreferences, updateAlertPreferences } from '../api/profileService';

export default function AlertSettings() {
  const [preferences, setPreferences] = useState({
    on_change: true,
    daily_time: '08:00',
    instant_button: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  // Fetch current preferences on mount
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoading(true);
        const response = await getAlertPreferences();
        if (response.alert_prefs) {
          setPreferences(response.alert_prefs);
        }
      } catch (err) {
        console.error('Error fetching alert preferences:', err);
        setError('Failed to load preferences');
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = (field) => {
    setPreferences({ ...preferences, [field]: !preferences[field] });
    setSaved(false);
  };

  const handleTimeChange = (e) => {
    setPreferences({ ...preferences, daily_time: e.target.value });
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await updateAlertPreferences(preferences);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <span>📧</span>
        Email Alert Settings
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Settings saved successfully!
        </div>
      )}

      <div className="space-y-6">
        {/* Change Detection Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <label className="font-semibold text-gray-800 block mb-1">
              AQI Change Alerts
            </label>
            <p className="text-sm text-gray-600">
              Get notified when air quality category changes (checked every 30 minutes)
            </p>
          </div>
          <button
            onClick={() => handleToggle('on_change')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.on_change ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.on_change ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Daily Time Picker */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="font-semibold text-gray-800 block mb-2">
            Daily Report Time
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Receive a daily air quality report at your preferred time
          </p>
          <input
            type="time"
            value={preferences.daily_time}
            onChange={handleTimeChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Instant Button Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <label className="font-semibold text-gray-800 block mb-1">
              Instant Email Button
            </label>
            <p className="text-sm text-gray-600">
              Enable "Send Email Now" button for on-demand reports
            </p>
          </div>
          <button
            onClick={() => handleToggle('instant_button')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.instant_button ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.instant_button ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save Settings
          </>
        )}
      </button>
    </div>
  );
}
