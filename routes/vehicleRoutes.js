const express = require('express');
const { addVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle, getAvailableVehicles } = require('../Controllers/vehicleController.js');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const { vehicleValidator } = require('../validators/vehicleValidators');
const { handleValidationErrors } = require('../middlewares/validationResult');
const router = express.Router();

// Public route to get available vehicles (e.g., for booking form dropdown)
router.get('/available', getAvailableVehicles); // No authentication required here

// Public route to get all vehicles (accessible without login)
router.get('/', getAllVehicles); // Fetch all vehicles without login

// Admin protected routes
router.post('/', protect, isAdmin, vehicleValidator, handleValidationErrors, addVehicle);
router.get('/:id', protect, isAdmin, getVehicleById);
router.put('/:id', protect, isAdmin, vehicleValidator, handleValidationErrors, updateVehicle);
router.delete('/:id', protect, isAdmin, deleteVehicle);

module.exports = router;
