const express = require('express');
const router = express.Router();
const {
  analyzeMeal,
  createMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal
} = require('../controllers/mealController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const validate = require('../middleware/validateMiddleware');
const { saveMealSchema } = require('../utils/validators');

router.post('/analyze', protect, upload.single('image'), analyzeMeal);
router.post('/', protect, validate(saveMealSchema), createMeal);
router.get('/', protect, getMeals);
router.get('/:id', protect, getMealById);
router.put('/:id', protect, updateMeal);
router.delete('/:id', protect, deleteMeal);

module.exports = router;
