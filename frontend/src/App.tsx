import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import MainLayout from "./components/layout/MainLayout";
import PlantOverviewPage from "./pages/PlantOverviewPage";
import MqttSettingsPage from "./pages/MqttSettingsPage";
import ComponentBrowserPage from "./pages/ComponentBrowserPage";
import TopDownCanvasDemo from "./playground/konva-demo/TopDownCanvasDemo";

const theme = createTheme({
  palette: {
    primary: { main: "#E30613" },
    background: { default: "#f5f5f5" },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/plant" element={<PlantOverviewPage />} />
            <Route path="/components" element={<ComponentBrowserPage />} />
            <Route path="/mqtt" element={<MqttSettingsPage />} />
            <Route path="/playground" element={<TopDownCanvasDemo />} />
            <Route path="*" element={<Navigate to="/plant" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
