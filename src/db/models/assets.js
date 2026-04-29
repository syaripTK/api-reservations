"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Assets extends Model {
    
    static associate(models) {
      
      Assets.hasMany(models.Reservations, {
        foreignKey: "asset_id",
        as: "reservations",
      });

      Assets.belongsTo(models.Categories, {
        foreignKey: "category_id",
        as: "category",
      });
    }
  }
  Assets.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      sku: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      image_url: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("available", "booked", "maintenance"),
        defaultValue: "available",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Assets",
      tableName: "assets",
    },
  );
  return Assets;
};
