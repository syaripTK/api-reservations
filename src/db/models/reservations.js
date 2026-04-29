"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Reservations extends Model {
    
    static associate(models) {
      
      Reservations.belongsTo(models.Users, {
        foreignKey: "user_id",
        as: "user",
      });

      Reservations.belongsTo(models.Assets, {
        foreignKey: "asset_id",
        as: "asset",
      });
    }
  }
  Reservations.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      asset_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected", "returned"),
        defaultValue: "pending",
      },
      reject_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      request_date: {
        type: DataTypes.DATE,
        defaultValue: Date.now,
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Date.now,
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Reservations",
      tableName: "Reservations",
      timestamps: true,
    },
  );
  return Reservations;
};
