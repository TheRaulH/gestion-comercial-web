const express = require("express");
const router = express.Router();
const pedidoController = require("../controllers/pedidoController");
const {
  verificarToken,
  esAdministrador,
} = require("../middlewares/authMiddleware");

// Rutas que requieren autenticación
router.use(verificarToken);

// Rutas para todos los usuarios autenticados
router.post("/", pedidoController.crearPedido);
router.get("/mis-pedidos", pedidoController.obtenerMisPedidos);
router.get("/:id", pedidoController.obtenerPedido);
router.put("/:id/cancelar", pedidoController.cancelarPedido);

// Rutas para administradores y personal autorizado
router.put("/:id/estado", esAdministrador, pedidoController.actualizarEstado);
router.get(
  "/arqueo/:id_arqueo",
  esAdministrador,
  pedidoController.obtenerPedidosPorArqueo
);
router.get(
  "/estado/:estado",
  esAdministrador,
  pedidoController.obtenerPedidosPorEstado
);

// Rutas exclusivas para administradores
router.get("/", esAdministrador, pedidoController.obtenerTodos);
router.put("/:id", esAdministrador, pedidoController.actualizarPedido);

module.exports = router;
