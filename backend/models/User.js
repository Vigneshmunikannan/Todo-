const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12; // Bcrypt cost factor — higher = slower but safer

// ─── Schema ───────────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username must not exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never return password by default
    },

    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [1, "Year must be at least 1"],
      max: [5, "Year must not exceed 5"],
    },

    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [100, "Department name is too long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [16, "Age must be at least 16"],
      max: [100, "Age must not exceed 100"],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// email & username indexes come from unique: true — do not add schema.index() for the same fields

// ─── Pre-save Hook: Hash Password ────────────────────────────────────────────
// Async middleware: Mongoose does not pass `next`; use return/throw only.
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Instance Method: Compare Password ───────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Safe Profile (no sensitive fields) ─────────────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
