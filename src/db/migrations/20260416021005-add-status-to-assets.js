"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("assets", "status", {
      type: Sequelize.ENUM("available", "booked", "maintenance"),
      defaultValue: "available",
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("assets", "status");
  },
};
