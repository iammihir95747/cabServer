const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');
// Add TourPackage if needed for tour bookings

const twilio = require('twilio'); // Import Twilio package

// Twilio configuration (replace with your Twilio credentials)
const accountSid = 'ACc6685b0892085ac2be0209c97fa7b365';
const authToken = 'fefa69e2e7185dfc8d4b60bfc59505c8';
const client = twilio(accountSid, authToken);

// Create a new booking and send WhatsApp message to the driver
exports.createBooking = async (req, res, next) => {
  const {
    name,
    email,
    phoneNumber,
    pickupLocation,
    dropoffLocation,
    pickupDateTime,
    bookingType,
    notes
  } = req.body;

  try {
    // Check for duplicate booking based on phone number, pickup location, dropoff location, and pickup time
    const existingBooking = await Booking.findOne({
      phoneNumber,
      'pickupLocation.description': pickupLocation.description,
      'dropoffLocation.description': dropoffLocation.description,
      pickupDateTime
    });

    if (existingBooking) {
      return res.status(400).json({ message: 'Duplicate booking: You have already made this booking.' });
    }

    // Create new booking
    const booking = new Booking({
      name,
      email,
      phoneNumber,
      pickupLocation,
      dropoffLocation,
      pickupDateTime,
      bookingType: bookingType || 'one-way',
      notes,
    });

    // Save the booking to the database
    const createdBooking = await booking.save();

    // Send WhatsApp message to the driver (replace with actual driver phone number)
    const driverPhoneNumber = 'whatsapp:+919574713004'; // Use the driver's phone number
    const messageBody = `New Booking Details:\nName: ${createdBooking.name}\nPhone: ${createdBooking.phoneNumber}\nPickup: ${createdBooking.pickupLocation.description}\nDropoff: ${createdBooking.dropoffLocation.description}\nPickup Time: ${createdBooking.pickupDateTime}`;

    // Send message via Twilio WhatsApp API
    client.messages
      .create({
        from: 'whatsapp:+14155238886', // Your Twilio WhatsApp number
        to: driverPhoneNumber, // The driver's WhatsApp number
        body: messageBody, // The message content
      })
      .then(message => {
        console.log('WhatsApp message sent:', message.sid); // Log success
      })
      .catch(err => {
        console.error('Error sending WhatsApp message:', err); // Log error if any
      });

    // Respond with the created booking details
    res.status(201).json(createdBooking);

  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error from MongoDB
      return res.status(400).json({ message: 'Duplicate booking detected.' });
    }

    // Other errors
    next(error);
  }
};


// Get bookings for the logged-in user
exports.getUserBookings = async (req, res, next) => {
  try {
    // Fetch bookings for the logged-in user, sort by most recent pickup time
    const bookings = await Booking.find({ user: req.user._id })
                                  .populate('vehicle', 'type modelName registrationNumber') // Populate selected fields
                                  .populate('driver', 'user') // Populate driver's user info (e.g., name)
                                  .populate('tourPackage', 'name')
                                  .sort({ pickupDateTime: -1 });

    res.json(bookings);

  } catch (error) {
    next(error);
  }
};

// Get a specific booking by ID
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
                                 .populate('user', 'name email phoneNumber')
                                 .populate('vehicle')
                                 .populate('driver') // Consider populating driver's user details too
                                 .populate('tourPackage');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization: Ensure user owns the booking or is an admin
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);

  } catch (error) {
    // Handle potential CastError if ID format is invalid
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    next(error);
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization: User can only cancel their own bookings
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Add logic for allowed cancellation statuses
    if (['pending', 'confirmed', 'assigned'].includes(booking.status)) {
      booking.status = 'cancelled_by_user';
      // Add logic here to notify admin/driver if assigned
      await booking.save();
      res.json({ message: 'Booking cancelled successfully' });
    } else {
      res.status(400).json({ message: `Cannot cancel booking with status: ${booking.status}` });
    }

  } catch (error) {
    // Handle potential CastError if ID format is invalid
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    next(error);
  }
};
