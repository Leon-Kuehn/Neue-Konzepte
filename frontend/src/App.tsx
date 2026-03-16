import { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import MainLayout from "./components/MainLayout";
import PlantOverviewPage from "./pages/PlantOverviewPage";
import MqttSettingsPage from "./pages/MqttSettingsPage";
import ComponentBrowserPage from "./pages/ComponentBrowserPage";
import HighBayStoragePage from "./pages/HighBayStoragePage";
import DocumentationPage from "./pages/DocumentationPage";
import AssistantPage from "./pages/AssistantPage";
import {
  AppPreferencesProvider,
  useAppPreferences,
} from "./context/AppPreferencesContext";

function AppShell() {
  const { themeMode } = useAppPreferences();
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: { main: "#E30613" },
          background:
            themeMode === "dark"
              ? { default: "#121212", paper: "#1e1e1e" }
              : { default: "#f5f5f5", paper: "#ffffff" },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        },
      }),
    [themeMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/plant" element={<PlantOverviewPage />} />
            <Route path="/hochregallager" element={<HighBayStoragePage />} />
            <Route path="/components" element={<ComponentBrowserPage />} />
            <Route path="/mqtt" element={<MqttSettingsPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="*" element={<Navigate to="/plant" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppPreferencesProvider>
      <AppShell />
    </AppPreferencesProvider>
  );
}
