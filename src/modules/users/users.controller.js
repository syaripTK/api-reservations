const UsersService = require("./users.service");
const { successResponse } = require("../../shared/utils/response");

class UsersController {
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      const user = await UsersService.updateProfile(userId, updates);

      return successResponse(res, 200, "Profil berhasil diperbarui", user);
    } catch (error) {
      next(error);
    }
  }

  static async getMyReservations(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await UsersService.getUserReservations(userId);

      return successResponse(res, 200, "Riwayat reservasi berhasil diambil", {
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
        },
        reservations: user.reservations,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersController;
