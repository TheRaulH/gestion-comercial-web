// routes/productoRoutes.js
const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController");
const {
  verificarToken,
  esAdministrador,
} = require("../middlewares/authMiddleware");

// Rutas públicas
router.get("/", productoController.obtenerTodos);
router.get("/activos", productoController.obtenerActivos);
router.get("/buscar", productoController.buscarPorNombre);
router.get("/tipo/:id_tipo", productoController.obtenerPorTipo);
router.get("/:id", productoController.obtenerPorId);

// Rutas protegidas - solo administrador
router.post("/", verificarToken, esAdministrador, productoController.crear);
router.put(
  "/:id",
  verificarToken,
  esAdministrador,
  productoController.actualizar
);
router.put(
  "/:id/stock",
  verificarToken,
  esAdministrador,
  productoController.actualizarStock
);
router.delete(
  "/:id",
  verificarToken,
  esAdministrador,
  productoController.eliminar
);
router.put(
  "/:id/desactivar",
  verificarToken,
  esAdministrador,
  productoController.desactivar
);

module.exports = router;
