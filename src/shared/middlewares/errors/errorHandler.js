const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const message = err.message || "Internal server error";

  return res.status(statusCode).json({
    status: "error",
    message,
    ...(process.env.NODE_ENV === "development" && { error: err.stack }),
  });
};

module.exports = errorHandler;
