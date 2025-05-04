const Pedido = require("../models/pedidoModel");

const pedidoController = {
  // Crear un nuevo pedido
  async crearPedido(req, res) {
    try {
      const { id_arqueo, total, estado } = req.body;
      const id_usuario = req.usuario.id; // Obtener del token JWT

      // Validar datos
      if (!id_arqueo || !total) {
        return res.status(400).json({ mensaje: "Faltan campos requeridos" });
      }

      // Crear el pedido
      const pedido = await Pedido.crear({
        id_usuario,
        id_arqueo,
        total,
        estado,
      });

      res.status(201).json({
        mensaje: "Pedido creado correctamente",
        pedido,
      });
    } catch (error) {
      console.error("Error al crear pedido:", error);
      res.status(500).json({ mensaje: "Error al procesar el pedido" });
    }
  },

  // Obtener todos los pedidos (solo admin)
  async obtenerTodos(req, res) {
    try {
      const pedidos = await Pedido.obtenerTodos();
      res.status(200).json(pedidos);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      res.status(500).json({ mensaje: "Error al obtener los pedidos" });
    }
  },

  // Obtener un pedido específico
  async obtenerPedido(req, res) {
    try {
      const { id } = req.params;
      const pedido = await Pedido.obtenerPorId(id);

      if (!pedido) {
        return res.status(404).json({ mensaje: "Pedido no encontrado" });
      }

      // Verificar si el usuario puede acceder al pedido (es el creador o es admin)
      if (pedido.id_usuario !== req.usuario.id && !req.usuario.esAdmin) {
        return res
          .status(403)
          .json({ mensaje: "No tiene permisos para ver este pedido" });
      }

      res.status(200).json(pedido);
    } catch (error) {
      console.error("Error al obtener pedido:", error);
      res.status(500).json({ mensaje: "Error al obtener el pedido" });
    }
  },

  // Obtener pedidos del usuario actual
  async obtenerMisPedidos(req, res) {
    try {
      const id_usuario = req.usuario.id;
      const pedidos = await Pedido.obtenerPorUsuario(id_usuario);
      res.status(200).json(pedidos);
    } catch (error) {
      console.error("Error al obtener mis pedidos:", error);
      res.status(500).json({ mensaje: "Error al obtener los pedidos" });
    }
  },

  // Obtener pedidos por arqueo
  async obtenerPedidosPorArqueo(req, res) {
    try {
      const { id_arqueo } = req.params;
      const pedidos = await Pedido.obtenerPorArqueo(id_arqueo);
      res.status(200).json(pedidos);
    } catch (error) {
      console.error("Error al obtener pedidos por arqueo:", error);
      res.status(500).json({ mensaje: "Error al obtener los pedidos" });
    }
  },

  // Actualizar estado de pedido
  async actualizarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      // Validar estado
      const estadosValidos = [
        "Pendiente",
        "En cocina",
        "Entregado",
        "Cancelado",
      ];
      if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({ mensaje: "Estado no válido" });
      }

      // Verificar que el pedido existe
      const pedido = await Pedido.obtenerPorId(id);
      if (!pedido) {
        return res.status(404).json({ mensaje: "Pedido no encontrado" });
      }

      // Actualizar estado
      const actualizado = await Pedido.actualizarEstado(id, estado);

      if (actualizado) {
        res
          .status(200)
          .json({ mensaje: "Estado actualizado correctamente", estado });
      } else {
        res.status(400).json({ mensaje: "No se pudo actualizar el estado" });
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      res
        .status(500)
        .json({ mensaje: "Error al actualizar el estado del pedido" });
    }
  },

  // Actualizar pedido completo (solo admin)
  async actualizarPedido(req, res) {
    try {
      const { id } = req.params;
      const { id_usuario, id_arqueo, fecha_pedido, total, estado } = req.body;

      // Verificar que el pedido existe
      const pedidoExistente = await Pedido.obtenerPorId(id);
      if (!pedidoExistente) {
        return res.status(404).json({ mensaje: "Pedido no encontrado" });
      }

      // Validar datos
      if (!id_usuario || !id_arqueo || !fecha_pedido || !total || !estado) {
        return res
          .status(400)
          .json({ mensaje: "Todos los campos son obligatorios" });
      }

      // Actualizar pedido
      const actualizado = await Pedido.actualizar(id, {
        id_usuario,
        id_arqueo,
        fecha_pedido,
        total,
        estado,
      });

      if (actualizado) {
        res.status(200).json({ mensaje: "Pedido actualizado correctamente" });
      } else {
        res.status(400).json({ mensaje: "No se pudo actualizar el pedido" });
      }
    } catch (error) {
      console.error("Error al actualizar pedido:", error);
      res.status(500).json({ mensaje: "Error al actualizar el pedido" });
    }
  },

  // Cancelar pedido
  async cancelarPedido(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el pedido existe
      const pedido = await Pedido.obtenerPorId(id);
      if (!pedido) {
        return res.status(404).json({ mensaje: "Pedido no encontrado" });
      }

      // Verificar si el usuario puede cancelar el pedido
      if (pedido.id_usuario !== req.usuario.id && !req.usuario.esAdmin) {
        return res
          .status(403)
          .json({ mensaje: "No tiene permisos para cancelar este pedido" });
      }

      // Verificar que el pedido no esté ya entregado
      if (pedido.estado === "Entregado") {
        return res
          .status(400)
          .json({ mensaje: "No se puede cancelar un pedido ya entregado" });
      }

      // Cancelar pedido
      const cancelado = await Pedido.cancelar(id);

      if (cancelado) {
        res.status(200).json({ mensaje: "Pedido cancelado correctamente" });
      } else {
        res.status(400).json({ mensaje: "No se pudo cancelar el pedido" });
      }
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      res.status(500).json({ mensaje: "Error al cancelar el pedido" });
    }
  },

  // Obtener pedidos por estado
  async obtenerPedidosPorEstado(req, res) {
    try {
      const { estado } = req.params;

      // Validar estado
      const estadosValidos = [
        "Pendiente",
        "En cocina",
        "Entregado",
        "Cancelado",
      ];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ mensaje: "Estado no válido" });
      }

      const pedidos = await Pedido.obtenerPorEstado(estado);
      res.status(200).json(pedidos);
    } catch (error) {
      console.error("Error al obtener pedidos por estado:", error);
      res.status(500).json({ mensaje: "Error al obtener los pedidos" });
    }
  },
};

module.exports = pedidoController;
