const mongoose = require('mongoose');

const ContactInquirySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phoneNumber: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ['new', 'replied', 'closed'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('ContactInquiry', ContactInquirySchema);
