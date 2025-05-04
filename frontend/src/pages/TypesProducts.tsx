// src/pages/ProductTypes.tsx
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
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from "@mui/icons-material";
import { useProductoStore } from "../stores/productoStore";
import { TipoProducto } from "../types/product"; 

const ProductTypeFormModal = ({
  open,
  onClose,
  onSubmit,
  currentType,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (nombre: string) => Promise<void>;
  currentType?: TipoProducto | null;
}) => {
  const [nombre, setNombre] = useState(currentType?.nombre || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setNombre(currentType?.nombre || "");
  }, [currentType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(nombre);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        {currentType ? "Editar Tipo de Producto" : "Crear Nuevo Tipo"}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            fullWidth
            label="Nombre del Tipo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoFocus
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
          disabled={isSubmitting || !nombre.trim()}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {currentType ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const ProductTypes = () => {
  const {
    tiposProducto,
    isLoading,
    error,
    fetchTiposProducto,
    createTipoProducto,
    updateTipoProducto,
    deleteTipoProducto,
  } = useProductoStore();
  const token = localStorage.getItem("authToken");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentType, setCurrentType] = useState<TipoProducto | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchTiposProducto();
  }, [fetchTiposProducto]);

  const handleOpenModal = (type: TipoProducto | null = null) => {
    setCurrentType(type);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentType(null);
  };

  const handleSubmit = async (nombre: string) => {
    try {
      if (currentType) {
        await updateTipoProducto(currentType.id_tipo_producto, nombre, token!);
        setSnackbar({
          open: true,
          message: "Tipo de producto actualizado correctamente",
          severity: "success",
        });
      } else {
        await createTipoProducto(nombre, token!);
        setSnackbar({
          open: true,
          message: "Tipo de producto creado correctamente",
          severity: "success",
        });
      }
      fetchTiposProducto();
    } catch (err) {
        console.error("Error al guardar el tipo de producto:", err);
      setSnackbar({
        open: true,
        message: "Error al procesar la solicitud",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas eliminar este tipo de producto?"
      )
    ) {
      try {
        await deleteTipoProducto(id, token!);
        setSnackbar({
          open: true,
          message: "Tipo de producto eliminado correctamente",
          severity: "success",
        });
        fetchTiposProducto();
      } catch (err) {
        console.error("Error al eliminar el tipo de producto:", err);
        setSnackbar({
          open: true,
          message: "Error al eliminar el tipo de producto",
          severity: "error",
        });
      }
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
          Tipos de Producto
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          aria-label="Agregar tipo de producto"
        >
          Agregar Tipo
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
          <Table aria-label="Tabla de tipos de producto">
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Nombre
                </TableCell>
                <TableCell align="right" sx={{ color: "primary.contrastText" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tiposProducto.map((tipo) => (
                <TableRow
                  key={tipo.id_tipo_producto}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CategoryIcon color="primary" />
                      <Typography>{tipo.nombre}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => handleOpenModal(tipo)}
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
                        onClick={() => handleDelete(tipo.id_tipo_producto)}
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

      <ProductTypeFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentType={currentType}
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
