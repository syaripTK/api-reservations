const { Sequelize } = require("sequelize");
const config = require("./database.js").development;

console.log({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
});

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false,
  },
);

module.exports = sequelize;
