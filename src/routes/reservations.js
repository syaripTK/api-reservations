const express = require("express");
const { body, param } = require("express-validator");
const { Sequelize } = require("sequelize");
const { Reservations, Assets, sequelize } = require("../db/models");
const validate = require("../shared/middlewares/errors/validate");
const verifyToken = require("../shared/middlewares/auth.middleware");
const { successResponse, errorResponse } = require("../shared/utils/response");

const router = express.Router();

// Protect all reservation routes
router.use(verifyToken());

// Create reservation (with transaction)
router.post(
  "/",
  [
    body("asset_id").isInt().withMessage("Asset ID harus berupa angka"),
    body("start_date")
      .isISO8601()
      .withMessage("Start date harus format ISO8601"),
    body("end_date").isISO8601().withMessage("End date harus format ISO8601"),
  ],
  validate,
  async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
      const { asset_id, start_date, end_date } = req.body;
      const user_id = req.user.id;

      // Validasi input date
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (startDate >= endDate) {
        await transaction.rollback();
        return errorResponse(
          res,
          400,
          "Tanggal akhir harus lebih besar dari tanggal awal",
        );
      }

      // Check asset availability with lock
      const asset = await Assets.findByPk(asset_id, {
        transaction,
        lock: Sequelize.Transaction.LOCK.UPDATE,
      });

      if (!asset) {
        await transaction.rollback();
        return errorResponse(res, 404, "Aset tidak ditemukan");
      }

      if (asset.status !== "available") {
        await transaction.rollback();
        return errorResponse(
          res,
          400,
          "Aset sedang tidak tersedia untuk peminjaman",
        );
      }

      // Create reservation
      const reservation = await Reservations.create(
        {
          user_id,
          asset_id,
          status: "pending",
          start_date: startDate,
          end_date: endDate,
        },
        { transaction },
      );

      // Update asset status to booked
      await asset.update({ status: "booked" }, { transaction });

      // Commit transaction
      await transaction.commit();

      return successResponse(
        res,
        201,
        "Permintaan peminjaman berhasil dibuat. Menunggu persetujuan admin.",
        reservation,
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },
);

// Get my reservations
router.get("/my-reservations", async (req, res, next) => {
  try {
    const user_id = req.user.id;

    const reservations = await Reservations.findAll({
      where: { user_id },
      include: [
        {
          association: "asset",
          attributes: ["id", "name", "sku", "status"],
        },
      ],
      order: [["id", "DESC"]],
    });

    return successResponse(
      res,
      200,
      "Daftar peminjaman berhasil diambil",
      reservations,
    );
  } catch (error) {
    next(error);
  }
});

// Admin only: Get all reservations
router.get("/", verifyToken(["admin"]), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.status = status;

    const { count, rows } = await Reservations.findAndCountAll({
      where,
      include: [
        {
          association: "user",
          attributes: ["id", "username", "full_name"],
        },
        {
          association: "asset",
          attributes: ["id", "name", "sku"],
        },
      ],
      offset,
      limit,
      order: [["id", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    return successResponse(res, 200, "Daftar peminjaman berhasil diambil", {
      data: rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Admin only: Approve reservation
router.put(
  "/:id/approve",
  verifyToken(["admin"]),
  [param("id").isInt().withMessage("ID harus berupa angka")],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const reservation = await Reservations.findByPk(id);

      if (!reservation) {
        return errorResponse(res, 404, "Peminjaman tidak ditemukan");
      }

      if (reservation.status !== "pending") {
        return errorResponse(
          res,
          400,
          "Hanya peminjaman dengan status pending yang bisa disetujui",
        );
      }

      await reservation.update({ status: "approved" });

      return successResponse(
        res,
        200,
        "Peminjaman berhasil disetujui",
        reservation,
      );
    } catch (error) {
      next(error);
    }
  },
);

// Admin only: Reject reservation
router.put(
  "/:id/reject",
  verifyToken(["admin"]),
  [param("id").isInt().withMessage("ID harus berupa angka")],
  validate,
  async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;

      const reservation = await Reservations.findByPk(id, { transaction });

      if (!reservation) {
        await transaction.rollback();
        return errorResponse(res, 404, "Peminjaman tidak ditemukan");
      }

      if (reservation.status !== "pending") {
        await transaction.rollback();
        return errorResponse(
          res,
          400,
          "Hanya peminjaman dengan status pending yang bisa ditolak",
        );
      }

      // Update reservation status
      await reservation.update({ status: "rejected" }, { transaction });

      // Release asset back to available
      const asset = await Assets.findByPk(reservation.asset_id, {
        transaction,
      });
      if (asset) {
        await asset.update({ status: "available" }, { transaction });
      }

      await transaction.commit();

      return successResponse(
        res,
        200,
        "Peminjaman berhasil ditolak",
        reservation,
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },
);

// User/Admin: Return asset (mark as returned)
router.put(
  "/:id/return",
  [param("id").isInt().withMessage("ID harus berupa angka")],
  validate,
  async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const reservation = await Reservations.findByPk(id, { transaction });

      if (!reservation) {
        await transaction.rollback();
        return errorResponse(res, 404, "Peminjaman tidak ditemukan");
      }

      // Check if user is authorized (owner or admin)
      if (req.user.role !== "admin" && reservation.user_id !== user_id) {
        await transaction.rollback();
        return errorResponse(res, 403, "Anda tidak berhak untuk operasi ini");
      }

      if (reservation.status !== "approved") {
        await transaction.rollback();
        return errorResponse(
          res,
          400,
          "Hanya peminjaman yang approved bisa dikembalikan",
        );
      }

      // Update reservation status
      await reservation.update({ status: "returned" }, { transaction });

      // Release asset back to available
      const asset = await Assets.findByPk(reservation.asset_id, {
        transaction,
      });
      if (asset) {
        await asset.update({ status: "available" }, { transaction });
      }

      await transaction.commit();

      return successResponse(
        res,
        200,
        "Aset berhasil dikembalikan",
        reservation,
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },
);

module.exports = router;
