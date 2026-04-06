require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

// ─── Import Routes ────────────────────────────────────────────────────────────
const authRoutes = require("./routes/authRoutes");
const statusRoutes = require("./routes/statusRoutes");

// ─── Connect to MongoDB ───────────────────────────────────────────────────────
connectDB();

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

// CORS — allow only from React dev server (or configured CLIENT_URL)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// HTTP request logger
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Parse JSON bodies (max 10kb to prevent body-bomb attacks)
app.use(express.json({ limit: "10kb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Routes ───────────────────────────────────────────────────────────────────

// Server status / health check — GET /api/status
app.use("/api/status", statusRoutes);

// Auth routes — /api/auth/register | /api/auth/login | /api/auth/getuser | /api/auth/updateuser
app.use("/api/auth", authRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n🚀  Server running on http://localhost:${PORT}`);
  console.log(`📋  Environment : ${process.env.NODE_ENV || "development"}`);
  console.log(`\n  API ROUTES`);
  console.log(`  ─────────────────────────────────────`);
  console.log(`  GET  http://localhost:${PORT}/api/status`);
  console.log(`  POST http://localhost:${PORT}/api/auth/register`);
  console.log(`  POST http://localhost:${PORT}/api/auth/login`);
  console.log(`  GET  http://localhost:${PORT}/api/auth/getuser`);
  console.log(`  PATCH http://localhost:${PORT}/api/auth/updateuser`);
  console.log(`  ─────────────────────────────────────\n`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully...");
  server.close(() => process.exit(0));
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  server.close(() => process.exit(1));
});

module.exports = app;
