const { body, param } = require("express-validator");

const createAssetValidator = [
  body("name").trim().notEmpty().withMessage("Nama aset harus diisi"),
  body("sku").trim().notEmpty().withMessage("SKU harus diisi"),
  body("category_id").isInt().withMessage("Category ID harus berupa angka"),
  body("description").optional().trim(),
];

const updateAssetValidator = [
  param("id").isInt().withMessage("ID harus berupa angka"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nama aset tidak bisa kosong"),
  body("sku").optional().trim().notEmpty().withMessage("SKU tidak bisa kosong"),
  body("category_id")
    .optional()
    .isInt()
    .withMessage("Category ID harus berupa angka"),
  body("status")
    .optional()
    .isIn(["available", "booked", "maintenance"])
    .withMessage("Status harus: available, booked, atau maintenance"),
  body("description").optional().trim(),
];

const deleteAssetValidator = [
  param("id").isInt().withMessage("ID harus berupa angka"),
];

const createCategoryValidator = [
  body("name").trim().notEmpty().withMessage("Nama kategori harus diisi"),
  body("description").optional().trim(),
];

const updateCategoryValidator = [
  param("id").isInt().withMessage("ID harus berupa angka"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nama kategori tidak bisa kosong"),
  body("description").optional().trim(),
];

const deleteCategoryValidator = [
  param("id").isInt().withMessage("ID harus berupa angka"),
];

module.exports = {
  createAssetValidator,
  updateAssetValidator,
  deleteAssetValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
};
