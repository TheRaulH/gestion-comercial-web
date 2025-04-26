// src/pages/CashRegisterAdmin.tsx
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useCajaStore } from "../../stores/cajaStore";
import { Arqueo } from "../../api/cajaApi";

export const CashRegisterAdmin = () => {
  const {
    arqueos,
    isLoading,
    error,
    fetchTodosArqueos,
    actualizarArqueo,
    eliminarArqueo,
  } = useCajaStore();

  const [selectedArqueo, setSelectedArqueo] = useState<Arqueo | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [ingresos, setIngresos] = useState("");
  const [egresos, setEgresos] = useState("");

  useEffect(() => {
    fetchTodosArqueos();
  }, [fetchTodosArqueos]);

  const handleEditClick = (arqueo: Arqueo) => {
    setSelectedArqueo(arqueo);
    setSaldoInicial(arqueo.saldo_inicial);
    setIngresos(arqueo.ingresos);
    setEgresos(arqueo.egresos);
    setOpenEdit(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedArqueo) return;
    await actualizarArqueo(
      selectedArqueo.id_arqueo,
      parseFloat(saldoInicial),
      parseFloat(ingresos),
      parseFloat(egresos)
    );
    setOpenEdit(false);
  };

  const handleDeleteClick = async (arqueo: Arqueo) => {
    if (
      confirm(`¿Seguro que quieres eliminar el arqueo ID ${arqueo.id_arqueo}?`)
    ) {
      await eliminarArqueo(arqueo.id_arqueo);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Administración de Arqueos
      </Typography>

      {isLoading && <CircularProgress />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!isLoading && !error && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Saldo Inicial</TableCell>
                <TableCell>Ingresos</TableCell>
                <TableCell>Egresos</TableCell>
                <TableCell>Saldo Final</TableCell>
                <TableCell>Fecha Inicio</TableCell>
                <TableCell>Fecha Fin</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {arqueos.map((arqueo) => (
                <TableRow key={arqueo.id_arqueo}>
                  <TableCell>{arqueo.id_arqueo}</TableCell>
                  <TableCell>{arqueo.id_usuario}</TableCell>
                  <TableCell>
                    ${parseFloat(arqueo.saldo_inicial).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${parseFloat(arqueo.ingresos).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${parseFloat(arqueo.egresos).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${parseFloat(arqueo.saldo_final).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {new Date(arqueo.fecha_inicio).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {arqueo.fecha_fin
                      ? new Date(arqueo.fecha_fin).toLocaleString()
                      : "Abierto"}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(arqueo)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(arqueo)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal de edición */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Editar Arqueo</DialogTitle>
        <DialogContent>
          <TextField
            label="Saldo Inicial"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
          />
          <TextField
            label="Ingresos"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={ingresos}
            onChange={(e) => setIngresos(e.target.value)}
          />
          <TextField
            label="Egresos"
            type="number"
            fullWidth
            sx={{ mt: 2 }}
            value={egresos}
            onChange={(e) => setEgresos(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleEditSubmit}>
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
