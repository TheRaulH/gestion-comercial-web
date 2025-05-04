// ./config/theme.js
// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#c86208",
    },
    secondary: {
      main: "#b5cae1",
    },
    background: {
      default: "#e6eaed",
      paper: "#05080f",
    },
    text: {
      primary: "#455060",
      secondary: "#b5cae1",
    },
    info: {
      main: "#b5cae1",
    },
  },
});

export default theme;
