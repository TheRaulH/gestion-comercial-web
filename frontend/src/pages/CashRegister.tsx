// src/pages/CashRegister.tsx (This file will now contain the merged logic)
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Chip,
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

import { useCajaStore } from "../stores/cajaStore";
import { useMovimientosCajaStore } from "../stores/movimientosCajaStore";
import {
  MovimientoCaja,
  MovimientoCajaCreate,
  MovimientoCajaUpdate,
} from "../types/movimientoCaja"; // Assuming these types are in this file

// MovementFormModal (Copied from CashMovements.tsx)
const MovementFormModal = ({
  open,
  onClose,
  onSubmit,
  currentMovement,
  arqueoId,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: MovimientoCajaCreate | MovimientoCajaUpdate
  ) => Promise<void>;
  currentMovement?: MovimientoCaja | null;
  arqueoId: number | null; // Allow null as arqueo might not be open
}) => {
  const [formData, setFormData] = useState<
    MovimientoCajaCreate | MovimientoCajaUpdate
  >({
    id_arqueo: arqueoId || 0, // Default to 0 if null, validation happens before opening modal
    tipo: "Ingreso",
    monto: 0,
    descripcion: "",
    fecha: new Date().toISOString(),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentMovement) {
      // For editing, only descripcion and monto can be changed
      setFormData({
        descripcion: currentMovement.descripcion,
        monto: currentMovement.monto,
      });
    } else {
      // For creating, all fields are needed
      setFormData({
        id_arqueo: arqueoId || 0,
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
    if (!arqueoId) {
      alert("No hay un arqueo abierto para registrar movimientos.");
      return;
    }
    setIsSubmitting(true);
    try {
      const dataToSubmit = currentMovement
        ? formData
        : { ...formData, id_arqueo: arqueoId };
      await onSubmit(dataToSubmit);
      onClose();
    } catch (error) {
      console.error("Error submitting movement:", error);
      // Handle specific errors if needed, e.g., show a more specific message
      alert("Hubo un error al guardar el movimiento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if the submit button should be disabled
  const isSubmitDisabled =
    isSubmitting || !formData.descripcion || (formData.monto ?? 0) <= 0;

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
                      value={(formData as MovimientoCajaCreate).tipo}
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="Ingreso">Ingreso</MenuItem>
                      <MenuItem value="Egreso">Egreso</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
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
              </>
            )}
            {/* For editing, type and id_arqueo are not edited */}
            {currentMovement && (
              <Grid size={{ xs: 12 }}>
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
            )}
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
          disabled={isSubmitDisabled}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {currentMovement ? "Actualizar" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Combined Cash Register and Movements Page
export const CashRegister = () => {
  const {
    arqueoAbierto,
    isLoading: isLoadingCaja,
    error: errorCaja,
    fetchArqueoAbierto,
    crearArqueo,
    cerrarArqueo,
  } = useCajaStore();

  const {
    movimientos,
    loading: isLoadingMovimientos,
    error: errorMovimientos,
    fetchByArqueoId,
    createMovimiento,
    updateMovimiento,
    deleteMovimiento,
  } = useMovimientosCajaStore();

  const [saldoInicial, setSaldoInicial] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMovement, setCurrentMovement] = useState<MovimientoCaja | null>(
    null
  );
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  // Effect to initially fetch the open arqueo
  useEffect(() => {
    fetchArqueoAbierto();
  }, [fetchArqueoAbierto]);

  // Effect to fetch movements when an arqueo is open or changes
  useEffect(() => {
    if (arqueoAbierto && arqueoAbierto.id_arqueo) {
      fetchByArqueoId(arqueoAbierto.id_arqueo);
    } else {
      // Clear movements if no arqueo is open
      // You might need a clearMovimientos action in your store
      // For now, we'll just not display them in the UI if arqueoAbierto is null
      // A store action to clear might be cleaner depending on store implementation
    }
  }, [arqueoAbierto, fetchByArqueoId]);

  const handleAbrirCaja = async () => {
    if (!saldoInicial || parseFloat(saldoInicial) < 0) {
      alert("Por favor ingresa un saldo inicial válido (mayor o igual a 0).");
      return;
    }
    try {
      await crearArqueo(parseFloat(saldoInicial));
      setSaldoInicial("");
      // fetchArqueoAbierto will be triggered by the store update,
      // which in turn triggers the movements fetch effect.
      setSnackbar({
        open: true,
        message: "Caja abierta exitosamente",
        severity: "success",
      });
    } catch (error) {
      console.error("Error al abrir caja:", error);
      setSnackbar({
        open: true,
        message: "Error al abrir caja",
        severity: "error",
      });
    }
  };

  const calculateTotal = (tipo: "Ingreso" | "Egreso") => {
    return movimientos
      .filter((mov) => mov.tipo === tipo)
      .reduce((total, mov) => total + Number(mov.monto), 0);
  };

  const calculateCurrentBalance = () => {
    const saldoInicialValue =
      parseFloat(arqueoAbierto?.saldo_inicial?.toString() || "0") || 0;
    const totalIngresos = calculateTotal("Ingreso");
    const totalEgresos = calculateTotal("Egreso");
    return saldoInicialValue + totalIngresos - totalEgresos;
  };

  const handleCerrarCaja = async () => {
    if (!arqueoAbierto?.id_arqueo) {
      alert("No hay una caja abierta para cerrar.");
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas cerrar la caja?")) {
      return; // User cancelled
    }

    try {
      const totalIngresos = calculateTotal("Ingreso");
      const totalEgresos = calculateTotal("Egreso");

      // saldo_final is calculated based on the movements
      const saldo_final = calculateCurrentBalance();

      await cerrarArqueo(
        arqueoAbierto.id_arqueo,
        totalIngresos,
        totalEgresos,
        saldo_final
      );

      setSnackbar({
        open: true,
        message: "Caja cerrada exitosamente",
        severity: "success",
      });

      // Refetch arqueo state, which will then clear/refetch movements
      fetchArqueoAbierto();
    } catch (error) {
      console.error("Error al cerrar caja:", error);
      setSnackbar({
        open: true,
        message: "Error al cerrar caja. Por favor intenta nuevamente.",
        severity: "error",
      });
    }
  };

  const handleOpenModal = (movement: MovimientoCaja | null = null) => {
    if (!arqueoAbierto) {
      alert("Debes tener una caja abierta para registrar movimientos.");
      return;
    }
    setCurrentMovement(movement);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMovement(null);
  };

  const handleSubmitMovement = async (
    data: MovimientoCajaCreate | MovimientoCajaUpdate
  ) => {
    if (!arqueoAbierto?.id_arqueo) {
      console.error("Attempted to submit movement without open arqueo.");
      setSnackbar({
        open: true,
        message: "Error: No hay arqueo abierto.",
        severity: "error",
      });
      return;
    }

    try {
      if (currentMovement) {
        // Update
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
        // Create
        const createData = data as MovimientoCajaCreate;
        // Ensure id_arqueo is correctly assigned from the open arqueo
        createData.id_arqueo = arqueoAbierto.id_arqueo;
        // Ensure date is current if not provided (modal provides it, but defensive check)
        if (!createData.fecha) createData.fecha = new Date().toISOString();

        await createMovimiento(createData);
        setSnackbar({
          open: true,
          message: "Movimiento creado correctamente",
          severity: "success",
        });
      }
      // Refetch movements after create/update
      fetchByArqueoId(arqueoAbierto.id_arqueo);
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

  const handleDeleteMovement = async (id: number) => {
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
          fetchByArqueoId(arqueoAbierto.id_arqueo); // Refetch after delete
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

  const totalLoading = isLoadingCaja || isLoadingMovimientos;
  const anyError = errorCaja || errorMovimientos;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Caja Registradora
      </Typography>

      {totalLoading && <CircularProgress sx={{ my: 2 }} />}
      {anyError && (
        <Typography color="error" sx={{ mt: 2 }}>
          {anyError}
        </Typography>
      )}

      {!totalLoading && !arqueoAbierto && (
        <Paper sx={{ p: 4, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            No tienes una caja abierta
          </Typography>
          <TextField
            label="Saldo Inicial"
            type="number"
            fullWidth
            sx={{ my: 2 }}
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Button variant="contained" onClick={handleAbrirCaja} fullWidth>
            Abrir Caja
          </Button>
        </Paper>
      )}

      {!totalLoading && arqueoAbierto && (
        <>
          <Paper sx={{ p: 4, mt: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Caja Abierta
            </Typography>
            {/* Display Saldo Inicial - Handle both string and number possibility */}
            {arqueoAbierto.saldo_inicial !== undefined && (
              <Typography>
                Saldo Inicial:{" "}
                <strong>
                  $
                  {parseFloat(arqueoAbierto.saldo_inicial.toString()).toFixed(
                    2
                  )}
                </strong>
              </Typography>
            )}

            <Typography sx={{ mt: 1 }}>
              Fecha de Apertura:{" "}
              <strong>
                {arqueoAbierto?.fecha_inicio
                  ? new Date(arqueoAbierto.fecha_inicio).toLocaleString()
                  : "Fecha no disponible"}
              </strong>
            </Typography>

            {/* Display Summary Card */}
            <Card variant="outlined" sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resumen de Movimientos
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography>
                      Ingresos: $
                      <strong>{calculateTotal("Ingreso").toFixed(2)}</strong>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography>
                      Egresos: $
                      <strong>{calculateTotal("Egreso").toFixed(2)}</strong>
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1">
                      Saldo actual (Movimientos): $
                      <strong>{calculateCurrentBalance().toFixed(2)}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              color="success"
              sx={{ mt: 3 }}
              fullWidth
              onClick={handleCerrarCaja}
              disabled={isLoadingCaja} // Prevent multiple clicks while closing
            >
              Cerrar Caja
            </Button>
          </Paper>

          {/* Movements Section */}
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center" mb={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h5" component="h2">
                  Detalle de Movimientos
                </Typography>
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
                  disabled={!arqueoAbierto} // Disable if no arqueo is open
                >
                  Nuevo Movimiento
                </Button>
              </Grid>
            </Grid>

            {isLoadingMovimientos ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                <CircularProgress />
              </Box>
            ) : errorMovimientos ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMovimientos}
              </Alert>
            ) : movimientos.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No hay movimientos registrados para este arqueo.
              </Alert>
            ) : (
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
                              movimiento.tipo === "Ingreso"
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>${movimiento.monto.toFixed(2)}</TableCell>{" "}
                        {/* Format monto */}
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
                              onClick={() =>
                                handleDeleteMovement(movimiento.id_movimiento)
                              }
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
          </Box>
        </>
      )}

      {/* Modal for adding/editing movements */}
      <MovementFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitMovement}
        currentMovement={currentMovement}
        arqueoId={arqueoAbierto?.id_arqueo || null} // Pass the open arqueo ID
      />

      {/* Snackbar for notifications */}
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

// You will also need the MovimientoCaja types, assuming they were in CashMovements.tsx
// Copy or import them here if needed. Example:
/*
export interface MovimientoCaja {
    id_movimiento: number;
    id_arqueo: number;
    tipo: 'Ingreso' | 'Egreso';
    monto: number;
    descripcion: string;
    fecha: string; // ISO 8601 string
    created_at: string;
    updated_at: string;
}

export type MovimientoCajaCreate = Omit<MovimientoCaja, 'id_movimiento' | 'created_at' | 'updated_at'>;
export type MovimientoCajaUpdate = Partial<Omit<MovimientoCaja, 'id_movimiento' | 'id_arqueo' | 'fecha' | 'created_at' | 'updated_at'>>;
*/
