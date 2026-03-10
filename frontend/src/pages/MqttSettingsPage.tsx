import { useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Alert,
  Stack,
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
  const [settings, setSettings] = useState<MqttSettings>(getInitialSettings);
  const [status, setStatus] = useState<ConnectionStatus>(getInitialStatus);
  const [error, setError] = useState<string>("");

  const handleChange = (field: keyof MqttSettings, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleConnect = async () => {
    setError("");
    try {
      const finalSettings: MqttSettings = {
        ...settings,
        protocol: settings.useTls ? "wss" : "ws",
      };
      saveSettings(finalSettings);
      await connect(finalSettings);
      setStatus("Connected");
    } catch (err) {
      setStatus("Error");
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setStatus("Disconnected");
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Disconnect failed");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        MQTT Settings
      </Typography>

      <Alert
        severity={
          status === "Connected" ? "success" : status === "Error" ? "error" : "info"
        }
        sx={{ mb: 3 }}
      >
        Connection Status: <strong>{status}</strong>
        {error && ` — ${error}`}
      </Alert>

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Broker Configuration
          </Typography>

          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <TextField
              id="mqtt-host"
              label="Broker Host"
              value={settings.host}
              onChange={(e) => handleChange("host", e.target.value)}
              fullWidth
              size="small"
              placeholder="raspberrypi.local"
            />

            <TextField
              id="mqtt-port"
              label="Port"
              type="number"
              value={settings.port}
              onChange={(e) => handleChange("port", parseInt(e.target.value) || 0)}
              fullWidth
              size="small"
            />

            <TextField
              id="mqtt-protocol"
              label="Protocol"
              select
              value={settings.protocol}
              onChange={(e) => handleChange("protocol", e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="ws">ws (WebSocket)</MenuItem>
              <MenuItem value="wss">wss (WebSocket Secure)</MenuItem>
            </TextField>

            <TextField
              id="mqtt-client-id"
              label="Client ID"
              value={settings.clientId}
              onChange={(e) => handleChange("clientId", e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              id="mqtt-username"
              label="Username (optional)"
              value={settings.username}
              onChange={(e) => handleChange("username", e.target.value)}
              fullWidth
              size="small"
            />

            <TextField
              id="mqtt-password"
              label="Password (optional)"
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
              label="Use TLS"
            />

            <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
              <Button
                variant="contained"
                onClick={handleConnect}
                disabled={status === "Connected"}
                sx={{ bgcolor: "#E30613", "&:hover": { bgcolor: "#c00510" } }}
              >
                Connect
              </Button>
              <Button
                variant="outlined"
                onClick={handleDisconnect}
                disabled={status !== "Connected"}
                color="error"
              >
                Disconnect
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
