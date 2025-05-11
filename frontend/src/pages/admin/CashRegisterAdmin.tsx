// src/pages/admin/CashRegisterAdmin.tsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Grid,
  Chip,
  Tooltip,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Edit,
  Delete,
  Visibility,
  FilterList,
  Refresh,
  TrendingUp,
  TrendingDown,
  AccountBalance,
} from "@mui/icons-material";
import { useCajaStore } from "../../stores/cajaStore";
import { Arqueo } from "../../api/cajaApi";
import { useNavigate } from "react-router-dom";

export const CashRegisterAdmin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    arqueos,
    isLoading,
    error,
    fetchTodosArqueos,
    actualizarArqueo,
    eliminarArqueo,
  } = useCajaStore();

  const [selectedArqueo, setSelectedArqueo] = useState<Arqueo | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [ingresos, setIngresos] = useState("");
  const [egresos, setEgresos] = useState("");

  // Calcular totales para el dashboard
  const totalIngresos = arqueos.reduce(
    (sum, arqueo) => sum + parseFloat(arqueo.ingresos),
    0
  );
  const totalEgresos = arqueos.reduce(
    (sum, arqueo) => sum + parseFloat(arqueo.egresos),
    0
  );

  const arqueoActivo = arqueos.find((arqueo) => !arqueo.fecha_fin);

  useEffect(() => {
    fetchTodosArqueos();
  }, [fetchTodosArqueos]);

  const handleEditClick = (arqueo: Arqueo) => {
    setSelectedArqueo(arqueo);
    setSaldoInicial(arqueo.saldo_inicial);
    setIngresos(arqueo.ingresos);
    setEgresos(arqueo.egresos);
    setOpenEdit(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedArqueo) return;
    await actualizarArqueo(
      selectedArqueo.id_arqueo,
      parseFloat(saldoInicial),
      parseFloat(ingresos),
      parseFloat(egresos)
    );
    setOpenEdit(false);
  };

  const handleDeleteClick = async (arqueo: Arqueo) => {
    if (
      confirm(`¿Seguro que quieres eliminar el arqueo ID ${arqueo.id_arqueo}?`)
    ) {
      await eliminarArqueo(arqueo.id_arqueo);
    }
  };

  const handleViewDetails = (arqueo: Arqueo) => {
    navigate(`/cash-register-details/${arqueo.id_arqueo}`);
  };

  const handleRefresh = () => {
    fetchTodosArqueos();
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Administración de Arqueos
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Gestiona y supervisa todos los arqueos de caja del sistema
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      {/* Dashboard Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={3}
            sx={{
              height: "100%",
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Arqueo Activo</Typography>
              </Box>
              {arqueoActivo ? (
                <>
                  <Typography variant="h4" fontWeight="bold">
                    ${parseFloat(arqueoActivo.saldo_final).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID: {arqueoActivo.id_arqueo} • Usuario:{" "}
                    {arqueoActivo.id_usuario}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 2 }}
                    onClick={() => handleViewDetails(arqueoActivo)}
                  >
                    Ver Detalles
                  </Button>
                </>
              ) : (
                <Typography color="text.secondary">
                  No hay arqueos activos
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={3}
            sx={{
              height: "100%",
              borderLeft: `4px solid ${theme.palette.success.main}`,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUp color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Ingresos</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                ${totalIngresos.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                De {arqueos.length} arqueos registrados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={3}
            sx={{
              height: "100%",
              borderLeft: `4px solid ${theme.palette.error.main}`,
              transition: "transform 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingDown color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Egresos</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                ${totalEgresos.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                De {arqueos.length} arqueos registrados
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleRefresh}
        >
          Actualizar Datos
        </Button>

        <Button variant="outlined" startIcon={<FilterList />}>
          Filtrar
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Card sx={{ bgcolor: "error.light", mb: 3, p: 2 }}>
          <Typography color="error">{error}</Typography>
        </Card>
      )}

      {!isLoading && !error && (
        <Card elevation={4}>
          <TableContainer
            component={Paper}
            sx={{ borderRadius: 2, overflow: "hidden" }}
          >
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                <TableRow>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    ID
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Usuario
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Saldo Inicial
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Ingresos
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Egresos
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Saldo Final
                  </TableCell>
                  <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                    Estado
                  </TableCell>
                  <TableCell
                    sx={{ color: "white", fontWeight: "bold" }}
                    align="right"
                  >
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {arqueos.map((arqueo) => (
                  <TableRow
                    key={arqueo.id_arqueo}
                    sx={{
                      "&:hover": { bgcolor: "action.hover" },
                      bgcolor: !arqueo.fecha_fin
                        ? "rgba(0, 230, 118, 0.08)"
                        : "inherit",
                    }}
                  >
                    <TableCell>{arqueo.id_arqueo}</TableCell>
                    <TableCell>{arqueo.id_usuario}</TableCell>
                    <TableCell>
                      ${parseFloat(arqueo.saldo_inicial).toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{ color: "success.main", fontWeight: "medium" }}
                    >
                      ${parseFloat(arqueo.ingresos).toFixed(2)}
                    </TableCell>
                    <TableCell
                      sx={{ color: "error.main", fontWeight: "medium" }}
                    >
                      ${parseFloat(arqueo.egresos).toFixed(2)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      ${parseFloat(arqueo.saldo_final).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={arqueo.fecha_fin ? "Cerrado" : "Abierto"}
                        color={arqueo.fecha_fin ? "default" : "success"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Ver Detalles">
                        <IconButton
                          color="info"
                          onClick={() => handleViewDetails(arqueo)}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(arqueo)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(arqueo)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Modal de edición */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 8,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          Editar Arqueo
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Saldo Inicial"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Ingresos"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={ingresos}
            onChange={(e) => setIngresos(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Egresos"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={egresos}
            onChange={(e) => setEgresos(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleEditSubmit}>
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
