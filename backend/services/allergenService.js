const { BIG_9_ALLERGENS } = require('../models/User');

// Keywords mapping for Big 9 allergen identification
const ALLERGEN_KEYWORDS = {
  milk: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'ghee', 'dairy', 'paneer', 'casein', 'latte', 'cappuccino'],
  eggs: ['egg', 'eggs', 'mayonnaise', 'mayo', 'meringue', 'aioli', 'custard', 'omelet', 'scrambled'],
  fish: ['fish', 'salmon', 'tuna', 'cod', 'trout', 'tilapia', 'bass', 'anchovy', 'sardine', 'halibut'],
  shellfish: ['shrimp', 'crab', 'lobster', 'prawn', 'mussel', 'oyster', 'clam', 'squid', 'calamari', 'scallop'],
  'tree nuts': ['almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'hazelnut', 'chestnut', 'pesto'],
  peanuts: ['peanut', 'peanuts', 'peanut butter', 'groundnut'],
  wheat: ['wheat', 'bread', 'pasta', 'noodle', 'flour', 'roti', 'naan', 'bun', 'toast', 'gluten', 'pita', 'bagel', 'couscous'],
  soy: ['soy', 'soya', 'tofu', 'edamame', 'soy sauce', 'tempeh', 'miso'],
  sesame: ['sesame', 'tahini', 'hummus', 'sesame oil', 'sesame seed']
};

/**
 * Detect potential allergens present in a list of food items
 * @param {Array} foods - List of food item objects or names
 * @returns {Array} - List of detected Big 9 allergen strings
 */
const detectAllergens = (foods) => {
  const detected = new Set();

  foods.forEach((food) => {
    const foodName = typeof food === 'string' ? food.toLowerCase() : food.name.toLowerCase();

    Object.entries(ALLERGEN_KEYWORDS).forEach(([allergen, keywords]) => {
      keywords.forEach((keyword) => {
        if (foodName.includes(keyword)) {
          detected.add(allergen);
        }
      });
    });
  });

  return Array.from(detected);
};

/**
 * Compare detected meal allergens against user's saved allergen profile
 * @param {Array} detectedAllergens - List of allergens in meal
 * @param {Array} userAllergens - User's allergen watchlist
 * @returns {Object} - Warning breakdown { hasMatch, matchingAllergens, warnings }
 */
const checkUserAllergenMatch = (detectedAllergens, userAllergens = []) => {
  const userSet = new Set(userAllergens.map((a) => a.toLowerCase()));
  const matches = detectedAllergens.filter((a) => userSet.has(a.toLowerCase()));

  return {
    hasMatch: matches.length > 0,
    matchingAllergens: matches,
    warnings: matches.map((allergen) => `WARNING: This meal contains ${allergen.toUpperCase()}, which matches your saved allergen profile!`)
  };
};

module.exports = {
  detectAllergens,
  checkUserAllergenMatch,
  BIG_9_ALLERGENS
};
