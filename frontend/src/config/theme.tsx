// ./config/theme.js
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#FF9800", // Naranja principal
    },
    secondary: {
      main: "#FF1744", // Rojo secundario
    },
    background: {
      default: "#000000", // Negro para el fondo por defecto
      paper: "#1E1E1E", // Un tono de negro más claro para las superficies (papel)
    },
    text: {
      primary: "#FFFFFF", // Texto primario en blanco para contrastar con el negro
      secondary: "#F5F5F5", // Un tono de blanco más claro para texto secundario
    },
  },
});
