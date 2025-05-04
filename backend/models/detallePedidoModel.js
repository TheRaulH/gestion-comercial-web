const { pool } = require("../config/db");

class DetallePedido {
  static async crear(detalleData) {
    try {
      const { id_pedido, id_producto, cantidad, precio_unitario } = detalleData;
      const [result] = await pool.execute(
        "INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [id_pedido, id_producto, cantidad, precio_unitario]
      );
      return {
        id_detalle: result.insertId,
        id_pedido,
        id_producto,
        cantidad,
        precio_unitario,
      };
    } catch (error) {
      throw error;
    }
  }

  static async obtenerTodos() {
    try {
      const [detalles] = await pool.query("SELECT * FROM detalle_pedidos");
      return detalles;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorId(id) {
    try {
      const [detalles] = await pool.execute(
        "SELECT * FROM detalle_pedidos WHERE id_detalle = ?",
        [id]
      );
      return detalles.length ? detalles[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorPedido(id_pedido) {
    try {
      const [detalles] = await pool.execute(
        "SELECT * FROM detalle_pedidos WHERE id_pedido = ?",
        [id_pedido]
      );
      return detalles;
    } catch (error) {
      throw error;
    }
  }

  static async actualizar(id, detalleData) {
    try {
      const { id_pedido, id_producto, cantidad, precio_unitario } = detalleData;
      const [result] = await pool.execute(
        "UPDATE detalle_pedidos SET id_pedido = ?, id_producto = ?, cantidad = ?, precio_unitario = ? WHERE id_detalle = ?",
        [id_pedido, id_producto, cantidad, precio_unitario, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async eliminar(id) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM detalle_pedidos WHERE id_detalle = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DetallePedido;
