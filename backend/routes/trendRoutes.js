const express = require('express');
const router = express.Router();
const { getWeeklyTrends, getDailyTrends } = require('../controllers/trendController');
const { protect } = require('../middleware/authMiddleware');

router.get('/weekly', protect, getWeeklyTrends);
router.get('/daily', protect, getDailyTrends);

module.exports = router;
