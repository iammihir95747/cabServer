const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Tempo Traveller'] }, // Example types
    modelName: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    ratePerKm: { type: Number, required: true, min: 0 },
    baseFare: { type: Number, default: 0 },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null }, // Link to assigned Driver model
    isAvailable: { type: Boolean, default: true },
    imageUrl: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', VehicleSchema);
