// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { testConnection } = require("./config/db");

// Cargar variables de entorno
dotenv.config({ path: "./.env" });

// Inicializar Express
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
//permitir el cors para localhost:3000
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// Probar conexión a la base de datos
testConnection();

// Importar rutas
const usuarioRoutes = require("./routes/usuarioRoutes");

// Definir rutas
app.get("/", (req, res) => {
  res.send("¡Backend de gestión comercial funcionando!");
});

// Usar rutas de la API
app.use("/api/usuarios", usuarioRoutes);

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: "Error interno del servidor" });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});
