
const { body } = require('express-validator');

exports.registerValidator = [
  body('name').notEmpty().withMessage('Invalid name: Name is required').trim(),
  body('email').isEmail().withMessage('Invalid email: Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Invalid password: Password must be at least 6 characters long'),
  body('phoneNumber').notEmpty().withMessage('Invalid phone number: Phone number is required').isMobilePhone('en-IN').withMessage('Invalid phone number: Enter a valid Indian phone number'),
];

exports.loginValidator = [
  body('email').isEmail().withMessage('Invalid email: Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Invalid password: Password is required'),
];