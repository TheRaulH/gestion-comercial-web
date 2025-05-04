// src/pages/CashRegister.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  TextField,
  Paper,
} from "@mui/material";

import { useCajaStore } from "../stores/cajaStore";

export const CashRegister = () => {
  const {
    arqueoAbierto,
    isLoading,
    error,
    fetchArqueoAbierto,
    crearArqueo,
    cerrarArqueo,
  } = useCajaStore();

  const [saldoInicial, setSaldoInicial] = useState("");
  const [ingresos, setIngresos] = useState("");
  const [egresos, setEgresos] = useState("");

  useEffect(() => {
    fetchArqueoAbierto(); 
  }, [fetchArqueoAbierto]);

  const handleAbrirCaja = async () => {
    if (!saldoInicial) {
      alert("Por favor ingresa un saldo inicial");
      return;
    }
    await crearArqueo(parseFloat(saldoInicial));
    setSaldoInicial("");
  };

  const handleCerrarCaja = async () => {
    try {

    if (!ingresos || !egresos) {
      alert("Por favor ingresa ingresos y egresos para cerrar");
      
      return;
    }

    //convertir a float el saldo inicial
    const saldoInicialValue = parseFloat(arqueoAbierto?.saldo_inicial || "0") || 0;
    const ingresosValue = parseFloat(ingresos) || 0;
    const egresosValue = parseFloat(egresos) || 0;
    
    const saldo_final = saldoInicialValue + ingresosValue - egresosValue;

    if (!arqueoAbierto?.id_arqueo) {
      alert("No se puede cerrar la caja: ID de arqueo no disponible");
      return;
    }

    await cerrarArqueo(
      arqueoAbierto.id_arqueo,
      ingresosValue,
      egresosValue,
      saldo_final
    );    

    alert("Caja cerrada exitosamente");
    // Resetear los campos después de cerrar la caja


    setIngresos("");
    setEgresos("");
    //refrescar la pagina
    fetchArqueoAbierto();
    // Redirigir a la página de arqueos si es necesario

  } catch (error) {
    console.error("Error al cerrar caja:", error);
    alert("Error al cerrar caja. Por favor intenta nuevamente.");
  }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom color="primary">
        Caja Registradora
      </Typography>

      {isLoading && <CircularProgress />}
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {!isLoading && !arqueoAbierto && (
        <Paper sx={{ p: 4, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            No tienes una caja abierta
          </Typography>
          <TextField
            label="Saldo Inicial"
            type="number"
            fullWidth
            sx={{ my: 2 }}
            value={saldoInicial}
            onChange={(e) => setSaldoInicial(e.target.value)}
          />
          <Button variant="contained" onClick={handleAbrirCaja} fullWidth>
            Abrir Caja
          </Button>
        </Paper>
      )}

      {!isLoading && arqueoAbierto && (
        <Paper sx={{ p: 4, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Caja Abierta
          </Typography>
          {!isLoading &&
            arqueoAbierto &&
            typeof arqueoAbierto.saldo_inicial === "string" && (
              <Typography>
                Saldo Inicial:{" "}
                <strong>
                  ${parseFloat(arqueoAbierto.saldo_inicial).toFixed(2)}
                </strong>
              </Typography>
            )}
          {!isLoading &&
            arqueoAbierto &&
            typeof arqueoAbierto.saldo_inicial === "number" && (
              <Typography>
                Saldo Inicial:{" "}
                <strong>${parseFloat(arqueoAbierto.saldo_inicial)}</strong>
              </Typography>
            )}
          {!isLoading &&
            arqueoAbierto &&
            typeof arqueoAbierto.saldo_inicial !== "string" &&
            typeof arqueoAbierto.saldo_inicial !== "number" && (
              <Typography color="error">
                Error: El saldo inicial no es un número o una cadena válida.
              </Typography>
            )}
          <Typography sx={{ mt: 1 }}>
            Fecha de Apertura:{" "}
            <strong>
              {arqueoAbierto?.fecha_inicio
                ? new Date(arqueoAbierto.fecha_inicio).toLocaleString()
                : "Fecha no disponible"}
            </strong>
          </Typography>

          <TextField
            label="Ingresos"
            type="number"
            fullWidth
            sx={{ mt: 3 }}
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

          <Button
            variant="contained"
            color="success"
            sx={{ mt: 3 }}
            fullWidth
            onClick={handleCerrarCaja}
          >
            Cerrar Caja
          </Button>
        </Paper>
      )}
    </Box>
  );
};
