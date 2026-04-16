const upload = require("../utils/multer.js");
const multer = require("multer");
const { errorResponse } = require("../utils/response.js");

const uploadPhoto = (fieldName) => (req, res, next) => {
  upload.single(fieldName)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return errorResponse(res, 400, "Terjadi kesalahan", [
        {
          field: fieldName,
          message: err.message,
        },
      ]);
    }

    if (err) {
      return errorResponse(res, 400, "Terjadi kesalahan", [
        {
          field: fieldName,
          message: err.message,
        },
      ]);
    }

    next();
  });
};

module.exports = uploadPhoto;
