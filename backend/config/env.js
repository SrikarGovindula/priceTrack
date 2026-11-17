const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017",
  DB_NAME: process.env.DB_NAME || "pricetrack",
  SESSION_SECRET:
    process.env.SESSION_SECRET ||
    "pricetrack_super_secret_session_key_2025_secure",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@pricetrack.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "AdminPassword123!",
  DEMO_USER_EMAIL: process.env.DEMO_USER_EMAIL || "user@pricetrack.com",
  DEMO_USER_PASSWORD: process.env.DEMO_USER_PASSWORD || "UserPassword123!",
  PRICE_CHECK_INTERVAL_MS:
    parseInt(process.env.PRICE_CHECK_INTERVAL_MS, 10) || 5 * 60 * 1000, // 5 minutes
  NODE_ENV: process.env.NODE_ENV || "development",
};
