import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { getClient, publish } from "../services/mqttClient";
import { useAppPreferences } from "../context/AppPreferencesContext";

type OperationConfig = {
  value: string;
  label: string;
  requiresX: boolean;
  requiresZ: boolean;
  requiresXNew: boolean;
  requiresZNew: boolean;
};

const operationOptions: OperationConfig[] = [
  { value: "store", label: "STORE", requiresX: true, requiresZ: true, requiresXNew: false, requiresZNew: false },
  { value: "store_random", label: "STORE_RANDOM", requiresX: false, requiresZ: false, requiresXNew: false, requiresZNew: false },
  { value: "destore", label: "DESTORE", requiresX: true, requiresZ: true, requiresXNew: false, requiresZNew: false },
  { value: "destore_random", label: "DESTORE_RANDOM", requiresX: false, requiresZ: false, requiresXNew: false, requiresZNew: false },
  { value: "rearrange", label: "REARRANGE", requiresX: true, requiresZ: true, requiresXNew: true, requiresZNew: true },
  { value: "show_occupancy", label: "SHOW_OCCUPANCY", requiresX: false, requiresZ: false, requiresXNew: false, requiresZNew: false },
  { value: "shutdown", label: "SHUTDOWN", requiresX: false, requiresZ: false, requiresXNew: false, requiresZNew: false },
];

export default function PlantControlPage() {
  const { t } = useAppPreferences();
  const [selectedOperation, setSelectedOperation] = useState(operationOptions[0].value);
  const [x, setX] = useState<number>(1);
  const [z, setZ] = useState<number>(1);
  const [xNew, setXNew] = useState<number>(1);
  const [zNew, setZNew] = useState<number>(1);
  const [setTopic, setSetTopic] = useState("hochregallager/set");
  const [resultMessage, setResultMessage] = useState<string>("");
  const [resultType, setResultType] = useState<"success" | "error" | "info">("info");

  const connected = getClient()?.connected ?? false;

  const selectedConfig = useMemo(
    () =>
      operationOptions.find((item) => item.value === selectedOperation) ??
      operationOptions[0],
    [selectedOperation],
  );

  const handleExecuteOperation = async () => {
    setResultMessage("");

    if (!connected) {
      setResultType("error");
      setResultMessage(t("plantControl.notConnected"));
      return;
    }

    const payload: Record<string, number | string> = {
      operation: selectedOperation,
    };

    if (selectedConfig.requiresX) {
      payload.x = x;
    }
    if (selectedConfig.requiresZ) {
      payload.z = z;
    }
    if (selectedConfig.requiresXNew) {
      payload.x_new = xNew;
    }
    if (selectedConfig.requiresZNew) {
      payload.z_new = zNew;
    }

    try {
      await publish(setTopic, JSON.stringify(payload), { qos: 1 });
      setResultType("success");
      setResultMessage(t("plantControl.commandSent"));
    } catch (error) {
      setResultType("error");
      setResultMessage(error instanceof Error ? error.message : t("plantControl.sendFailed"));
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t("plantControl.title")}
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t("plantControl.description")}
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        {t("plantControl.protocolHint")}
      </Alert>

      <Alert severity={connected ? "success" : "warning"} sx={{ mb: 3 }}>
        {connected ? t("plantControl.connected") : t("plantControl.disconnected")}
      </Alert>

      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <TextField
              id="plant-control-operation"
              label={t("plantControl.operation")}
              select
              value={selectedOperation}
              onChange={(event) => setSelectedOperation(event.target.value)}
              size="small"
              fullWidth
            >
              {operationOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {selectedConfig.requiresX && (
              <TextField
                id="plant-control-x"
                label={t("plantControl.x")}
                type="number"
                size="small"
                fullWidth
                value={x}
                onChange={(event) => setX(Math.min(10, Math.max(1, Number.parseInt(event.target.value, 10) || 1)))}
              />
            )}

            {selectedConfig.requiresZ && (
              <TextField
                id="plant-control-z"
                label={t("plantControl.z")}
                type="number"
                size="small"
                fullWidth
                value={z}
                onChange={(event) => setZ(Math.min(5, Math.max(1, Number.parseInt(event.target.value, 10) || 1)))}
              />
            )}

            {selectedConfig.requiresXNew && (
              <TextField
                id="plant-control-x-new"
                label={t("plantControl.xNew")}
                type="number"
                size="small"
                fullWidth
                value={xNew}
                onChange={(event) => setXNew(Math.min(10, Math.max(1, Number.parseInt(event.target.value, 10) || 1)))}
              />
            )}

            {selectedConfig.requiresZNew && (
              <TextField
                id="plant-control-z-new"
                label={t("plantControl.zNew")}
                type="number"
                size="small"
                fullWidth
                value={zNew}
                onChange={(event) => setZNew(Math.min(5, Math.max(1, Number.parseInt(event.target.value, 10) || 1)))}
              />
            )}

            <TextField
              id="plant-control-set-topic"
              label={t("plantControl.setTopic")}
              size="small"
              fullWidth
              value={setTopic}
              onChange={(event) => setSetTopic(event.target.value)}
            />

            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                onClick={handleExecuteOperation}
                sx={{ bgcolor: "#E30613", "&:hover": { bgcolor: "#c00510" } }}
              >
                {t("plantControl.sendCommand")}
              </Button>
            </Box>

            {resultMessage && <Alert severity={resultType}>{resultMessage}</Alert>}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
