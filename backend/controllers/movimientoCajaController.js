const MovimientoCaja = require("../models/movimientoCajaModel");

const movimientoCajaController = {
  async crearMovimiento(req, res) {
    try {
      const nuevoMovimiento = await MovimientoCaja.crear(req.body);
      res
        .status(201)
        .json({
          mensaje: "Movimiento de caja creado correctamente",
          movimiento: nuevoMovimiento,
        });
    } catch (error) {
      console.error("Error al crear movimiento de caja:", error);
      res.status(500).json({ mensaje: "Error al crear el movimiento de caja" });
    }
  },

  async obtenerMovimientos(req, res) {
    try {
      const movimientos = await MovimientoCaja.obtenerTodos();
      res.status(200).json(movimientos);
    } catch (error) {
      console.error("Error al obtener movimientos de caja:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los movimientos de caja" });
    }
  },

  async obtenerMovimientoPorId(req, res) {
    try {
      const movimiento = await MovimientoCaja.obtenerPorId(req.params.id);
      if (movimiento) {
        res.status(200).json(movimiento);
      } else {
        res.status(404).json({ mensaje: "Movimiento de caja no encontrado" });
      }
    } catch (error) {
      console.error("Error al obtener movimiento de caja:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener el movimiento de caja" });
    }
  },

  async obtenerMovimientosPorArqueo(req, res) {
    try {
      const movimientos = await MovimientoCaja.obtenerPorArqueo(
        req.params.id_arqueo
      );
      res.status(200).json(movimientos);
    } catch (error) {
      console.error("Error al obtener movimientos por arqueo:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los movimientos para este arqueo" });
    }
  },

  async actualizarMovimiento(req, res) {
    try {
      const actualizado = await MovimientoCaja.actualizar(
        req.params.id,
        req.body
      );
      if (actualizado) {
        const movimientoActualizado = await MovimientoCaja.obtenerPorId(
          req.params.id
        );
        res
          .status(200)
          .json({
            mensaje: "Movimiento de caja actualizado correctamente",
            movimiento: movimientoActualizado,
          });
      } else {
        res.status(404).json({ mensaje: "Movimiento de caja no encontrado" });
      }
    } catch (error) {
      console.error("Error al actualizar movimiento de caja:", error);
      res
        .status(500)
        .json({ mensaje: "Error al actualizar el movimiento de caja" });
    }
  },

  async eliminarMovimiento(req, res) {
    try {
      const eliminado = await MovimientoCaja.eliminar(req.params.id);
      if (eliminado) {
        res
          .status(200)
          .json({ mensaje: "Movimiento de caja eliminado correctamente" });
      } else {
        res.status(404).json({ mensaje: "Movimiento de caja no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar movimiento de caja:", error);
      res
        .status(500)
        .json({ mensaje: "Error al eliminar el movimiento de caja" });
    }
  },
};

module.exports = movimientoCajaController;
