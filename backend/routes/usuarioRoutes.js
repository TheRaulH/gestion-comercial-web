// routes/usuarioRoutes.js
const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const {
  verificarToken,
  esAdministrador,
} = require("../middlewares/authMiddleware");

// Rutas públicas
router.post("/registro", usuarioController.registrar);
router.post("/login", usuarioController.login);

// Rutas protegidas - requieren autenticación
router.get("/perfil", verificarToken, usuarioController.obtenerPerfil);
router.put("/perfil", verificarToken, usuarioController.actualizarPerfil);
router.put(
  "/cambiar-password",
  verificarToken,
  usuarioController.cambiarPassword
);

// Rutas de administrador
router.get(
  "/",
  verificarToken,
  esAdministrador,
  usuarioController.obtenerTodos
);
router.put(
  "/:id",
  verificarToken,
  esAdministrador,
  usuarioController.gestionarUsuario
);
router.delete(
  "/:id",
  verificarToken,
  esAdministrador,
  usuarioController.eliminarUsuario
);

module.exports = router;
