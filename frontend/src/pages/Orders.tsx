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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip,
  Divider,
  Autocomplete, // Importar Autocomplete
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckIcon,
  Kitchen as KitchenIcon,
  LocalShipping as DeliveryIcon,
  Cancel as CancelIcon,
  AddShoppingCart as AddDetailIcon,
} from "@mui/icons-material";
import { usePedidoStore } from "../stores/pedidoStore";
import { useDetallePedidoStore } from "../stores/detallePedidoStore";
import { useProductoStore } from "../stores/productoStore";
import { useAuthStore } from "../stores/authStore";
import { useCajaStore } from "../stores/cajaStore";

interface Pedido {
  id: number;
  fecha_pedido: string;
  total: number;
  estado: "Pendiente" | "En cocina" | "Listo" | "Entregado" | "Cancelado";
  id_arqueo: number;
  id_usuario?: number; // Puede que necesites esto para mostrar quién creó el pedido
}

interface DetallePedido {
  id_detalle: number;
  id_pedido: number;
  id_producto: number;
  cantidad: number;
  precio_unitario: number;
}

const OrderDetailsModal = ({
  open,
  onClose,
  orderId,
}: {
  open: boolean;
  onClose: () => void;
  orderId: number;
}) => {
  const { detalles, cargando, cargarDetallesPorPedidoId } =
    useDetallePedidoStore();
  const { productos } = useProductoStore();

  useEffect(() => {
    if (open && orderId) {
      cargarDetallesPorPedidoId(orderId);
    }
  }, [open, orderId, cargarDetallesPorPedidoId]);

  const getProductName = (idProducto: number) => {
    return productos.find((p) => p.id_producto === idProducto)?.nombre || "N/A";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalles del Pedido</DialogTitle>
      <DialogContent>
        {cargando ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio Unitario</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {detalles.map((detalle) => (
                  <TableRow key={detalle.id_detalle}>
                    <TableCell>{getProductName(detalle.id_producto)}</TableCell>
                    <TableCell align="right">{detalle.cantidad}</TableCell>
                    <TableCell align="right">
                      ${detalle.precio_unitario.toFixed(2)}
                    </TableCell>
                    <TableCell align="right">
                      {(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const CreateOrderModal = ({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (orderData: any, details: any[]) => Promise<void>;
}) => {
  const { productos, fetchProductos } = useProductoStore(); // Asegúrate de cargar los productos
  const { arqueoAbierto } = useCajaStore();
  const [orderData, setOrderData] = useState({
    id_arqueo: arqueoAbierto?.id_arqueo || 0,
    estado: "Pendiente",
  });
  const [details, setDetails] = useState<DetallePedido[]>([]); // Usar la interfaz DetallePedido
  const [currentDetail, setCurrentDetail] = useState<{
    id_producto: number | null; // Permitir null para el estado inicial
    cantidad: number;
    precio_unitario: number;
  }>({
    id_producto: null,
    cantidad: 1,
    precio_unitario: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Cargar productos cuando el modal se abre si aún no están cargados
    if (open && productos.length === 0) {
      fetchProductos();
    }
  }, [open, productos.length, fetchProductos]);

  const handleAddDetail = () => {
    // Verificar si se ha seleccionado un producto
    if (currentDetail.id_producto !== null && currentDetail.cantidad > 0) {
      const product = productos.find(
        (p) => p.id_producto === currentDetail.id_producto
      );
      // Asegurarse de que el producto fue encontrado (aunque Autocomplete debería garantizar esto)
      if (product) {
        // Verificar si el producto ya está en los detalles para sumarle la cantidad
        const existingDetailIndex = details.findIndex(
          (d) => d.id_producto === currentDetail.id_producto
        );

        if (existingDetailIndex > -1) {
          // Si el producto ya existe, actualizar la cantidad
          const updatedDetails = [...details];
          updatedDetails[existingDetailIndex].cantidad +=
            currentDetail.cantidad;
          setDetails(updatedDetails);
        } else {
          // Si el producto no existe, agregarlo como un nuevo detalle
          const newDetail: DetallePedido = {
            id_detalle: Date.now(), // Usar un ID temporal único para el frontend
            id_pedido: 0, // Esto se llenará al crear el pedido en el backend
            id_producto: currentDetail.id_producto,
            cantidad: currentDetail.cantidad,
            precio_unitario: product.precio,
          };
          setDetails([...details, newDetail]);
        }

        // Resetear el detalle actual para añadir otro producto
        setCurrentDetail({
          id_producto: null, // Resetear a null
          cantidad: 1,
          precio_unitario: 0,
        });
      }
    }
  };

  const handleRemoveDetail = (id_detalleToRemove: number) => {
    setDetails(
      details.filter((detail) => detail.id_detalle !== id_detalleToRemove)
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const total = details.reduce(
        (sum, detail) => sum + detail.cantidad * detail.precio_unitario,
        0
      );
      await onCreate(
        { ...orderData, total },
        details.map(({ ...rest }) => rest)
      ); // Excluir id_detalle temporal
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Crear Nuevo Pedido</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12 }}>
            {" "}
            {/* Usar 'item' en lugar de 'size' */}
            <Typography variant="h6">Información del Pedido</Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                {" "}
                {/* Usar 'item' en lugar de 'size' */}
                <TextField
                  fullWidth
                  label="ID Arqueo"
                  value={orderData.id_arqueo}
                  InputProps={{ readOnly: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                {" "}
                {/* Usar 'item' en lugar de 'size' */}
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={orderData.estado}
                    label="Estado"
                    onChange={(e) =>
                      setOrderData({ ...orderData, estado: e.target.value })
                    }
                  >
                    <MenuItem value="Pendiente">Pendiente</MenuItem>
                    <MenuItem value="En cocina">En cocina</MenuItem>
                    {/* Puedes añadir más estados si son relevantes al crear */}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12 }}>
            {" "}
            {/* Usar 'item' en lugar de 'size' */}
            <Typography variant="h6">Detalles del Pedido</Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 5 }}>
                {" "}
                {/* Usar 'item' en lugar de 'size' */}
                <Autocomplete
                  fullWidth
                  options={productos}
                  getOptionLabel={(option) => option.nombre}
                  isOptionEqualToValue={(option, value) =>
                    option.id_producto === value.id_producto
                  }
                  value={
                    productos.find(
                      (p) => p.id_producto === currentDetail.id_producto
                    ) || null
                  } // Controlar el valor seleccionado
                  onChange={(_event, newValue) => {
                    setCurrentDetail({
                      ...currentDetail,
                      id_producto: newValue ? newValue.id_producto : null, // Almacenar solo el ID
                      precio_unitario: newValue ? newValue.precio : 0,
                    });
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Producto" />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                {" "}
                {/* Usar 'item' en lugar de 'size' */}
                <TextField
                  fullWidth
                  label="Cantidad"
                  type="number"
                  value={currentDetail.cantidad}
                  onChange={(e) =>
                    setCurrentDetail({
                      ...currentDetail,
                      cantidad: Math.max(1, Number(e.target.value)),
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                {" "}
                {/* Usar 'item' en lugar de 'size' */}
                <TextField
                  fullWidth
                  label="Precio"
                  value={currentDetail.precio_unitario.toString()}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                {" "}
                {/* Usar 'item' en lugar de 'size' */}
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddDetailIcon />}
                  onClick={handleAddDetail}
                  disabled={
                    currentDetail.id_producto === null ||
                    currentDetail.cantidad <= 0
                  } // Deshabilitar si no hay producto o cantidad inválida
                >
                  Agregar
                </Button>
              </Grid>
            </Grid>
          </Grid>

          {details.length > 0 && (
            <Grid size={{ xs: 12 }}>
              {" "}
              {/* Usar 'item' en lugar de 'size' */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Precio Unitario</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((detail) => {
                      const product = productos.find(
                        (p) => p.id_producto === detail.id_producto
                      );
                      return (
                        <TableRow key={detail.id_detalle}>
                          <TableCell>{product?.nombre || "N/A"}</TableCell>
                          <TableCell align="right">{detail.cantidad}</TableCell>
                          <TableCell align="right">
                            ${detail.precio_unitario.toString()}
                          </TableCell>
                          <TableCell align="right">
                            $
                            {(detail.cantidad * detail.precio_unitario).toFixed(
                              2
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              onClick={() =>
                                handleRemoveDetail(detail.id_detalle)
                              }
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        <Typography variant="h6">Total:</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="h6">
                          $
                          {details
                            .reduce(
                              (sum, detail) =>
                                sum + detail.cantidad * detail.precio_unitario,
                              0
                            )
                            .toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || details.length === 0}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          Crear Pedido
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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

  useEffect(() => {
    // Cargar productos al montar la página
    fetchProductos();

    if (user?.es_administrador) {
      fetchTodosPedidos();
    } else {
      fetchMisPedidos();
    }
  }, [fetchTodosPedidos, fetchMisPedidos, user, fetchProductos]); // Añadir cargarProductos a las dependencias

  const handleCreateOrder = async (orderData: any, details: any[]) => {
    try {
      // Crear el pedido principal
      const nuevoPedido: Pedido = await crearNuevoPedido({
        // Usar la interfaz Pedido
        ...orderData,
        id_usuario: user?.id_usuario,
      });

      // Crear los detalles del pedido
      for (const detail of details) {
        await crearDetalle({
          id_pedido: nuevoPedido.id, // Usar el ID real del pedido creado
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

      // Actualizar la lista de pedidos
      if (user?.es_administrador) {
        fetchTodosPedidos();
      } else {
        fetchMisPedidos();
      }
    } catch (err) {
      console.error("Error al crear el pedido:", err);
      setSnackbar({
        open: true,
        message: "Error al crear el pedido",
        severity: "error",
      });
    }
  };

  const handleStatusUpdate = async (
    orderId: number,
    estado: "Pendiente" | "En cocina" | "Listo" | "Entregado" | "Cancelado"
  ) => {
    try {
      await cambiarEstadoPedido(orderId, { estado });
      setSnackbar({
        open: true,
        message: "Estado del pedido actualizado",
        severity: "success",
      });
      if (user?.es_administrador) {
        fetchTodosPedidos();
      } else {
        fetchMisPedidos();
      }
    } catch (err) {
      console.error("Error al actualizar el estado del pedido:", err);
      setSnackbar({
        open: true,
        message: "Error al actualizar el estado",
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
      } catch (err) {
        console.error("Error al cancelar el pedido:", err);
        setSnackbar({
          open: true,
          message: "Error al cancelar el pedido",
          severity: "error",
        });
      }
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return <CheckIcon color="info" />;
      case "En cocina":
        return <KitchenIcon color="warning" />;
      case "Listo":
        return <CheckIcon color="success" />;
      case "Entregado":
        return <DeliveryIcon color="primary" />;
      case "Cancelado":
        return <CancelIcon color="error" />;
      default:
        return <CheckIcon />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Pendiente":
        return "info";
      case "En cocina":
        return "warning";
      case "Listo":
        return "success";
      case "Entregado":
        return "primary";
      case "Cancelado":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
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
                  Estado
                </TableCell>
                <TableCell align="right" sx={{ color: "primary.contrastText" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pedidos.map((pedido) => (
                <TableRow
                  key={pedido.id}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell>{pedido.id}</TableCell>
                  <TableCell>{formatDate(pedido.fecha_pedido)}</TableCell>
                  <TableCell>${pedido.total.toString()}</TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(pedido.estado)}
                      label={pedido.estado}
                      color={getStatusColor(pedido.estado) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Ver detalles">
                      <IconButton
                        onClick={() => {
                          setSelectedOrderId(pedido.id);
                          setIsDetailsModalOpen(true);
                        }}
                        aria-label="Ver detalles"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {pedido.estado !== "Cancelado" &&
                      pedido.estado !== "Entregado" && (
                        <Tooltip title="Marcar como listo">
                          <IconButton
                            onClick={() =>
                              handleStatusUpdate(pedido.id, "Listo")
                            }
                            aria-label="Marcar como listo"
                            color="success"
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    {pedido.estado !== "Cancelado" && (
                      <Tooltip title="Cancelar pedido">
                        <IconButton
                          onClick={() => handleCancel(pedido.id)}
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateOrderModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateOrder}
      />

      <OrderDetailsModal
        open={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        orderId={selectedOrderId || 0}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
