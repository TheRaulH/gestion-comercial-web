/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Orders.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  MenuItem,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip, // Importar Autocomplete
} from "@mui/material";
import {
  Add as AddIcon,
  Cancel as CancelIcon,
  CheckCircleOutlined,
  RemoveRedEyeSharp,
  TakeoutDining,
} from "@mui/icons-material";

// Import the extracted components
import CreateOrderModal from "../components/modals/CreateOrderModal"; // Adjust path if needed
import OrderDetailsModal from "../components/modals/OrderDetailsModal"; // Adjust path if needed
import { getStatusIcon, getStatusColor } from "../utils/statusIcons"; // Assuming a new utility file
import getPaymentIcon from "../utils/paymentIcons"; // Assuming a new utility file

import { usePedidoStore } from "../stores/pedidoStore";
import { useDetallePedidoStore } from "../stores/detallePedidoStore";
import { useProductoStore } from "../stores/productoStore";
import { useAuthStore } from "../stores/authStore";
import { PaymentMethod } from "../types/pedidos"; // Assuming types are here or in a shared file

export const Orders = () => {
  const {
    pedidos,
    isLoading,
    error,
    fetchTodosPedidos,
    fetchMisPedidos,
    crearNuevoPedido,
    cambiarEstadoPedido,
    cancelarUnPedido,
    formaPagoSeleccionada,
    setFormaPagoSeleccionada,
  } = usePedidoStore();
  const { crearDetalle } = useDetallePedidoStore();
  const { user } = useAuthStore();
  const { fetchProductos } = useProductoStore(); // Asegúrate de cargar los productos al cargar la página

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Function to refresh the order list based on user role
  const refreshOrders = () => {
    if (user?.es_administrador) {
      fetchTodosPedidos();
    } else {
      fetchMisPedidos();
    }
  };

  useEffect(() => {
    // Cargar productos and orders on mount
    fetchProductos();
    refreshOrders();
  }, [fetchProductos, user]); // Depend on user to refetch if role changes (though typically static)

  const handleCreateOrder = async (orderData: any, details: any[]) => {
    try {
      // 1. Crear el pedido principal
      const response = await crearNuevoPedido({
        ...orderData,
      });
      const nuevoPedido = response.pedido; // Accede al objeto pedido dentro de la respuesta

      console.log("ID del pedido creado:", nuevoPedido.id_pedido); // Debug

      // 2. Crear los detalles del pedido
      for (const detail of details) {
        await crearDetalle({
          id_pedido: nuevoPedido.id_pedido, // Usar el ID correcto
          id_producto: detail.id_producto,
          cantidad: detail.cantidad,
          precio_unitario: detail.precio_unitario,
        });
      }

      setSnackbar({
        open: true,
        message: "Pedido creado correctamente",
        severity: "success",
      });

      setIsCreateModalOpen(false);
      refreshOrders();
    } catch (err: unknown) {
      console.error("Error al crear el pedido:", err);
      setSnackbar({
        open: true,
        message: `Error al crear el pedido: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        severity: "error",
      });
    }
  };

  const handleStatusUpdate = async (
    orderId: number,
    estado: "Pendiente" | "En cocina" | "Entregado" | "Cancelado"
  ) => {
    try {
      await cambiarEstadoPedido(orderId, { estado });
      setSnackbar({
        open: true,
        message: "Estado del pedido actualizado",
        severity: "success",
      });
      refreshOrders(); // Refresh list after status update
    } catch (err: unknown) {
      console.error("Error al actualizar el estado del pedido:", err);
      setSnackbar({
        open: true,
        message: `Error al actualizar el estado: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
        severity: "error",
      });
    }
  };

  const handleCancel = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
      try {
        await cancelarUnPedido(id);
        setSnackbar({
          open: true,
          message: "Pedido cancelado correctamente",
          severity: "success",
        });
        if (user?.es_administrador) {
          fetchTodosPedidos();
        } else {
          fetchMisPedidos();
        }
      } catch (err: any) {
        console.error("Error al cancelar el pedido:", err);
        setSnackbar({
          open: true,
          message: `Error al cancelar el pedido: ${
            err.message || "Unknown error"
          }`,
          severity: "error",
        });
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filter orders by payment method
  const filteredPedidos = formaPagoSeleccionada
    ? pedidos.filter((pedido) => pedido.forma_pago === formaPagoSeleccionada)
    : pedidos;

  // Helper function for formatting date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"; // Handle cases where date might be missing
    try {
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      console.error("Failed to format date:", dateString, e);
      return dateString; // Return original if formatting fails
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h4" component="h1">
            Gestión de Pedidos
          </Typography>
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}
        >
          <FormControl component="fieldset" sx={{ m: 1, minWidth: 160 }}>
            <InputLabel id="demo-simple-select-helper-label">
              Forma de Pago
            </InputLabel>

            <Select
              labelId="demo-simple-select-helper-label"
              id="demo-simple-select-helper"
              value={formaPagoSeleccionada || ""}
              onChange={(e) =>
                setFormaPagoSeleccionada(
                  e.target.value ? (e.target.value as PaymentMethod) : null
                )
              }
              label="Forma de Pago"
            >
              <MenuItem value="">
                <em>Todas</em>
              </MenuItem>
              <MenuItem value="Efectivo">Efectivo</MenuItem>
              <MenuItem value="Tarjeta">Tarjeta</MenuItem>
              <MenuItem value="QR">QR</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Agregar pedido"
          >
            Nuevo Pedido
          </Button>
        </Grid>
      </Grid>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && (
        <TableContainer component={Paper} elevation={3}>
          <Table aria-label="Tabla de pedidos">
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "primary.contrastText" }}>ID</TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Fecha
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Total
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Forma de Pago
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Estado
                </TableCell>
                <TableCell align="right" sx={{ color: "primary.contrastText" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPedidos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No hay pedidos para mostrar.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPedidos.map((pedido) => (
                  <TableRow
                    component={Paper}
                    key={pedido.id_pedido}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell>{pedido.id_pedido}</TableCell>
                    <TableCell>{formatDate(pedido.fecha_pedido)}</TableCell>
                    <TableCell>{pedido.total.toString()} Bs.</TableCell>
                    <TableCell align="center">
                      <Tooltip title={pedido.forma_pago}>
                        {getPaymentIcon(pedido.forma_pago)}
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(pedido.estado)}
                        label={pedido.estado}
                        color={getStatusColor(pedido.estado) as any}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver detalles">
                        <IconButton
                          onClick={() => {
                            setSelectedOrderId(pedido.id_pedido);
                            setIsDetailsModalOpen(true);
                          }}
                          aria-label="Ver detalles"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <RemoveRedEyeSharp />
                        </IconButton>
                      </Tooltip>
                      {pedido.estado === "Pendiente" && (
                        <Tooltip title="Marcar como En cocina">
                          <IconButton
                            onClick={() =>
                              handleStatusUpdate(pedido.id_pedido, "En cocina")
                            }
                            aria-label="Marcar como En cocina"
                            color="info" // Color para En cocina
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <TakeoutDining />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Botón Marcar como entregado (visible si el estado es En cocina) */}
                      {pedido.estado === "En cocina" && (
                        <Tooltip title="Marcar como entregado">
                          <IconButton
                            onClick={() =>
                              handleStatusUpdate(pedido.id_pedido, "Entregado")
                            }
                            aria-label="Marcar como entregado"
                            color="success" // Color para Entregado
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <CheckCircleOutlined />
                          </IconButton>
                        </Tooltip>
                      )}

                      {/* Botón Cancelar pedido (visible si no está Cancelado o Entregado) */}
                      {pedido.estado !== "Cancelado" &&
                        pedido.estado !== "Entregado" && (
                          <Tooltip title="Cancelar pedido">
                            <IconButton
                              onClick={() => handleCancel(pedido.id_pedido)}
                              aria-label="Cancelar pedido"
                              color="error"
                              size="small"
                            >
                              <CancelIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateOrderModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateOrder}
      />
      {selectedOrderId !== null && (
        <OrderDetailsModal
          open={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrderId(null); // Reset selected order on close
          }}
          orderId={selectedOrderId}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
