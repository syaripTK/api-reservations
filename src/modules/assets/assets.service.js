const { Assets, Categories } = require("../../db/models");
const { Op } = require("sequelize");

class AssetsService {
  static async getAllAssets(filter = {}) {
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

  static async getAssetById(id) {
    try {
      const asset = await Assets.findByPk(id, {
        include: [
          {
            model: Categories,
            as: "category",
            attributes: ["id", "name", "description"],
          },
        ],
      });

      if (!asset) {
        const error = new Error("Aset tidak ditemukan");
        error.status = 404;
        throw error;
      }

      return asset;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = AssetsService;
