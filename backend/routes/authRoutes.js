const express = require("express");
const { body } = require("express-validator");

const { register, login, getUser, updateUser } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// ─── Validation Rule Sets ─────────────────────────────────────────────────────

const registerRules = [
  body("username")
    .trim()
    .notEmpty().withMessage("Username is required")
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),

  body("year")
    .notEmpty().withMessage("Year is required")
    .isInt({ min: 1, max: 5 }).withMessage("Year must be between 1 and 5"),

  body("department")
    .trim()
    .notEmpty().withMessage("Department is required")
    .isLength({ max: 100 }).withMessage("Department name too long"),

  body("age")
    .notEmpty().withMessage("Age is required")
    .isInt({ min: 16, max: 100 }).withMessage("Age must be between 16 and 100"),
];

const loginRules = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),
];

const updateRules = [
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 30 }).withMessage("Username must be 3–30 characters")
    .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .optional()
    .trim()
    .isEmail().withMessage("Provide a valid email address")
    .normalizeEmail(),

  body("year")
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage("Year must be between 1 and 5"),

  body("department")
    .optional()
    .trim()
    .notEmpty().withMessage("Department cannot be blank")
    .isLength({ max: 100 }).withMessage("Department name too long"),

  body("age")
    .optional()
    .isInt({ min: 16, max: 100 }).withMessage("Age must be between 16 and 100"),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", registerRules, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login and receive JWT
 * @access  Public
 */
router.post("/login", loginRules, validate, login);

/**
 * @route   GET /api/auth/getuser
 * @desc    Get authenticated user profile
 * @access  Private
 */
router.get("/getuser", protect, getUser);

/**
 * @route   PATCH /api/auth/updateuser
 * @desc    Update authenticated user profile
 * @access  Private
 */
router.patch("/updateuser", protect, updateRules, validate, updateUser);

module.exports = router;
