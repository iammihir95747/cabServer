const express = require('express');
const { getAdminDashboardStats, adminUpdateBooking } = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
// Add relevant validators if needed
const { handleValidationErrors } = require('../middlewares/validationResult');
const router = express.Router();

router.use(protect, isAdmin); // All routes here require admin access

router.get('/dashboard', getAdminDashboardStats);
// Example: Admin specific update (e.g., assigning driver)
router.patch('/bookings/:id', /* Add necessary validators */ handleValidationErrors, adminUpdateBooking);
// Add routes for managing drivers (GET all drivers, GET driver/:id, PUT driver/:id, DELETE driver/:id) - Link to driverController methods

module.exports = router;