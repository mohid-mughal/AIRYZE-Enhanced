/**
 * HealthProfileForm Component
 * 
 * Reusable form component for collecting user health profile information
 * Used in onboarding and profile editing
 * Requirements: 2.2
 */

import { useState } from 'react';

const AGE_GROUPS = [
  { value: 'under_12', label: 'Under 12', icon: '👶' },
  { value: '13_18', label: '13-18', icon: '🧒' },
  { value: '19_40', label: '19-40', icon: '👨' },
  { value: '41_60', label: '41-60', icon: '👴' },
  { value: '60_plus', label: '60+', icon: '👵' }
];

const HEALTH_CONDITIONS = [
  { value: 'asthma', label: 'Asthma', icon: '🫁' },
  { value: 'heart_issues', label: 'Heart Issues', icon: '❤️' },
  { value: 'allergies', label: 'Allergies', icon: '🤧' },
  { value: 'pregnant', label: 'Pregnant', icon: '🤰' },
  { value: 'young_children', label: 'Young Children', icon: '👶' },
  { value: 'none', label: 'None', icon: '✅' }
];

const ACTIVITY_LEVELS = [
  { value: 'mostly_indoors', label: 'Mostly Indoors', icon: '🏠' },
  { value: 'light_exercise', label: 'Light Exercise', icon: '🚶' },
  { value: 'running_cycling', label: 'Running/Cycling', icon: '🏃' },
  { value: 'heavy_sports', label: 'Heavy Sports', icon: '⚽' }
];

const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Peshawar',
  'Quetta',
  'Faisalabad',
  'Multan'
];

export default function HealthProfileForm({ initialData = {}, onSubmit, submitLabel = 'Continue' }) {
  const [formData, setFormData] = useState({
    age_group: initialData.age_group || '',
    health_conditions: initialData.health_conditions || [],
    activity_level: initialData.activity_level || '',
    primary_city: initialData.primary_city || ''
  });

  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1 && !formData.age_group) {
      newErrors.age_group = 'Please select your age group';
    }
    if (step === 2 && formData.health_conditions.length === 0) {
      newErrors.health_conditions = 'Please select at least one option';
    }
    if (step === 3 && !formData.activity_level) {
      newErrors.activity_level = 'Please select your activity level';
    }
    if (step === 4 && !formData.primary_city) {
      newErrors.primary_city = 'Please select your primary city';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = () => {
    if (validateStep(4)) {
      onSubmit(formData);
    }
  };

  const handleAgeGroupSelect = (value) => {
    setFormData({ ...formData, age_group: value });
    setErrors({ ...errors, age_group: null });
  };

  const handleHealthConditionToggle = (value) => {
    let newConditions;
    
    if (value === 'none') {
      // If "none" is selected, clear all other conditions
      newConditions = formData.health_conditions.includes('none') ? [] : ['none'];
    } else {
      // Remove "none" if selecting any other condition
      newConditions = formData.health_conditions.filter(c => c !== 'none');
      
      if (newConditions.includes(value)) {
        newConditions = newConditions.filter(c => c !== value);
      } else {
        newConditions = [...newConditions, value];
      }
    }

    setFormData({ ...formData, health_conditions: newConditions });
    setErrors({ ...errors, health_conditions: null });
  };

  const handleActivityLevelSelect = (value) => {
    setFormData({ ...formData, activity_level: value });
    setErrors({ ...errors, activity_level: null });
  };

  const handleCitySelect = (value) => {
    setFormData({ ...formData, primary_city: value });
    setErrors({ ...errors, primary_city: null });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 transition-all ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-gray-600 mt-2">
          Step {currentStep} of 4
        </div>
      </div>

      {/* Step 1: Age Group */}
      {currentStep === 1 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
            What's your age group?
          </h2>
          <p className="text-gray-600 text-center mb-8">
            This helps us provide age-appropriate health recommendations
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {AGE_GROUPS.map((group) => (
              <button
                key={group.value}
                onClick={() => handleAgeGroupSelect(group.value)}
                className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                  formData.age_group === group.value
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{group.icon}</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {group.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {errors.age_group && (
            <p className="text-red-600 text-sm mb-4">{errors.age_group}</p>
          )}
        </div>
      )}

      {/* Step 2: Health Conditions */}
      {currentStep === 2 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
            Do you have any health conditions?
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Select all that apply (you can select multiple)
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {HEALTH_CONDITIONS.map((condition) => (
              <button
                key={condition.value}
                onClick={() => handleHealthConditionToggle(condition.value)}
                className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                  formData.health_conditions.includes(condition.value)
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{condition.icon}</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {condition.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {errors.health_conditions && (
            <p className="text-red-600 text-sm mb-4">{errors.health_conditions}</p>
          )}
        </div>
      )}

      {/* Step 3: Activity Level */}
      {currentStep === 3 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
            What's your activity level?
          </h2>
          <p className="text-gray-600 text-center mb-8">
            This helps us understand your outdoor exposure
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {ACTIVITY_LEVELS.map((level) => (
              <button
                key={level.value}
                onClick={() => handleActivityLevelSelect(level.value)}
                className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                  formData.activity_level === level.value
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{level.icon}</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {level.label}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {errors.activity_level && (
            <p className="text-red-600 text-sm mb-4">{errors.activity_level}</p>
          )}
        </div>
      )}

      {/* Step 4: Primary City */}
      {currentStep === 4 && (
        <div className="animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
            What's your primary city?
          </h2>
          <p className="text-gray-600 text-center mb-8">
            We'll use this to send you personalized air quality alerts
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`p-6 rounded-xl border-2 transition-all text-left hover:shadow-lg ${
                  formData.primary_city === city
                    ? 'border-blue-600 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">🏙️</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {city}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {errors.primary_city && (
            <p className="text-red-600 text-sm mb-4">{errors.primary_city}</p>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-8">
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {currentStep === 4 ? submitLabel : 'Next'}
        </button>
      </div>
    </div>
  );
}
