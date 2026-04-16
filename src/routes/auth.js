const express = require("express");
const AuthController = require("../modules/auth/auth.controller");
const { loginValidator } = require("../modules/auth/auth.validator");
const validate = require("../shared/middlewares/errors/validate");
const verifyToken = require("../shared/middlewares/auth.middleware");

const router = express.Router();

router.post("/login", loginValidator, validate, AuthController.login);

router.get("/me", verifyToken(), AuthController.getProfile);

module.exports = router;
