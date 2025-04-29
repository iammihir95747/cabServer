// validators/driverValidators.js
const { body, param } = require('express-validator');

const createDriverValidator = [
  body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
  body('licenseNumber').notEmpty().withMessage('License number is required').isString().withMessage('License number must be a string'),
  body('contactNumber').notEmpty().withMessage('Contact number is required').isMobilePhone().withMessage('Invalid contact number'),
  body('availability').optional().isBoolean().withMessage('Availability must be a boolean'),
  // Add other validation rules as needed
];

const updateDriverValidator = [
  param('id').isMongoId().withMessage('Invalid driver ID'),
  body('name').optional().isString().withMessage('Name must be a string'),
  body('licenseNumber').optional().isString().withMessage('License number must be a string'),
  body('contactNumber').optional().isMobilePhone().withMessage('Invalid contact number'),
  body('availability').optional().isBoolean().withMessage('Availability must be a boolean'),
  // Add other validation rules as needed
];

const getDriverValidator = [
  param('id').isMongoId().withMessage('Invalid driver ID'),
];

const deleteDriverValidator = [
   param('id').isMongoId().withMessage('Invalid driver ID'),
];

module.exports = {
  createDriverValidator,
  updateDriverValidator,
  getDriverValidator,
  deleteDriverValidator,
};