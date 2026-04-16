const { body } = require("express-validator");

const loginValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username harus diisi")
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter"),
  body("password")
    .notEmpty()
    .withMessage("Password harus diisi")
    .isLength({ min: 5 })
    .withMessage("Password minimal 5 karakter"),
];

module.exports = { loginValidator };
