import React from "react";
// Importamos useNavigate de react-router-dom en lugar de useRouter de next/router
import { useNavigate } from "react-router-dom";
import { Button, Box, Typography, Container, Paper } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuthStore } from "../stores/authStore"; // Custom hook for authentication

// logout page confirmation

const LogoutPage: React.FC = () => {
  // Usamos useNavigate en lugar de useRouter
  const navigate = useNavigate();
  const { logout } = useAuthStore(); // Custom hook for authentication

  const handleLogout = () => {
    // Call the logout function from the authentication context or hook
    logout();
    // Opcional: Redirigir a la página de inicio de sesión o a la página principal después del logout
    // navigate('/login'); // Por ejemplo, redirigir a /login
    // navigate('/'); // O redirigir a la página principal
  };

  const handleCancel = () => {
    // Go back to previous page using navigate with -1
    navigate(-1); // Equivalente a router.back() en react-router-dom v6
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center" }}>
        <LogoutIcon color="error" sx={{ fontSize: 60, mb: 2 }} />

        <Typography variant="h5" component="h1" gutterBottom>
          ¿Deseas cerrar sesión?
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Si cierras sesión deberás iniciar sesión nuevamente para acceder al
          sistema.
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleLogout}
            startIcon={<LogoutIcon />}
          >
            Cerrar Sesión
          </Button>
          <Button variant="outlined" onClick={handleCancel}>
            Cancelar
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LogoutPage;
