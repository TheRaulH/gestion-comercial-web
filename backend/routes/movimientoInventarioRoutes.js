// routes/movimientoInventarioRoutes.js
const express = require("express");
const router = express.Router();
const movimientoInventarioController = require("../controllers/movimientoInventarioController");
const {
  verificarToken,
  esAdministrador,
} = require("../middlewares/authMiddleware");

// Todos los endpoints requieren autenticación
router.use(verificarToken);

// Rutas accesibles para usuarios autenticados (administradores y operadores)
// Obtener todos los movimientos
router.get("/", movimientoInventarioController.obtenerTodos);

// Obtener un movimiento específico por ID
router.get("/:id", movimientoInventarioController.obtenerPorId);

// Obtener movimientos por producto
router.get(
  "/producto/:idProducto",
  movimientoInventarioController.obtenerPorProducto
);

// Obtener movimientos por tipo (Ingreso/Egreso)
router.get("/tipo/:tipo", movimientoInventarioController.obtenerPorTipo);

// Obtener movimientos por rango de fechas
router.get("/fechas", movimientoInventarioController.obtenerPorRangoFechas);

// Obtener balance de stock de un producto
router.get(
  "/balance/:idProducto",
  movimientoInventarioController.obtenerBalanceProducto
);

// Registrar nuevo movimiento (solo administradores pueden registrar)
router.post(
  "/",
  esAdministrador,
  movimientoInventarioController.registrarMovimiento
);

// Actualizar movimiento (solo administradores pueden actualizar)
router.put(
  "/:id",
  esAdministrador,
  movimientoInventarioController.actualizarMovimiento
);

// Eliminar movimiento (solo administradores pueden eliminar)
router.delete(
  "/:id",
  esAdministrador,
  movimientoInventarioController.eliminarMovimiento
);

module.exports = router;
