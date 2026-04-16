const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRED },
  );
};
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (input, hashed) => {
  return await bcrypt.compare(input, hashed);
};

const hitungHariCuti = (mulai, selesai) => {
  const start = new Date(mulai);
  const end = new Date(selesai);

  const diffTime = end - start;
  const diffDay = diffTime / (1000 * 60 * 60 * 24);

  return diffDay + 1;
};

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  hitungHariCuti,
};
