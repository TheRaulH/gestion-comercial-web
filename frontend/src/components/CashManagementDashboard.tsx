import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import {
  BarChart,
  LineChart,
  PieChart,
  Bar,
  Line,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useCajaStore } from "../stores/cajaStore";
import { useTheme } from "@mui/material/styles";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Componente para mostrar cuando no hay datos
const EmptyCashMessage = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="300px"
    textAlign="center"
    p={4}
  >
    <Typography variant="h6" gutterBottom>
      No hay datos de caja disponibles
    </Typography>
    <Typography variant="body1" color="textSecondary">
      Aún no se han registrado arqueos en el sistema.
    </Typography>
  </Box>
);

// Componente de gestión de caja
const CashManagementDashboard = () => {
  const {
    arqueos, 
    isLoading,
    error,
    fetchTodosArqueos,
    fetchTodosAbiertos,
  } = useCajaStore();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    if (tabValue === 0) {
      fetchTodosArqueos();
    } else {
      fetchTodosAbiertos();
    }
  }, [tabValue, fetchTodosArqueos, fetchTodosAbiertos]);

  // Estado de carga
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Manejo de errores
  if (error) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Datos vacíos
  if (!arqueos || arqueos.length === 0) {
    return <EmptyCashMessage />;
  }

  // Procesamiento de datos para gráficos
  const getArqueosByUser = () => {
    const users: Record<
      number,
      { name: string; saldoFinal: number; diferencia: number }
    > = {};

    arqueos.forEach((arqueo) => {
      if (!users[arqueo.id_usuario]) {
        users[arqueo.id_usuario] = {
          name: `Usuario ${arqueo.id_usuario}`,
          saldoFinal: 0,
          diferencia: 0,
        };
      }

      const saldoFinal = parseFloat(arqueo.saldo_final || "0");
      const saldoCalculado =
        parseFloat(arqueo.saldo_inicial || "0") +
        parseFloat(arqueo.ingresos || "0") -
        parseFloat(arqueo.egresos || "0");

      users[arqueo.id_usuario].saldoFinal += saldoFinal;
      users[arqueo.id_usuario].diferencia += saldoFinal - saldoCalculado;
    });

    return Object.values(users);
  };

  const getCashFlowData = () => {
    // Simulamos movimientos de caja (en un sistema real usarías los movimientos_caja)
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;

    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));

      return {
        date: format(date, timeRange === "week" ? "EEEE" : "dd MMM", {
          locale: es,
        }),
        ingresos: Math.floor(Math.random() * 500) + 100,
        egresos: Math.floor(Math.random() * 300) + 50,
      };
    });
  };

  const getMovementsDistribution = () => {
    // Simulamos distribución de movimientos (60% ingresos, 40% egresos)
    return [
      { name: "Ingresos", value: 60 },
      { name: "Egresos", value: 40 },
    ];
  };

  // Cálculo de KPIs
  const openArqueosCount = arqueos.filter((a) => !a.fecha_fin).length;
  const lastClosedArqueo = arqueos.find((a) => a.fecha_fin) || arqueos[0];
  const totalIngresos = arqueos.reduce(
    (sum, a) => sum + parseFloat(a.ingresos || "0"),
    0
  );
  const totalEgresos = arqueos.reduce(
    (sum, a) => sum + parseFloat(a.egresos || "0"),
    0
  );

  // Datos para gráficos
  const arqueosByUserData = getArqueosByUser();
  const cashFlowData = getCashFlowData();
  const movementsDistributionData = getMovementsDistribution();

  // Arqueos con inconsistencias (diferencia > 1%)
  const inconsistentArqueos = arqueos.filter((arqueo) => {
    const saldoFinal = parseFloat(arqueo.saldo_final || "0");
    const saldoCalculado =
      parseFloat(arqueo.saldo_inicial || "0") +
      parseFloat(arqueo.ingresos || "0") -
      parseFloat(arqueo.egresos || "0");

    return Math.abs(saldoFinal - saldoCalculado) > saldoCalculado * 0.01;
  });

  const COLORS = [theme.palette.success.main, theme.palette.error.main];

  return (
    <Box>
      {/* Tabs para cambiar entre arqueos cerrados y abiertos */}
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Arqueos Cerrados" />
        <Tab label="Arqueos Abiertos" />
      </Tabs>

      {/* Selector de rango de tiempo */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5">
          {tabValue === 0 ? "Historial de Arqueos" : "Arqueos Abiertos"}
        </Typography>

        {tabValue === 0 && (
          <Tabs
            value={timeRange}
            onChange={(_, newValue) => setTimeRange(newValue)}
            aria-label="time range tabs"
          >
            <Tab label="Semanal" value="week" />
            <Tab label="Mensual" value="month" />
            <Tab label="Anual" value="year" />
          </Tabs>
        )}
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Arqueos Abiertos</Typography>
              <Typography variant="h4">{openArqueosCount}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Último Saldo</Typography>
              <Typography variant="h4">
                $
                {parseFloat(
                  lastClosedArqueo?.saldo_final || "0"
                ).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Ingresos</Typography>
              <Typography variant="h4" color="success.main">
                ${totalIngresos.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Egresos</Typography>
              <Typography variant="h4" color="error.main">
                ${totalEgresos.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Resumen de Arqueos por Usuario */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Resumen de Arqueos por Usuario
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={arqueosByUserData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="saldoFinal"
                    fill={theme.palette.primary.main}
                    name="Saldo Final"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="diferencia"
                    fill={theme.palette.warning.main}
                    name="Diferencia"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Ingresos vs Egresos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Flujo de Caja (
                {timeRange === "week"
                  ? "Semanal"
                  : timeRange === "month"
                  ? "Mensual"
                  : "Anual"}
                )
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="ingresos"
                    stroke={theme.palette.success.main}
                    name="Ingresos"
                  />
                  <Line
                    type="monotone"
                    dataKey="egresos"
                    stroke={theme.palette.error.main}
                    name="Egresos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución de Movimientos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución de Movimientos
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={movementsDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {movementsDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Arqueos con inconsistencias */}
      {tabValue === 0 && inconsistentArqueos.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6" gutterBottom color="warning.main">
            Arqueos con Inconsistencias
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Arqueo</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell align="right">Saldo Final</TableCell>
                  <TableCell align="right">Saldo Calculado</TableCell>
                  <TableCell align="right">Diferencia</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inconsistentArqueos.map((arqueo) => {
                  const saldoFinal = parseFloat(arqueo.saldo_final || "0");
                  const saldoCalculado =
                    parseFloat(arqueo.saldo_inicial || "0") +
                    parseFloat(arqueo.ingresos || "0") -
                    parseFloat(arqueo.egresos || "0");
                  const diferencia = saldoFinal - saldoCalculado;

                  return (
                    <TableRow key={arqueo.id_arqueo}>
                      <TableCell>{arqueo.id_arqueo}</TableCell>
                      <TableCell>Usuario {arqueo.id_usuario}</TableCell>
                      <TableCell align="right">
                        ${saldoFinal.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        ${saldoCalculado.toFixed(2)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${
                            diferencia > 0 ? "+" : ""
                          }${diferencia.toFixed(2)}`}
                          color={diferencia > 0 ? "error" : "success"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default CashManagementDashboard;
