const express = require("express");
const { body, param } = require("express-validator");
const { Sequelize, Op } = require("sequelize");
const { Reservations, Assets, Users, sequelize } = require("../db/models");
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

// User Dashboard: Get user statistics
router.get("/dashboard/user-stats", async (req, res, next) => {
  try {
    const user_id = req.user.id;

    // Get reservation statistics
    const reservationStats = await Reservations.findAll({
      where: { user_id },
      attributes: [
        "status",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
      ],
      group: ["status"],
    });

    // Get recent reservations
    const recentReservations = await Reservations.findAll({
      where: { user_id },
      include: [
        {
          association: "asset",
          attributes: ["id", "name", "sku"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // Transform stats to object
    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      returned: 0,
      total: 0,
    };

    reservationStats.forEach((stat) => {
      stats[stat.status] = parseInt(stat.dataValues.count);
      stats.total += parseInt(stat.dataValues.count);
    });

    return successResponse(
      res,
      200,
      "Statistik dashboard user berhasil diambil",
      {
        stats,
        recentReservations,
      },
    );
  } catch (error) {
    next(error);
  }
});

// User Dashboard: Get user reservation summary
router.get("/dashboard/user-summary", async (req, res, next) => {
  try {
    const user_id = req.user.id;

    // Get summary data
    const totalReservations = await Reservations.count({
      where: { user_id },
    });

    const approvedReservations = await Reservations.count({
      where: { user_id, status: "approved" },
    });

    const pendingReservations = await Reservations.count({
      where: { user_id, status: "pending" },
    });

    const returnedReservations = await Reservations.count({
      where: { user_id, status: "returned" },
    });

    const rejectedReservations = await Reservations.count({
      where: { user_id, status: "rejected" },
    });

    // Get active reservations (approved but not returned)
    const activeReservations = await Reservations.findAll({
      where: {
        user_id,
        status: "approved",
      },
      include: [
        {
          association: "asset",
          attributes: ["id", "name", "sku"],
        },
      ],
      order: [["end_date", "ASC"]],
    });

    return successResponse(
      res,
      200,
      "Ringkasan dashboard user berhasil diambil",
      {
        totalReservations,
        approvedReservations,
        pendingReservations,
        returnedReservations,
        rejectedReservations,
        activeReservations,
      },
    );
  } catch (error) {
    next(error);
  }
});

// Admin Dashboard: Get overall statistics
router.get(
  "/dashboard/admin-stats",
  verifyToken(["admin"]),
  async (req, res, next) => {
    try {
      // Get reservation statistics by status
      const reservationStats = await Reservations.findAll({
        attributes: [
          "status",
          [Sequelize.fn("COUNT", Sequelize.col("id")), "count"],
        ],
        group: ["status"],
      });

      // Get total counts
      const totalReservations = await Reservations.count();
      const totalUsers = await Users.count();

      // Transform stats to object
      const stats = {
        total: totalReservations,
        pending: 0,
        approved: 0,
        rejected: 0,
        returned: 0,
        totalUsers,
      };

      reservationStats.forEach((stat) => {
        stats[stat.status] = parseInt(stat.dataValues.count);
      });

      // Get recent reservations
      const recentReservations = await Reservations.findAll({
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
        order: [["createdAt", "DESC"]],
        limit: 10,
      });

      return successResponse(
        res,
        200,
        "Statistik dashboard admin berhasil diambil",
        {
          stats,
          recentReservations,
        },
      );
    } catch (error) {
      next(error);
    }
  },
);

// Admin Dashboard: Get summary and insights
router.get(
  "/dashboard/admin-summary",
  verifyToken(["admin"]),
  async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const where = {};

      // Add date filter if provided
      if (startDate || endDate) {
        where.created_at = {};
        if (startDate) {
          where.created_at[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.created_at[Op.lte] = new Date(endDate);
        }
      }

      // Get pending reservations
      const pendingReservations = await Reservations.findAll({
        where: { ...where, status: "pending" },
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
        order: [["createdAt", "DESC"]],
      });

      // Get approval rate
      const totalReservations = await Reservations.count({ where });
      const approvedCount = await Reservations.count({
        where: { ...where, status: "approved" },
      });
      const rejectedCount = await Reservations.count({
        where: { ...where, status: "rejected" },
      });

      const approvalRate =
        totalReservations > 0
          ? Math.round((approvedCount / totalReservations) * 100)
          : 0;

      // Get active reservations (approved and not returned)
      const activeReservations = await Reservations.findAll({
        where: { status: "approved" },
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
        order: [["end_date", "ASC"]],
      });

      // Get overdue reservations (approved with end_date passed)
      const now = new Date();
      const overdueReservations = await Reservations.findAll({
        where: {
          status: "approved",
          end_date: {
            [Op.lt]: now,
          },
        },
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
      });

      // Get user activity (top users by reservation count)
      const userActivity = await Users.findAll({
        attributes: [
          "id",
          "username",
          "full_name",
          [
            Sequelize.fn("COUNT", Sequelize.col("reservations.id")),
            "reservationCount",
          ],
        ],
        include: [
          {
            association: "reservations",
            attributes: [],
          },
        ],
        group: ["users.id"],
        subQuery: false,
        order: [
          [Sequelize.fn("COUNT", Sequelize.col("reservations.id")), "DESC"],
        ],
        limit: 10,
      });

      return successResponse(
        res,
        200,
        "Ringkasan dashboard admin berhasil diambil",
        {
          summary: {
            totalReservations,
            approvedCount,
            rejectedCount,
            approvalRate: `${approvalRate}%`,
            pendingCount: pendingReservations.length,
            activeCount: activeReservations.length,
            overdueCount: overdueReservations.length,
          },
          pendingReservations,
          activeReservations,
          overdueReservations,
          userActivity,
        },
      );
    } catch (error) {
      next(error);
    }
  },
);

// Get reservation detail
router.get(
  "/:id",
  verifyToken(),
  [param("id").isInt().withMessage("ID harus berupa angka")],
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const reservationId = parseInt(id);

      const reservation = await Reservations.findByPk(reservationId, {
        include: [
          {
            association: "user",
            attributes: ["id", "username", "full_name"],
          },
          {
            association: "asset",
            attributes: ["id", "name", "sku", "status"],
          },
        ],
      });

      if (!reservation) {
        return errorResponse(res, 404, "Peminjaman tidak ditemukan");
      }

      return successResponse(
        res,
        200,
        "Detail peminjaman berhasil diambil",
        reservation,
      );
    } catch (error) {
      next(error);
    }
  },
);

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
  [
    param("id").isInt().withMessage("ID harus berupa angka"),
    body("reject_reason")
      .trim()
      .notEmpty()
      .withMessage("Alasan penolakan harus diisi"),
  ],
  validate,
  async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { reject_reason } = req.body;

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

      // Update reservation status and reject reason
      await reservation.update(
        { status: "rejected", reject_reason },
        { transaction },
      );

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

// User: Cancel pending reservation
router.delete(
  "/:id/cancel",
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

      // Check if user is authorized (owner)
      if (reservation.user_id !== user_id) {
        await transaction.rollback();
        return errorResponse(
          res,
          403,
          "Anda hanya bisa membatalkan peminjaman milik Anda sendiri",
        );
      }

      if (reservation.status !== "pending") {
        await transaction.rollback();
        return errorResponse(
          res,
          400,
          "Hanya peminjaman dengan status pending yang bisa dibatalkan",
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
        "Permintaan peminjaman berhasil dibatalkan",
        reservation,
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  },
);
module.exports = router;
