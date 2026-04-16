const express = require("express");
const authRoutes = require("./auth");
const assetsRoutes = require("./assets");
const usersRoutes = require("./users");
const adminRoutes = require("./admin");
const reservationsRoutes = require("./reservations");

const router = express.Router();

// API Version 1 Routes
router.use("/v1/auth", authRoutes);
router.use("/v1/assets", assetsRoutes);
router.use("/v1/users", usersRoutes);
router.use("/v1/admin", adminRoutes);
router.use("/v1/reservations", reservationsRoutes);

// Health check
router.get("/health", (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "API is running",
    timestamp: new Date(),
  });
});

module.exports = router;
