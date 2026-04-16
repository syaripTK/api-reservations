process.env.TZ = "Asia/Jakarta";
const express = require("express");
const sequelize = require("./config/sequelize.js");
const path = require("path");
const cors = require("cors");
const notFound = require("./shared/middlewares/errors/notFound.js");
const errorHandler = require("./shared/middlewares/errors/errorHandler.js");
const apiRoutes = require("./routes");
const { loginLimiter } = require("./shared/middlewares/limit.js");

const app = express();

// ====== GLOBAL MIDDLEWARE ======
// CORS
app.use(cors());

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files - Uploads
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));

// Rate Limiting for Login
app.use("/api/v1/auth/login", loginLimiter);

// ====== ROUTES ======
app.use("/api", apiRoutes);

// ====== ERROR HANDLING MIDDLEWARE (MUST BE LAST) ======
app.use(notFound);
app.use(errorHandler);

module.exports = app;
