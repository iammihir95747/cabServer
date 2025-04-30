const express = require('express');
const cors = require('cors');
const config = require('./Config');
const connectDB = require('./Config/db');
const { errorHandler } = require('./middlewares/errorHandler');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const driverRoutes = require('./routes/driverRoutes'); // Uncomment when implemented

// Create express app
const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON format
app.use(express.urlencoded({ extended: true })); // Body parser for URL-encoded data

// Simple Route for Testing
app.get('/', (req, res) => {
  res.send('Taxi Booking API Running...');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/tours', tourRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
// app.use('/api/drivers', driverRoutes); // Uncomment when implemented

// --- Error Handling Middleware ---
// Not Found Handler (if no route matches) - place before global error handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the global error handler
});

// Global Error Handler - Must be the last middleware
app.use(errorHandler);

// Start Server
const port = config.PORT || 5001; // Use the config port or default to 5001
app.listen(port, () => {
  console.log(`Server running ✅ in ${config.NODE_ENV} mode on port: ${port}`);
});
