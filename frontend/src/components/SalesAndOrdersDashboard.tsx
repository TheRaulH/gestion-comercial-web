import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  useTheme,
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
import { usePedidoStore } from "../stores/pedidoStore"; 
import { format, subDays, isSameDay, isSameWeek, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
import { OrderStatus, PaymentMethod } from "../types/pedidos";

// Componente para mostrar cuando no hay datos
const EmptyDataMessage = () => (
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
        No hay datos disponibles
      </Typography>
      <Typography variant="body1" color="textSecondary">
        Aún no se han registrado pedidos en el sistema.
      </Typography>
    </Box>
  );

// Componente de gráficos y estadísticas
const SalesAndOrdersDashboard = () => {
    const { pedidos, isLoading, error, fetchTodosPedidos } = usePedidoStore();
    const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("week");
    const theme = useTheme();
  
    useEffect(() => {
      fetchTodosPedidos();
    }, [fetchTodosPedidos]);
  
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
    if (!pedidos || pedidos.length === 0) {
      return <EmptyDataMessage />;
    }
  // Procesamiento de datos para gráficos
  const processSalesData = () => {
    const now = new Date();
    let compareFn: (dateLeft: Date, dateRight: Date) => boolean;
    let dateFormat: string;

    if (timeRange === "day") {
      compareFn = isSameDay;
      dateFormat = "HH:mm";
    } else if (timeRange === "week") {
      compareFn = isSameWeek;
      dateFormat = "EEEE";
    } else {
      compareFn = isSameMonth;
      dateFormat = "dd MMM";
    }

    const daysToShow = timeRange === "day" ? 24 : timeRange === "week" ? 7 : 30;
    const dateArray = Array.from({ length: daysToShow }, (_, i) =>
      subDays(now, i)
    ).reverse();

    return dateArray.map((date) => {
      const filteredOrders = pedidos.filter((order) =>
        compareFn(new Date(order.fecha_pedido), date)
      );

      return {
        date: format(date, dateFormat, { locale: es }),
        totalSales: filteredOrders.reduce((sum, order) => sum + order.total, 0),
        orderCount: filteredOrders.length,
        avgOrderValue:
          filteredOrders.length > 0
            ? filteredOrders.reduce((sum, order) => sum + order.total, 0) /
              filteredOrders.length
            : 0,
      };
    });
  };

  const processPaymentData = () => {
    const paymentMethods: Record<PaymentMethod, number> = {
      Efectivo: 0,
      Tarjeta: 0,
      QR: 0,
    };

    pedidos.forEach((order) => {
      paymentMethods[order.forma_pago] += order.total;
    });

    return Object.entries(paymentMethods).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const processStatusData = () => {
    const statusCounts: Record<OrderStatus, number> = {
      Pendiente: 0,
      "En cocina": 0, 
      Entregado: 0,
      Cancelado: 0,
    };

    pedidos.forEach((order) => {
      statusCounts[order.estado]++;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const processUserPerformance = () => {
    const userSales: Record<number, { name: string; sales: number }> = {};

    pedidos.forEach((order) => {
      if (!userSales[order.id_usuario]) {
        userSales[order.id_usuario] = {
          name: `Usuario ${order.id_usuario}`,
          sales: 0,
        };
      }
      userSales[order.id_usuario].sales += order.total;
    });

    return Object.values(userSales).sort((a, b) => b.sales - a.sales);
  };

  const salesData = processSalesData();
  const paymentData = processPaymentData();
  const statusData = processStatusData();
  const userPerformanceData = processUserPerformance();

  // Cálculo de KPIs
  const totalRevenue = pedidos.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = pedidos.length;
  const activeOrders = pedidos.filter(
    (order) => order.estado === "Pendiente" || order.estado === "En cocina"
  ).length;
  const cancelledOrders = pedidos.filter(
    (order) => order.estado === "Cancelado"
  ).length;
  const cancellationRate = (cancelledOrders / totalOrders) * 100;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <Box>
      {/* Selector de rango de tiempo */}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Tabs
          value={timeRange}
          onChange={(_, newValue) => setTimeRange(newValue)}
          sx={{ mb: 3 }}
        >
          <Tab label="Diario" value="day" />
          <Tab label="Semanal" value="week" />
          <Tab label="Mensual" value="month" />
        </Tabs>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Ingresos Totales</Typography>
              <Typography variant="h4">
                ${totalRevenue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Pedidos</Typography>
              <Typography variant="h4">{totalOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Pedidos Activos</Typography>
              <Typography variant="h4">{activeOrders}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Tasa de Cancelación</Typography>
              <Typography variant="h4">
                {cancellationRate.toFixed(1)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Valor Promedio</Typography>
              <Typography variant="h4">${avgOrderValue.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Tendencia de Ventas */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Tendencia de Ventas
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    stroke={theme.palette.primary.main}
                    name="Ventas Totales"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Número de Pedidos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Número de Pedidos
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="orderCount"
                    fill={theme.palette.secondary.main}
                    name="Número de Pedidos"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por Forma de Pago */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Forma de Pago
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentData}
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
                    {paymentData.map((entry, index) => (
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

        {/* Distribución por Estado */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Estado
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
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
                    {statusData.map((entry, index) => (
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

        {/* Ventas por Usuario */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Ventas por Usuario
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={userPerformanceData}
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="sales"
                    fill={theme.palette.primary.main}
                    name="Ventas Totales"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default SalesAndOrdersDashboard;