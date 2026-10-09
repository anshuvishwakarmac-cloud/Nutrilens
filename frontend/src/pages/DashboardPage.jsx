import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getWeeklyTrends } from '../api/trendApi';
import { getMeals } from '../api/mealApi';
import { useAuth } from '../context/AuthContext';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Flame, TrendingUp, TrendingDown, Target, Calendar, Camera, ChevronRight, Award, AlertCircle, RefreshCw
} from 'lucide-react';

const MACRO_COLORS = ['#10b981', '#3b82f6', '#f59e0b']; // Protein, Carbs, Fat

export const DashboardPage = () => {
  const { user } = useAuth();
  const [trends, setTrends] = useState(null);
  const [recentMeals, setRecentMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [trendRes, mealRes] = await Promise.all([
          getWeeklyTrends(4),
          getMeals({ page: 1, limit: 5 })
        ]);

        setTrends(trendRes);
        setRecentMeals(mealRes.meals || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Could not load nutrition analytics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3 text-emerald-600">
        <RefreshCw className="w-10 h-10 animate-spin" />
        <p className="text-sm font-medium text-gray-600">Loading weekly nutrition trends...</p>
      </div>
    );
  }

  const dailyGoal = user?.profile?.dailyCalorieTarget || 2000;
  const currentWeek = trends?.weeks?.length > 0 ? trends.weeks[trends.weeks.length - 1] : null;
  const avgCalories = currentWeek ? currentWeek.avgDailyCalories : 0;
  const wowChange = trends?.wowChangePercent || 0;

  // Chart data formatting
  const weeklyChartData = (trends?.weeks || []).map((w) => ({
    name: `Week ${w.weekNumber}`,
    AvgCalories: w.avgDailyCalories,
    Target: dailyGoal
  }));

  const macroTotals = currentWeek?.macroTotals || { protein_g: 0, carbs_g: 0, fat_g: 0 };
  const macroPieData = [
    { name: 'Protein (g)', value: macroTotals.protein_g },
    { name: 'Carbs (g)', value: macroTotals.carbs_g },
    { name: 'Fat (g)', value: macroTotals.fat_g }
  ].filter((item) => item.value > 0);

  const totalMacroGrams = macroTotals.protein_g + macroTotals.carbs_g + macroTotals.fat_g || 1;
  const proteinPct = Math.round((macroTotals.protein_g / totalMacroGrams) * 100);
  const carbsPct = Math.round((macroTotals.carbs_g / totalMacroGrams) * 100);
  const fatPct = Math.round((macroTotals.fat_g / totalMacroGrams) * 100);

  const goalProgress = Math.min(Math.round((avgCalories / dailyGoal) * 100), 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="inline-block text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-2">
            Weekly Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            You're averaging <strong className="text-white font-bold">{avgCalories} kcal/day</strong> this week against your target of <strong className="text-white font-bold">{dailyGoal} kcal</strong>.
          </p>
        </div>

        <Link
          to="/analyze"
          className="bg-white text-emerald-700 hover:bg-emerald-50 px-6 py-3.5 rounded-2xl font-bold shadow-lg flex items-center space-x-2 transition transform active:scale-95 shrink-0"
        >
          <Camera className="w-5 h-5 text-emerald-600" />
          <span>Analyze Meal Photo</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Avg Calories */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>Avg Daily Intake</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-gray-900">{avgCalories}</span>
            <span className="text-sm font-semibold text-gray-400">kcal / day</span>
          </div>
          <p className="text-xs text-gray-500">Goal: {dailyGoal} kcal</p>
        </div>

        {/* Goal Adherence */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>Goal Adherence</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-gray-900">{goalProgress}%</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>

        {/* Week over Week Change */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>WoW Change</span>
            <div className={`p-2 rounded-xl ${wowChange <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
              {wowChange <= 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-gray-900">
              {wowChange > 0 ? `+${wowChange}%` : `${wowChange}%`}
            </span>
          </div>
          <p className="text-xs text-gray-500">vs previous week average</p>
        </div>

        {/* Recorded Meals Count */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>Meals Logged</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-gray-900">
              {trends?.totalRecordedMeals || 0}
            </span>
            <span className="text-sm font-semibold text-gray-400">total</span>
          </div>
          <p className="text-xs text-gray-500">Across active tracking weeks</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Calorie Trends Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Weekly Calorie Trends</h3>
              <p className="text-xs text-gray-500">Average daily calories vs target over last 4 weeks</p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>

          <div className="h-72 w-full pt-4">
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', border: 'none' }}
                  />
                  <Legend />
                  <Bar dataKey="AvgCalories" fill="#10b981" radius={[8, 8, 0, 0]} name="Avg Daily Cal" />
                  <Bar dataKey="Target" fill="#e2e8f0" radius={[8, 8, 0, 0]} name="Daily Target" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No weekly data logged yet. Snap your first meal to populate trends!
              </div>
            )}
          </div>
        </div>

        {/* Macro Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Macro Split</h3>
            <p className="text-xs text-gray-500">Protein, Carbs, & Fat ratio for current week</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {macroPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={macroPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {macroPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MACRO_COLORS[index % MACRO_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-gray-400">Log meals to view macro split</div>
            )}
          </div>

          {/* Macro legend breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-gray-100 pt-3">
            <div>
              <span className="block text-emerald-600 font-bold">{macroTotals.protein_g}g ({proteinPct || 0}%)</span>
              <span className="text-gray-400">Protein</span>
            </div>
            <div>
              <span className="block text-blue-600 font-bold">{macroTotals.carbs_g}g ({carbsPct || 0}%)</span>
              <span className="text-gray-400">Carbs</span>
            </div>
            <div>
              <span className="block text-amber-600 font-bold">{macroTotals.fat_g}g ({fatPct || 0}%)</span>
              <span className="text-gray-400">Fat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Meals List */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Recent Meal Logs</h3>
            <p className="text-xs text-gray-500">Your latest AI meal entries</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentMeals.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentMeals.map((meal) => (
              <div key={meal._id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={meal.imageUrl}
                    alt={meal.mealType}
                    className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 capitalize">
                      {meal.mealType} ({meal.foods?.length || 0} items)
                    </h4>
                    <p className="text-xs text-gray-400">
                      {new Date(meal.eatenAt).toLocaleDateString()} at{' '}
                      {new Date(meal.eatenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-sm font-bold text-emerald-600">
                    {meal.totals?.calories || 0} kcal
                  </span>
                  <span className="text-xs text-gray-400">
                    P: {meal.totals?.protein_g}g | C: {meal.totals?.carbs_g}g | F: {meal.totals?.fat_g}g
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-sm text-gray-400">
            No meals logged yet today. Snap a photo of your meal to get started!
          </div>
        )}
      </div>

      <DisclaimerBanner />
    </div>
  );
};
