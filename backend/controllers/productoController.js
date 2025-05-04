// controllers/productoController.js
const Producto = require("../models/productoModel");
const TipoProducto = require("../models/tipoProductoModel");

const productoController = {
  // Crear un nuevo producto
  async crear(req, res) {
    try {
      const {
        nombre,
        descripcion,
        precio,
        stock_actual,
        id_tipo_producto,
        activo,
      } = req.body;

      // Validar datos
      if (!nombre || nombre.trim() === "") {
        return res
          .status(400)
          .json({ mensaje: "El nombre del producto es obligatorio" });
      }

      if (
        precio === undefined ||
        precio === null ||
        isNaN(parseFloat(precio))
      ) {
        return res
          .status(400)
          .json({
            mensaje:
              "El precio del producto es obligatorio y debe ser un número",
          });
      }

      if (!id_tipo_producto) {
        return res
          .status(400)
          .json({ mensaje: "El tipo de producto es obligatorio" });
      }

      // Verificar que el tipo de producto existe
      const tipoProducto = await TipoProducto.obtenerPorId(id_tipo_producto);
      if (!tipoProducto) {
        return res
          .status(404)
          .json({ mensaje: "Tipo de producto no encontrado" });
      }

      // Crear el producto
      const producto = await Producto.crear({
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        precio: parseFloat(precio),
        stock_actual: stock_actual !== undefined ? parseInt(stock_actual) : 0,
        id_tipo_producto,
        activo: activo !== undefined ? Boolean(activo) : true,
      });

      res.status(201).json({
        mensaje: "Producto creado correctamente",
        producto,
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      res.status(500).json({ mensaje: "Error al crear el producto" });
    }
  },

  // Obtener todos los productos
  async obtenerTodos(req, res) {
    try {
      const productos = await Producto.obtenerTodos();
      res.json(productos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({ mensaje: "Error al obtener los productos" });
    }
  },

  // Obtener solo productos activos
  async obtenerActivos(req, res) {
    try {
      const productos = await Producto.obtenerActivos();
      res.json(productos);
    } catch (error) {
      console.error("Error al obtener productos activos:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los productos activos" });
    }
  },

  // Obtener productos por tipo
  async obtenerPorTipo(req, res) {
    try {
      const { id_tipo } = req.params;

      // Verificar que el tipo existe
      const tipoProducto = await TipoProducto.obtenerPorId(id_tipo);
      if (!tipoProducto) {
        return res
          .status(404)
          .json({ mensaje: "Tipo de producto no encontrado" });
      }

      const productos = await Producto.obtenerPorTipo(id_tipo);
      res.json(productos);
    } catch (error) {
      console.error("Error al obtener productos por tipo:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los productos por tipo" });
    }
  },

  // Obtener un producto específico por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const producto = await Producto.obtenerPorId(id);

      if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
      }

      res.json(producto);
    } catch (error) {
      console.error("Error al obtener producto por ID:", error);
      res.status(500).json({ mensaje: "Error al obtener el producto" });
    }
  },

  // Buscar productos por nombre
  async buscarPorNombre(req, res) {
    try {
      const { q } = req.query;

      if (!q || q.trim() === "") {
        return res
          .status(400)
          .json({ mensaje: "El término de búsqueda es obligatorio" });
      }

      const productos = await Producto.buscarPorNombre(q.trim());
      res.json(productos);
    } catch (error) {
      console.error("Error al buscar productos:", error);
      res.status(500).json({ mensaje: "Error al buscar productos" });
    }
  },

  // Actualizar un producto
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        descripcion,
        precio,
        stock_actual,
        id_tipo_producto,
        activo,
      } = req.body;

      // Validar datos
      if (!nombre || nombre.trim() === "") {
        return res
          .status(400)
          .json({ mensaje: "El nombre del producto es obligatorio" });
      }

      if (
        precio === undefined ||
        precio === null ||
        isNaN(parseFloat(precio))
      ) {
        return res
          .status(400)
          .json({
            mensaje:
              "El precio del producto es obligatorio y debe ser un número",
          });
      }

      if (!id_tipo_producto) {
        return res
          .status(400)
          .json({ mensaje: "El tipo de producto es obligatorio" });
      }

      // Verificar que el producto existe
      const producto = await Producto.obtenerPorId(id);
      if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
      }

      // Verificar que el tipo de producto existe
      const tipoProducto = await TipoProducto.obtenerPorId(id_tipo_producto);
      if (!tipoProducto) {
        return res
          .status(404)
          .json({ mensaje: "Tipo de producto no encontrado" });
      }

      // Actualizar el producto
      await Producto.actualizar(id, {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        precio: parseFloat(precio),
        stock_actual: parseInt(stock_actual),
        id_tipo_producto,
        activo: Boolean(activo),
      });

      res.json({ mensaje: "Producto actualizado correctamente" });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).json({ mensaje: "Error al actualizar el producto" });
    }
  },

  // Actualizar stock de producto
  async actualizarStock(req, res) {
    try {
      const { id } = req.params;
      const { cantidad } = req.body;

      // Validar datos
      if (
        cantidad === undefined ||
        cantidad === null ||
        isNaN(parseInt(cantidad))
      ) {
        return res
          .status(400)
          .json({ mensaje: "La cantidad es obligatoria y debe ser un número" });
      }

      // Verificar que el producto existe
      const producto = await Producto.obtenerPorId(id);
      if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
      }

      // Actualizar el stock
      await Producto.actualizarStock(id, parseInt(cantidad));

      res.json({
        mensaje: "Stock actualizado correctamente",
        nuevo_stock: producto.stock_actual + parseInt(cantidad),
      });
    } catch (error) {
      console.error("Error al actualizar stock:", error);
      res
        .status(500)
        .json({ mensaje: "Error al actualizar el stock del producto" });
    }
  },

  // Eliminar un producto
  async eliminar(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el producto existe
      const producto = await Producto.obtenerPorId(id);
      if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
      }

      await Producto.eliminar(id);
      res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({ mensaje: "Error al eliminar el producto" });
    }
  },

  // Desactivar un producto (alternativa a eliminar)
  async desactivar(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el producto existe
      const producto = await Producto.obtenerPorId(id);
      if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
      }

      await Producto.desactivar(id);
      res.json({ mensaje: "Producto desactivado correctamente" });
    } catch (error) {
      console.error("Error al desactivar producto:", error);
      res.status(500).json({ mensaje: "Error al desactivar el producto" });
    }
  },
};

module.exports = productoController;
