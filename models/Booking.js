const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  description: { type: String, required: true },
}, { _id: false }); // avoid nested _id for subdocs

const bookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  pickupLocation: { type: locationSchema, required: true },
  dropoffLocation: { type: locationSchema, required: true },
  pickupDateTime: { type: Date, required: true },
  bookingType: { type: String, enum: ['one-way', 'round-trip', 'tour'], default: 'one-way' },
  notes: { type: String },
}, { timestamps: true });

// Compound unique index to prevent duplicate bookings
bookingSchema.index({
  phoneNumber: 1,
  'pickupLocation.description': 1,
  'dropoffLocation.description': 1,
  pickupDateTime: 1,
}, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
