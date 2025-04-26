// utils/passwordUtils.js
const bcrypt = require("bcrypt");

// Función para hashear contraseñas
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Función para comparar contraseñas
async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword,
};
