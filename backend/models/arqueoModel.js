// models/arqueoModel.js
const { pool } = require("../config/db");

class ArqueoCaja {
  // Crear un nuevo arqueo de caja
  static async crear(arqueoData) {
    try {
      const { id_usuario, fecha_inicio, saldo_inicial } = arqueoData;

      // Verificar si hay un arqueo abierto para este usuario
      const arqueoAbierto = await this.obtenerArqueoAbiertoPorUsuario(
        id_usuario
      );
      if (arqueoAbierto) {
        throw new Error(
          "Ya existe un arqueo de caja abierto para este usuario"
        );
      }

      const [result] = await pool.execute(
        "INSERT INTO arqueos_caja (id_usuario, fecha_inicio, saldo_inicial) VALUES (?, ?, ?)",
        [id_usuario, fecha_inicio || new Date(), saldo_inicial]
      );

      return { id: result.insertId, ...arqueoData };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los arqueos de caja
  static async obtenerTodos() {
    try {
      const [arqueos] = await pool.query(`
        SELECT a.*, u.nombre as nombre_usuario 
        FROM arqueos_caja a
        JOIN usuarios u ON a.id_usuario = u.id_usuario
        ORDER BY a.fecha_inicio DESC
      `);
      return arqueos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener arqueos de caja por usuario
  static async obtenerPorUsuario(id_usuario) {
    try {
      const [arqueos] = await pool.execute(
        `
        SELECT * FROM arqueos_caja 
        WHERE id_usuario = ? 
        ORDER BY fecha_inicio DESC
      `,
        [id_usuario]
      );

      return arqueos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener arqueo de caja por ID
  static async obtenerPorId(id) {
    try {
      const [arqueos] = await pool.execute(
        `
        SELECT a.*, u.nombre as nombre_usuario 
        FROM arqueos_caja a
        JOIN usuarios u ON a.id_usuario = u.id_usuario
        WHERE a.id_arqueo = ?
      `,
        [id]
      );

      return arqueos.length ? arqueos[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener arqueos abiertos (sin fecha_fin)
  static async obtenerArqueosAbiertos() {
    try {
      const [arqueos] = await pool.query(`
        SELECT a.*, u.nombre as nombre_usuario 
        FROM arqueos_caja a
        JOIN usuarios u ON a.id_usuario = u.id_usuario
        WHERE a.fecha_fin IS NULL
      `);
      return arqueos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener arqueo abierto por usuario
  static async obtenerArqueoAbiertoPorUsuario(id_usuario) {
    try {
      const [arqueos] = await pool.execute(
        `
        SELECT * FROM arqueos_caja 
        WHERE id_usuario = ? AND fecha_fin IS NULL
      `,
        [id_usuario]
      );

      return arqueos.length ? arqueos[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Cerrar arqueo de caja
  static async cerrarArqueo(id, dataCierre) {
    try {
      const { fecha_fin, ingresos, egresos, saldo_final } = dataCierre;

      const [result] = await pool.execute(
        "UPDATE arqueos_caja SET fecha_fin = ?, ingresos = ?, egresos = ?, saldo_final = ? WHERE id_arqueo = ?",
        [fecha_fin || new Date(), ingresos, egresos, saldo_final, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar arqueo de caja
  static async actualizar(id, arqueoData) {
    try {
      const { saldo_inicial, ingresos, egresos } = arqueoData;

      const [result] = await pool.execute(
        "UPDATE arqueos_caja SET saldo_inicial = ?, ingresos = ?, egresos = ? WHERE id_arqueo = ?",
        [saldo_inicial, ingresos, egresos, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar arqueo de caja
  static async eliminar(id) {
    try {
      // Primero verificamos si hay registros relacionados
      const [movimientos] = await pool.execute(
        "SELECT COUNT(*) as count FROM movimientos_caja WHERE id_arqueo = ?",
        [id]
      );

      if (movimientos[0].count > 0) {
        throw new Error(
          "No se puede eliminar el arqueo porque tiene movimientos asociados"
        );
      }

      const [pedidos] = await pool.execute(
        "SELECT COUNT(*) as count FROM pedidos WHERE id_arqueo = ?",
        [id]
      );

      if (pedidos[0].count > 0) {
        throw new Error(
          "No se puede eliminar el arqueo porque tiene pedidos asociados"
        );
      }

      // Si no hay registros relacionados, procedemos a eliminar
      const [result] = await pool.execute(
        "DELETE FROM arqueos_caja WHERE id_arqueo = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ArqueoCaja;
