const mongoose = require("mongoose");

/**
 * Connect to MongoDB Atlas
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DBCONNECTION);

    console.log(
      `✅  MongoDB Connected: ${conn.connection.host} — DB: ${conn.connection.name}`
    );
  } catch (err) {
    console.error(`❌  MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
