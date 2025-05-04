// controllers/tipoProductoController.js
const TipoProducto = require("../models/tipoProductoModel");

const tipoProductoController = {
  // Crear un nuevo tipo de producto
  async crear(req, res) {
    try {
      const { nombre } = req.body;

      // Validar datos
      if (!nombre || nombre.trim() === "") {
        return res
          .status(400)
          .json({ mensaje: "El nombre del tipo de producto es obligatorio" });
      }

      // Crear el tipo de producto
      const tipoProducto = await TipoProducto.crear({
        nombre: nombre.trim(),
      });

      res.status(201).json({
        mensaje: "Tipo de producto creado correctamente",
        tipoProducto,
      });
    } catch (error) {
      console.error("Error al crear tipo de producto:", error);
      res.status(500).json({ mensaje: "Error al crear el tipo de producto" });
    }
  },

  // Obtener todos los tipos de producto
  async obtenerTodos(req, res) {
    try {
      const tipos = await TipoProducto.obtenerTodos();
      res.json(tipos);
    } catch (error) {
      console.error("Error al obtener tipos de producto:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los tipos de producto" });
    }
  },

  // Obtener un tipo de producto específico por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const tipoProducto = await TipoProducto.obtenerPorId(id);

      if (!tipoProducto) {
        return res
          .status(404)
          .json({ mensaje: "Tipo de producto no encontrado" });
      }

      res.json(tipoProducto);
    } catch (error) {
      console.error("Error al obtener tipo de producto por ID:", error);
      res.status(500).json({ mensaje: "Error al obtener el tipo de producto" });
    }
  },

  // Actualizar un tipo de producto
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre } = req.body;

      // Validar datos
      if (!nombre || nombre.trim() === "") {
        return res
          .status(400)
          .json({ mensaje: "El nombre del tipo de producto es obligatorio" });
      }

      // Verificar que el tipo existe
      const tipoProducto = await TipoProducto.obtenerPorId(id);
      if (!tipoProducto) {
        return res
          .status(404)
          .json({ mensaje: "Tipo de producto no encontrado" });
      }

      // Actualizar el tipo
      await TipoProducto.actualizar(id, {
        nombre: nombre.trim(),
      });

      res.json({ mensaje: "Tipo de producto actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar tipo de producto:", error);
      res
        .status(500)
        .json({ mensaje: "Error al actualizar el tipo de producto" });
    }
  },

  // Eliminar un tipo de producto
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el tipo existe
      const tipoProducto = await TipoProducto.obtenerPorId(id);
      if (!tipoProducto) {
        return res
          .status(404)
          .json({ mensaje: "Tipo de producto no encontrado" });
      }

      try {
        await TipoProducto.eliminar(id);
        res.json({ mensaje: "Tipo de producto eliminado correctamente" });
      } catch (error) {
        // Si hay un error específico de relaciones
        if (error.message.includes("tiene productos asociados")) {
          return res.status(400).json({ mensaje: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error al eliminar tipo de producto:", error);
      res
        .status(500)
        .json({ mensaje: "Error al eliminar el tipo de producto" });
    }
  },
};

module.exports = tipoProductoController;
