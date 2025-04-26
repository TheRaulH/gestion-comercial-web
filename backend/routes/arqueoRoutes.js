// routes/arqueoRoutes.js
const express = require("express");
const router = express.Router();
const arqueoController = require("../controllers/arqueoController");
const {
  verificarToken,
  esAdministrador,
} = require("../middlewares/authMiddleware");

// Rutas protegidas - requieren autenticación
router.post("/", verificarToken, arqueoController.crear);
router.get("/usuario", verificarToken, arqueoController.obtenerPorUsuario);
router.get("/abierto", verificarToken, arqueoController.obtenerArqueoAbierto);
router.get("/:id", verificarToken, arqueoController.obtenerPorId);
router.put("/:id/cerrar", verificarToken, arqueoController.cerrarArqueo);

// Rutas de administrador
router.get("/", verificarToken, esAdministrador, arqueoController.obtenerTodos);
router.get(
  "/admin/abiertos",
  verificarToken,
  esAdministrador,
  arqueoController.obtenerArqueosAbiertos
);
router.put(
  "/:id",
  verificarToken,
  esAdministrador,
  arqueoController.actualizarArqueo
);
router.delete(
  "/:id",
  verificarToken,
  esAdministrador,
  arqueoController.eliminarArqueo
);

module.exports = router;
