const Vehicle = require('../models/Vehicle');

// Add a new vehicle (Admin)
exports.addVehicle = async (req, res, next) => {
    const { type, modelName, registrationNumber, capacity, ratePerKm, baseFare, imageUrl } = req.body;
    try {
        const registrationExists = await Vehicle.findOne({ registrationNumber });
        if (registrationExists) {
            return res.status(400).json({ message: `Vehicle with registration ${registrationNumber} already exists` });
        }

        const vehicle = await Vehicle.create({
            type, modelName, registrationNumber, capacity, ratePerKm, baseFare, imageUrl
        });
        res.status(201).json(vehicle);
    } catch (error) {
        next(error);
    }
};

// Get all vehicles (Public access without login)
exports.getAllVehicles = async (req, res, next) => {
    try {
        // Fetch all vehicles, including imageUrl for all users (unauthenticated access)
        const vehicles = await Vehicle.find({}).select('type modelName capacity imageUrl'); // Include imageUrl
        res.json(vehicles); // Return the fetched vehicles
    } catch (error) {
        next(error); // Handle errors
    }
};

// Get available vehicles (Public/User for booking form)
exports.getAvailableVehicles = async (req, res, next) => {
    try {
        // Fetch vehicles where 'isAvailable' is true and include imageUrl in the response
        const vehicles = await Vehicle.find({ isAvailable: true }).select('type modelName capacity imageUrl'); // Include imageUrl
        res.json(vehicles); // Return the available vehicles
    } catch (error) {
        next(error); // Handle errors
    }
};

// Get single vehicle by ID (Admin)
exports.getVehicleById = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id).populate('driver', 'user');
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json(vehicle);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid vehicle ID format' });
        }
        next(error);
    }
};

// Update vehicle (Admin)
exports.updateVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // Return the updated document
            runValidators: true, // Ensure updates adhere to schema validation
        });
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json(vehicle);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid vehicle ID format' });
        }
        // Handle potential duplicate key error for registrationNumber if changed
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Registration number must be unique' });
        }
        next(error);
    }
};

// Delete vehicle (Admin)
exports.deleteVehicle = async (req, res, next) => {
    try {
        const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        // Add logic: Cannot delete if vehicle is assigned to active bookings?
        res.json({ message: 'Vehicle removed successfully' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid vehicle ID format' });
        }
        next(error);
    }
};
