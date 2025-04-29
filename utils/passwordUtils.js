// utils/passwordUtils.js
const bcrypt = require('bcryptjs');

/**
 * Hashes a password using bcrypt.
 *
 * @param {string} password - The password to hash.
 * @returns {Promise<string>} - A promise that resolves with the hashed password.
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    const hashedPassword = await bcrypt.hash(password, salt); // Hash the password with the salt
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Compares a plain password with a hashed password.
 *
 * @param {string} plainPassword - The plain password to compare.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - A promise that resolves with true if the passwords match, false otherwise.
 */
const comparePasswords = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

module.exports = { hashPassword, comparePasswords };