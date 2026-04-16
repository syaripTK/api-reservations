const express = require("express");
const UsersController = require("../modules/users/users.controller");
const { updateProfileValidator } = require("../modules/users/users.validator");
const validate = require("../shared/middlewares/errors/validate");
const verifyToken = require("../shared/middlewares/auth.middleware");

const router = express.Router();

router.put(
  "/profile",
  verifyToken(),
  updateProfileValidator,
  validate,
  UsersController.updateProfile,
);

router.get("/reservations", verifyToken(), UsersController.getMyReservations);

module.exports = router;
