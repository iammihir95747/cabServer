const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }, // Link to User model
    licenseNumber: { type: String, required: true, unique: true, trim: true },
    assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null }, // Currently assigned vehicle
    status: { type: String, enum: ['available', 'on_trip', 'offline'], default: 'offline' },
    currentLocation: { // Optional: for real-time tracking
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere', default: [0, 0] } // [longitude, latitude]
    },
}, { timestamps: true });

module.exports = mongoose.model('Driver', DriverSchema);