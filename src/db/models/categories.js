'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categories extends Model {
    
    static associate(models) {
      
      Categories.hasMany(models.Assets, {
        foreignKey: "category_id",
        as: "assets",
      });
    }
  }
  Categories.init({
    id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      name: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
  }, {
    sequelize,
    modelName: 'Categories',
    tableName: 'categories',
  });
  return Categories;
};