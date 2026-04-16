const notFound = (req, res, next) => {
  const error = new Error("Maaf, halaman tidak ditemukan");
  error.status = 404;
  next(error);
};
module.exports = notFound;
