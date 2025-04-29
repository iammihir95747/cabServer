const mongoose = require('mongoose');

const TourPackageSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    locationsCovered: [{ type: String, trim: true }], // Array of places
    durationDays: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    includedVehicleTypes: [{ type: String, enum: ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Tempo Traveller'] }], // Which vehicles are suitable
    imageUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('TourPackage', TourPackageSchema);