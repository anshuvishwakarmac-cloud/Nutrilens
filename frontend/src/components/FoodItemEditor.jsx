import React, { useState } from 'react';
import { Trash2, Plus, CheckCircle2, RefreshCw } from 'lucide-react';

export const FoodItemEditor = ({ initialFoods, onFoodsChange }) => {
  const [foods, setFoods] = useState(initialFoods || []);

  const updateFoodField = (index, field, value) => {
    const updated = [...foods];
    const item = { ...updated[index] };

    if (field === 'name') {
      item.name = value;
    } else if (field === 'estimated_grams') {
      const oldGrams = item.estimated_grams || 100;
      const newGrams = Math.max(Number(value) || 1, 1);
      const ratio = newGrams / oldGrams;

      item.estimated_grams = newGrams;
      item.calories = Math.round((item.calories || 0) * ratio);
      item.protein_g = Number(((item.protein_g || 0) * ratio).toFixed(1));
      item.carbs_g = Number(((item.carbs_g || 0) * ratio).toFixed(1));
      item.fat_g = Number(((item.fat_g || 0) * ratio).toFixed(1));
      item.fiber_g = Number(((item.fiber_g || 0) * ratio).toFixed(1));
      item.sugar_g = Number(((item.sugar_g || 0) * ratio).toFixed(1));
    } else {
      item[field] = Number(value) || 0;
    }

    updated[index] = item;
    setFoods(updated);
    onFoodsChange(updated);
  };

  const removeFood = (index) => {
    const updated = foods.filter((_, i) => i !== index);
    setFoods(updated);
    onFoodsChange(updated);
  };

  const addFoodItem = () => {
    const newItem = {
      name: 'Custom Food Item',
      estimated_grams: 100,
      calories: 150,
      protein_g: 10,
      carbs_g: 15,
      fat_g: 5,
      fiber_g: 2,
      sugar_g: 1,
      confidence: 1.0,
      usdaVerified: false
    };
    const updated = [...foods, newItem];
    setFoods(updated);
    onFoodsChange(updated);
  };

  // Compute live totals
  const totals = foods.reduce(
    (acc, f) => ({
      calories: acc.calories + (Number(f.calories) || 0),
      protein_g: Number((acc.protein_g + (Number(f.protein_g) || 0)).toFixed(1)),
      carbs_g: Number((acc.carbs_g + (Number(f.carbs_g) || 0)).toFixed(1)),
      fat_g: Number((acc.fat_g + (Number(f.fat_g) || 0)).toFixed(1)),
      fiber_g: Number((acc.fiber_g + (Number(f.fiber_g) || 0)).toFixed(1)),
      sugar_g: Number((acc.sugar_g + (Number(f.sugar_g) || 0)).toFixed(1))
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0 }
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Detected Foods & Portions</h3>
          <p className="text-xs text-gray-500">
            AI can make mistakes. Adjust gram portions or edit items before logging.
          </p>
        </div>
        <button
          onClick={addFoodItem}
          className="flex items-center space-x-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Food items list */}
      <div className="space-y-4">
        {foods.map((food, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 space-y-3 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={food.name}
                  onChange={(e) => updateFoodField(idx, 'name', e.target.value)}
                  className="w-full text-base font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-emerald-500 focus:outline-none px-1 py-0.5"
                  placeholder="Food item name"
                />
              </div>

              {food.usdaVerified && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full flex items-center space-x-1 border border-blue-200">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  <span>USDA Verified</span>
                </span>
              )}

              <button
                onClick={() => removeFood(idx)}
                className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Micro grid inputs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              <div>
                <label className="block text-gray-400 font-medium mb-1">Grams</label>
                <input
                  type="number"
                  min="1"
                  value={food.estimated_grams}
                  onChange={(e) => updateFoodField(idx, 'estimated_grams', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Calories</label>
                <input
                  type="number"
                  min="0"
                  value={food.calories}
                  onChange={(e) => updateFoodField(idx, 'calories', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Protein (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={food.protein_g}
                  onChange={(e) => updateFoodField(idx, 'protein_g', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 font-medium text-gray-700"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Carbs (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={food.carbs_g}
                  onChange={(e) => updateFoodField(idx, 'carbs_g', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 font-medium text-gray-700"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Fat (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={food.fat_g}
                  onChange={(e) => updateFoodField(idx, 'fat_g', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 font-medium text-gray-700"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-medium mb-1">Fiber (g)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={food.fiber_g}
                  onChange={(e) => updateFoodField(idx, 'fiber_g', e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded px-2 py-1 font-medium text-gray-700"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recalculated Meal Summary */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4">
        <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
          Recalculated Meal Totals
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
          <div className="bg-white rounded-lg p-2 shadow-xs">
            <span className="block text-xs text-gray-500 font-medium">Calories</span>
            <span className="text-base font-bold text-emerald-700">{totals.calories} kcal</span>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-xs">
            <span className="block text-xs text-gray-500 font-medium">Protein</span>
            <span className="text-sm font-bold text-gray-800">{totals.protein_g}g</span>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-xs">
            <span className="block text-xs text-gray-500 font-medium">Carbs</span>
            <span className="text-sm font-bold text-gray-800">{totals.carbs_g}g</span>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-xs">
            <span className="block text-xs text-gray-500 font-medium">Fat</span>
            <span className="text-sm font-bold text-gray-800">{totals.fat_g}g</span>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-xs">
            <span className="block text-xs text-gray-500 font-medium">Fiber</span>
            <span className="text-sm font-bold text-gray-800">{totals.fiber_g}g</span>
          </div>

          <div className="bg-white rounded-lg p-2 shadow-xs">
            <span className="block text-xs text-gray-500 font-medium">Sugar</span>
            <span className="text-sm font-bold text-gray-800">{totals.sugar_g}g</span>
          </div>
        </div>
      </div>
    </div>
  );
};
