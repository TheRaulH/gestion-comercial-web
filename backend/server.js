// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { testConnection } = require("./config/db");
const { inicializarBaseDeDatos } = require("./config/dbInit");

// Cargar variables de entorno
dotenv.config({ path: "./.env" });

// Inicializar Express
const app = express();
const port = process.env.PORT || 5000;

// Middleware
// Middleware
const corsOptions = {
  origin: "http://localhost:5173", // Especifica el origen permitido
  credentials: true, // Permite el envío de cookies y encabezados de autorización
};
app.use(cors(corsOptions));

app.use(express.json());

// Inicializar base de datos
async function iniciarServidor() {
  // Inicializar la base de datos
  const dbInicializada = await inicializarBaseDeDatos();
  if (!dbInicializada) {
    console.error(
      "Error al inicializar la base de datos. Deteniendo servidor."
    );
    process.exit(1);
  }

  // Probar conexión a la base de datos
  const conexionExitosa = await testConnection();
  if (!conexionExitosa) {
    console.error("Error al conectar a la base de datos. Deteniendo servidor.");
    process.exit(1);
  }

  // Importar rutas
  const usuarioRoutes = require("./routes/usuarioRoutes");
  const arqueoRoutes = require("./routes/arqueoRoutes");
      const tipoProductoRoutes = require("./routes/tipoProductoRoutes");
      const productoRoutes = require("./routes/productoRoutes");
      const movimientoInventarioRoutes = require("./routes/movimientoInventarioRoutes");
      const pedidoRoutes = require("./routes/pedidoRoutes");
      const detallePedidoRoutes = require("./routes/detallePedidoRoutes");
      const movimientoCajaRoutes = require("./routes/movimientoCajaRoutes");

      // Definir rutas
      app.get("/", (req, res) => {
        res.send("¡Backend de gestión comercial funcionando!");
      });

      // Usar rutas de la API
      app.use("/api/usuarios", usuarioRoutes);
      app.use("/api/arqueos", arqueoRoutes);
      app.use("/api/tipos-producto", tipoProductoRoutes);
      app.use("/api/productos", productoRoutes);
      app.use("/api/inventario/movimientos", movimientoInventarioRoutes);
      app.use("/api/pedidos", pedidoRoutes);
      app.use("/api/detalle-pedidos", detallePedidoRoutes);
      app.use("/api/movimientos-caja", movimientoCajaRoutes);



  // Middleware para manejo de errores
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  });

  // Iniciar servidor
  app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
  });
}

// Iniciar servidor
iniciarServidor();