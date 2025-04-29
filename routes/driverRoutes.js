// routes/driverRoutes.js
const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { handleValidationErrors } = require('../middlewares/validationResult');
const {
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    updateDriverStatus,
    updateDriverLocation
} = require('../controllers/driverController');
const {
    createDriverValidator,
    updateDriverValidator,
    updateStatusValidator,
    updateLocationValidator,
    driverIdParamValidator // Import the param validator
} = require('../validators/driverValidators');

const router = express.Router();

// === Admin Routes ===
router.post('/',
    protect,
    isAdmin,
    createDriverValidator,       // Apply validator
    handleValidationErrors,      // Check for errors
    createDriver
);

router.get('/', protect, isAdmin, getAllDrivers);

router.get('/:id',
    protect,
    isAdmin,                    // Or check if driver is requesting own profile in controller
    driverIdParamValidator,     // Validate the :id param
    handleValidationErrors,
    getDriverById
);

router.put('/:id',
    protect,
    isAdmin,
    driverIdParamValidator,     // Validate the :id param
    updateDriverValidator,      // Validate body
    handleValidationErrors,
    updateDriver
);

router.delete('/:id',
    protect,
    isAdmin,
    driverIdParamValidator,     // Validate the :id param
    handleValidationErrors,
    deleteDriver
);


// === Driver Self-Update Routes ===
router.patch('/status',          // Doesn't need :id as it uses logged-in user
    protect,                    // Ensure user is logged in (role check can happen in controller)
    updateStatusValidator,      // Validate body
    handleValidationErrors,
    updateDriverStatus          // Controller finds driver via req.user
);

router.patch('/location',        // Doesn't need :id
    protect,
    updateLocationValidator,
    handleValidationErrors,
    updateDriverLocation
);


module.exports = router;