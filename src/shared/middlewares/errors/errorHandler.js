const { ValidationError, UniqueConstraintError } = require("sequelize");

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${err.name}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Sequelize UniqueConstraintError — duplicate value on a unique field
  if (err instanceof UniqueConstraintError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: `${e.path} sudah digunakan`,
    }));
    return res.status(409).json({
      status: "error",
      message: "Data sudah ada",
      errors,
    });
  }

  // Sequelize ValidationError — model-level validation failures
  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(422).json({
      status: "error",
      message: "Validation error",
      errors,
    });
  }

  // Errors with a pre-attached errors array (e.g. from the service layer)
  const statusCode = err.status || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    status: "error",
    message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
