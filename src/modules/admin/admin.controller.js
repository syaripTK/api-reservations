const AdminService = require("./admin.service");
const { successResponse } = require("../../shared/utils/response");

class AdminController {
  // ====== ASSETS CONTROLLER ======
  static async createAsset(req, res, next) {
    try {
      const assetData = {
        name: req.body.name,
        sku: req.body.sku,
        category_id: req.body.category_id,
        description: req.body.description,
        image_url: req.file?.filename || null,
      };

      const asset = await AdminService.createAsset(assetData);

      return successResponse(res, 201, "Aset berhasil dibuat", asset);
    } catch (error) {
      if (req.file) {
        const fs = require("fs");
        const path = require("path");
        const filePath = path.join(
          process.cwd(),
          "src",
          "uploads",
          req.file.filename,
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      next(error);
    }
  }

  static async updateAsset(req, res, next) {
    try {
      const { id } = req.params;
      const assetData = {
        name: req.body.name,
        sku: req.body.sku,
        category_id: req.body.category_id,
        status: req.body.status,
        description: req.body.description,
        image_url: req.file?.filename || null,
      };

      const asset = await AdminService.updateAsset(parseInt(id), assetData);

      return successResponse(res, 200, "Aset berhasil diperbarui", asset);
    } catch (error) {
      if (req.file) {
        const fs = require("fs");
        const path = require("path");
        const filePath = path.join(
          process.cwd(),
          "src",
          "uploads",
          req.file.filename,
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      next(error);
    }
  }

  static async deleteAsset(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteAsset(parseInt(id));

      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async getAllAssets(req, res, next) {
    try {
      const { category_id, status, page, limit } = req.query;

      const filter = {
        category_id: category_id ? parseInt(category_id) : undefined,
        status: status || undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };

      const result = await AdminService.getAllAssetsAdmin(filter);

      return successResponse(
        res,
        200,
        "Daftar aset berhasil diambil",
        result.data,
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAssetDetail(req, res, next) {
    try {
      const { id } = req.params;
      const asset = await AdminService.getAssetById(parseInt(id));

      return successResponse(res, 200, "Detail aset berhasil diambil", asset);
    } catch (error) {
      next(error);
    }
  }

  // ====== CATEGORIES CONTROLLER ======
  static async createCategory(req, res, next) {
    try {
      const categoryData = {
        name: req.body.name,
        description: req.body.description,
      };

      const category = await AdminService.createCategory(categoryData);

      return successResponse(res, 201, "Kategori berhasil dibuat", category);
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const categoryData = {
        name: req.body.name,
        description: req.body.description,
      };

      const category = await AdminService.updateCategory(
        parseInt(id),
        categoryData,
      );

      return successResponse(
        res,
        200,
        "Kategori berhasil diperbarui",
        category,
      );
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteCategory(parseInt(id));

      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async getAllCategories(req, res, next) {
    try {
      const categories = await AdminService.getAllCategories();

      return successResponse(
        res,
        200,
        "Daftar kategori berhasil diambil",
        categories,
      );
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryDetail(req, res, next) {
    try {
      const { id } = req.params;
      const category = await AdminService.getCategoryById(parseInt(id));

      return successResponse(
        res,
        200,
        "Detail kategori berhasil diambil",
        category,
      );
    } catch (error) {
      next(error);
    }
  }

  // ====== USERS CONTROLLER ======
  static async getAllUsers(req, res, next) {
    try {
      const { role, page, limit } = req.query;

      const filter = {
        role: role || undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };

      const result = await AdminService.getAllUsersAdmin(filter);

      return successResponse(res, 200, "Daftar user berhasil diambil", result);
    } catch (error) {
      next(error);
    }
  }

  static async getUserDetail(req, res, next) {
    try {
      const { id } = req.params;
      const user = await AdminService.getUserDetail(parseInt(id));

      return successResponse(res, 200, "Detail user berhasil diambil", user);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req, res, next) {
    try {
      const userData = {
        username: req.body.username,
        full_name: req.body.full_name,
        password: req.body.password,
        role: req.body.role,
      };

      const user = await AdminService.createUser(userData);

      return successResponse(res, 201, "User berhasil dibuat", user);
    } catch (error) {
      next(error);
    }
  }

  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const userData = {
        username: req.body.username,
        full_name: req.body.full_name,
        role: req.body.role,
      };

      const user = await AdminService.updateUser(parseInt(id), userData);

      return successResponse(res, 200, "User berhasil diperbarui", user);
    } catch (error) {
      next(error);
    }
  }

  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;
      const result = await AdminService.deleteUser(parseInt(id));

      return successResponse(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
