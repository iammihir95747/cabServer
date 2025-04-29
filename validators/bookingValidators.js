const { body } = require('express-validator');

exports.createBookingValidator = [
    body('pickupLocation.description').notEmpty().withMessage('Pickup location description is required').trim(),
    body('dropoffLocation.description').notEmpty().withMessage('Dropoff location description is required').trim(),
    body('pickupDateTime').isISO8601().withMessage('Invalid pickup date/time format').toDate()
        .custom((value) => { // Basic future date check
            if (value < new Date()) {
                throw new Error('Pickup date/time must be in the future');
            }
            return true;
        }),
    body('bookingType').optional().isIn(['one-way', 'round-trip', 'tour']).withMessage('Invalid booking type'),
    body('vehicleType').optional().notEmpty().withMessage('Vehicle type is required if booking is not a tour package').trim(), // Conditional validation might be needed in controller
    body('tourPackage').optional().isMongoId().withMessage('Invalid tour package ID'),
    body('notes').optional().trim(),
];
