/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/admin/CashRegisterDetails.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Chip,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Stack,
  useTheme,
 
} from "@mui/material";


import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";


import {
  ArrowBack,
  AccountBalance,
  TrendingUp,
  TrendingDown,
  Receipt,
  Person,
  CalendarToday,
  PriceCheck,
  Payments,
} from "@mui/icons-material";
import { useCajaStore } from "../../stores/cajaStore";
import { Arqueo } from "../../api/cajaApi";
// Importar el store y el tipo para movimientos
import { useMovimientosCajaStore } from "../../stores/movimientosCajaStore"; // Asegúrate de que la ruta sea correcta

 

export const CashRegisterDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  // De useCajaStore para el arqueo principal
  const {
    arqueos,
    isLoading: isLoadingArqueos, // Renombrar para evitar conflicto
    error: arqueosError, // Renombrar para evitar conflicto
    fetchTodosArqueos,
  } = useCajaStore();

  // De useMovimientosCajaStore para los movimientos
  const {
    movimientos,
    loading: loadingMovimientos, // Usar este loading
    error: movimientosError, // Usar este error si necesitas manejarlo
    fetchByArqueoId,
  } = useMovimientosCajaStore();

  const [arqueo, setArqueo] = useState<Arqueo | null>(null);

  useEffect(() => {
    const arqueoId = Number(id);
    // Si los arqueos aún no están cargados, fetchTodosArqueos
    if (arqueos.length === 0 && !isLoadingArqueos && !arqueosError) {
      fetchTodosArqueos();
    }
    // Buscar el arqueo en el estado del store
    const foundArqueo = arqueos.find((a) => a.id_arqueo === arqueoId);
    setArqueo(foundArqueo || null);

    // Si el arqueo se encontró, cargar sus movimientos
    if (foundArqueo) {
      fetchByArqueoId(foundArqueo.id_arqueo);
    }
  }, [
    id,
    arqueos,
    isLoadingArqueos,
    arqueosError,
    fetchTodosArqueos,
    fetchByArqueoId,
  ]); // Agregar fetchByArqueoId a las dependencias

  // Calcular totales usando los movimientos del store
  const totalIngresos = movimientos
    .filter((m: { tipo: string; }) => m.tipo === "Ingreso") // Usar "Ingreso" capitalizado según tu tipo
    .reduce((sum: any, m: { monto: any; }) => sum + m.monto, 0);

  const totalEgresos = movimientos
    .filter((m: { tipo: string; }) => m.tipo === "Egreso") // Usar "Egreso" capitalizado según tu tipo
    .reduce((sum: any, m: { monto: any; }) => sum + m.monto, 0);

  if (isLoadingArqueos || !arqueo) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (arqueosError) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Volver
        </Button>
        <Typography color="error" variant="h6">
          {arqueosError}
        </Typography>
      </Box>
    );
  }

  if (movimientosError) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Volver
        </Button>
        <Typography color="error" variant="h6">
          {movimientosError}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
        variant="outlined"
      >
        Volver a Arqueos
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Detalles del Arqueo #{arqueo.id_arqueo}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {arqueo.fecha_fin
            ? `Cerrado el ${new Date(arqueo.fecha_fin).toLocaleString()}`
            : "Arqueo actualmente abierto"}
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>

      {/* Información General */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={3}
            sx={{
              height: "100%",
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Información General
              </Typography>

              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Person color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Usuario
                    </Typography>
                    <Typography variant="subtitle1">
                      {arqueo.id_usuario}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <CalendarToday color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Fecha Apertura
                    </Typography>
                    <Typography variant="subtitle1">
                      {new Date(arqueo.fecha_inicio).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                {arqueo.fecha_fin && (
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CalendarToday color="primary" sx={{ mr: 2 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fecha Cierre
                      </Typography>
                      <Typography variant="subtitle1">
                        {new Date(arqueo.fecha_fin).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                )}

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Chip
                    label={arqueo.fecha_fin ? "CERRADO" : "ABIERTO"}
                    color={arqueo.fecha_fin ? "default" : "success"}
                    size="small"
                  />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={3}
            sx={{
              height: "100%",
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                Resumen Financiero
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "background.default",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Saldo Inicial
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ${parseFloat(arqueo.saldo_inicial).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "success.light",
                      borderRadius: 1,
                      color: "success.dark",
                    }}
                  >
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Ingresos
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ${parseFloat(arqueo.ingresos).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "error.light",
                      borderRadius: 1,
                      color: "error.dark",
                    }}
                  >
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Egresos
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ${parseFloat(arqueo.egresos).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "primary.light",
                      borderRadius: 1,
                      color: "primary.dark",
                    }}
                  >
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Saldo Final
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      ${parseFloat(arqueo.saldo_final).toFixed(2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Movimientos */}
      <Card elevation={3} sx={{ borderRadius: 2, mb: 4 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              flexDirection: { xs: "column", md: "row" }, // Stack on small screens
              gap: { xs: 2, md: 0 }, // Add gap when stacked
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              <Receipt sx={{ mr: 1, verticalAlign: "middle" }} />
              Movimientos del Arqueo
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              {" "}
              {/* Use gap for chips */}
              <Chip
                icon={<TrendingUp />}
                label={`Ingresos: $${totalIngresos.toFixed(2)}`} // Usar totalIngresos calculado de los movimientos
                color="success"
                variant="outlined"
                size="small"
              />
              <Chip
                icon={<TrendingDown />}
                label={`Egresos: $${totalEgresos.toFixed(2)}`} // Usar totalEgresos calculado de los movimientos
                color="error"
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>

          {loadingMovimientos ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : movimientos.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: "background.default" }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Descripcion</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Monto</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {movimientos.map((mov) => (
                    <TableRow
                      key={mov.id_movimiento}
                      sx={{ "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <TableCell>{mov.id_movimiento}</TableCell>
                      <TableCell>
                        {new Date(mov.fecha).toLocaleString()}
                      </TableCell>
                      <TableCell>{mov.descripcion}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          // Usar "Ingreso" o "Egreso" capitalizado para comparar
                          label={mov.tipo === "Ingreso" ? "Ingreso" : "Egreso"}
                          color={mov.tipo === "Ingreso" ? "success" : "error"}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          // Usar "Ingreso" o "Egreso" capitalizado para comparar
                          color:
                            mov.tipo === "Ingreso"
                              ? "success.main"
                              : "error.main",
                          fontWeight: "bold",
                        }}
                      >
                        ${mov.monto.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                No hay movimientos registrados para este arqueo
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Línea de tiempo */}
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
            Cronología del Arqueo
          </Typography>

          {/* Puedes añadir un CircularProgress aquí también si loadingMovimientos es true */}
          {loadingMovimientos ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress size={30} />
            </Box>
          ) : (
            <Timeline position="alternate">
              {/* Evento de Apertura siempre primero */}
              <TimelineItem>
                <TimelineOppositeContent color="text.secondary">
                  {new Date(arqueo.fecha_inicio).toLocaleString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary">
                    <AccountBalance />
                  </TimelineDot>
                  {/* Conector si hay movimientos o si el arqueo está abierto */}
                  {(movimientos.length > 0 || !arqueo.fecha_fin) && (
                    <TimelineConnector />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="h6" component="span">
                    Apertura de Arqueo
                  </Typography>
                  <Typography>
                    Saldo inicial: $
                    {parseFloat(arqueo.saldo_inicial).toFixed(2)}
                  </Typography>
                </TimelineContent>
              </TimelineItem>

              {/* Movimientos */}
              {/* Asegurarse de que los movimientos estén ordenados por fecha si no lo están ya */}
              {/* Puedes añadir .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()) si es necesario */}
              {movimientos.map((mov, index) => (
                <TimelineItem key={mov.id_movimiento}>
                  <TimelineOppositeContent color="text.secondary">
                    {new Date(mov.fecha).toLocaleString()}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot
                      // Usar "Ingreso" o "Egreso" capitalizado para comparar
                      color={mov.tipo === "Ingreso" ? "success" : "error"}
                    >
                      {/* Usar "Ingreso" o "Egreso" capitalizado para comparar */}
                      {mov.tipo === "Ingreso" ? <Payments /> : <PriceCheck />}
                    </TimelineDot>
                    {/* Conector si no es el último movimiento Y el arqueo no está cerrado */}
                    {(index < movimientos.length - 1 || !arqueo.fecha_fin) && (
                      <TimelineConnector />
                    )}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      {/* Usar "Ingreso" o "Egreso" capitalizado */}
                      {mov.tipo === "Ingreso" ? "Ingreso" : "Egreso"}
                    </Typography>
                    <Typography>
                      {/* Usar mov.descripcion */}
                      {mov.descripcion} (${mov.monto.toFixed(2)})
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}

              {/* Evento de Cierre si el arqueo está cerrado */}
              {arqueo.fecha_fin && (
                <TimelineItem>
                  <TimelineOppositeContent color="text.secondary">
                    {new Date(arqueo.fecha_fin).toLocaleString()}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      {" "}
                      {/* O un color diferente para cierre */}                      
                      <AccountBalance />{" "}
                      {/* Icono de cierre, maybe diferente? */}
                    </TimelineDot>
                    {/* No connector after the last item */}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">
                      Cierre de Arqueo
                    </Typography>
                    <Typography>
                      Saldo final: ${parseFloat(arqueo.saldo_final).toFixed(2)}
                    </Typography>
                    {/* Puedes añadir la diferencia aquí si quieres */}
                    {/* <Typography>Diferencia: ...</Typography> */}
                  </TimelineContent>
                </TimelineItem>
              )}
            </Timeline>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}