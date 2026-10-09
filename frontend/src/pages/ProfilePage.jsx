import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/userApi';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { User, Target, ShieldAlert, Save, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';

const BIG_9_ALLERGENS = [
  'milk',
  'eggs',
  'fish',
  'shellfish',
  'tree nuts',
  'peanuts',
  'wheat',
  'soy',
  'sesame'
];

export const ProfilePage = () => {
  const { user, updateUserContext } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [profileData, setProfileData] = useState({
    age: user?.profile?.age || 25,
    weight: user?.profile?.weight || 70,
    height: user?.profile?.height || 175,
    goal: user?.profile?.goal || 'maintain',
    dailyCalorieTarget: user?.profile?.dailyCalorieTarget || 2000
  });

  const [allergens, setAllergens] = useState(user?.allergens || []);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleAllergenToggle = (allergen) => {
    setAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  // Automated BMR & TDEE Calorie Calculator (Mifflin-St Jeor)
  const calculateRecommendedCalories = () => {
    const { age, weight, height, goal } = profileData;
    // BMR estimate
    const bmr = 10 * Number(weight) + 6.25 * Number(height) - 5 * Number(age) + 5;
    // Moderate activity factor 1.375
    let tdee = Math.round(bmr * 1.375);

    if (goal === 'lose') tdee = Math.round(tdee - 500); // 500 kcal deficit
    if (goal === 'gain') tdee = Math.round(tdee + 350); // 350 kcal surplus

    const recommended = Math.max(tdee, 1200);

    setProfileData((prev) => ({
      ...prev,
      dailyCalorieTarget: recommended
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');

    try {
      const updated = await updateProfile({
        name,
        profile: {
          age: Number(profileData.age),
          weight: Number(profileData.weight),
          height: Number(profileData.height),
          goal: profileData.goal,
          dailyCalorieTarget: Number(profileData.dailyCalorieTarget)
        },
        allergens
      });

      updateUserContext(updated);
      setSuccess('Profile settings and allergen watchlist saved successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center space-x-2">
          <User className="w-6 h-6 text-emerald-600" />
          <span>User Profile & Allergen Settings</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your fitness goals, calorie targets, and Big 9 allergen warnings
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-800 flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email Address (Read Only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Goals & Calorie Calculator */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Nutrition Goal & Targets</span>
            </h3>

            <button
              type="button"
              onClick={calculateRecommendedCalories}
              className="flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
              title="Auto-calculate using Mifflin-St Jeor formula"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculate Target</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-gray-500 mb-1">Age</label>
              <input
                type="number"
                min="1"
                max="120"
                value={profileData.age}
                onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Weight (kg)</label>
              <input
                type="number"
                min="20"
                max="300"
                value={profileData.weight}
                onChange={(e) => setProfileData({ ...profileData, weight: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Height (cm)</label>
              <input
                type="number"
                min="50"
                max="250"
                value={profileData.height}
                onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Daily Target (kcal)</label>
              <input
                type="number"
                step="50"
                min="500"
                max="10000"
                value={profileData.dailyCalorieTarget}
                onChange={(e) => setProfileData({ ...profileData, dailyCalorieTarget: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Primary Goal Strategy
            </label>
            <select
              value={profileData.goal}
              onChange={(e) => setProfileData({ ...profileData, goal: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
            >
              <option value="lose">Weight Loss (Caloric Deficit -500 kcal)</option>
              <option value="maintain">Maintain Current Weight (TDEE Equilibrium)</option>
              <option value="gain">Muscle Gain (Clean Surplus +350 kcal)</option>
            </select>
          </div>
        </div>

        {/* Big 9 Allergen Settings */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Big 9 Allergen Watchlist</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              NutriLens will issue explicit high-contrast warning alerts whenever an analyzed meal contains selected items.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BIG_9_ALLERGENS.map((allergen) => {
              const checked = allergens.includes(allergen);
              return (
                <button
                  type="button"
                  key={allergen}
                  onClick={() => handleAllergenToggle(allergen)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold capitalize border transition flex items-center justify-between ${
                    checked
                      ? 'bg-amber-100 border-amber-400 text-amber-900 shadow-xs'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span>{allergen}</span>
                  {checked && <CheckCircle2 className="w-4 h-4 text-amber-700" />}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition transform active:scale-[0.99]"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving Changes...' : 'Save Profile & Settings'}</span>
        </button>
      </form>

      <DisclaimerBanner />
    </div>
  );
};
