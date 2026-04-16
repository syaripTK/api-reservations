const { Users } = require("../../db/models");
const {
  comparePassword,
  generateToken,
  hashPassword,
} = require("../../shared/utils/helpers");

class AuthService {
  static async login(username, password) {
    try {
      const user = await Users.findOne({
        where: { username },
        attributes: { exclude: [] },
      });

      if (!user) {
        const error = new Error("Username atau password salah");
        error.status = 401;
        throw error;
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        const error = new Error("Username atau password salah");
        error.status = 401;
        throw error;
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user.toJSON();

      return {
        token,
        user: userWithoutPassword,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getProfile(userId) {
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

module.exports = AuthService;
