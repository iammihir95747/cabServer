const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '30d' });
};

// Register User
exports.registerUser = async (req, res, next) => {
    const { name, email, password, phoneNumber, role } = req.body; // This extracts values in the correct order

    try {
        const userExists = await User.findOne({ $or: [{ email }, { phoneNumber }] });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email or phone number already exists' });
        }

        const user = await User.create({ name, email, password, phoneNumber, role: role || 'user' }); // Creating user object in the specified order

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        next(error); // Pass error to global handler
    }
};


// Login User
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        console.log('User Login:', req.body);  // Log incoming data for login

        const user = await User.findOne({ email });

        // Check if user exists and password matches
        if (user && (await user.matchPassword(password))) {
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account is deactivated' });
            }
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error("Login error:", error);  // Log any errors
        next(error); // Pass error to global handler
    }
};

// Get Logged In User Profile
exports.getProfile = async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
  
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber,
      role: req.user.role,
    });
  };