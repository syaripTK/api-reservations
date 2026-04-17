"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require("bcrypt");

    const existing = await queryInterface.sequelize.query(
      "SELECT id FROM users WHERE username = 'admin' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    if (existing.length > 0) {
      return;
    }

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
    await queryInterface.bulkDelete("users", { username: "admin" }, {});
  },
};
