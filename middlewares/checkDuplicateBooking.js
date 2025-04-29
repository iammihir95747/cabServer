// middleware/checkDuplicateBooking.js
const Booking = require('../models/Booking');

const checkDuplicateBooking = async (req, res, next) => {
  try {
    const { phoneNumber, email, pickupLocation, dropoffLocation, pickupDateTime } = req.body;

    // Check for duplicate email and phone number
    const existingBooking = await Booking.findOne({
      $or: [
        { phoneNumber },  // Check for duplicate phone number
        { email },         // Check for duplicate email
      ],
      'pickupLocation.description': pickupLocation.description,
      'dropoffLocation.description': dropoffLocation.description,
      pickupDateTime,
    });

    if (existingBooking) {
      console.log('Duplicate booking detected:', existingBooking);

      return res.status(409).json({
        success: false,
        message: 'Booking already registered with the same phone number or email.',
      });
    }

    next();
  } catch (error) {
    console.error('Error checking duplicate booking:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking for duplicates.',
      error: error.message,
    });
  }
};

module.exports = checkDuplicateBooking;
