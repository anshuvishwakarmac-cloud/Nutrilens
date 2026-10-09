const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    estimated_grams: { type: Number, required: true, default: 100 },
    calories: { type: Number, required: true, default: 0 },
    protein_g: { type: Number, required: true, default: 0 },
    carbs_g: { type: Number, required: true, default: 0 },
    fat_g: { type: Number, required: true, default: 0 },
    fiber_g: { type: Number, required: true, default: 0 },
    sugar_g: { type: Number, required: true, default: 0 },
    confidence: { type: Number, default: 0.85 },
    usdaVerified: { type: Boolean, default: false }
  },
  { _id: true }
);

const mealSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack'],
      default: 'lunch',
      required: true
    },
    foods: [foodItemSchema],
    totals: {
      calories: { type: Number, required: true, default: 0 },
      protein_g: { type: Number, required: true, default: 0 },
      carbs_g: { type: Number, required: true, default: 0 },
      fat_g: { type: Number, required: true, default: 0 },
      fiber_g: { type: Number, required: true, default: 0 },
      sugar_g: { type: Number, required: true, default: 0 }
    },
    allergensDetected: [
      {
        type: String,
        lowercase: true,
        trim: true
      }
    ],
    aiConfidence: {
      type: Number,
      default: 0.85
    },
    notes: {
      type: String,
      default: ''
    },
    eatenAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Helper method to automatically calculate totals from food items array
mealSchema.methods.recalculateTotals = function () {
  const totals = {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0,
    sugar_g: 0
  };

  this.foods.forEach((food) => {
    totals.calories += food.calories || 0;
    totals.protein_g += food.protein_g || 0;
    totals.carbs_g += food.carbs_g || 0;
    totals.fat_g += food.fat_g || 0;
    totals.fiber_g += food.fiber_g || 0;
    totals.sugar_g += food.sugar_g || 0;
  });

  // Round values cleanly
  this.totals = {
    calories: Math.round(totals.calories),
    protein_g: Number(totals.protein_g.toFixed(1)),
    carbs_g: Number(totals.carbs_g.toFixed(1)),
    fat_g: Number(totals.fat_g.toFixed(1)),
    fiber_g: Number(totals.fiber_g.toFixed(1)),
    sugar_g: Number(totals.sugar_g.toFixed(1))
  };

  return this.totals;
};

// Pre-save hook to ensure totals match food items
mealSchema.pre('save', function (next) {
  if (this.foods && this.foods.length > 0) {
    this.recalculateTotals();
  }
  next();
});

const Meal = mongoose.model('Meal', mealSchema);
module.exports = Meal;
