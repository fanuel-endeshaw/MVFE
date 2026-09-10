import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import AppRoutes from "./routes/AppRoutes";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#0A4EC2" },
    secondary: { main: "#1D7AFB" },
    background: { default: "#F3F6FB", paper: "#FFFFFF" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
