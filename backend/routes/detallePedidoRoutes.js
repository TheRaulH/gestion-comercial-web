const express = require("express");
const router = express.Router();
const detallePedidoController = require("../controllers/detallePedidoController");
const {
  verificarToken,
  esAdministrador,
} = require("../middlewares/authMiddleware"); // Si necesitas autenticación

// Rutas para todos los usuarios (si aplica)
router.get("/", detallePedidoController.obtenerDetalles);
router.get("/:id", detallePedidoController.obtenerDetallePorId);
router.get(
  "/pedido/:id_pedido",
  detallePedidoController.obtenerDetallesPorPedido
);
router.post("/", /* verificarToken, */ detallePedidoController.crearDetalle); // Protege la creación si es necesario
router.put(
  "/:id",
  /* verificarToken, */ detallePedidoController.actualizarDetalle
); // Protege la actualización si es necesario
router.delete(
  "/:id",
  /* verificarToken, */ detallePedidoController.eliminarDetalle
); // Protege la eliminación si es necesario

// Rutas que requieren autenticación de administrador (si aplica)
// router.delete("/:id", verificarToken, esAdministrador, detallePedidoController.eliminarDetalle);

module.exports = router;
