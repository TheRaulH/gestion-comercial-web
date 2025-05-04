const express = require("express");
const router = express.Router();
const movimientoCajaController = require("../controllers/movimientoCajaController");
const {
  verificarToken,
  esAdministrador,
} = require("../middlewares/authMiddleware"); // Si necesitas autenticación

// Rutas para todos los usuarios (si aplica)
router.get("/", movimientoCajaController.obtenerMovimientos);
router.get("/:id", movimientoCajaController.obtenerMovimientoPorId);
router.get(
  "/arqueo/:id_arqueo",
  movimientoCajaController.obtenerMovimientosPorArqueo
);
router.post(
  "/",
  /* verificarToken, */ movimientoCajaController.crearMovimiento
); // Protege la creación si es necesario
router.put(
  "/:id",
  /* verificarToken, */ movimientoCajaController.actualizarMovimiento
); // Protege la actualización si es necesario
router.delete(
  "/:id",
  /* verificarToken, */ movimientoCajaController.eliminarMovimiento
); // Protege la eliminación si es necesario

// Rutas que requieren autenticación de administrador (si aplica)
// router.delete("/:id", verificarToken, esAdministrador, movimientoCajaController.eliminarMovimiento);

module.exports = router;
