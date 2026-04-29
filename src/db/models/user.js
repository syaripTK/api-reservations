"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    
    static associate(models) {
      
      User.hasMany(models.Reservations, {
        foreignKey: "user_id",
        as: "reservations",
      });
    }
  }
  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING(50),
        unique: true,
      },
      full_name: {
        type: DataTypes.STRING(50),
      },
      password: {
        type: DataTypes.STRING,
      },
      role: {
        type: DataTypes.ENUM("admin", "user"),
        defaultValue: "user",
      },
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "users",
    },
  );
  return User;
};
