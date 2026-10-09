const Meal = require('../models/Meal');
const { analyzeMealImage } = require('../services/aiService');
const { crossCheckFoods } = require('../services/usdaService');
const { detectAllergens, checkUserAllergenMatch } = require('../services/allergenService');
const { uploadImage } = require('../services/storageService');

// @desc    Analyze uploaded meal image with Vision AI + USDA verification + Allergen detection
// @route   POST /api/meals/analyze
// @access  Private
const analyzeMeal = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file of a meal' });
    }

    // 1. Upload image to Cloudinary or static storage fallback
    const imageUrl = await uploadImage(req.file);

    // 2. Vision AI analysis
    const aiResult = await analyzeMealImage(req.file.path, req.file.mimetype);

    // 3. USDA cross-verification for enhanced accuracy
    const verifiedFoods = await crossCheckFoods(aiResult.foods);

    // Recalculate totals after USDA verification
    const totals = verifiedFoods.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories || 0),
        protein_g: Number((acc.protein_g + (item.protein_g || 0)).toFixed(1)),
        carbs_g: Number((acc.carbs_g + (item.carbs_g || 0)).toFixed(1)),
        fat_g: Number((acc.fat_g + (item.fat_g || 0)).toFixed(1)),
        fiber_g: Number((acc.fiber_g + (item.fiber_g || 0)).toFixed(1)),
        sugar_g: Number((acc.sugar_g + (item.sugar_g || 0)).toFixed(1))
      }),
      { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sugar_g: 0 }
    );

    // 4. Allergen screening
    const detectedAllergens = detectAllergens(verifiedFoods);
    // Combine with AI-suggested allergens
    const combinedAllergens = Array.from(
      new Set([...detectedAllergens, ...(aiResult.allergens || [])])
    );

    // 5. Compare against user's saved allergen profile
    const allergenWarning = checkUserAllergenMatch(
      combinedAllergens,
      req.user.allergens || []
    );

    res.json({
      imageUrl,
      foods: verifiedFoods,
      total: totals,
      allergens: combinedAllergens,
      allergenWarning,
      confidence: 0.88,
      notes: aiResult.notes || 'NutriLens AI analyzed meal photo successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Save confirmed or edited meal to database
// @route   POST /api/meals
// @access  Private
const createMeal = async (req, res, next) => {
  try {
    const { imageUrl, mealType, foods, notes, eatenAt } = req.body;

    const detectedAllergens = detectAllergens(foods);

    const meal = new Meal({
      userId: req.user._id,
      imageUrl,
      mealType: mealType || 'lunch',
      foods,
      allergensDetected: detectedAllergens,
      notes: notes || '',
      eatenAt: eatenAt ? new Date(eatenAt) : new Date()
    });

    // recalculateTotals is handled in pre-save hook
    const savedMeal = await meal.save();

    res.status(201).json(savedMeal);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's logged meals with filtering & pagination
// @route   GET /api/meals
// @access  Private
const getMeals = async (req, res, next) => {
  try {
    const { mealType, from, to, page = 1, limit = 20 } = req.query;

    const query = { userId: req.user._id };

    if (mealType) {
      query.mealType = mealType;
    }

    if (from || to) {
      query.eatenAt = {};
      if (from) query.eatenAt.$gte = new Date(from);
      if (to) query.eatenAt.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [meals, totalCount] = await Promise.all([
      Meal.find(query).sort({ eatenAt: -1 }).skip(skip).limit(Number(limit)),
      Meal.countDocuments(query)
    ]);

    res.json({
      meals,
      page: Number(page),
      pages: Math.ceil(totalCount / Number(limit)),
      totalCount
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get meal by ID
// @route   GET /api/meals/:id
// @access  Private
const getMealById = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal entry not found' });
    }

    res.json(meal);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a logged meal
// @route   PUT /api/meals/:id
// @access  Private
const updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal entry not found' });
    }

    if (req.body.mealType) meal.mealType = req.body.mealType;
    if (req.body.foods) meal.foods = req.body.foods;
    if (req.body.notes !== undefined) meal.notes = req.body.notes;
    if (req.body.eatenAt) meal.eatenAt = new Date(req.body.eatenAt);

    if (req.body.foods) {
      meal.allergensDetected = detectAllergens(req.body.foods);
    }

    const updatedMeal = await meal.save();
    res.json(updatedMeal);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a logged meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal entry not found' });
    }

    res.json({ message: 'Meal entry deleted successfully', id: req.params.id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeMeal,
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal
};
