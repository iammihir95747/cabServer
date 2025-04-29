const { body } = require('express-validator');

exports.tourPackageValidator = [
    body('name').notEmpty().withMessage('Tour name is required').trim(),
    body('description').notEmpty().withMessage('Description is required').trim(),
    body('locationsCovered').isArray({ min: 1 }).withMessage('At least one location is required'),
    body('locationsCovered.*').notEmpty().withMessage('Location name cannot be empty').trim(),
    body('durationDays').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('includedVehicleTypes').optional().isArray().withMessage('Included vehicle types must be an array'),
    body('includedVehicleTypes.*').isIn(['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Tempo Traveller']).withMessage('Invalid vehicle type included'),
];

// --- validators/contactValidators.js ---

exports.contactInquiryValidator = [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('phoneNumber').notEmpty().withMessage('Phone number is required').isMobilePhone('en-IN').withMessage('Enter a valid Indian phone number'),
    body('message').notEmpty().withMessage('Message is required').trim(),
];
