const User = require('../models/User');

exports.getMyProfile = async (req, res, next) => {
    // req.user is attached by the protect middleware
    // We already selected '-password' in the middleware
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(404).json({ message: 'User not found' }); // Should not happen if protect middleware works
    }
};

exports.updateMyProfile = async (req, res, next) => {
    const { name, phoneNumber, /* potentially email but handle verification */ } = req.body;
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
             return res.status(404).json({ message: 'User not found' });
        }

        // Check if phone number is changing and if it's already taken by another user
        if (phoneNumber && phoneNumber !== user.phoneNumber) {
            const phoneExists = await User.findOne({ phoneNumber: phoneNumber });
            if (phoneExists) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
            user.phoneNumber = phoneNumber;
        }

        user.name = name || user.name;
        // Add email update logic with verification if needed

        const updatedUser = await user.save();

        // Respond with updated user info (excluding password) and potentially a new token if needed
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.role,
        });

    } catch (error) {
        next(error);
    }
};