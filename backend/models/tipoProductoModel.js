// models/tipoProductoModel.js
const { pool } = require("../config/db");

class TipoProducto {
  // Crear un nuevo tipo de producto
  static async crear(tipoData) {
    try {
      const { nombre } = tipoData;

      const [result] = await pool.execute(
        "INSERT INTO tipos_producto (nombre) VALUES (?)",
        [nombre]
      );

      return { id_tipo_producto: result.insertId, ...tipoData };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los tipos de producto
  static async obtenerTodos() {
    try {
      const [tipos] = await pool.query(
        "SELECT * FROM tipos_producto ORDER BY nombre"
      );
      return tipos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener tipo de producto por ID
  static async obtenerPorId(id) {
    try {
      const [tipos] = await pool.execute(
        "SELECT * FROM tipos_producto WHERE id_tipo_producto = ?",
        [id]
      );

      return tipos.length ? tipos[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar tipo de producto
  static async actualizar(id, tipoData) {
    try {
      const { nombre } = tipoData;

      const [result] = await pool.execute(
        "UPDATE tipos_producto SET nombre = ? WHERE id_tipo_producto = ?",
        [nombre, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar tipo de producto
  static async eliminar(id) {
    try {
      // Primero verificamos si hay productos asociados a este tipo
      const [productos] = await pool.execute(
        "SELECT COUNT(*) as count FROM productos WHERE id_tipo_producto = ?",
        [id]
      );

      if (productos[0].count > 0) {
        throw new Error(
          "No se puede eliminar el tipo de producto porque tiene productos asociados"
        );
      }

      // Si no hay productos asociados, procedemos a eliminar
      const [result] = await pool.execute(
        "DELETE FROM tipos_producto WHERE id_tipo_producto = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TipoProducto;
