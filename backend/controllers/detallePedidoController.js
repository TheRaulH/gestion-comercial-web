const DetallePedido = require("../models/detallePedidoModel");

const detallePedidoController = {
  async crearDetalle(req, res) {
    try {
      const nuevoDetalle = await DetallePedido.crear(req.body);
      res
        .status(201)
        .json({
          mensaje: "Detalle de pedido creado correctamente",
          detalle: nuevoDetalle,
        });
    } catch (error) {
      console.error("Error al crear detalle de pedido:", error);
      res.status(500).json({ mensaje: "Error al crear el detalle del pedido" });
    }
  },

  async obtenerDetalles(req, res) {
    try {
      const detalles = await DetallePedido.obtenerTodos();
      res.status(200).json(detalles);
    } catch (error) {
      console.error("Error al obtener detalles de pedidos:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los detalles de los pedidos" });
    }
  },

  async obtenerDetallePorId(req, res) {
    try {
      const detalle = await DetallePedido.obtenerPorId(req.params.id);
      if (detalle) {
        res.status(200).json(detalle);
      } else {
        res.status(404).json({ mensaje: "Detalle de pedido no encontrado" });
      }
    } catch (error) {
      console.error("Error al obtener detalle de pedido:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener el detalle del pedido" });
    }
  },

  async obtenerDetallesPorPedido(req, res) {
    try {
      const detalles = await DetallePedido.obtenerPorPedido(
        req.params.id_pedido
      );
      res.status(200).json(detalles);
    } catch (error) {
      console.error("Error al obtener detalles por pedido:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los detalles del pedido" });
    }
  },

  async actualizarDetalle(req, res) {
    try {
      const actualizado = await DetallePedido.actualizar(
        req.params.id,
        req.body
      );
      if (actualizado) {
        const detalleActualizado = await DetallePedido.obtenerPorId(
          req.params.id
        );
        res
          .status(200)
          .json({
            mensaje: "Detalle de pedido actualizado correctamente",
            detalle: detalleActualizado,
          });
      } else {
        res.status(404).json({ mensaje: "Detalle de pedido no encontrado" });
      }
    } catch (error) {
      console.error("Error al actualizar detalle de pedido:", error);
      res
        .status(500)
        .json({ mensaje: "Error al actualizar el detalle del pedido" });
    }
  },

  async eliminarDetalle(req, res) {
    try {
      const eliminado = await DetallePedido.eliminar(req.params.id);
      if (eliminado) {
        res
          .status(200)
          .json({ mensaje: "Detalle de pedido eliminado correctamente" });
      } else {
        res.status(404).json({ mensaje: "Detalle de pedido no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar detalle de pedido:", error);
      res
        .status(500)
        .json({ mensaje: "Error al eliminar el detalle del pedido" });
    }
  },
};

module.exports = detallePedidoController;
