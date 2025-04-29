// routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { createBooking } = require('../Controllers/BookingController.js');
const checkDuplicateBooking = require('../middlewares/checkDuplicateBooking');

router.post('/', checkDuplicateBooking, createBooking); // POST to /api/bookings

module.exports = router;
