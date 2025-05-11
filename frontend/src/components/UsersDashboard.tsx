import {   useEffect } from "react";
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
  Avatar,
} from "@mui/material";
import {
  BarChart,
  PieChart,
  Bar,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useUserStore } from "../stores/userStore";
import { usePedidoStore } from "../stores/pedidoStore";
import { useCajaStore } from "../stores/cajaStore";
import { useTheme } from "@mui/material/styles";

// Componente para mostrar cuando no hay datos
const EmptyUsersMessage = () => (
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
      No hay usuarios registrados
    </Typography>
    <Typography variant="body1" color="textSecondary">
      Aún no se han registrado usuarios en el sistema.
    </Typography>
  </Box>
);

// Componente de gestión de usuarios
const UsersDashboard = () => {
  const { users, isLoading, error, fetchUsers } = useUserStore();
  const { pedidos } = usePedidoStore();
  const { arqueos } = useCajaStore();
  const theme = useTheme();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
  if (!users || users.length === 0) {
    return <EmptyUsersMessage />;
  }

  // Procesamiento de datos para gráficos
  const getUserActivityData = () => {
    return users
      .map((user) => {
        const userPedidos = pedidos.filter(
          (p) => p.id_usuario === parseInt(user.id_usuario)
        ).length;
        const userArqueos = arqueos.filter(
          (a) => a.id_usuario === parseInt(user.id_usuario)
        ).length;

        return {
          name: user.nombre,
          pedidos: userPedidos,
          arqueos: userArqueos,
          total: userPedidos + userArqueos,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const getUserStatusData = () => {
    const activeUsers = users.filter((u) => u.activo).length;
    const inactiveUsers = users.length - activeUsers;

    return [
      { name: "Activos", value: activeUsers },
      { name: "Inactivos", value: inactiveUsers },
    ];
  };

  const getUserRoleData = () => {
    const admins = users.filter((u) => u.es_administrador).length;
    const regularUsers = users.length - admins;

    return [
      { name: "Administradores", value: admins },
      { name: "Usuarios", value: regularUsers },
    ];
  };

  // Cálculo de KPIs
  const totalUsers = users.length;
  const adminUsers = users.filter((u) => u.es_administrador).length;
  const activeUsers = users.filter((u) => u.activo).length;
  const inactiveUsers = totalUsers - activeUsers;

  // Datos para gráficos
  const userActivityData = getUserActivityData();
  const userStatusData = getUserStatusData();
  const userRoleData = getUserRoleData();

  // Colores para gráficos
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  // Usuarios más activos (combinando pedidos y arqueos)
  const mostActiveUsers = [...users]
    .map((user) => {
      const pedidosCount = pedidos.filter(
        (p) => p.id_usuario === parseInt(user.id_usuario)
      ).length;
      const arqueosCount = arqueos.filter(
        (a) => a.id_usuario === parseInt(user.id_usuario)
      ).length;
      return {
        ...user,
        actividadTotal: pedidosCount + arqueosCount,
        pedidosCount,
        arqueosCount,
      };
    })
    .sort((a, b) => b.actividadTotal - a.actividadTotal)
    .slice(0, 5);

  return (
    <Box>
      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Usuarios</Typography>
              <Typography variant="h4">{totalUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Administradores</Typography>
              <Typography variant="h4">{adminUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Usuarios Activos</Typography>
              <Typography variant="h4" color="success.main">
                {activeUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Usuarios Inactivos</Typography>
              <Typography variant="h4" color="error.main">
                {inactiveUsers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Actividad de usuarios (pedidos + arqueos) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Usuarios Más Activos
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="pedidos"
                    fill={theme.palette.primary.main}
                    name="Pedidos"
                  />
                  <Bar
                    dataKey="arqueos"
                    fill={theme.palette.secondary.main}
                    name="Arqueos"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribución por rol */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Rol
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userRoleData}
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
                    {userRoleData.map((entry, index) => (
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

        {/* Distribución por estado */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribución por Estado
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userStatusData}
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
                    {userStatusData.map((entry, index) => (
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

      {/* Tabla de usuarios más activos */}
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Usuarios Más Activos (Pedidos + Arqueos)
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell align="right">Total Actividad</TableCell>
                <TableCell align="right">Pedidos</TableCell>
                <TableCell align="right">Arqueos</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mostActiveUsers.map((user) => (
                <TableRow key={user.id_usuario}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar>{user.nombre.charAt(0).toUpperCase()}</Avatar>
                      {user.nombre}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{user.actividadTotal}</TableCell>
                  <TableCell align="right">{user.pedidosCount}</TableCell>
                  <TableCell align="right">{user.arqueosCount}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.es_administrador ? "Admin" : "Usuario"}
                      color={user.es_administrador ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.activo ? "Activo" : "Inactivo"}
                      color={user.activo ? "success" : "error"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default UsersDashboard;
