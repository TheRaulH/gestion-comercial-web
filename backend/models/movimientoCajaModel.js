const { pool } = require("../config/db");

class MovimientoCaja {
  static async crear(movimientoData) {
    try {
      const { id_arqueo, tipo, monto, descripcion, fecha } = movimientoData;
      const [result] = await pool.execute(
        "INSERT INTO movimientos_caja (id_arqueo, tipo, monto, descripcion, fecha) VALUES (?, ?, ?, ?, ?)",
        [id_arqueo, tipo, monto, descripcion, fecha]
      );
      return {
        id_movimiento: result.insertId,
        id_arqueo,
        tipo,
        monto,
        descripcion,
        fecha,
      };
    } catch (error) {
      throw error;
    }
  }

  static async obtenerTodos() {
    try {
      const [movimientos] = await pool.query("SELECT * FROM movimientos_caja");
      return movimientos;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorId(id) {
    try {
      const [movimientos] = await pool.execute(
        "SELECT * FROM movimientos_caja WHERE id_movimiento = ?",
        [id]
      );
      return movimientos.length ? movimientos[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async obtenerPorArqueo(id_arqueo) {
    try {
      const [movimientos] = await pool.execute(
        "SELECT * FROM movimientos_caja WHERE id_arqueo = ?",
        [id_arqueo]
      );
      return movimientos;
    } catch (error) {
      throw error;
    }
  }

  static async actualizar(id, movimientoData) {
    try {
      const { id_arqueo, tipo, monto, descripcion, fecha } = movimientoData;
      const [result] = await pool.execute(
        "UPDATE movimientos_caja SET id_arqueo = ?, tipo = ?, monto = ?, descripcion = ?, fecha = ? WHERE id_movimiento = ?",
        [id_arqueo, tipo, monto, descripcion, fecha, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async eliminar(id) {
    try {
      const [result] = await pool.execute(
        "DELETE FROM movimientos_caja WHERE id_movimiento = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MovimientoCaja;
