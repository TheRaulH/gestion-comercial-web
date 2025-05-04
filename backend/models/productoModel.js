// models/productoModel.js
const { pool } = require("../config/db");

class Producto {
  // Crear un nuevo producto
  static async crear(productoData) {
    try {
      const {
        nombre,
        descripcion,
        precio,
        stock_actual,
        id_tipo_producto,
        activo,
      } = productoData;

      const [result] = await pool.execute(
        "INSERT INTO productos (nombre, descripcion, precio, stock_actual, id_tipo_producto, activo) VALUES (?, ?, ?, ?, ?, ?)",
        [
          nombre,
          descripcion,
          precio,
          stock_actual || 0,
          id_tipo_producto,
          activo === undefined ? 1 : activo,
        ]
      );

      return { id_producto: result.insertId, ...productoData };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los productos
  static async obtenerTodos() {
    try {
      const [productos] = await pool.query(`
        SELECT p.*, t.nombre as tipo_producto 
        FROM productos p
        JOIN tipos_producto t ON p.id_tipo_producto = t.id_tipo_producto
        ORDER BY p.nombre
      `);
      return productos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener productos activos
  static async obtenerActivos() {
    try {
      const [productos] = await pool.query(`
        SELECT p.*, t.nombre as tipo_producto 
        FROM productos p
        JOIN tipos_producto t ON p.id_tipo_producto = t.id_tipo_producto
        WHERE p.activo = 1
        ORDER BY p.nombre
      `);
      return productos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener productos por tipo
  static async obtenerPorTipo(id_tipo_producto) {
    try {
      const [productos] = await pool.execute(
        `
        SELECT p.*, t.nombre as tipo_producto 
        FROM productos p
        JOIN tipos_producto t ON p.id_tipo_producto = t.id_tipo_producto
        WHERE p.id_tipo_producto = ?
        ORDER BY p.nombre
      `,
        [id_tipo_producto]
      );

      return productos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener producto por ID
  static async obtenerPorId(id) {
    try {
      const [productos] = await pool.execute(
        `
        SELECT p.*, t.nombre as tipo_producto 
        FROM productos p
        JOIN tipos_producto t ON p.id_tipo_producto = t.id_tipo_producto
        WHERE p.id_producto = ?
      `,
        [id]
      );

      return productos.length ? productos[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar productos por nombre
  static async buscarPorNombre(texto) {
    try {
      const [productos] = await pool.execute(
        `
        SELECT p.*, t.nombre as tipo_producto 
        FROM productos p
        JOIN tipos_producto t ON p.id_tipo_producto = t.id_tipo_producto
        WHERE p.nombre LIKE ?
        ORDER BY p.nombre
      `,
        [`%${texto}%`]
      );

      return productos;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar producto
  static async actualizar(id, productoData) {
    try {
      const {
        nombre,
        descripcion,
        precio,
        stock_actual,
        id_tipo_producto,
        activo,
      } = productoData;

      const [result] = await pool.execute(
        "UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock_actual = ?, id_tipo_producto = ?, activo = ? WHERE id_producto = ?",
        [
          nombre,
          descripcion,
          precio,
          stock_actual,
          id_tipo_producto,
          activo,
          id,
        ]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar stock
  static async actualizarStock(id, cantidad) {
    try {
      const [result] = await pool.execute(
        "UPDATE productos SET stock_actual = stock_actual + ? WHERE id_producto = ?",
        [cantidad, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar producto
  static async eliminar(id) {
    try {
      // Aquí podrías verificar si hay pedidos u otras relaciones con este producto
      // antes de eliminarlo, similar a como se hace en el modelo de ArqueoCaja

      const [result] = await pool.execute(
        "DELETE FROM productos WHERE id_producto = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Desactivar producto (alternativa a eliminar)
  static async desactivar(id) {
    try {
      const [result] = await pool.execute(
        "UPDATE productos SET activo = 0 WHERE id_producto = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Producto;
