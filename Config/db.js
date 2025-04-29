const mongoose = require('mongoose');
const config = require('./index'); // Imports MONGO_URI from config/index.js (which loads .env)

/**
 * Establishes a connection to the MongoDB database.
 */
const connectDB = async () => { 
    try {
        // Attempt to connect to the database using the URI from the configuration
        const conn = await mongoose.connect(config.MONGO_URI, {
            // Note: useNewUrlParser, useUnifiedTopology, useCreateIndex, and useFindAndModify
            // are no longer needed in Mongoose 6+ as they are deprecated or default.
        });

        // Log a success message to the console, including the host of the connected database
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        // Log any errors that occur during the connection attempt
        console.error(`Error connecting to MongoDB: ${error.message}`);

        // Exit the Node.js process with a failure code (1) if the connection fails
        process.exit(1);
    }
};

// Export the connectDB function so it can be imported and used in server.js
module.exports = connectDB;