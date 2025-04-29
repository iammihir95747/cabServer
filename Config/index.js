// Config/index.js
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

module.exports = {
    PORT: process.env.PORT || 5001,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV || 'development',
};

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(module.exports.MONGO_URI, {
            // Remove deprecated options: useNewUrlParser and useUnifiedTopology are default true in Mongoose 6+
            // useCreateIndex and useFindAndModify are not supported
        });
        console.log(`MongoDB Connected✅: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports.connectDB = connectDB; // Export connectDB correctly