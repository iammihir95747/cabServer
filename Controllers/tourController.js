const TourPackage = require('../models/TourPackage');

// Create Tour Package (Admin)
exports.createTourPackage = async (req, res, next) => {
     const { name, description, locationsCovered, durationDays, price, includedVehicleTypes, imageUrl } = req.body;
    try {
        const tourExists = await TourPackage.findOne({ name });
        if (tourExists) {
            return res.status(400).json({ message: `Tour package named '${name}' already exists` });
        }
        const tour = await TourPackage.create({ name, description, locationsCovered, durationDays, price, includedVehicleTypes, imageUrl, isActive: true });
        res.status(201).json(tour);
    } catch (error) {
        next(error);
    }
};

// Get All Tour Packages (Public - only active ones)
exports.getAllTourPackages = async (req, res, next) => {
    try {
        const tours = await TourPackage.find({ isActive: true });
        res.json(tours);
    } catch (error) {
        next(error);
    }
};

// Get Single Tour Package (Public)
exports.getTourPackageById = async (req, res, next) => {
    try {
        const tour = await TourPackage.findOne({ _id: req.params.id, isActive: true });
        if (!tour) {
            return res.status(404).json({ message: 'Tour package not found or is inactive' });
        }
        res.json(tour);
    } catch (error) {
         if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid tour package ID format' });
         }
        next(error);
    }
};

// Update Tour Package (Admin)
exports.updateTourPackage = async (req, res, next) => {
     try {
        // Ensure isActive can be updated too
        const { name, description, locationsCovered, durationDays, price, includedVehicleTypes, imageUrl, isActive } = req.body;
        const tour = await TourPackage.findByIdAndUpdate(req.params.id,
            { name, description, locationsCovered, durationDays, price, includedVehicleTypes, imageUrl, isActive },
            { new: true, runValidators: true }
        );
        if (!tour) {
            return res.status(404).json({ message: 'Tour package not found' });
        }
        res.json(tour);
    } catch (error) {
         if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid tour package ID format' });
         }
         if (error.code === 11000) { // Handle unique name constraint if needed
            return res.status(400).json({ message: 'Tour package name must be unique' });
         }
        next(error);
    }
};

// Delete Tour Package (Admin - might soft delete by setting isActive=false)
exports.deleteTourPackage = async (req, res, next) => {
     try {
        // Option 1: Hard Delete
        // const tour = await TourPackage.findByIdAndDelete(req.params.id);

        // Option 2: Soft Delete
        const tour = await TourPackage.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });

        if (!tour) {
            return res.status(404).json({ message: 'Tour package not found' });
        }
        // Adjust message based on hard/soft delete
        res.json({ message: 'Tour package deactivated successfully' });
    } catch (error) {
         if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid tour package ID format' });
         }
        next(error);
    }
};