const { body } = require('express-validator');

exports.vehicleValidator = [
    body('type').notEmpty().isIn(['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Tempo Traveller']).withMessage('Invalid vehicle type'),
    body('modelName').notEmpty().withMessage('Model name is required').trim(),
    body('registrationNumber').notEmpty().withMessage('Registration number is required').trim().toUpperCase(),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive integer'),
    body('ratePerKm').isFloat({ min: 0 }).withMessage('Rate per KM must be a non-negative number'),
    body('baseFare').optional().isFloat({ min: 0 }).withMessage('Base fare must be a non-negative number'),
];

// --- validators/tourValidators.js --- (Example for Admin)

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