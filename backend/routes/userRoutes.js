const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { updateProfileSchema } = require('../utils/validators');

router.get('/me', protect, getUserProfile);
router.put('/me', protect, validate(updateProfileSchema), updateUserProfile);

module.exports = router;
