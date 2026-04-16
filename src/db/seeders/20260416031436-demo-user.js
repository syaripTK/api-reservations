"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require("bcrypt");
    const hashed = await bcrypt.hash("admin123", 10);
    await queryInterface.bulkInsert(
      "users",
      [
        {
          id: 1,
          username: "admin",
          full_name: "administrator",
          password: hashed,
          role: "admin",
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
