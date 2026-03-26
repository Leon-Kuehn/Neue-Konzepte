import { useState, type ChangeEvent } from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Switch,
  MenuItem,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import type { MqttSettings, ConnectionStatus } from "../types/MqttSettings";
import {
  connect,
  disconnect,
  loadSettings,
  saveSettings,
  generateClientId,
  getClient,
} from "../services/mqttClient";
import { useAppPreferences } from "../context/AppPreferencesContext";
import {
  disableSimulation,
  enableSimulation,
  getSimulationScenarios,
  updateSimulationConfig,
  type SimulationScenarioId,
  type SimulationSpeed,
} from "../services/simulationService";
import { useSimulationState } from "../hooks/useSimulationState";
import { setLiveConnectionState } from "../services/liveComponentService";

const defaultSettings: MqttSettings = {
  protocol: "ws",
  host: "raspberrypi.local",
  port: 1883,
  clientId: generateClientId(),
  username: "",
  password: "",
  useTls: false,
};

function getInitialSettings(): MqttSettings {
  return loadSettings() ?? defaultSettings;
}

function getInitialStatus(): ConnectionStatus {
  return getClient()?.connected ? "Connected" : "Disconnected";
}

export default function MqttSettingsPage() {
  const {
    t,
    themeMode,
    setThemeMode,
    language,
    setLanguage,
    simulatorVisibility,
    setSimulatorVisibility,
  } = useAppPreferences();
  const [settings, setSettings] = useState<MqttSettings>(getInitialSettings);
  const [status, setStatus] = useState<ConnectionStatus>(getInitialStatus);
  const [error, setError] = useState<string>("");
  const simulation = useSimulationState();
  const scenarios = getSimulationScenarios();

  const statusLabel =
    status === "Connected"
      ? t("status.connected")
      : status === "Error"
        ? t("status.error")
        : t("status.disconnected");

  const handleChange = (field: keyof MqttSettings, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    setError("");

    if (simulation.enabled) {
      setStatus("Error");
      setLiveConnectionState(false);
      setError("Disable simulation mode before connecting to a real MQTT broker.");
      return;
    }

    try {
      const finalSettings: MqttSettings = {
        ...settings,
        protocol: settings.useTls ? "wss" : "ws",
      };
      saveSettings(finalSettings);
      await connect(finalSettings);
      setStatus("Connected");
      setLiveConnectionState(true);
    } catch (err) {
      setStatus("Error");
      setLiveConnectionState(false);
      setError(err instanceof Error ? err.message : t("mqtt.connectionFailed"));
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setStatus("Disconnected");
      setLiveConnectionState(false);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("mqtt.disconnectFailed"));
    }
  };

  const handleSimulationToggle = (_event: ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (checked) {
      enableSimulation();
      return;
    }

    disableSimulation();
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t("settings.title")}
      </Typography>

      <Alert
        severity={
          status === "Connected" ? "success" : status === "Error" ? "error" : "info"
        }
        sx={{ mb: 3 }}
      >
        {t("mqtt.connectionStatus")}: <strong>{statusLabel}</strong>
        {error && ` - ${error}`}
      </Alert>

      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          alignItems: "start",
        }}
      >
        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("settings.applicationSettings")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t("settings.applicationHint")}
            </Typography>

            <Stack spacing={2.5}>
              <TextField
                id="app-theme"
                label={t("settings.theme")}
                select
                value={themeMode}
                onChange={(e) => setThemeMode(e.target.value as "light" | "dark")}
                fullWidth
                size="small"
              >
                <MenuItem value="light">{t("settings.themeLight")}</MenuItem>
                <MenuItem value="dark">{t("settings.themeDark")}</MenuItem>
              </TextField>

              <TextField
                id="app-language"
                label={t("settings.language")}
                select
                value={language}
                onChange={(e) => setLanguage(e.target.value as "de" | "en" | "fr")}
                fullWidth
                size="small"
              >
                <MenuItem value="de">{t("settings.languageGerman")}</MenuItem>
                <MenuItem value="en">{t("settings.languageEnglish")}</MenuItem>
                <MenuItem value="fr">{t("settings.languageFrench")}</MenuItem>
              </TextField>

              <Divider />

              <Typography variant="subtitle2" fontWeight={700}>
                {t("settings.simulators")}
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={simulatorVisibility.plantSimulator}
                    onChange={(_event, checked) => {
                      setSimulatorVisibility({ plantSimulator: checked });
                    }}
                  />
                }
                label={t("settings.showPlantSimulator")}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={simulatorVisibility.warehouseSimulator}
                    onChange={(_event, checked) => {
                      setSimulatorVisibility({ warehouseSimulator: checked });
                    }}
                  />
                }
                label={t("settings.showWarehouseSimulator")}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ height: "100%" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t("mqtt.sectionTitle")}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack spacing={2.5} sx={{ mt: 2 }}>
            <TextField
              id="mqtt-host"
              label={t("mqtt.brokerHost")}
              value={settings.host}
              onChange={(e) => handleChange("host", e.target.value)}
              fullWidth
              size="small"
              placeholder="raspberrypi.local"
            />

            <TextField
              id="mqtt-port"
              label={t("mqtt.port")}
              type="number"
              value={settings.port}
              onChange={(e) => handleChange("port", parseInt(e.target.value) || 0)}
              fullWidth
              size="small"
            />

            <TextField
              id="mqtt-protocol"
              label={t("mqtt.protocol")}
              select
              value={settings.protocol}
              onChange={(e) => handleChange("protocol", e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="ws">{t("mqtt.protocolWs")}</MenuItem>
              <MenuItem value="wss">{t("mqtt.protocolWss")}</MenuItem>
            </TextField>

            <TextField
              id="mqtt-client-id"
              label={t("mqtt.clientId")}
              value={settings.clientId}
              onChange={(e) => handleChange("clientId", e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              id="mqtt-username"
              label={t("mqtt.usernameOptional")}
              value={settings.username}
              onChange={(e) => handleChange("username", e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              id="mqtt-password"
              label={t("mqtt.passwordOptional")}
              type="password"
              value={settings.password}
              onChange={(e) => handleChange("password", e.target.value)}
              fullWidth
              size="small"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={settings.useTls}
                  onChange={(e) => {
                    const tls = e.target.checked;
                    // Protokoll + Port gemeinsam umschalten
                    setSettings((prev) => ({
                      ...prev,
                      useTls: tls,
                      protocol: tls ? "wss" : "ws",
                      port: tls ? 8883 : 1883,
                    }));
                  }}
                />
              }
              label={t("mqtt.useTls")}
            />

            <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
              <Button
                variant="contained"
                onClick={handleConnect}
                disabled={status === "Connected" || simulation.enabled}
                sx={{ bgcolor: "#E30613", "&:hover": { bgcolor: "#c00510" } }}
              >
                {t("mqtt.connect")}
              </Button>
              <Button
                variant="outlined"
                onClick={handleDisconnect}
                disabled={status !== "Connected"}
                color="error"
              >
                {t("mqtt.disconnect")}
              </Button>
            </Box>

            <Divider sx={{ mt: 1 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Simulation
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Simulation mode generates realistic live activity in the UI. While enabled, plant traffic is simulated and does not require physical hardware.
            </Typography>

            <FormControlLabel
              control={<Switch checked={simulation.enabled} onChange={handleSimulationToggle} />}
              label="Simulation mode"
            />

            <TextField
              id="simulation-scenario"
              label="Simulation scenario"
              select
              value={simulation.scenario}
              onChange={(event) => {
                updateSimulationConfig({
                  scenario: event.target.value as SimulationScenarioId,
                });
              }}
              fullWidth
              size="small"
            >
              {scenarios.map((scenario) => (
                <MenuItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              id="simulation-speed"
              label="Simulation speed"
              select
              value={simulation.speed}
              onChange={(event) => {
                updateSimulationConfig({
                  speed: event.target.value as SimulationSpeed,
                });
              }}
              fullWidth
              size="small"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="fast">Fast</MenuItem>
            </TextField>

            {simulation.enabled && (
              <Alert severity="warning" sx={{ mt: 0.5 }}>
                Simulation mode active - live data is simulated.
              </Alert>
            )}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
