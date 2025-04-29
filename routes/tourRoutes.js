const express = require('express');
const { createTourPackage, getAllTourPackages, getTourPackageById, updateTourPackage, deleteTourPackage } = require('../controllers/tourController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { tourPackageValidator } = require('../validators/tourValidators');
const { handleValidationErrors } = require('../middlewares/validationResult');
const router = express.Router();

// Public routes
router.get('/', getAllTourPackages); // List all active tours for users
router.get('/:id', getTourPackageById);

// Admin protected routes
router.post('/', protect, isAdmin, tourPackageValidator, handleValidationErrors, createTourPackage);
router.put('/:id', protect, isAdmin, tourPackageValidator, handleValidationErrors, updateTourPackage);
router.delete('/:id', protect, isAdmin, deleteTourPackage);

module.exports = router;

// routes/userRoutes.js
const { getMyProfile, updateMyProfile } = require('../controllers/userController');
// Add admin routes for user management later if needed

router.use(protect);

router.get('/me', getMyProfile);
router.put('/me', updateMyProfile); // Add validators for profile update

module.exports = router;