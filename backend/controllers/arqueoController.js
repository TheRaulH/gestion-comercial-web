// controllers/arqueoController.js
const ArqueoCaja = require("../models/arqueoModel");
const Usuario = require("../models/usuarioModel");

const arqueoController = {
  // Crear un nuevo arqueo de caja
  async crear(req, res) {
    try {
      const { saldo_inicial } = req.body;
      const id_usuario = req.usuario.id;

      // Validar datos
      if (saldo_inicial === undefined || saldo_inicial === null) {
        return res
          .status(400)
          .json({ mensaje: "El saldo inicial es obligatorio" });
      }

      // Verificar que el usuario existe
      const usuario = await Usuario.obtenerPorId(id_usuario);
      if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
      }

      // Verificar si ya tiene un arqueo abierto
      const arqueoAbierto = await ArqueoCaja.obtenerArqueoAbiertoPorUsuario(
        id_usuario
      );
      if (arqueoAbierto) {
        return res.status(400).json({
          mensaje: "Ya tienes un arqueo de caja abierto",
          arqueo: arqueoAbierto,
        });
      }

      // Crear el arqueo
      const arqueo = await ArqueoCaja.crear({
        id_usuario,
        fecha_inicio: new Date(),
        saldo_inicial: parseFloat(saldo_inicial),
      });

      res.status(201).json({
        mensaje: "Arqueo de caja iniciado correctamente",
        arqueo,
      });
    } catch (error) {
      console.error("Error al crear arqueo de caja:", error);
      res.status(500).json({ mensaje: "Error al crear el arqueo de caja" });
    }
  },

  // Obtener todos los arqueos de caja (admin)
  async obtenerTodos(req, res) {
    try {
      const arqueos = await ArqueoCaja.obtenerTodos();
      res.json(arqueos);
    } catch (error) {
      console.error("Error al obtener arqueos:", error);
      res.status(500).json({ mensaje: "Error al obtener los arqueos de caja" });
    }
  },

  // Obtener arqueos de caja del usuario autenticado
  async obtenerPorUsuario(req, res) {
    try {
      const id_usuario = req.usuario.id;
      const arqueos = await ArqueoCaja.obtenerPorUsuario(id_usuario);
      res.json(arqueos);
    } catch (error) {
      console.error("Error al obtener arqueos del usuario:", error);
      res.status(500).json({ mensaje: "Error al obtener los arqueos de caja" });
    }
  },

  // Obtener un arqueo específico por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const arqueo = await ArqueoCaja.obtenerPorId(id);

      if (!arqueo) {
        return res
          .status(404)
          .json({ mensaje: "Arqueo de caja no encontrado" });
      }

      // Verificar si el usuario tiene acceso a este arqueo (admin o dueño)
      if (!req.usuario.esAdmin && arqueo.id_usuario !== req.usuario.id) {
        return res
          .status(403)
          .json({ mensaje: "No tienes permiso para ver este arqueo" });
      }

      res.json(arqueo);
    } catch (error) {
      console.error("Error al obtener arqueo por ID:", error);
      res.status(500).json({ mensaje: "Error al obtener el arqueo de caja" });
    }
  },

  // Obtener arqueo abierto del usuario autenticado
  async obtenerArqueoAbierto(req, res) {
    try {
      const id_usuario = req.usuario.id;
      const arqueo = await ArqueoCaja.obtenerArqueoAbiertoPorUsuario(
        id_usuario
      );

      if (!arqueo) {
        return res
          .status(404)
          .json({ mensaje: "No tienes ningún arqueo de caja abierto" });
      }

      res.json(arqueo);
    } catch (error) {
      console.error("Error al obtener arqueo abierto:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener el arqueo de caja abierto" });
    }
  },

  // Obtener todos los arqueos abiertos (admin)
  async obtenerArqueosAbiertos(req, res) {
    try {
      const arqueos = await ArqueoCaja.obtenerArqueosAbiertos();
      res.json(arqueos);
    } catch (error) {
      console.error("Error al obtener arqueos abiertos:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los arqueos de caja abiertos" });
    }
  },

  // Cerrar un arqueo de caja
  async cerrarArqueo(req, res) {
    try {
      const { id } = req.params;
      const { ingresos, egresos, saldo_final } = req.body;

      // Validar datos
      if (
        ingresos === undefined ||
        egresos === undefined ||
        saldo_final === undefined
      ) {
        return res.status(400).json({
          mensaje: "Ingresos, egresos y saldo final son obligatorios",
        });
      }

      // Verificar que el arqueo existe
      const arqueo = await ArqueoCaja.obtenerPorId(id);
      if (!arqueo) {
        return res
          .status(404)
          .json({ mensaje: "Arqueo de caja no encontrado" });
      }

      // Verificar si el usuario tiene permiso (admin o dueño)
      if (!req.usuario.esAdmin && arqueo.id_usuario !== req.usuario.id) {
        return res.status(403).json({
          mensaje: "No tienes permiso para cerrar este arqueo",
        });
      }

      // Verificar que el arqueo está abierto
      if (arqueo.fecha_fin) {
        return res.status(400).json({ mensaje: "Este arqueo ya está cerrado" });
      }

      // Cerrar el arqueo
      await ArqueoCaja.cerrarArqueo(id, {
        fecha_fin: new Date(),
        ingresos: parseFloat(ingresos),
        egresos: parseFloat(egresos),
        saldo_final: parseFloat(saldo_final),
      });

      res.json({ mensaje: "Arqueo de caja cerrado correctamente" });
    } catch (error) {
      console.error("Error al cerrar arqueo:", error);
      res.status(500).json({ mensaje: "Error al cerrar el arqueo de caja" });
    }
  },

  // Actualizar un arqueo de caja (solo admin)
  async actualizarArqueo(req, res) {
    try {
      const { id } = req.params;
      const { saldo_inicial, ingresos, egresos } = req.body;

      // Validar datos
      if (saldo_inicial === undefined) {
        return res
          .status(400)
          .json({ mensaje: "El saldo inicial es obligatorio" });
      }

      // Verificar que el arqueo existe
      const arqueo = await ArqueoCaja.obtenerPorId(id);
      if (!arqueo) {
        return res
          .status(404)
          .json({ mensaje: "Arqueo de caja no encontrado" });
      }

      // Actualizar el arqueo
      await ArqueoCaja.actualizar(id, {
        saldo_inicial: parseFloat(saldo_inicial),
        ingresos:
          ingresos !== undefined ? parseFloat(ingresos) : arqueo.ingresos,
        egresos: egresos !== undefined ? parseFloat(egresos) : arqueo.egresos,
      });

      res.json({ mensaje: "Arqueo de caja actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar arqueo:", error);
      res
        .status(500)
        .json({ mensaje: "Error al actualizar el arqueo de caja" });
    }
  },

  // Eliminar un arqueo de caja (solo admin)
  async eliminarArqueo(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el arqueo existe
      const arqueo = await ArqueoCaja.obtenerPorId(id);
      if (!arqueo) {
        return res
          .status(404)
          .json({ mensaje: "Arqueo de caja no encontrado" });
      }

      try {
        await ArqueoCaja.eliminar(id);
        res.json({ mensaje: "Arqueo de caja eliminado correctamente" });
      } catch (error) {
        // Si hay un error específico de relaciones
        if (
          error.message.includes("tiene movimientos asociados") ||
          error.message.includes("tiene pedidos asociados")
        ) {
          return res.status(400).json({ mensaje: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error al eliminar arqueo:", error);
      res.status(500).json({ mensaje: "Error al eliminar el arqueo de caja" });
    }
  },
};

module.exports = arqueoController;
