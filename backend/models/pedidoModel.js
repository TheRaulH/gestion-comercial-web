const { pool } = require("../config/db");

class Pedido {
  // Crear un nuevo pedido
  static async crear(pedidoData) {
    try {
      const {
        id_usuario,
        id_arqueo,
        total,
        forma_pago,
        estado = "Pendiente",
      } = pedidoData;
      const fecha_pedido = new Date(); // Fecha actual

      const values = [
        id_usuario,
        id_arqueo,
        fecha_pedido,
        total,
        forma_pago,
        estado,
      ];


      console.log("Valores para la consulta SQL:", values); // <--- AGREGAR ESTA LÍNEA

      const [result] = await pool.execute(
        "INSERT INTO pedidos (id_usuario, id_arqueo, fecha_pedido, total, forma_pago, estado) VALUES (?, ?, ?, ?, ?, ?)",
        [id_usuario, id_arqueo, fecha_pedido, total, forma_pago, estado]
      );

      return {
        id_pedido: result.insertId,
        id_usuario,
        id_arqueo,
        fecha_pedido,
        total,
        forma_pago,
        estado,
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los pedidos
  static async obtenerTodos() {
    try {
      const [pedidos] = await pool.query(
        "SELECT * FROM pedidos ORDER BY fecha_pedido DESC"
      );
      return pedidos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener pedido por ID
  static async obtenerPorId(id) {
    try {
      const [pedidos] = await pool.execute(
        "SELECT * FROM pedidos WHERE id_pedido = ?",
        [id]
      );
      return pedidos.length ? pedidos[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener pedidos por usuario ID
  static async obtenerPorUsuario(id_usuario) {
    try {
      const [pedidos] = await pool.execute(
        "SELECT * FROM pedidos WHERE id_usuario = ? ORDER BY fecha_pedido DESC",
        [id_usuario]
      );
      return pedidos;
    } catch (error) {
      throw error;
    }
  }

  // Obtener pedidos por arqueo ID
  static async obtenerPorArqueo(id_arqueo) {
    try {
      const [pedidos] = await pool.execute(
        "SELECT * FROM pedidos WHERE id_arqueo = ? ORDER BY fecha_pedido DESC",
        [id_arqueo]
      );
      return pedidos;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar estado de pedido
  static async actualizarEstado(id, estado) {
    try {
      const [result] = await pool.execute(
        "UPDATE pedidos SET estado = ? WHERE id_pedido = ?",
        [estado, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar pedido completo
  static async actualizar(id, pedidoData) {
    try {
      const { id_usuario, id_arqueo, fecha_pedido, total, forma_pago, estado } =
        pedidoData;
      const [result] = await pool.execute(
        "UPDATE pedidos SET id_usuario = ?, id_arqueo = ?, fecha_pedido = ?, total = ?, forma_pago = ?, estado = ? WHERE id_pedido = ?",
        [id_usuario, id_arqueo, fecha_pedido, total, forma_pago, estado, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Cancelar pedido
  static async cancelar(id) {
    try {
      const [result] = await pool.execute(
        "UPDATE pedidos SET estado = 'Cancelado' WHERE id_pedido = ?",
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Obtener pedidos por estado
  static async obtenerPorEstado(estado) {
    try {
      const [pedidos] = await pool.execute(
        "SELECT * FROM pedidos WHERE estado = ? ORDER BY fecha_pedido DESC",
        [estado]
      );
      return pedidos;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Pedido;
