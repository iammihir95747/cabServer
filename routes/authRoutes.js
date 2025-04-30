const express = require('express');
const { registerUser, loginUser, getProfile } = require('../Controllers/authController.js');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { handleValidationErrors } = require('../middlewares/validationResult');
const { protect } = require('../middlewares/authMiddleware'); // ✅ You need this middleware to protect the profile route
const router = express.Router();
// Register
router.post('/register', registerValidator, handleValidationErrors, registerUser);

// Login
router.post('/login', loginValidator, handleValidationErrors, loginUser);


router.get('/profile', protect, getProfile); 

module.exports = router;
