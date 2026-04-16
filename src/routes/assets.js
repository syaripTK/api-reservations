const express = require("express");
const AssetsController = require("../modules/assets/assets.controller");
const {
  getAssetsValidator,
  getAssetDetailValidator,
} = require("../modules/assets/assets.validator");
const validate = require("../shared/middlewares/errors/validate");
const verifyToken = require("../shared/middlewares/auth.middleware");

const router = express.Router();

router.get(
  "/",
  verifyToken(),
  getAssetsValidator,
  validate,
  AssetsController.getAllAssets,
);

router.get(
  "/:id",
  verifyToken(),
  getAssetDetailValidator,
  validate,
  AssetsController.getAssetDetail,
);

module.exports = router;
