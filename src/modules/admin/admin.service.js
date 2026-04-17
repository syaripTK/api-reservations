const { Assets, Categories, Users, Reservations } = require("../../db/models");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

class AdminService {
  // ====== ASSETS MANAGEMENT ======
  static async createAsset(assetData) {
    try {
      let imageUrl = null;
      if (assetData.image_url) {
        imageUrl = `/uploads/${assetData.image_url}`;
      }

      const asset = await Assets.create({
        name: assetData.name,
        sku: assetData.sku,
        category_id: assetData.category_id,
        description: assetData.description || null,
        image_url: imageUrl,
        status: "available",
      });

      return asset;
    } catch (error) {
      throw error;
    }
  }

  static async updateAsset(assetId, assetData) {
    try {
      const asset = await Assets.findByPk(assetId);

      if (!asset) {
        const error = new Error("Aset tidak ditemukan");
        error.status = 404;
        throw error;
      }

      const dataToUpdate = {};
      if (assetData.name) dataToUpdate.name = assetData.name;
      if (assetData.sku) dataToUpdate.sku = assetData.sku;
      if (assetData.category_id)
        dataToUpdate.category_id = assetData.category_id;
      if (assetData.status) dataToUpdate.status = assetData.status;
      if (assetData.description !== undefined)
        dataToUpdate.description = assetData.description;

      // Handle image update
      if (assetData.image_url) {
        // Delete old image if exists
        if (asset.image_url) {
          const oldImagePath = path.join(process.cwd(), "src", asset.image_url);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        dataToUpdate.image_url = `/uploads/${assetData.image_url}`;
      }

      await asset.update(dataToUpdate);
      return asset;
    } catch (error) {
      throw error;
    }
  }

  static async deleteAsset(assetId) {
    try {
      const asset = await Assets.findByPk(assetId);

      if (!asset) {
        const error = new Error("Aset tidak ditemukan");
        error.status = 404;
        throw error;
      }

      // Delete image file
      if (asset.image_url) {
        const imagePath = path.join(process.cwd(), "src", asset.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await asset.destroy();
      return { message: "Aset berhasil dihapus" };
    } catch (error) {
      throw error;
    }
  }

  static async getAllAssetsAdmin(filter = {}) {
    try {
      const { category_id, status, page = 1, limit = 10 } = filter;
      const offset = (page - 1) * limit;

      const where = {};
      if (category_id) where.category_id = category_id;
      if (status) where.status = status;

      const { count, rows } = await Assets.findAndCountAll({
        where,
        include: [
          {
            model: Categories,
            as: "category",
            attributes: ["id", "name"],
          },
        ],
        offset,
        limit,
        order: [["id", "DESC"]],
      });

      const totalPages = Math.ceil(count / limit);

      return {
        data: rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // ====== CATEGORIES MANAGEMENT ======
  static async createCategory(categoryData) {
    try {
      const category = await Categories.create({
        name: categoryData.name,
        description: categoryData.description || null,
      });

      return category;
    } catch (error) {
      throw error;
    }
  }

  static async updateCategory(categoryId, categoryData) {
    try {
      const category = await Categories.findByPk(categoryId);

      if (!category) {
        const error = new Error("Kategori tidak ditemukan");
        error.status = 404;
        throw error;
      }

      const dataToUpdate = {};
      if (categoryData.name) dataToUpdate.name = categoryData.name;
      if (categoryData.description !== undefined)
        dataToUpdate.description = categoryData.description;

      await category.update(dataToUpdate);
      return category;
    } catch (error) {
      throw error;
    }
  }

  static async deleteCategory(categoryId) {
    try {
      const category = await Categories.findByPk(categoryId);

      if (!category) {
        const error = new Error("Kategori tidak ditemukan");
        error.status = 404;
        throw error;
      }

      await category.destroy();
      return { message: "Kategori berhasil dihapus" };
    } catch (error) {
      throw error;
    }
  }

  static async getAllCategories() {
    try {
      const categories = await Categories.findAll({
        order: [["id", "DESC"]],
      });

      return categories;
    } catch (error) {
      throw error;
    }
  }

  static async getCategoryById(categoryId) {
    try {
      const category = await Categories.findByPk(categoryId, {
        include: [
          {
            model: Assets,
            as: "assets",
            attributes: ["id", "name", "sku", "status"],
          },
        ],
      });

      if (!category) {
        const error = new Error("Kategori tidak ditemukan");
        error.status = 404;
        throw error;
      }

      return category;
    } catch (error) {
      throw error;
    }
  }

  // ====== USERS MANAGEMENT ======
  static async getAllUsersAdmin(filter = {}) {
    try {
      const { role, page = 1, limit = 10 } = filter;
      const offset = (page - 1) * limit;

      const where = {};
      if (role) where.role = role;

      const { count, rows } = await Users.findAndCountAll({
        where,
        attributes: { exclude: ["password"] },
        offset,
        limit,
        order: [["id", "DESC"]],
      });

      const totalPages = Math.ceil(count / limit);

      return {
        data: rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUserDetail(userId) {
    try {
      const user = await Users.findByPk(userId, {
        attributes: { exclude: ["password"] },
        include: [
          {
            model: Reservations,
            as: "reservations",
            attributes: ["id", "status", "start_date", "end_date"],
          },
        ],
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

  static async createUser(userData) {
    try {
      const { username, full_name, password, role } = userData;

      // Check if username already exists
      const existingUser = await Users.findOne({ where: { username } });
      if (existingUser) {
        const error = new Error("Username sudah digunakan");
        error.status = 409;
        throw error;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await Users.create({
        username,
        full_name,
        password: hashedPassword,
        role: role || "user",
      });

      // Return user without password
      const userResponse = user.toJSON();
      delete userResponse.password;
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  static async updateUser(userId, userData) {
    try {
      const user = await Users.findByPk(userId);

      if (!user) {
        const error = new Error("User tidak ditemukan");
        error.status = 404;
        throw error;
      }

      const dataToUpdate = {};

      if (userData.username) {
        // Check if new username is not already used by another user
        const existingUser = await Users.findOne({
          where: { username: userData.username, id: { [Op.ne]: userId } },
        });
        if (existingUser) {
          const error = new Error("Username sudah digunakan");
          error.status = 409;
          throw error;
        }
        dataToUpdate.username = userData.username;
      }

      if (userData.full_name) dataToUpdate.full_name = userData.full_name;
      if (userData.role) dataToUpdate.role = userData.role;

      await user.update(dataToUpdate);

      // Return user without password
      const userResponse = user.toJSON();
      delete userResponse.password;
      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(userId) {
    try {
      const user = await Users.findByPk(userId);

      if (!user) {
        const error = new Error("User tidak ditemukan");
        error.status = 404;
        throw error;
      }

      // Delete associated reservations first (optional - depends on your business logic)
      // await user.destroy({ cascade: true });

      await user.destroy();
      return { message: "User berhasil dihapus" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AdminService;
