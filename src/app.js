process.env.TZ = "Asia/Jakarta";
const express = require("express");
const sequelize = require("./config/sequelize.js");
const path = require("path");
const cors = require("cors");
const notFound = require("./shared/middlewares/errors/notFound.js");
const errorHandler = require("./shared/middlewares/errors/errorHandler.js");
const apiRoutes = require("./routes");
const { loginLimiter } = require("./shared/middlewares/limit.js");

const app = express();



app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/api/v1/auth/login", loginLimiter);


app.use("/api", apiRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;
