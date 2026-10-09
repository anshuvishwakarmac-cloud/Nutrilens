import React, { useState, useEffect } from 'react';
import { getMeals, deleteMeal, updateMeal } from '../api/mealApi';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import {
  History, Calendar, Filter, Trash2, Edit3, X, Check, Search, AlertCircle, RefreshCw
} from 'lucide-react';

export const HistoryPage = () => {
  const [meals, setMeals] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [mealTypeFilter, setMealTypeFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [editingMeal, setEditingMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (mealTypeFilter) params.mealType = mealTypeFilter;
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;

      const res = await getMeals(params);
      setMeals(res.meals || []);
      setTotalCount(res.totalCount || 0);
      setPages(res.pages || 1);
    } catch (err) {
      console.error('Fetch history error:', err);
      setError('Could not load meal history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, mealTypeFilter, fromDate, toDate]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal entry?')) return;
    try {
      await deleteMeal(id);
      setMeals((prev) => prev.filter((m) => m._id !== id));
      setTotalCount((prev) => prev - 1);
    } catch (err) {
      alert('Failed to delete meal: ' + err.message);
    }
  };

  const handleUpdateNotes = async (id, newNotes) => {
    try {
      const updated = await updateMeal(id, { notes: newNotes });
      setMeals((prev) => prev.map((m) => (m._id === id ? updated : m)));
      setEditingMeal(null);
    } catch (err) {
      alert('Failed to update meal: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 flex items-center space-x-2">
            <History className="w-6 h-6 text-emerald-600" />
            <span>Meal History & Logs</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Browse, filter, and edit all past analyzed meal entries
          </p>
        </div>

        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
          Total Logged: {totalCount} meals
        </span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        {/* Meal Type Filter */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
            Filter by Meal Type
          </label>
          <select
            value={mealTypeFilter}
            onChange={(e) => {
              setMealTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Meal Types</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
            From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
            To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Meals Grid */}
      {loading ? (
        <div className="py-16 text-center text-emerald-600 flex flex-col items-center space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-sm font-medium text-gray-500">Loading history logs...</span>
        </div>
      ) : meals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meals.map((meal) => (
            <div
              key={meal._id}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition space-y-4 p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={meal.imageUrl}
                    alt={meal.mealType}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 text-xs font-bold uppercase tracking-wider bg-black/70 text-white backdrop-blur-md px-2.5 py-1 rounded-full">
                    {meal.mealType}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-400">
                      {new Date(meal.eatenAt).toLocaleDateString()} at{' '}
                      {new Date(meal.eatenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <h3 className="text-xl font-extrabold text-emerald-700 mt-0.5">
                      {meal.totals?.calories || 0} kcal
                    </h3>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingMeal(meal)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title="Edit meal note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(meal._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete meal log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Macro breakdown summary */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-gray-50 p-2.5 rounded-xl">
                  <div>
                    <span className="block font-bold text-gray-800">{meal.totals?.protein_g}g</span>
                    <span className="text-gray-400">Protein</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-800">{meal.totals?.carbs_g}g</span>
                    <span className="text-gray-400">Carbs</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-800">{meal.totals?.fat_g}g</span>
                    <span className="text-gray-400">Fat</span>
                  </div>
                </div>

                {/* Detected food items list */}
                <div className="space-y-1 text-xs">
                  <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Foods Identified:
                  </span>
                  <ul className="list-disc list-inside text-gray-600 space-y-0.5">
                    {meal.foods?.map((f, idx) => (
                      <li key={idx}>
                        {f.name} ({f.estimated_grams}g) - {f.calories} kcal
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Notes */}
                {meal.notes && (
                  <p className="text-xs italic text-gray-500 bg-emerald-50/50 p-2 rounded-lg">
                    "{meal.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400 space-y-2">
          <History className="w-12 h-12 mx-auto text-gray-300" />
          <h3 className="text-base font-semibold text-gray-700">No meal logs found</h3>
          <p className="text-xs text-gray-400">Try adjusting your filters or log a new meal photo.</p>
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-gray-500">
            Page {page} of {pages}
          </span>
          <button
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingMeal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Edit Meal Notes</h3>
              <button onClick={() => setEditingMeal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Notes
              </label>
              <textarea
                rows={3}
                defaultValue={editingMeal.notes}
                id="edit-notes-input"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setEditingMeal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = document.getElementById('edit-notes-input').value;
                  handleUpdateNotes(editingMeal._id, val);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
};
