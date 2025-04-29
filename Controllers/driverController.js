// controllers/driverController.js

const Driver = require('../models/Driver');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const mongoose = require('mongoose'); // Needed for validating ObjectIds

/**
 * @desc    Register a new driver (associates a User with Driver details)
 * @route   POST /api/drivers
 * @access  Private/Admin
 */
exports.createDriver = async (req, res, next) => {
    const { userId, licenseNumber, assignedVehicleId } = req.body;

    // --- Basic Validation ---
    if (!userId || !licenseNumber) {
        return res.status(400).json({ message: 'User ID and License Number are required' });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
         return res.status(400).json({ message: 'Invalid User ID format' });
    }
    if (assignedVehicleId && !mongoose.Types.ObjectId.isValid(assignedVehicleId)) {
        return res.status(400).json({ message: 'Invalid Assigned Vehicle ID format' });
    }
    // --- End Basic Validation ---

    try {
        // 1. Check if the User exists and has the 'driver' role (or set it if needed)
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: `User with ID ${userId} not found` });
        }
        // Optional: Ensure or set the user's role to 'driver'
        if (user.role !== 'driver') {
             user.role = 'driver';
             // Consider implications if user was previously 'customer' or 'admin'
             await user.save();
             console.log(`User ${user.email} role updated to driver.`);
        }

        // 2. Check if a Driver record already exists for this User ID
        const driverExists = await Driver.findOne({ user: userId });
        if (driverExists) {
            return res.status(400).json({ message: `A driver profile already exists for User ID ${userId}` });
        }

        // 3. Check if license number is unique
        const licenseExists = await Driver.findOne({ licenseNumber });
        if (licenseExists) {
            return res.status(400).json({ message: `License number ${licenseNumber} is already registered` });
        }

        // 4. Check if assigned vehicle exists and is not already assigned (if provided)
        let vehicle = null;
        if (assignedVehicleId) {
            vehicle = await Vehicle.findById(assignedVehicleId);
            if (!vehicle) {
                return res.status(404).json({ message: `Vehicle with ID ${assignedVehicleId} not found` });
            }
            if (vehicle.driver) {
                 // Check if it's assigned to a *different* driver already being created (less likely)
                 // or handle reassignment logic if needed. For simplicity, prevent assignment if already assigned.
                 return res.status(400).json({ message: `Vehicle ${vehicle.registrationNumber} is already assigned to another driver.` });
            }
        }

        // 5. Create the Driver document
        const driver = await Driver.create({
            user: userId,
            licenseNumber,
            assignedVehicle: assignedVehicleId || null, // Assign null if not provided
            status: 'offline', // Default status
        });

        // 6. If vehicle assigned, update the vehicle document with the new driver's ID
        if (vehicle) {
            vehicle.driver = driver._id;
            await vehicle.save();
        }

        // Populate user details for the response
        const populatedDriver = await Driver.findById(driver._id).populate('user', 'name email phoneNumber').populate('assignedVehicle');

        res.status(201).json(populatedDriver);

    } catch (error) {
        next(error); // Pass error to global handler
    }
};

/**
 * @desc    Get all drivers
 * @route   GET /api/drivers
 * @access  Private/Admin
 */
