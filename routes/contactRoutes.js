const express = require('express');
const { submitInquiry, getAllInquiries, updateInquiryStatus } = require('../Controllers/contactController.js');
const { contactInquiryValidator } = require('../validators/contactValidators');
const { handleValidationErrors } = require('../middlewares/validationResult');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminMiddleware');
const router = express.Router();

// Public route to submit inquiry
router.post('/', contactInquiryValidator, handleValidationErrors, submitInquiry);

// Admin routes to manage inquiries
router.get('/', protect, isAdmin, getAllInquiries);
router.patch('/:id/status', protect, isAdmin, updateInquiryStatus); // Admin updates status

module.exports = router;
