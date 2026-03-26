import { useEffect, useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import MainLayout from "./components/MainLayout";
import PlantOverviewPage from "./pages/PlantOverviewPage";
import MqttSettingsPage from "./pages/MqttSettingsPage";
import ComponentBrowserPage from "./pages/ComponentBrowserPage";
import HighBayStoragePage from "./pages/HighBayStoragePage";
import DocumentationPage from "./pages/DocumentationPage";
import PlantControlPage from "./pages/PlantControlPage";
import ImprintPage from "./pages/ImprintPage";
import PrivacyPage from "./pages/PrivacyPage";
import {
  AppPreferencesProvider,
  useAppPreferences,
} from "./context/AppPreferencesContext";
import { SimulationDesignerProvider } from "./context/SimulationDesignerContext";
import { initializeSimulation } from "./services/simulationService";
import { initializeLiveComponentFeed } from "./services/liveComponentService";

function AppShell() {
  const { themeMode, colorStyle, accessibility } = useAppPreferences();

  useEffect(() => {
    initializeSimulation();
    initializeLiveComponentFeed();
  }, []);

  const resolvedThemeMode = useMemo(() => {
    if (themeMode !== "system") {
      return themeMode;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, [themeMode]);

  const theme = useMemo(
    () => {
      const primaryByStyle = {
        "dhbw-red": { main: "#E30613", dark: "#B0000D" },
        "ocean-blue": { main: "#1565C0", dark: "#0D47A1" },
        "forest-green": { main: "#2E7D32", dark: "#1B5E20" },
        violet: { main: "#6A1B9A", dark: "#4A148C" },
      } as const;

      const selectedPrimary = primaryByStyle[colorStyle];
      const highContrast = accessibility.highContrast;
      const paletteText = highContrast
        ? resolvedThemeMode === "dark"
          ? { primary: "#FFFFFF", secondary: "#E5E5E5" }
          : { primary: "#111111", secondary: "#222222" }
        : undefined;

      return createTheme({
        palette: {
          mode: resolvedThemeMode,
          primary: selectedPrimary,
          contrastThreshold: highContrast ? 7 : 3,
          ...(paletteText ? { text: paletteText } : {}),
          background:
            resolvedThemeMode === "dark"
              ? {
                  default: highContrast ? "#000000" : "#121212",
                  paper: highContrast ? "#0B0B0B" : "#1e1e1e",
                }
              : {
                  default: highContrast ? "#FFFFFF" : "#f5f5f5",
                  paper: "#ffffff",
                },
        },
        typography: {
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          fontSize: accessibility.textScale === "large" ? 16 : 14,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: accessibility.reducedMotion
              ? {
                  "*, *::before, *::after": {
                    animation: "none !important",
                    transition: "none !important",
                    scrollBehavior: "auto !important",
                  },
                }
              : undefined,
          },
        },
      });
    },
    [
      accessibility.highContrast,
      accessibility.reducedMotion,
      accessibility.textScale,
      colorStyle,
      resolvedThemeMode,
    ],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SimulationDesignerProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/plant" element={<PlantOverviewPage />} />
              <Route path="/components" element={<ComponentBrowserPage />} />
              <Route path="/hochregallager" element={<HighBayStoragePage />} />
              <Route path="/plant-control" element={<PlantControlPage />} />
              <Route path="/docs" element={<DocumentationPage />} />
              <Route path="/imprint" element={<ImprintPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/mqtt" element={<MqttSettingsPage />} />
              <Route path="*" element={<Navigate to="/plant" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SimulationDesignerProvider>
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
