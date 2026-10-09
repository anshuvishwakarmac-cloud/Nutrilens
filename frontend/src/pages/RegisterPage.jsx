import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, Mail, Lock, User, Target, ShieldAlert, ArrowRight, AlertCircle } from 'lucide-react';

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

export const RegisterPage = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: 25,
    weight: 70,
    height: 175,
    goal: 'maintain',
    dailyCalorieTarget: 2000,
    allergens: []
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAllergenToggle = (allergen) => {
    setFormData((prev) => {
      const exists = prev.allergens.includes(allergen);
      return {
        ...prev,
        allergens: exists
          ? prev.allergens.filter((a) => a !== allergen)
          : [...prev.allergens, allergen]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profile: {
          age: Number(formData.age),
          weight: Number(formData.weight),
          height: Number(formData.height),
          goal: formData.goal,
          dailyCalorieTarget: Number(formData.dailyCalorieTarget)
        },
        allergens: formData.allergens
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md mb-2">
            <Camera className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900">Create NutriLens Account</h2>
          <p className="text-sm text-gray-500 mt-1">Setup your profile and allergen warnings</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Alex Morgan"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="alex@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="At least 6 characters"
            />
          </div>

          {/* Profile Metrics Grid */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-1">
              <Target className="w-4 h-4 text-emerald-600" />
              <span>Nutrition Targets & Profile</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-gray-500 mb-1">Age</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="20"
                  max="300"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="50"
                  max="250"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-gray-500 mb-1">Daily Target (kcal)</label>
                <input
                  type="number"
                  step="50"
                  min="500"
                  max="10000"
                  value={formData.dailyCalorieTarget}
                  onChange={(e) => setFormData({ ...formData, dailyCalorieTarget: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Primary Goal</label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm"
              >
                <option value="lose">Weight Loss (Caloric Deficit)</option>
                <option value="maintain">Maintain Current Weight</option>
                <option value="gain">Muscle Gain / Weight Surplus</option>
              </select>
            </div>
          </div>

          {/* Big 9 Allergen Checklist */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center space-x-1">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>Big 9 Allergen Profile (Select to enable warnings)</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {BIG_9_ALLERGENS.map((allergen) => {
                const checked = formData.allergens.includes(allergen);
                return (
                  <button
                    type="button"
                    key={allergen}
                    onClick={() => handleAllergenToggle(allergen)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
                      checked
                        ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold shadow-xs'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {allergen}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition transform active:scale-[0.99]"
          >
            <span>{loading ? 'Creating account...' : 'Create Account & Start'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="text-center text-sm text-gray-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-emerald-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
