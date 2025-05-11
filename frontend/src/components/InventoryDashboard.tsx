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
import { useProductoStore } from "../stores/productoStore";
import { useMovimientoStore } from "../stores/movimientoStore";
import { useTheme } from "@mui/material/styles";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";

// Componente para mostrar cuando no hay datos
const EmptyInventoryMessage = () => (
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
      No hay datos de inventario disponibles
    </Typography>
    <Typography variant="body1" color="textSecondary">
      Aún no se han registrado productos en el sistema.
    </Typography>
  </Box>
);

// Componente de gráficos y estadísticas de inventario
const InventoryDashboard = () => {
  const {
    productos,
    isLoading: loadingProducts,
    error: productsError,
    fetchProductos,
  } = useProductoStore();
  const {
    movimientos,
    isLoading: loadingMovements,
    error: movementsError,
    fetchMovimientos,
  } = useMovimientoStore();
  const theme = useTheme();
  const [topN, setTopN] = useState<number>(5);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState<"week" | "month">("week");

  useEffect(() => {
    fetchProductos();
    fetchMovimientos();
  }, [fetchProductos, fetchMovimientos]);

  // Estados combinados de carga y error
  const isLoading = loadingProducts || loadingMovements;
  const error = productsError || movementsError;

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
  if (!productos || productos.length === 0) {
    return <EmptyInventoryMessage />;
  }

  // Procesamiento de datos para gráficos
  const getTopProductsBySales = () => {
    // Ahora usamos datos reales de movimientos de egresos (ventas)
    const productSales: Record<
      number,
      { name: string; sales: number; stock: number }
    > = {};

    movimientos?.forEach((movimiento) => {
      if (movimiento.tipo_movimiento === "Egreso") {
        if (!productSales[movimiento.id_producto]) {
          const product = productos.find(
            (p) => p.id_producto === movimiento.id_producto
          );
          productSales[movimiento.id_producto] = {
            name: product?.nombre || `Producto ${movimiento.id_producto}`,
            sales: 0,
            stock: product?.stock_actual || 0,
          };
        }
        productSales[movimiento.id_producto].sales += movimiento.cantidad;
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, topN);
  };

  const getStockByCategory = () => {
    const categories: Record<
      number,
      { name: string; stock: number; count: number }
    > = {};

    productos.forEach((product) => {
      if (!categories[product.id_tipo_producto]) {
        categories[product.id_tipo_producto] = {
          name: `Tipo ${product.id_tipo_producto}`,
          stock: 0,
          count: 0,
        };
      }
      categories[product.id_tipo_producto].stock += product.stock_actual;
      categories[product.id_tipo_producto].count++;
    });

    return Object.values(categories);
  };

  const getInventoryMovements = () => {
    const days = timeRange === "week" ? 7 : 30;
    const dateArray = Array.from({ length: days }, (_, i) =>
      subDays(new Date(), i)
    ).reverse();

    return dateArray.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const ingresos =
        movimientos
          ?.filter(
            (m) => m.tipo_movimiento === "Ingreso" && m.fecha.includes(dateStr)
          )
          .reduce((sum, m) => sum + m.cantidad, 0) || 0;

      const egresos =
        movimientos
          ?.filter(
            (m) => m.tipo_movimiento === "Egreso" && m.fecha.includes(dateStr)
          )
          .reduce((sum, m) => sum + m.cantidad, 0) || 0;

      return {
        date: format(date, timeRange === "week" ? "EEEE" : "dd MMM", {
          locale: es,
        }),
        ingresos,
        egresos,
      };
    });
  };

  const getMovementTypesDistribution = () => {
    if (!movimientos || movimientos.length === 0) {
      return [
        { name: "Ingresos", value: 0 },
        { name: "Egresos", value: 0 },
      ];
    }

    const ingresos = movimientos.filter(
      (m) => m.tipo_movimiento === "Ingreso"
    ).length;
    const egresos = movimientos.length - ingresos;

    return [
      { name: "Ingresos", value: ingresos },
      { name: "Egresos", value: egresos },
    ];
  };

  // Cálculo de KPIs
  const totalProducts = productos.length;
  const activeProducts = productos.filter((p) => p.activo).length;
  const lowStockProducts = productos.filter(
    (p) => p.stock_actual <= lowStockThreshold
  ).length;
  const totalInventoryValue = productos.reduce(
    (sum, p) => sum + p.precio * p.stock_actual,
    0
  );
  const totalIngresos =
    movimientos
      ?.filter((m) => m.tipo_movimiento === "Ingreso")
      .reduce((sum, m) => sum + m.cantidad, 0) || 0;
  const totalEgresos =
    movimientos
      ?.filter((m) => m.tipo_movimiento === "Egreso")
      .reduce((sum, m) => sum + m.cantidad, 0) || 0;

  // Datos para gráficos
  const topProductsData = getTopProductsBySales();
  const stockByCategoryData = getStockByCategory();
  const inventoryMovementsData = getInventoryMovements();
  const movementTypesData = getMovementTypesDistribution();

  // Productos con bajo stock
  const lowStockProductsList = productos
    .filter((p) => p.stock_actual <= lowStockThreshold)
    .sort((a, b) => a.stock_actual - b.stock_actual);

  // Productos con movimientos recientes
  const recentMovements = [...(movimientos || [])]
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 10);

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <Box>
      {/* Tabs para cambiar entre vistas */}
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Resumen" />
        <Tab label="Movimientos" />
      </Tabs>

      {tabValue === 0 ? (
        <>
          {/* Selector de parámetros */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box display="flex" gap={2}>
              <Box>
                <Typography variant="subtitle2">Top productos</Typography>
                <select
                  value={topN}
                  onChange={(e) => setTopN(Number(e.target.value))}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {[3, 5, 10].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </Box>
              <Box>
                <Typography variant="subtitle2">Umbral stock bajo</Typography>
                <select
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                  style={{
                    padding: "8px",
                    borderRadius: "4px",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {[5, 10, 15, 20].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </Box>
            </Box>

            <Tabs
              value={timeRange}
              onChange={(_, newValue) => setTimeRange(newValue)}
              
            >
              <Tab label="Semanal" value="week" />
              <Tab label="Mensual" value="month" />
            </Tabs>
          </Box>

          {/* KPIs */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Productos</Typography>
                  <Typography variant="h4">{totalProducts}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Productos Activos</Typography>
                  <Typography variant="h4">{activeProducts}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Stock Bajo</Typography>
                  <Typography
                    variant="h4"
                    color={lowStockProducts > 0 ? "error" : "inherit"}
                  >
                    {lowStockProducts}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Valor Inventario</Typography>
                  <Typography variant="h4">
                    ${totalInventoryValue.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Gráficos */}
          <Grid container spacing={3}>
            {/* Top Productos Más Vendidos */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Top {topN} Productos Más Vendidos
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topProductsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="sales"
                        fill={theme.palette.primary.main}
                        name="Unidades Vendidas"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Stock por Categoría */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Stock por Tipo de Producto
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stockByCategoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="stock"
                        fill={theme.palette.secondary.main}
                        name="Stock Total"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* Movimientos de Inventario */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Movimientos de Inventario (
                    {timeRange === "week" ? "Última semana" : "Último mes"})
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={inventoryMovementsData}>
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

            {/* Distribución de tipos de movimiento */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Distribución de Movimientos
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={movementTypesData}
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
                        {movementTypesData.map((entry, index) => (
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

          {/* Productos con bajo stock */}
          <Box mt={4}>
            <Typography variant="h6" gutterBottom>
              Productos con Stock Bajo (≤ {lowStockThreshold} unidades)
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Producto</TableCell>
                    <TableCell align="right">Stock Actual</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lowStockProductsList.map((product) => (
                    <TableRow key={product.id_producto}>
                      <TableCell>{product.nombre}</TableCell>
                      <TableCell align="right">
                        {product.stock_actual}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={
                            product.stock_actual === 0
                              ? "Agotado"
                              : "Bajo stock"
                          }
                          color={
                            product.stock_actual === 0 ? "error" : "warning"
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      ) : (
        <>
          {/* Vista de movimientos */}
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Últimos Movimientos de Inventario
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Total ingresos: {totalIngresos} unidades | Total egresos:{" "}
              {totalEgresos} unidades
            </Typography>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell>Observaciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentMovements.map((movimiento) => {
                  const product = productos.find(
                    (p) => p.id_producto === movimiento.id_producto
                  );
                  return (
                    <TableRow key={movimiento.id}>
                      <TableCell>
                        {format(new Date(movimiento.fecha), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        {product?.nombre ||
                          `Producto ${movimiento.id_producto}`}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={movimiento.tipo_movimiento}
                          color={
                            movimiento.tipo_movimiento === "Ingreso"
                              ? "success"
                              : "error"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">{movimiento.cantidad}</TableCell>
                      <TableCell>{movimiento.observaciones || "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default InventoryDashboard;
