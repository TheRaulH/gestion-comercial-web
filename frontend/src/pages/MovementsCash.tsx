// src/pages/CashMovements.tsx
import {  useEffect, useState } from "react";
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
  Card,
  CardContent,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon, 
  ArrowUpward as IncomeIcon,
  ArrowDownward as OutcomeIcon,
} from "@mui/icons-material"; 
import { useMovimientosCajaStore } from "../stores/movimientosCajaStore";
import { useCajaStore } from "../stores/cajaStore";
import { MovimientoCaja, MovimientoCajaCreate, MovimientoCajaUpdate } from "../types/movimientoCaja";

const MovementFormModal = ({
  open,
  onClose,
  onSubmit,
  currentMovement,
  arqueoId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: MovimientoCajaCreate | MovimientoCajaUpdate) => Promise<void>;
  currentMovement?: MovimientoCaja | null;
  arqueoId: number;
}) => {
  const [formData, setFormData] = useState<MovimientoCajaCreate | MovimientoCajaUpdate>({
    id_arqueo: arqueoId,
    tipo: "Ingreso",
    monto: 0,
    descripcion: "",
    fecha: new Date().toISOString(),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentMovement) {
      setFormData({
        descripcion: currentMovement.descripcion,
        monto: currentMovement.monto,
      });
    } else {
      setFormData({
        id_arqueo: arqueoId,
        tipo: "Ingreso",
        monto: 0,
        descripcion: "",
        fecha: new Date().toISOString(),
      });
    }
  }, [currentMovement, arqueoId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "monto" ? Number(value) : value,
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
        {currentMovement ? "Editar Movimiento" : "Nuevo Movimiento de Caja"}
      </DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {!currentMovement && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth margin="normal" required>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      name="tipo" 
                      label="Tipo"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="Ingreso">Ingreso</MenuItem>
                      <MenuItem value="Egreso">Egreso</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                 
              </>
            )}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Monto"
                name="monto"
                type="number"
                value={formData.monto}
                onChange={handleChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                margin="normal"
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                multiline
                rows={3}
                required
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
          disabled={isSubmitting || !formData.descripcion}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {currentMovement ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const CashMovements = () => {
  const {
    movimientos,
    loading,
    error,
    fetchByArqueoId,
    createMovimiento,
    updateMovimiento,
    deleteMovimiento,
  } = useMovimientosCajaStore();
  const { arqueoAbierto, fetchArqueoAbierto } = useCajaStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMovement, setCurrentMovement] = useState<MovimientoCaja | null>(
    null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // useEffect para la carga inicial del arqueo abierto
  useEffect(() => {
    const loadInitialArqueo = async () => {
      try {
        // Llama a la función que carga el arqueo.
        // Esta función *debe* ser responsable de actualizar el estado `arqueoAbierto`.
        await fetchArqueoAbierto();
        console.log("Intentando cargar el arqueo abierto inicial.");
        // La lógica dependiente (fetchByArqueoId) se ejecutará en el siguiente useEffect cuando cambie arqueoAbierto
      } catch (err) {
        console.error("Error al cargar el arqueo abierto inicial:", err);
        setSnackbar({
          open: true,
          message: "Error al cargar el arqueo abierto",
          severity: "error",
        });
      }
    };

    loadInitialArqueo();

    // Dependencias: solo las funciones externas que este efecto usa.
    // NO incluyas arqueoAbierto aquí, ya que es lo que se actualiza.
  }, [fetchArqueoAbierto, setSnackbar]); // Incluye setSnackbar si se usa dentro

  // useEffect para reaccionar cuando el estado arqueoAbierto cambie
  useEffect(() => {
    console.log("Estado arqueoAbierto cambió:", arqueoAbierto);
    // Si arqueoAbierto ya fue cargado y tiene un ID, entonces carga los datos dependientes
    if (arqueoAbierto && arqueoAbierto.id_arqueo) {
      console.log(
        "Arqueo ID encontrado, cargando datos dependientes:",
        arqueoAbierto.id_arqueo
      );
      fetchByArqueoId(arqueoAbierto.id_arqueo);
    }
    // Dependencias: el estado que este efecto observa y la función que llama
  }, [arqueoAbierto, fetchByArqueoId]); // Este efecto se ejecuta cuando arqueoAbierto o fetchByArqueoId cambian

  // Elimina el memoizedFetchArqueoAbierto y el useEffect que dependía de él
  // Ya no son necesarios con la lógica separada.

  const handleOpenModal = (movement: MovimientoCaja | null = null) => {
    setCurrentMovement(movement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMovement(null);
  };

  const handleSubmit = async (
    data: MovimientoCajaCreate | MovimientoCajaUpdate
  ) => {
    try {
      if (currentMovement) {
        await updateMovimiento(
          currentMovement.id_movimiento,
          data as MovimientoCajaUpdate
        );
        setSnackbar({
          open: true,
          message: "Movimiento actualizado correctamente",
          severity: "success",
        });
      } else {
        await createMovimiento(data as MovimientoCajaCreate);
        setSnackbar({
          open: true,
          message: "Movimiento creado correctamente",
          severity: "success",
        });
      }
      if (arqueoAbierto?.id_arqueo) {
        fetchByArqueoId(arqueoAbierto.id_arqueo);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error al procesar la solicitud:", err);
      setSnackbar({
        open: true,
        message: "Error al procesar la solicitud",
        severity: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este movimiento?")
    ) {
      try {
        await deleteMovimiento(id);
        setSnackbar({
          open: true,
          message: "Movimiento eliminado correctamente",
          severity: "success",
        });
        if (arqueoAbierto?.id_arqueo) {
          fetchByArqueoId(arqueoAbierto.id_arqueo);
        }
      } catch (err) {
        console.error("Error al eliminar el movimiento:", err);
        setSnackbar({
          open: true,
          message: "Error al eliminar el movimiento",
          severity: "error",
        });
      }
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

  const calculateBalance = () => {
    return movimientos.reduce((total, mov) => {
      return mov.tipo === "Ingreso" ? total + mov.monto : total - mov.monto;
    }, 0);
  };

  //calcular ingresos sabiendo que el movimiento tiene como dato un string y no un number
  const calculateTotal = (tipo: "Ingreso" | "Egreso") => {  
    return movimientos
      .filter((mov) => mov.tipo === tipo)
      .reduce((total, mov) => total + Number(mov.monto), 0);
  }

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h4" component="h1">
            Movimientos de Caja
          </Typography>
          {arqueoAbierto && (
            <Typography variant="subtitle1">
              Arqueo actual: #{arqueoAbierto.id_arqueo} -{" "}
              {arqueoAbierto.fecha_inicio}
            </Typography>
          )}
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", justifyContent: "flex-end" }}
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenModal()}
            aria-label="Agregar movimiento"
            disabled={!arqueoAbierto}
          >
            Nuevo Movimiento
          </Button>
        </Grid>
      </Grid>

      {!arqueoAbierto && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No hay un arqueo de caja abierto. Debes abrir un arqueo para registrar
          movimientos.
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {arqueoAbierto && !loading && !error && (
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de Caja
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography>
                    Ingresos: $
                    {calculateTotal("Ingreso").toString()}
                     
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography>
                    Egresos: $
                    {calculateTotal("Egreso").toString()}
                     
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Typography variant="subtitle1">
                    Saldo actual: ${calculateBalance().toString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
          </Card>

          <TableContainer component={Paper} elevation={3}>
            <Table aria-label="Tabla de movimientos de caja">
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.main" }}>
                  <TableCell sx={{ color: "primary.contrastText" }}>
                    Fecha
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText" }}>
                    Tipo
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText" }}>
                    Monto
                  </TableCell>
                  <TableCell sx={{ color: "primary.contrastText" }}>
                    Descripción
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "primary.contrastText" }}
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {movimientos.map((movimiento) => (
                  <TableRow
                    key={movimiento.id_movimiento}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { border: 0 },
                    }}
                  >
                    <TableCell>{formatDate(movimiento.fecha)}</TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          movimiento.tipo === "Ingreso" ? (
                            <IncomeIcon />
                          ) : (
                            <OutcomeIcon />
                          )
                        }
                        label={movimiento.tipo}
                        color={
                          movimiento.tipo === "Ingreso" ? "success" : "error"
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>${movimiento.monto}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {movimiento.descripcion}
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
                          onClick={() => handleDelete(movimiento.id_movimiento)}
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
        </>
      )}

      <MovementFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentMovement={currentMovement}
        arqueoId={arqueoAbierto?.id_arqueo || 0}
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