// routes/tipoProductoRoutes.js
const express = require("express");
const router = express.Router();
const tipoProductoController = require("../controllers/tipoProductoController");
const {
  verificarToken,
  esAdministrador,
} = require("../middlewares/authMiddleware");

// Rutas públicas
router.get("/", tipoProductoController.obtenerTodos);
router.get("/:id", tipoProductoController.obtenerPorId);

// Rutas protegidas - solo administrador
router.post("/", verificarToken, esAdministrador, tipoProductoController.crear);
router.put(
  "/:id",
  verificarToken,
  esAdministrador,
  tipoProductoController.actualizar
);
router.delete(
  "/:id",
  verificarToken,
  esAdministrador,
  tipoProductoController.eliminar
);

module.exports = router;
