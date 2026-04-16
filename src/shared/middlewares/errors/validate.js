const { validationResult } = require("express-validator");
const fs = require("fs");
const path = require("path");

module.exports = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (req.file) {
        const filePath = path.join(
          process.cwd(),
          "src",
          "uploads",
          req.file.filename,
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      return res.status(400).json({
        status: "error",
        message: "Terjadi kesalahan",
        errors: errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        })),
      });
    }

    next();
  } catch (error) {
    console.error(error.message);
  }
};
