// src/pages/Dashboard.tsx
import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import SalesAndOrdersDashboard from "../components/SalesAndOrdersDashboard";
import InventoryDashboard from "../components/InventoryDashboard";
import CashManagementDashboard from "../components/CashManagementDashboard";
import UsersDashboard from "../components/UsersDashboard";
// Componente para mostrar cuando el usuario no es admin
const WelcomeMessage = () => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    minHeight="60vh"
    textAlign="center"
  >
    <Typography variant="h4" gutterBottom>
      ¡Bienvenido al Sistema de Gestión!
    </Typography>
    <Typography variant="body1" color="textSecondary">
      Aquí podrás gestionar tus pedidos y realizar seguimiento a tus
      actividades.
    </Typography>
  </Box>
);
// Componente principal del Dashboard
const Dashboard = () => {
  const { user } = useAuthStore();
  const [tabValue, setTabValue] = useState(0);

  if (!user?.es_administrador) {
    return <WelcomeMessage />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Panel de Administración
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="Ventas y Pedidos" />
        <Tab label="Inventario" />
        <Tab label="Gestion de Caja" />
        <Tab label="Usuarios" />
        {/* Puedes añadir más pestañas aquí para otras secciones del dashboard */}
      </Tabs>

      {tabValue === 0 && <SalesAndOrdersDashboard />}
      {tabValue === 1 && <InventoryDashboard />}
      {tabValue === 2 && <CashManagementDashboard />}
      {tabValue === 3 && <UsersDashboard />}
    </Box>
  );
};

export default Dashboard;
