const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  ipv6Subnet: 56,
  message: {
    status: "error",
    message: "Terlalu banyak percobaan login, coba lagi nanti",
  },
});

module.exports = {
  loginLimiter,
};
