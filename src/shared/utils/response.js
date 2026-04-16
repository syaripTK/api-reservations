const errorResponse = (res, code, message, errors) => {
  return res.status(code).json({
    status: "error",
    message,
    errors
  });
};

const successResponse = (res, code, message, data) => {
  return res.status(code).json({
    status: "success",
    message,
    data,
  });
};

const loginResponse = (res, code, message, token, user) => {
  return res.status(code).json({
    status: "success",
    message,
    token,
    user,
  });
};

module.exports = {
  successResponse,
  errorResponse,
  loginResponse,
};
