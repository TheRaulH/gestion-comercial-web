// src/pages/Users.tsx
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
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { useUserStore } from "../stores/userStore";
import { UserFormModal } from "../components/UserFormModal";
import { User } from "../types/user";

export const Users = () => {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    deleteUser,
    updateUser,
    createUser,
  } = useUserStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (user: User | null = null) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (data: any) => {
    try {
      if (currentUser) {
        await updateUser(currentUser.id_usuario, data);
        setSnackbar({
          open: true,
          message: "Usuario actualizado correctamente",
          severity: "success",
        });
      } else {
        await createUser({
          ...data,
          password: "default123",
        });
        setSnackbar({
          open: true,
          message: "Usuario creado correctamente",
          severity: "success",
        });
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

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await deleteUser(id);
        setSnackbar({
          open: true,
          message: "Usuario eliminado correctamente",
          severity: "success",
        });
      } catch (err) {
        console.error("Error al eliminar el usuario:", err);
        setSnackbar({
          open: true,
          message: "Error al eliminar el usuario",
          severity: "error",
        });
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1" color="primary">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          aria-label="Agregar usuario"
        >
          Agregar Usuario
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!isLoading && !error && (
        <TableContainer component={Paper} elevation={3}>
          <Table aria-label="Tabla de usuarios">
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Email
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Rol
                </TableCell>
                <TableCell sx={{ color: "primary.contrastText" }}>
                  Estado
                </TableCell>
                <TableCell align="right" sx={{ color: "primary.contrastText" }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id_usuario}
                  hover
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    opacity: user.activo ? 1 : 0.7,
                  }}
                >
                  <TableCell>{user.nombre}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.es_administrador ? "Administrador" : "Usuario"
                      }
                      color={user.es_administrador ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {user.activo ? (
                        <>
                          <CheckCircleIcon color="success" fontSize="small" />
                          <Typography ml={1}>Activo</Typography>
                        </>
                      ) : (
                        <>
                          <CancelIcon color="error" fontSize="small" />
                          <Typography ml={1}>Inactivo</Typography>
                        </>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <IconButton
                        onClick={() => handleOpenModal(user)}
                        aria-label="Editar usuario"
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton
                        onClick={() => handleDelete(user.id_usuario)}
                        aria-label="Eliminar usuario"
                        color="error"
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

      <UserFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        currentUser={currentUser}
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
