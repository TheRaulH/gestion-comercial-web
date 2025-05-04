// src/pages/Movements.tsx
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
  Card,
  CardContent, 
} from "@mui/material";
import Grid from '@mui/material/Grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterAlt as FilterIcon,
  Clear as ClearIcon,
  ArrowUpward as IncomeIcon,
  ArrowDownward as OutcomeIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers";
import { useMovimientoStore } from "../stores/movimientoStore";
import { useProductoStore } from "../stores/productoStore";
import { TipoMovimiento, Movimiento, MovimientoCreate, MovimientoUpdate } from "../types/movimiento";
 
const MovementFormModal = ({
  open,
  onClose,
  onSubmit,
  currentMovement,
  productOptions,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MovimientoCreate | MovimientoUpdate) => Promise<void>;
  currentMovement?: Movimiento | null;
  productOptions: { id: number; nombre: string }[];
}) => {
  const [formData, setFormData] = useState<MovimientoCreate | MovimientoUpdate>({
    id_producto: 0,
    tipo_movimiento: "Ingreso",
    cantidad: 0,
    observaciones: "",
    fecha: "",
    ...(currentMovement ? { fecha: currentMovement.fecha } : {}),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentMovement) {
      setFormData({
        id_producto: currentMovement.id_producto,
        tipo_movimiento: currentMovement.tipo_movimiento,
        cantidad: currentMovement.cantidad,
        observaciones: currentMovement.observaciones,
        fecha: currentMovement.fecha,
      });
    } else {
      setFormData({
        id_producto: 0,
        tipo_movimiento: "Ingreso",
        cantidad: 0,
        observaciones: "",
      });
    }
  }, [currentMovement]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "cantidad" ? Number(value) : value,
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

//   const handleDateChange = (date: Date | null) => {
//     setFormData({
//       ...formData,
//       fecha: date ? date.toISOString() : "",
//     });
//   };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {currentMovement ? "Editar Movimiento" : "Registrar Nuevo Movimiento"}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Producto</InputLabel>
                <Select
                  name="id_producto"
                  value={formData.id_producto}
                  label="Producto"
                  onChange={handleSelectChange}
                >
                  {productOptions.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Tipo de Movimiento</InputLabel>
                <Select
                  name="tipo_movimiento"
                  value={formData.tipo_movimiento}
                  label="Tipo de Movimiento"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="Ingreso">Ingreso</MenuItem>
                  <MenuItem value="Egreso">Egreso</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Cantidad"
                name="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
              />
            </Grid>
            {currentMovement && (
              <Grid size={12}>
                <DatePicker
                  label="Fecha"
                //   value={formData.fecha ? new Date(formData.fecha) : null}
                //   onChange={handleDateChange}
                //   renderInput={(params) => (
                //     <TextField {...params} fullWidth margin="normal" required />
                //   )}
                />
              </Grid>
            )}
            <Grid size={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || !formData.id_producto}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {currentMovement ? "Actualizar" : "Registrar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const Movements = () => {
  const {
    movimientos,
    balanceStock,
    isLoading,
    error,
    fetchMovimientos,
    fetchMovimientosPorProducto,
    fetchMovimientosPorTipo,
    fetchMovimientosPorFechas,
    fetchBalanceStock,
    crearMovimiento,
    actualizarMovimiento,
    eliminarMovimiento,
  } = useMovimientoStore();
  const { productos, fetchProductos } = useProductoStore();
   

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMovement, setCurrentMovement] = useState<Movimiento | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [filters, setFilters] = useState({
    idProducto: 0,
    tipo: "" as TipoMovimiento | "",
    fechaInicio: "",
    fechaFin: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMovimientos();
     
    fetchProductos();
  }, [fetchMovimientos, fetchProductos]);

  const handleOpenModal = (movement: Movimiento | null = null) => {
    setCurrentMovement(movement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMovement(null);
  };

  const handleSubmit = async (data: MovimientoCreate | MovimientoUpdate) => {
    try {
      if (currentMovement) {
        await actualizarMovimiento(currentMovement.id, data as MovimientoUpdate);
        setSnackbar({
          open: true,
          message: "Movimiento actualizado correctamente",
          severity: "success",
        });
      } else {
        await crearMovimiento(data as MovimientoCreate);
        setSnackbar({
          open: true,
          message: "Movimiento registrado correctamente",
          severity: "success",
        });
      }
      fetchMovimientos();
      handleCloseModal();
    } catch (err) {
        console.error("Error al guardar movimiento:", err);
      setSnackbar({
        open: true,
        message: "Error al procesar la solicitud",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este movimiento?")) {
      try {
        await eliminarMovimiento(id);
        setSnackbar({
          open: true,
          message: "Movimiento eliminado correctamente",
          severity: "success",
        });
        fetchMovimientos();
      } catch (err) {
        console.error("Error al eliminar movimiento:", err);
        setSnackbar({
          open: true,
          message: "Error al eliminar el movimiento",
          severity: "error",
        });
      }
    }
  };

  const applyFilters = () => {
    if (filters.idProducto) {
      fetchMovimientosPorProducto(filters.idProducto);
      fetchBalanceStock(filters.idProducto);
    } else if (filters.tipo) {
      fetchMovimientosPorTipo(filters.tipo);
    } else if (filters.fechaInicio && filters.fechaFin) {
      fetchMovimientosPorFechas(filters.fechaInicio, filters.fechaFin);
    } else {
      fetchMovimientos();
    }
  };

  const clearFilters = () => {
    setFilters({
      idProducto: 0,
      tipo: "",
      fechaInicio: "",
      fechaFin: "",
    });
    fetchMovimientos();
  };

  const getProductName = (idProducto: number) => {
    return productos.find(p => p.id_producto === idProducto)?.nombre || "N/A";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h4" component="h1">
            Gestión de Movimientos
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 2 }}
          >
            Filtros
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            aria-label="Agregar movimiento"
          >
            Nuevo Movimiento
          </Button>
        </Grid>
      </Grid>

      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filtros
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Producto</InputLabel>
                  <Select
                    value={filters.idProducto}
                    label="Producto"
                    onChange={(e) => setFilters({...filters, idProducto: Number(e.target.value)})}
                  >
                    <MenuItem value={0}>Todos los productos</MenuItem>
                    {productos.map((product) => (
                      <MenuItem key={product.id_producto} value={product.id_producto}>
                        {product.nombre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Movimiento</InputLabel>
                  <Select
                    value={filters.tipo}
                    label="Tipo de Movimiento"
                    onChange={(e) => setFilters({...filters, tipo: e.target.value as TipoMovimiento | ""})}
                  >
                    <MenuItem value="">Todos los tipos</MenuItem>
                    <MenuItem value="Ingreso">Ingreso</MenuItem>
                    <MenuItem value="Egreso">Egreso</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="Fecha inicio"
                  value={filters.fechaInicio ? new Date(filters.fechaInicio) : null}
                  onChange={(newValue) => 
                    setFilters({...filters, fechaInicio: newValue?.toISOString() || ""})
                  }
                  //renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <DatePicker
                  label="Fecha fin"
                  value={filters.fechaFin ? new Date(filters.fechaFin) : null}
                  onChange={(newValue) => 
                    setFilters({...filters, fechaFin: newValue?.toISOString() || ""})
                  }
                  //renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ mr: 2 }}
                >
                  Limpiar
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={applyFilters}
                >
                  Aplicar Filtros
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {balanceStock && filters.idProducto > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Balance de Stock
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography>Producto: {getProductName(balanceStock.id_producto)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle1">
                  Stock actual: {balanceStock.stock}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
       
       

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
          <Table aria-label="Tabla de movimientos">
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Producto
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Cantidad
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Fecha
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Observaciones
                </TableCell>
                <TableCell align="right" sx={{ color: "primary.contrastText" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movimientos.map((movimiento) => (
                <TableRow
                  key={movimiento.id}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell>
                    {getProductName(movimiento.id_producto)}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      {movimiento.tipo_movimiento === "Ingreso" ? (
                        <IncomeIcon color="success" sx={{ mr: 1 }} />
                      ) : (
                        <OutcomeIcon color="error" sx={{ mr: 1 }} />
                      )}
                      <Typography>{movimiento.tipo_movimiento}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{movimiento.cantidad}</TableCell>
                  <TableCell>{formatDate(movimiento.fecha)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {movimiento.observaciones}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => handleOpenModal(movimiento)}
                        aria-label="Editar"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        onClick={() => handleDelete(movimiento.id)}
                        aria-label="Eliminar"
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <MovementFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentMovement={currentMovement}
        productOptions={productos.map((p) => ({
          id: p.id_producto,
          nombre: p.nombre,
        }))}
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