// models/movimientoInventarioModel.js
const { pool } = require("../config/db");

class MovimientoInventario {
  // Crear un nuevo movimiento de inventario
  static async crear(movimientoData) {
    try {
      const { id_producto, tipo_movimiento, cantidad, observaciones } =
        movimientoData;

      // La fecha se genera automáticamente como NOW() si no se proporciona
      const fecha = movimientoData.fecha || new Date();

      const [result] = await pool.execute(
        "INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, fecha, observaciones) VALUES (?, ?, ?, ?, ?)",
        [id_producto, tipo_movimiento, cantidad, fecha, observaciones]
      );

      return {
        id: result.insertId,
        id_producto,
        tipo_movimiento,
        cantidad,
        fecha,
        observaciones,
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los movimientos de inventario
  static async obtenerTodos() {
    try {
      const [movimientos] = await pool.query(`
        SELECT m.*, p.nombre as nombre_producto
        FROM movimientos_inventario m
        JOIN productos p ON m.id_producto = p.id_producto
        ORDER BY m.fecha DESC
      `);
      return movimientos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener movimiento por ID
  static async obtenerPorId(id) {
    try {
      const [movimientos] = await pool.execute(
        `
        SELECT m.*, p.nombre as nombre_producto
        FROM movimientos_inventario m
        JOIN productos p ON m.id_producto = p.id_producto
        WHERE m.id_movimiento = ?
      `,
        [id]
      );

      return movimientos.length ? movimientos[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener movimientos por producto
  static async obtenerPorProducto(idProducto) {
    try {
      const [movimientos] = await pool.execute(
        `
        SELECT m.*, p.nombre as nombre_producto
        FROM movimientos_inventario m
        JOIN productos p ON m.id_producto = p.id_producto
        WHERE m.id_producto = ?
        ORDER BY m.fecha DESC
      `,
        [idProducto]
      );

      return movimientos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener movimientos por tipo (Ingreso/Egreso)
  static async obtenerPorTipo(tipo) {
    try {
      const [movimientos] = await pool.execute(
        `
        SELECT m.*, p.nombre as nombre_producto
        FROM movimientos_inventario m
        JOIN productos p ON m.id_producto = p.id_producto
        WHERE m.tipo_movimiento = ?
        ORDER BY m.fecha DESC
      `,
        [tipo]
      );

      return movimientos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener movimientos por rango de fechas
  static async obtenerPorRangoFechas(fechaInicio, fechaFin) {
    try {
      const [movimientos] = await pool.execute(
        `
        SELECT m.*, p.nombre as nombre_producto
        FROM movimientos_inventario m
        JOIN productos p ON m.id_producto = p.id_producto
        WHERE m.fecha BETWEEN ? AND ?
        ORDER BY m.fecha DESC
      `,
        [fechaInicio, fechaFin]
      );

      return movimientos;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar un movimiento de inventario
  static async actualizar(id, movimientoData) {
    try {
      const { id_producto, tipo_movimiento, cantidad, fecha, observaciones } =
        movimientoData;

      const [result] = await pool.execute(
        "UPDATE movimientos_inventario SET id_producto = ?, tipo_movimiento = ?, cantidad = ?, fecha = ?, observaciones = ? WHERE id_movimiento = ?",
        [id_producto, tipo_movimiento, cantidad, fecha, observaciones, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar un movimiento de inventario
  static async eliminar(id) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM movimientos_inventario WHERE id_movimiento = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener el balance actual de stock para un producto
  static async obtenerBalanceProducto(idProducto) {
    try {
      const [result] = await pool.execute(
        `
        SELECT 
          SUM(CASE WHEN tipo_movimiento = 'Ingreso' THEN cantidad ELSE 0 END) as total_ingresos,
          SUM(CASE WHEN tipo_movimiento = 'Egreso' THEN cantidad ELSE 0 END) as total_egresos,
          SUM(CASE WHEN tipo_movimiento = 'Ingreso' THEN cantidad ELSE -cantidad END) as balance
        FROM movimientos_inventario
        WHERE id_producto = ?
      `,
        [idProducto]
      );

      return result[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MovimientoInventario;
