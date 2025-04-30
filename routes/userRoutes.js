const express = require('express');
const { getMyProfile, updateMyProfile } = require ('../Controllers/userController.js')
const { protect } = require('../middlewares/authMiddleware');
// Add admin routes for user management later if needed
const router = express.Router();

router.use(protect);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile); // Add validators for profile update

module.exports = router;