const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware: Protect routes with JWT authentication
 *
 * Expects:  Authorization: Bearer <token>
 * On success: attaches req.user = { id, username, email }
 * On failure: returns 401 Unauthorized
 */
const protect = async (req, res, next) => {
  let token;

  // ── 1. Extract token ──────────────────────────────────────────────────────
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  // ── 2. Verify token ───────────────────────────────────────────────────────
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token. Authentication failed.",
    });
  }

  // ── 3. Attach user to request ─────────────────────────────────────────────
  try {
    const user = await User.findById(decoded.id).select(
      "_id username email department year age"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    req.user = user; // Available in downstream handlers
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error during authentication.",
    });
  }
};

module.exports = { protect };
