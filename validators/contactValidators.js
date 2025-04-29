const { body } = require('express-validator');

exports.contactInquiryValidator = [
    body('name').notEmpty().withMessage('Name is required').trim(),
    body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
    body('phoneNumber').notEmpty().withMessage('Phone number is required').isMobilePhone('en-IN').withMessage('Enter a valid Indian phone number'),
    body('message').notEmpty().withMessage('Message is required').trim(),
];
