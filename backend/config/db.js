// config/db.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gestioncomercial",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Función para obtener una conexión sin especificar la base de datos
// útil para crear la BD si no existe
async function getRawConnection() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });
  return connection;
}

// Función para probar la conexión
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Conexión a la base de datos exitosa");
    connection.release();
    return true;
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error.message);
    return false;
  }
}

module.exports = {
  pool,
  getRawConnection,
  testConnection,
};
