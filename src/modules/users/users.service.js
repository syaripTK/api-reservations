const { Users } = require("../../db/models");
const { hashPassword } = require("../../shared/utils/helpers");

class UsersService {
  static async updateProfile(userId, updates) {
    try {
      const user = await Users.findByPk(userId);

      if (!user) {
        const error = new Error("User tidak ditemukan");
        error.status = 404;
        throw error;
      }

      const dataToUpdate = {};
      if (updates.full_name) dataToUpdate.full_name = updates.full_name;
      if (updates.password) {
        dataToUpdate.password = await hashPassword(updates.password);
      }

      await user.update(dataToUpdate);

      const { password: _, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  static async getUserReservations(userId) {
    try {
      const user = await Users.findByPk(userId, {
        include: [
          {
            association: "reservations",
            attributes: [
              "id",
              "asset_id",
              "status",
              "request_date",
              "start_date",
              "end_date",
            ],
          },
        ],
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        const error = new Error("User tidak ditemukan");
        error.status = 404;
        throw error;
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  static async getUserById(userId) {
    try {
      const user = await Users.findByPk(userId, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        const error = new Error("User tidak ditemukan");
        error.status = 404;
        throw error;
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UsersService;
