const express = require("express");

const router = express.Router();

/**
 * @route   GET /api/status
 * @desc    Server health check — confirms API is live and DB is connected
 * @access  Public
 */
router.get("/", (req, res) => {
  const mongoose = require("mongoose");
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbState = dbStates[mongoose.connection.readyState] || "unknown";

  res.status(200).json({
    success: true,
    message: "🚀 ToDo List API is running",
    environment: process.env.NODE_ENV || "development",
    database: dbState,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

module.exports = router;
