const AuthService = require("./auth.service");
const {
  successResponse,
  errorResponse,
  loginResponse,
} = require("../../shared/utils/response");

class AuthController {
  static async login(req, res, next) {
    try {
      const { username, password } = req.body;

      const result = await AuthService.login(username, password);

      return loginResponse(
        res,
        200,
        "Login berhasil",
        result.token,
        result.user,
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await AuthService.getProfile(userId);

      return successResponse(res, 200, "Profil ditemukan", user);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
