const express = require("express");
const AdminController = require("../modules/admin/admin.controller");
const {
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
} = require("../modules/admin/admin.validator");
const validate = require("../shared/middlewares/errors/validate");
const verifyToken = require("../shared/middlewares/auth.middleware");
const uploadPhoto = require("../shared/middlewares/upload.middlware");

const router = express.Router();

// Protect all admin routes - only admin role allowed
router.use(verifyToken(["admin"]));

// ====== ASSETS ROUTES ======
router.get("/assets", AdminController.getAllAssets);

router.get(
  "/assets/:id",
  getAssetDetailValidator,
  validate,
  AdminController.getAssetDetail,
);

router.post(
  "/assets",
  uploadPhoto("image"),
  createAssetValidator,
  validate,
  AdminController.createAsset,
);

router.put(
  "/assets/:id",
  uploadPhoto("image"),
  updateAssetValidator,
  validate,
  AdminController.updateAsset,
);

router.delete(
  "/assets/:id",
  deleteAssetValidator,
  validate,
  AdminController.deleteAsset,
);

// ====== CATEGORIES ROUTES ======
router.get("/categories", AdminController.getAllCategories);

router.get("/categories/:id", AdminController.getCategoryDetail);

router.post(
  "/categories",
  createCategoryValidator,
  validate,
  AdminController.createCategory,
);

router.put(
  "/categories/:id",
  updateCategoryValidator,
  validate,
  AdminController.updateCategory,
);

router.delete(
  "/categories/:id",
  deleteCategoryValidator,
  validate,
  AdminController.deleteCategory,
);

// ====== USERS ROUTES ======
router.get("/users", AdminController.getAllUsers);

router.get(
  "/users/:id",
  getUserValidator,
  validate,
  AdminController.getUserDetail,
);

router.post(
  "/users",
  createUserValidator,
  validate,
  AdminController.createUser,
);

router.put(
  "/users/:id",
  updateUserValidator,
  validate,
  AdminController.updateUser,
);

router.delete(
  "/users/:id",
  deleteUserValidator,
  validate,
  AdminController.deleteUser,
);

module.exports = router;