exports.getAllDrivers = async (req, res, next) => {
    try {
        const drivers = await Driver.find({})
            .populate('user', 'name email phoneNumber role isActive') // Select fields from User
            .populate('assignedVehicle', 'type modelName registrationNumber'); // Select fields from Vehicle

        res.json(drivers);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single driver by ID
 * @route   GET /api/drivers/:id
 * @access  Private/Admin (Potentially Driver for own profile)
 */
exports.getDriverById = async (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(400).json({ message: 'Invalid Driver ID format' });
    }
    try {
        const driver = await Driver.findById(req.params.id)
            .populate('user', 'name email phoneNumber role isActive')
            .populate('assignedVehicle', 'type modelName registrationNumber');

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // Optional: Add authorization check if drivers should access their own profile via this route
        // const requestingUser = req.user; // Assuming protect middleware adds user
        // if (requestingUser.role !== 'admin' && driver.user._id.toString() !== requestingUser._id.toString()) {
        //     return res.status(403).json({ message: 'Not authorized to view this driver profile' });
        // }

        res.json(driver);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update driver details (e.g., license, assigned vehicle)
 * @route   PUT /api/drivers/:id
 * @access  Private/Admin
 */
exports.updateDriver = async (req, res, next) => {
    const { licenseNumber, assignedVehicleId } = req.body; // Add other updatable fields as needed

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(400).json({ message: 'Invalid Driver ID format' });
    }
     if (assignedVehicleId && !mongoose.Types.ObjectId.isValid(assignedVehicleId)) {
        return res.status(400).json({ message: 'Invalid Assigned Vehicle ID format' });
    }

    try {
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // --- Update Logic ---
        let updatedData = {};
        if (licenseNumber) {
            // Check if new license number is unique (excluding the current driver)
            const licenseExists = await Driver.findOne({ licenseNumber: licenseNumber, _id: { $ne: driver._id } });
            if (licenseExists) {
                 return res.status(400).json({ message: `License number ${licenseNumber} is already registered to another driver` });
            }
            updatedData.licenseNumber = licenseNumber;
        }

        // Handle Vehicle Reassignment
        const currentVehicleId = driver.assignedVehicle ? driver.assignedVehicle.toString() : null;
        const newVehicleId = assignedVehicleId ? assignedVehicleId.toString() : null;

        if (currentVehicleId !== newVehicleId) {
            // 1. If assigning a NEW vehicle
            if (newVehicleId) {
                const newVehicle = await Vehicle.findById(newVehicleId);
                if (!newVehicle) {
                    return res.status(404).json({ message: `Vehicle with ID ${newVehicleId} not found` });
                }
                // Check if the new vehicle is already assigned to SOMEONE ELSE
                if (newVehicle.driver && newVehicle.driver.toString() !== driver._id.toString()) {
                     return res.status(400).json({ message: `Vehicle ${newVehicle.registrationNumber} is already assigned to driver ID ${newVehicle.driver}` });
                }
                // Assign new vehicle to driver
                updatedData.assignedVehicle = newVehicleId;
                // Assign driver to the new vehicle
                newVehicle.driver = driver._id;
                await newVehicle.save();
            } else {
                 // 2. If UNASSIGNING (newVehicleId is null or empty)
                 updatedData.assignedVehicle = null;
            }

             // 3. If the driver HAD a vehicle previously assigned, unassign the driver from THAT vehicle
            if (currentVehicleId) {
                const oldVehicle = await Vehicle.findById(currentVehicleId);
                if (oldVehicle && oldVehicle.driver && oldVehicle.driver.toString() === driver._id.toString()) {
                    oldVehicle.driver = null;
                    await oldVehicle.save();
                }
            }
        }
        // --- End Vehicle Reassignment ---

        // Perform the update on the Driver document
        const updatedDriver = await Driver.findByIdAndUpdate(req.params.id, updatedData, {
            new: true, // Return the modified document
            runValidators: true // Run schema validators on update
        }).populate('user', 'name email phoneNumber').populate('assignedVehicle');


        res.json(updatedDriver);

    } catch (error) {
        // Handle potential duplicate key error for licenseNumber if validation missed it
         if (error.code === 11000 && error.keyPattern && error.keyPattern.licenseNumber) {
            return res.status(400).json({ message: 'License number must be unique' });
         }
        next(error);
    }
};


/**
 * @desc    Update own driver status (Available, Offline, On Trip)
 * @route   PATCH /api/drivers/status
 * @access  Private/Driver
 */
exports.updateDriverStatus = async (req, res, next) => {
    const { status } = req.body;
    const allowedStatuses = ['available', 'on_trip', 'offline'];

    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}` });
    }

    try {
        // Find the driver profile linked to the logged-in user
        const driver = await Driver.findOne({ user: req.user._id }); // req.user comes from 'protect' middleware

        if (!driver) {
            // This case should ideally not happen if user role is correctly managed
            return res.status(404).json({ message: 'Driver profile not found for the logged-in user.' });
        }

        driver.status = status;
        await driver.save();

        res.json({ message: `Status updated to ${status}`, driver }); // Return updated driver or just message

    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Delete a driver
 * @route   DELETE /api/drivers/:id
 * @access  Private/Admin
 */
exports.deleteDriver = async (req, res, next) => {
     if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
         return res.status(400).json({ message: 'Invalid Driver ID format' });
    }
    try {
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        // --- Cleanup Logic ---
        // 1. Unassign driver from any assigned vehicle
        if (driver.assignedVehicle) {
             await Vehicle.updateOne(
                 { _id: driver.assignedVehicle },
                 { $unset: { driver: "" } } // Or set to null: { $set: { driver: null } }
             );
        }

        // 2. Consider associated User account:
        // Option A: Deactivate the User account
         await User.updateOne({ _id: driver.user }, { $set: { isActive: false } });
        // Option B: Delete the User account (more destructive, consider implications)
        // await User.findByIdAndDelete(driver.user);
         // Option C: Just remove the driver role? Might be complex if they have bookings etc.

        // 3. Delete the Driver document itself
        await Driver.findByIdAndDelete(req.params.id);
        // --- End Cleanup ---

        res.json({ message: 'Driver profile and associated user deactivated successfully.' }); // Adjust message based on User action

    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Update own driver location
 * @route   PATCH /api/drivers/location
 * @access  Private/Driver
 */
exports.updateDriverLocation = async (req, res, next) => {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: 'Valid latitude and longitude (numbers) are required.' });
    }

     // Basic validation for coordinate range
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        return res.status(400).json({ message: 'Invalid coordinate range.' });
    }


    try {
        const driver = await Driver.findOne({ user: req.user._id }); // Find driver by logged-in user ID

        if (!driver) {
            return res.status(404).json({ message: 'Driver profile not found for the logged-in user.' });
        }

        // Update location using GeoJSON Point format
        driver.currentLocation = {
            type: 'Point',
            coordinates: [longitude, latitude] // IMPORTANT: GeoJSON is [longitude, latitude]
        };

        await driver.save();

        res.json({ message: 'Location updated successfully.' });

    } catch (error) {
        next(error);
    }
};