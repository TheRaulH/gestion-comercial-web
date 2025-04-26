// src/components/ConfirmLogoutDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface ConfirmLogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmLogoutDialog = ({
  open,
  onClose,
  onConfirm,
}: ConfirmLogoutDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-logout-title"
      aria-describedby="confirm-logout-description"
    >
      <DialogTitle id="confirm-logout-title">¿Cerrar sesión?</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-logout-description">
          ¿Estás seguro que deseas salir de tu cuenta?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained" autoFocus>
          Salir
        </Button>
      </DialogActions>
    </Dialog>
  );
};
