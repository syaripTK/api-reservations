const { query, param } = require("express-validator");

const getAssetsValidator = [
  query("category_id")
    .optional()
    .isInt()
    .withMessage("Category ID harus berupa angka"),
  query("status")
    .optional()
    .isIn(["available", "booked", "maintenance"])
    .withMessage("Status harus: available, booked, atau maintenance"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page harus angka positif"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit harus angka antara 1-100"),
];

const getAssetDetailValidator = [
  param("id").isInt().withMessage("ID harus berupa angka"),
];

module.exports = { getAssetsValidator, getAssetDetailValidator };
