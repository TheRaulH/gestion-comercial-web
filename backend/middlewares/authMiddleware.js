// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuarioModel");

// Middleware para verificar token JWT
function verificarToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res
      .status(401)
      .json({ mensaje: "Acceso denegado. Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
}

// Middleware para verificar si el usuario es administrador
async function esAdministrador(req, res, next) {
  try {
    if (!req.usuario) {
      return res.status(401).json({ mensaje: "Usuario no autenticado" });
    }

    const usuario = await Usuario.obtenerPorId(req.usuario.id);

    if (!usuario || !usuario.es_administrador) {
      return res
        .status(403)
        .json({
          mensaje: "Acceso denegado. Se requieren permisos de administrador",
        });
    }

    next();
  } catch (error) {
    console.error("Error en middleware de administrador:", error);
    res.status(500).json({ mensaje: "Error al verificar permisos" });
  }
}

module.exports = {
  verificarToken,
  esAdministrador,
};
