const axios = require('axios');

const USDA_BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

/**
 * Search USDA FoodData Central for a specific food item
 * @param {string} foodName 
 * @param {number} grams 
 * @returns {Object|null}
 */
const verifyWithUSDA = async (foodName, grams = 100) => {
  const apiKey = process.env.USDA_API_KEY;

  if (!apiKey || apiKey === 'DEMO_KEY' || apiKey === 'your_usda_api_key_here') {
    // If no active key configured, return null to keep original AI values
    return null;
  }

  try {
    const response = await axios.get(`${USDA_BASE_URL}/foods/search`, {
      params: {
        api_key: apiKey,
        query: foodName,
        pageSize: 1,
        dataType: ['Foundation', 'SR Legacy', 'Branded']
      },
      timeout: 4000
    });

    if (
      !response.data ||
      !response.data.foods ||
      response.data.foods.length === 0
    ) {
      return null;
    }

    const food = response.data.foods[0];
    const nutrients = food.foodNutrients || [];

    const getNutrient = (nameOrId) => {
      const match = nutrients.find(
        (n) =>
          n.nutrientName?.toLowerCase().includes(nameOrId.toLowerCase()) ||
          n.nutrientId === nameOrId
      );
      return match ? match.value : 0;
    };

    // USDA standard values are per 100g
    const factor = grams / 100;

    const calories100 = getNutrient('Energy') || getNutrient(1008);
    const protein100 = getNutrient('Protein') || getNutrient(1003);
    const carbs100 = getNutrient('Carbohydrate') || getNutrient(1005);
    const fat100 = getNutrient('Total lipid') || getNutrient(1004);
    const fiber100 = getNutrient('Fiber') || getNutrient(1079);
    const sugar100 = getNutrient('Sugars') || getNutrient(2000);

    return {
      usdaName: food.description,
      calories: Math.round(calories100 * factor),
      protein_g: Number((protein100 * factor).toFixed(1)),
      carbs_g: Number((carbs100 * factor).toFixed(1)),
      fat_g: Number((fat100 * factor).toFixed(1)),
      fiber_g: Number((fiber100 * factor).toFixed(1)),
      sugar_g: Number((sugar100 * factor).toFixed(1)),
      usdaVerified: true
    };
  } catch (error) {
    console.warn(`[USDA API Warning] Search for "${foodName}" failed:`, error.message);
    return null; // Gracefully degrade if USDA API fails or rate limited
  }
};

/**
 * Cross-check array of AI detected food items against USDA database
 * @param {Array} foods 
 * @returns {Array} Updated foods list
 */
const crossCheckFoods = async (foods) => {
  const verifiedFoods = await Promise.all(
    foods.map(async (food) => {
      const usdaResult = await verifyWithUSDA(food.name, food.estimated_grams);
      if (usdaResult) {
        // If USDA returns valid data and differs noticeably, adjust values or merge
        return {
          ...food,
          calories: usdaResult.calories,
          protein_g: usdaResult.protein_g,
          carbs_g: usdaResult.carbs_g,
          fat_g: usdaResult.fat_g,
          fiber_g: usdaResult.fiber_g,
          sugar_g: usdaResult.sugar_g,
          usdaVerified: true
        };
      }
      return {
        ...food,
        usdaVerified: false
      };
    })
  );

  return verifiedFoods;
};

module.exports = {
  verifyWithUSDA,
  crossCheckFoods
};
