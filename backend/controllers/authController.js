const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ─── Helper: Sign JWT ─────────────────────────────────────────────────────────
const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// ─── Helper: Build & send token response ─────────────────────────────────────
const createSendToken = (user, statusCode, res, message = "Success") => {
  const token = signToken(user._id);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      year: user.year,
      department: user.department,
      age: user.age,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 *
 * Validations handled by express-validator (see routes):
 *   - username: required, 3–30 chars, alphanumeric+underscore
 *   - password: required, min 8 chars, must contain upper/lower/number
 *   - email: required, valid email
 *   - year: required, 1–5
 *   - department: required, string
 *   - age: required, 16–100
 */
const register = async (req, res) => {
  try {
    const { username, password, email, year, department, age } = req.body;

    // ── Check duplicate username ──────────────────────────────────────────
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already taken. Please choose another.",
      });
    }

    // ── Check duplicate email ─────────────────────────────────────────────
    const existingEmail = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered. Please log in.",
      });
    }

    // ── Create user (password hashed via pre-save hook in model) ──────────
    const user = await User.create({
      username,
      password,
      email: email.toLowerCase().trim(),
      year,
      department,
      age,
    });

    createSendToken(user, 201, res, "Registration successful. Welcome!");
  } catch (err) {
    // Mongoose duplicate key error (race condition safety net)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists.`,
      });
    }
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT
 * @access  Public
 *
 * Validations:
 *   - email: required, valid email
 *   - password: required, non-empty
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Fetch user WITH password (select:false by default) ────────────────
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      // Use vague message to prevent email enumeration
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ── Verify password ───────────────────────────────────────────────────
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    createSendToken(user, 200, res, "Login successful. Welcome back!");
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   GET /api/auth/getuser
 * @desc    Get currently authenticated user's profile
 * @access  Private (JWT required)
 */
const getUser = async (req, res) => {
  try {
    // req.user is attached by the `protect` middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        year: user.year,
        department: user.department,
        age: user.age,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("GetUser Error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
/**
 * @route   PATCH /api/auth/updateuser
 * @desc    Update current user's profile fields (partial update)
 * @access  Private (JWT required)
 *
 * Allowed updates: username, email, year, department, age
 * Password update intentionally excluded — use a dedicated /change-password route
 *
 * Validations (all optional but if provided, must pass):
 *   - username: 3–30 chars, alphanumeric+underscore
 *   - email: valid email
 *   - year: 1–5
 *   - age: 16–100
 *   - department: non-empty string
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;

    // ── Disallow direct password update via this route ────────────────────
    if (req.body.password) {
      return res.status(400).json({
        success: false,
        message:
          "Password cannot be updated via this route. Use /change-password instead.",
      });
    }

    // ── Build allowed update object ───────────────────────────────────────
    const allowedFields = ["username", "email", "year", "department", "age"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update.",
      });
    }

    // ── Normalise email if present ────────────────────────────────────────
    if (updates.email) updates.email = updates.email.toLowerCase().trim();

    // ── Check new username uniqueness ─────────────────────────────────────
    if (updates.username) {
      const exists = await User.findOne({
        username: updates.username,
        _id: { $ne: userId },
      });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Username already taken.",
        });
      }
    }

    // ── Check new email uniqueness ────────────────────────────────────────
    if (updates.email) {
      const exists = await User.findOne({
        email: updates.email,
        _id: { $ne: userId },
      });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Email already in use by another account.",
        });
      }
    }

    // ── Apply update ──────────────────────────────────────────────────────
    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,          // Return the updated document
      runValidators: true, // Run schema validators on the update
    });

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        year: updatedUser.year,
        department: updatedUser.department,
        age: updatedUser.age,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists.`,
      });
    }
    console.error("UpdateUser Error:", err);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = { register, login, getUser, updateUser };
