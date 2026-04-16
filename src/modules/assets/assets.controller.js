const AssetsService = require("./assets.service");
const { successResponse } = require("../../shared/utils/response");

class AssetsController {
  static async getAllAssets(req, res, next) {
    try {
      const { category_id, status, page, limit } = req.query;

      const filter = {
        category_id: category_id ? parseInt(category_id) : undefined,
        status: status || undefined,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };

      const result = await AssetsService.getAllAssets(filter);

      return successResponse(
        res,
        200,
        "Daftar aset berhasil diambil",
        result.data,
        result.pagination,
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAssetDetail(req, res, next) {
    try {
      const { id } = req.params;
      const asset = await AssetsService.getAssetById(parseInt(id));

      return successResponse(res, 200, "Detail aset berhasil diambil", asset);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AssetsController;
