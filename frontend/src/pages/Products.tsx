// src/pages/Products.tsx
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AddCircleOutline as AddStockIcon,
} from "@mui/icons-material";
import { useProductoStore } from "../stores/productoStore";
import {
  Producto,
  ProductoCreateUpdate,
  TipoProducto,
  ProductoStockUpdate,
} from "../types/product";

const ProductFormModal = ({
  open,
  onClose,
  onSubmit,
  currentProduct,
  tiposProducto,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductoCreateUpdate) => Promise<void>;
  currentProduct?: Producto | null;
  tiposProducto: TipoProducto[];
}) => {
  const [formData, setFormData] = useState<ProductoCreateUpdate>({
    nombre: "",
    descripcion: "",
    precio: 0,
    stock_actual: 0,
    id_tipo_producto: 0,
    activo: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentProduct) {
      setFormData({
        nombre: currentProduct.nombre,
        descripcion: currentProduct.descripcion,
        precio: currentProduct.precio,
        stock_actual: currentProduct.stock_actual,
        id_tipo_producto: currentProduct.id_tipo_producto,
        activo: currentProduct.activo,
      });
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        precio: 0,
        stock_actual: 0,
        id_tipo_producto: 0,
        activo: true,
      });
    }
  }, [currentProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    });
  };

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
        {currentProduct ? "Editar Producto" : "Crear Nuevo Producto"}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            fullWidth
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Descripción"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            multiline
            rows={3}
          />
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Precio"
              name="precio"
              type="number"
              value={formData.precio}
              onChange={handleChange}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              fullWidth
              label="Stock Actual"
              name="stock_actual"
              type="number"
              value={formData.stock_actual}
              onChange={handleChange}
              inputProps={{ min: 0 }}
            />
          </Box>
          <TextField
            margin="normal"
            fullWidth
            select
            label="Tipo de Producto"
            name="id_tipo_producto"
            value={formData.id_tipo_producto}
            onChange={handleChange}
            required
          >
            {tiposProducto.map((tipo) => (
              <MenuItem
                key={tipo.id_tipo_producto}
                value={tipo.id_tipo_producto}
              >
                {tipo.nombre}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                color="primary"
              />
            }
            label="Producto activo"
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {currentProduct ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const StockUpdateModal = ({
  open,
  onClose,
  onSubmit,
  currentStock,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ProductoStockUpdate) => Promise<void>;
  currentStock: number;
}) => {
  const [stockData, setStockData] = useState<ProductoStockUpdate>({
    cantidad: currentStock,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setStockData({ cantidad: currentStock });
  }, [currentStock]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(stockData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Actualizar Stock</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nueva cantidad"
            type="number"
            value={stockData.cantidad}
            onChange={(e) => setStockData({ cantidad: Number(e.target.value) })}
            inputProps={{ min: 0 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          Actualizar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const Products = () => {
  const {
    productos,
    tiposProducto,
    isLoading,
    error,
    fetchProductos,
    fetchTiposProducto,
    createProducto,
    updateProducto,
    updateStockProducto,
    deleteProducto,
    deactivateProducto,
  } = useProductoStore();
  const token = localStorage.getItem("authToken");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Producto | null>(null);
  const [currentProductForStock, setCurrentProductForStock] =
    useState<Producto | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchProductos();
    fetchTiposProducto();
  }, [fetchProductos, fetchTiposProducto]);

  const handleOpenModal = (product: Producto | null = null) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentProduct(null);
  };

  const handleOpenStockModal = (product: Producto) => {
    setCurrentProductForStock(product);
    setIsStockModalOpen(true);
  };

  const handleCloseStockModal = () => {
    setIsStockModalOpen(false);
    setCurrentProductForStock(null);
  };

  const handleSubmit = async (data: ProductoCreateUpdate) => {
    try {
      if (currentProduct) {
        await updateProducto(currentProduct.id_producto, data, token!);
        setSnackbar({
          open: true,
          message: "Producto actualizado correctamente",
          severity: "success",
        });
      } else {
        await createProducto(data, token!);
        setSnackbar({
          open: true,
          message: "Producto creado correctamente",
          severity: "success",
        });
      }
      fetchProductos();
      handleCloseModal();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Error al procesar la solicitud",
        severity: "error",
      });
    }
  };

  const handleUpdateStock = async (data: ProductoStockUpdate) => {
    if (!currentProductForStock) return;
    try {
      await updateStockProducto(
        currentProductForStock.id_producto,
        data.cantidad,
        token!
      );
      setSnackbar({
        open: true,
        message: "Stock actualizado correctamente",
        severity: "success",
      });
      fetchProductos();
      handleCloseStockModal();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Error al actualizar el stock",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await deleteProducto(id, token!);
        setSnackbar({
          open: true,
          message: "Producto eliminado correctamente",
          severity: "success",
        });
        fetchProductos();
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Error al eliminar el producto",
          severity: "error",
        });
      }
    }
  };

  const handleToggleStatus = async (product: Producto) => {
    try {
      await deactivateProducto(product.id_producto, token!);
      setSnackbar({
        open: true,
        message: `Producto ${
          product.activo ? "desactivado" : "activado"
        } correctamente`,
        severity: "success",
      });
      fetchProductos();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: `Error al ${
          product.activo ? "desactivar" : "activar"
        } el producto`,
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Gestión de Productoss
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          aria-label="Agregar producto"
        >
          Agregar Producto
        </Button>
      </Box>

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
          <Table aria-label="Tabla de productos">
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Tipo
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Precio
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Stock
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
              {productos.map((producto) => (
                <TableRow
                  key={producto.id_producto}
                  hover
                  sx={{
                    opacity: producto.activo ? 1 : 0.7,
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <InventoryIcon
                        color={producto.activo ? "primary" : "disabled"}
                      />
                      <Typography>{producto.nombre}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {tiposProducto.find(
                      (t) => t.id_tipo_producto === producto.id_tipo_producto
                    )?.nombre || "N/A"}
                  </TableCell>
                  <TableCell>${producto.precio.toString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={producto.stock_actual}
                      color="default"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={producto.activo ? "Activo" : "Inactivo"}
                      color={producto.activo ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Actualizar stock">
                      <IconButton
                        onClick={() => handleOpenStockModal(producto)}
                        aria-label="Actualizar stock"
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <AddStockIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={producto.activo ? "Desactivar" : "Activar"}>
                      <IconButton
                        onClick={() => handleToggleStatus(producto)}
                        aria-label={producto.activo ? "Desactivar" : "Activar"}
                        color={producto.activo ? "warning" : "success"}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        {producto.activo ? (
                          <VisibilityOffIcon />
                        ) : (
                          <VisibilityIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => handleOpenModal(producto)}
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
                        onClick={() => handleDelete(producto.id_producto)}
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

      <ProductFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentProduct={currentProduct}
        tiposProducto={tiposProducto}
      />

      <StockUpdateModal
        open={isStockModalOpen}
        onClose={handleCloseStockModal}
        onSubmit={handleUpdateStock}
        currentStock={currentProductForStock?.stock_actual || 0}
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
