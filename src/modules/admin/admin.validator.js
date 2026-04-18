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

const createUserValidator = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username harus diisi")
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter"),
  body("full_name").trim().notEmpty().withMessage("Nama lengkap harus diisi"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password harus diisi")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Role harus: admin atau user"),
];

const updateUserValidator = [
  param("id").isInt().withMessage("ID harus berupa angka"),
  body("username")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Username tidak bisa kosong")
    .isLength({ min: 3 })
    .withMessage("Username minimal 3 karakter"),
  body("full_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nama lengkap tidak bisa kosong"),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Role harus: admin atau user"),
];

const deleteUserValidator = [
  param("id").isInt().withMessage("ID harus berupa angka"),
];

const getUserValidator = [
  param("id").isInt().withMessage("ID harus berupa angka"),
];

const getAssetDetailValidator = [
  param("id").isInt().withMessage("ID harus berupa angka"),
];

module.exports = {
  createAssetValidator,
  updateAssetValidator,
  deleteAssetValidator,
  getAssetDetailValidator,
  createCategoryValidator,
  updateCategoryValidator,
  deleteCategoryValidator,
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  getUserValidator,
};
