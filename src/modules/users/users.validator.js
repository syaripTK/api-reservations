const { body, param } = require("express-validator");

const updateProfileValidator = [
  body("full_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nama lengkap tidak bisa kosong"),
  body("password")
    .optional()
    .isLength({ min: 5 })
    .withMessage("Password minimal 5 karakter"),
];

module.exports = { updateProfileValidator };
