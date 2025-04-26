// src/components/UserFormModal.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Box,
  Grid,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { User } from "../types/user"; 

const userSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un email válido"),
  es_administrador: z.boolean(),
  activo: z.boolean(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  currentUser: User | null;
}

export const UserFormModal = ({
  open,
  onClose,
  onSubmit,
  currentUser,
}: UserFormModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nombre: "",
      email: "",
      es_administrador: false,
      activo: true,
    },
  });

  useEffect(() => {
    if (currentUser) {
      reset({
        nombre: currentUser.nombre,
        email: currentUser.email,
        es_administrador: currentUser.es_administrador,
        activo: currentUser.activo,
      });
    } else {
      reset({
        nombre: "",
        email: "",
        es_administrador: false,
        activo: true,
      });
    }
  }, [currentUser, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="user-form-dialog"
    >
      <DialogTitle id="user-form-dialog">
        {currentUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid >
              <TextField
                fullWidth
                label="Nombre completo"
                margin="normal"
                {...register("nombre")}
                error={!!errors.nombre}
                helperText={errors.nombre?.message}
                disabled={isSubmitting}
              />
            </Grid>
            <Grid >
              <TextField
                fullWidth
                label="Email"
                margin="normal"
                type="email"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isSubmitting}
              />
            </Grid>
            <Grid >
              <FormControlLabel
                control={
                  <Switch
                    {...register("es_administrador")}
                    color="primary"
                    disabled={isSubmitting}
                  />
                }
                label="Administrador"
              />
            </Grid>
            <Grid  >
              <FormControlLabel
                control={
                  <Switch
                    {...register("activo")}
                    color="primary"
                    disabled={isSubmitting}
                  />
                }
                label="Usuario activo"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {currentUser ? "Actualizar" : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
