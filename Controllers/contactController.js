const ContactInquiry = require('../models/ContactInquiry');

// Submit a new inquiry (Public)
exports.submitInquiry = async (req, res, next) => {
     const { name, email, phoneNumber, message } = req.body;
     try {
         const inquiry = await ContactInquiry.create({ name, email, phoneNumber, message });
         // Optional: Send an email notification to admin
         res.status(201).json({ message: 'Inquiry submitted successfully', inquiryId: inquiry._id });
     } catch (error) {
         next(error);
     }
};

// Get all inquiries (Admin)
exports.getAllInquiries = async (req, res, next) => {
    try {
        const inquiries = await ContactInquiry.find({}).sort({ createdAt: -1 }); // Sort newest first
        res.json(inquiries);
    } catch (error) {
        next(error);
    }
};

// Update inquiry status (Admin)
exports.updateInquiryStatus = async (req, res, next) => {
    const { status } = req.body;
    const allowedStatuses = ['new', 'replied', 'closed'];

    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided' });
    }

     try {
        const inquiry = await ContactInquiry.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );
        if (!inquiry) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.json(inquiry);
    } catch (error) {
         if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid inquiry ID format' });
         }
        next(error);
    }
};


// --- controllers/adminController.js --- (Example actions)
const Booking = require('../models/Booking');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

// Get some basic dashboard stats (Admin)
exports.getAdminDashboardStats = async (req, res, next) => {
     try {
         const totalUsers = await User.countDocuments({ role: 'customer' });
         const totalDrivers = await Driver.countDocuments();
         const totalVehicles = await Vehicle.countDocuments();
         const pendingBookings = await Booking.countDocuments({ status: 'pending' });
         const completedBookings = await Booking.countDocuments({ status: 'completed' });

         res.json({
             users: totalUsers,
             drivers: totalDrivers,
             vehicles: totalVehicles,
             bookings: {
                 pending: pendingBookings,
                 completed: completedBookings,
             }
         });
     } catch (error) {
         next(error);
     }
};

// Admin updates a booking (e.g., assign driver/vehicle, change status)
exports.adminUpdateBooking = async (req, res, next) => {
    const { status, driverId, vehicleId, actualFare, paymentStatus } = req.body;
     try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Validate driverId and vehicleId if provided
        if (driverId) {
            const driverExists = await Driver.findById(driverId);
            if (!driverExists) return res.status(400).json({ message: 'Invalid Driver ID' });
            booking.driver = driverId;
             // Update driver status?
             // driverExists.status = 'assigned' / 'on_trip'; await driverExists.save();
        }
        if (vehicleId) {
            const vehicleExists = await Vehicle.findById(vehicleId);
            if (!vehicleExists) return res.status(400).json({ message: 'Invalid Vehicle ID' });
            booking.vehicle = vehicleId;
            // Update vehicle availability?
            // vehicleExists.isAvailable = false; await vehicleExists.save();
        }

        // Update other fields if provided
        if (status) booking.status = status;
        if (actualFare !== undefined) booking.actualFare = actualFare;
        if (paymentStatus) booking.paymentStatus = paymentStatus;

        // Add more logic, e.g., when status changes to 'completed', make vehicle/driver available again

        const updatedBooking = await booking.save();
        res.json(updatedBooking);

    } catch (error) {
         if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid ID format' });
         }
        next(error);
    }
};
