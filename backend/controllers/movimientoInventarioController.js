// controllers/movimientoInventarioController.js
const MovimientoInventario = require("../models/movimientoInventarioModel");
const Producto = require("../models/productoModel"); // Asumiendo que existe este modelo

const movimientoInventarioController = {
  // Registrar un nuevo movimiento de inventario
  async registrarMovimiento(req, res) {
    try {
      const { id_producto, tipo_movimiento, cantidad, fecha, observaciones } =
        req.body;

      // Validar datos requeridos
      if (!id_producto || !tipo_movimiento || !cantidad) {
        return res.status(400).json({
          mensaje:
            "El ID del producto, tipo de movimiento y cantidad son obligatorios",
        });
      }

      // Validar que la cantidad sea positiva
      if (cantidad <= 0) {
        return res.status(400).json({
          mensaje: "La cantidad debe ser un número positivo",
        });
      }

      // Validar que el producto exista
      // Asumiendo que el modelo Producto tiene un método para buscar por ID
      const producto = await Producto.obtenerPorId(id_producto);
      if (!producto) {
        return res.status(404).json({ mensaje: "El producto no existe" });
      }

      // Validar tipo de movimiento
      if (tipo_movimiento !== "Ingreso" && tipo_movimiento !== "Egreso") {
        return res.status(400).json({
          mensaje: "El tipo de movimiento debe ser 'Ingreso' o 'Egreso'",
        });
      }

      // Para egresos, verificar que haya stock suficiente
      if (tipo_movimiento === "Egreso") {
        const balance = await MovimientoInventario.obtenerBalanceProducto(
          id_producto
        );
        if ((balance.balance || 0) < cantidad) {
          return res.status(400).json({
            mensaje: "Stock insuficiente para realizar el egreso",
          });
        }
      }

      // Crear el movimiento
      const movimiento = await MovimientoInventario.crear({
        id_producto,
        tipo_movimiento,
        cantidad,
        fecha,
        observaciones,
      });

      res.status(201).json({
        mensaje: "Movimiento registrado correctamente",
        movimiento,
      });
    } catch (error) {
      console.error("Error al registrar movimiento:", error);
      res
        .status(500)
        .json({ mensaje: "Error al registrar el movimiento de inventario" });
    }
  },

  // Obtener todos los movimientos de inventario
  async obtenerTodos(req, res) {
    try {
      const movimientos = await MovimientoInventario.obtenerTodos();
      res.json({ movimientos });
    } catch (error) {
      console.error("Error al obtener movimientos:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los movimientos de inventario" });
    }
  },

  // Obtener un movimiento específico por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const movimiento = await MovimientoInventario.obtenerPorId(id);

      if (!movimiento) {
        return res.status(404).json({ mensaje: "Movimiento no encontrado" });
      }

      res.json({ movimiento });
    } catch (error) {
      console.error("Error al obtener movimiento:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener el movimiento de inventario" });
    }
  },

  // Obtener movimientos por producto
  async obtenerPorProducto(req, res) {
    try {
      const { idProducto } = req.params;

      // Validar que el producto exista
      const producto = await Producto.obtenerPorId(idProducto);
      if (!producto) {
        return res.status(404).json({ mensaje: "El producto no existe" });
      }

      const movimientos = await MovimientoInventario.obtenerPorProducto(
        idProducto
      );
      res.json({ movimientos });
    } catch (error) {
      console.error("Error al obtener movimientos por producto:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener los movimientos del producto" });
    }
  },

  // Obtener movimientos por tipo
  async obtenerPorTipo(req, res) {
    try {
      const { tipo } = req.params;

      // Validar tipo
      if (tipo !== "Ingreso" && tipo !== "Egreso") {
        return res.status(400).json({
          mensaje: "El tipo de movimiento debe ser 'Ingreso' o 'Egreso'",
        });
      }

      const movimientos = await MovimientoInventario.obtenerPorTipo(tipo);
      res.json({ movimientos });
    } catch (error) {
      console.error("Error al obtener movimientos por tipo:", error);
      res.status(500).json({ mensaje: "Error al obtener los movimientos" });
    }
  },

  // Obtener movimientos por rango de fechas
  async obtenerPorRangoFechas(req, res) {
    try {
      const { fechaInicio, fechaFin } = req.query;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          mensaje: "Las fechas de inicio y fin son obligatorias",
        });
      }

      const movimientos = await MovimientoInventario.obtenerPorRangoFechas(
        fechaInicio,
        fechaFin
      );
      res.json({ movimientos });
    } catch (error) {
      console.error("Error al obtener movimientos por fechas:", error);
      res.status(500).json({ mensaje: "Error al obtener los movimientos" });
    }
  },

  // Actualizar un movimiento
  async actualizarMovimiento(req, res) {
    try {
      const { id } = req.params;
      const { id_producto, tipo_movimiento, cantidad, fecha, observaciones } =
        req.body;

      // Verificar que el movimiento exista
      const movimientoExistente = await MovimientoInventario.obtenerPorId(id);
      if (!movimientoExistente) {
        return res.status(404).json({ mensaje: "Movimiento no encontrado" });
      }

      // Validar datos
      if (!id_producto || !tipo_movimiento || !cantidad) {
        return res.status(400).json({
          mensaje:
            "El ID del producto, tipo de movimiento y cantidad son obligatorios",
        });
      }

      // Validar que la cantidad sea positiva
      if (cantidad <= 0) {
        return res.status(400).json({
          mensaje: "La cantidad debe ser un número positivo",
        });
      }

      // Validar que el producto exista
      const producto = await Producto.obtenerPorId(id_producto);
      if (!producto) {
        return res.status(404).json({ mensaje: "El producto no existe" });
      }

      // Validar tipo de movimiento
      if (tipo_movimiento !== "Ingreso" && tipo_movimiento !== "Egreso") {
        return res.status(400).json({
          mensaje: "El tipo de movimiento debe ser 'Ingreso' o 'Egreso'",
        });
      }

      // Para egresos, verificar stock suficiente (considerando el cambio)
      if (tipo_movimiento === "Egreso") {
        // Si cambia de ingreso a egreso o aumenta la cantidad del egreso
        if (
          movimientoExistente.tipo_movimiento === "Ingreso" ||
          (movimientoExistente.tipo_movimiento === "Egreso" &&
            cantidad > movimientoExistente.cantidad)
        ) {
          const diferenciaACambiar =
            movimientoExistente.tipo_movimiento === "Ingreso"
              ? cantidad // Si cambia de ingreso a egreso, se resta todo
              : cantidad - movimientoExistente.cantidad; // Si es egreso, solo la diferencia

          const balance = await MovimientoInventario.obtenerBalanceProducto(
            id_producto
          );
          if ((balance.balance || 0) < diferenciaACambiar) {
            return res.status(400).json({
              mensaje: "Stock insuficiente para realizar la modificación",
            });
          }
        }
      }

      // Actualizar el movimiento
      const resultado = await MovimientoInventario.actualizar(id, {
        id_producto,
        tipo_movimiento,
        cantidad,
        fecha,
        observaciones,
      });

      if (resultado) {
        res.json({
          mensaje: "Movimiento actualizado correctamente",
          movimiento: await MovimientoInventario.obtenerPorId(id),
        });
      } else {
        res.status(500).json({ mensaje: "Error al actualizar el movimiento" });
      }
    } catch (error) {
      console.error("Error al actualizar movimiento:", error);
      res
        .status(500)
        .json({ mensaje: "Error al actualizar el movimiento de inventario" });
    }
  },

  // Eliminar un movimiento
  async eliminarMovimiento(req, res) {
    try {
      const { id } = req.params;

      // Verificar que el movimiento exista
      const movimiento = await MovimientoInventario.obtenerPorId(id);
      if (!movimiento) {
        return res.status(404).json({ mensaje: "Movimiento no encontrado" });
      }

      // Si es un egreso, verificar que la eliminación no cause stock negativo
      if (movimiento.tipo_movimiento === "Ingreso") {
        const balance = await MovimientoInventario.obtenerBalanceProducto(
          movimiento.id_producto
        );
        if ((balance.balance || 0) < movimiento.cantidad) {
          return res.status(400).json({
            mensaje:
              "No se puede eliminar este ingreso porque causaría un stock negativo",
          });
        }
      }

      const resultado = await MovimientoInventario.eliminar(id);

      if (resultado) {
        res.json({ mensaje: "Movimiento eliminado correctamente" });
      } else {
        res.status(500).json({ mensaje: "Error al eliminar el movimiento" });
      }
    } catch (error) {
      console.error("Error al eliminar movimiento:", error);
      res
        .status(500)
        .json({ mensaje: "Error al eliminar el movimiento de inventario" });
    }
  },

  // Obtener balance de stock de un producto
  async obtenerBalanceProducto(req, res) {
    try {
      const { idProducto } = req.params;

      // Validar que el producto exista
      const producto = await Producto.obtenerPorId(idProducto);
      if (!producto) {
        return res.status(404).json({ mensaje: "El producto no existe" });
      }

      const balance = await MovimientoInventario.obtenerBalanceProducto(
        idProducto
      );

      res.json({
        producto: {
          id: producto.id_producto,
          nombre: producto.nombre,
        },
        stock: {
          total_ingresos: balance.total_ingresos || 0,
          total_egresos: balance.total_egresos || 0,
          balance_actual: balance.balance || 0,
        },
      });
    } catch (error) {
      console.error("Error al obtener balance de producto:", error);
      res
        .status(500)
        .json({ mensaje: "Error al obtener el balance del producto" });
    }
  },
};

module.exports = movimientoInventarioController;
