import { Alert, Box, Card, CardContent, CircularProgress, Divider, List, ListItem, Typography } from "@mui/material";
import type { PlantComponent } from "../types/PlantComponent";
import { useAppPreferences } from "../context/AppPreferencesContext";
import LiveStatusChips from "./LiveStatusChips";
import type { SensorData, SensorStats } from "../services/sensorDataApi";

interface Props {
  component: PlantComponent | undefined;
  latestStoredEntry?: SensorData;
  latestStoredLoading?: boolean;
  latestStoredError?: string;
  stats?: SensorStats;
  statsLoading?: boolean;
  statsError?: string;
  history?: SensorData[];
  historyLoading?: boolean;
  historyError?: string;
}

function renderPayload(payload: unknown): string {
  if (payload === null || payload === undefined) {
    return "n/a";
  }

  if (typeof payload === "string" || typeof payload === "number" || typeof payload === "boolean") {
    return String(payload);
  }

  try {
    return JSON.stringify(payload);
  } catch {
    return "[unserializable payload]";
  }
}

function renderNumber(value: number | undefined): string {
  return value === undefined ? "n/a" : Number(value.toFixed(2)).toString();
}

export default function ComponentDetails({
  component,
  latestStoredEntry,
  latestStoredLoading,
  latestStoredError,
  stats,
  statsLoading,
  statsError,
  history,
  historyLoading,
  historyError,
}: Props) {
  const { t } = useAppPreferences();

  if (!component) {
    return (
      <Card sx={{ height: "100%", overflow: "auto" }}>
        <CardContent>
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            {t("componentDetails.empty")}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", overflow: "auto" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {component.name}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {/* Basic Info */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("componentDetails.basicInformation")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <Typography variant="body2">
            <strong>{t("componentDetails.id")}:</strong> {component.id}
          </Typography>
          <Typography variant="body2">
            <strong>{t("componentDetails.role")}:</strong> {component.role}
          </Typography>
          <Typography variant="body2">
            <strong>{t("componentDetails.category")}:</strong> {component.category}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Live Status */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("componentDetails.liveStatus")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
          <LiveStatusChips status={component.status} online={component.online} />
        </Box>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>{t("componentDetails.lastChanged")}:</strong>{" "}
          {new Date(component.lastChanged).toLocaleString()}
        </Typography>
        {component.stats.cycles !== undefined && (
          <Typography variant="body2">
            <strong>{t("componentDetails.cycles")}:</strong> {component.stats.cycles}
          </Typography>
        )}
        {component.stats.uptimeHours !== undefined && (
          <Typography variant="body2">
            <strong>{t("componentDetails.uptime")}:</strong> {component.stats.uptimeHours}h
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          <strong>{t("componentDetails.mqttStatusTopic")}:</strong> {component.mqttTopics.status}
        </Typography>
        {component.mqttTopics.command && (
          <Typography variant="body2">
            <strong>{t("componentDetails.mqttCommandTopic")}:</strong> {component.mqttTopics.command}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Placeholder sections */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("componentDetails.historicalData")}
        </Typography>
        {latestStoredLoading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">Loading stored values...</Typography>
          </Box>
        )}
        {latestStoredError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            Failed to load latest stored values: {latestStoredError}
          </Alert>
        )}
        {latestStoredEntry && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
            <Typography variant="body2">
              <strong>Latest stored at:</strong> {new Date(latestStoredEntry.receivedAt).toLocaleString()}
            </Typography>
            <Typography variant="body2">
              <strong>Latest stored payload:</strong> {renderPayload(latestStoredEntry.payload)}
            </Typography>
          </Box>
        )}

        {statsLoading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">Loading statistics...</Typography>
          </Box>
        )}
        {statsError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            Failed to load statistics: {statsError}
          </Alert>
        )}
        {stats && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.75, mb: 2 }}>
            <Typography variant="body2"><strong>Stored rows:</strong> {stats.count}</Typography>
            <Typography variant="body2"><strong>Average:</strong> {renderNumber(stats.averageValue)}</Typography>
            <Typography variant="body2"><strong>Min:</strong> {renderNumber(stats.minValue)}</Typography>
            <Typography variant="body2"><strong>Max:</strong> {renderNumber(stats.maxValue)}</Typography>
          </Box>
        )}

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("componentDetails.trendChart")}
        </Typography>
        {historyLoading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">Loading history...</Typography>
          </Box>
        )}
        {historyError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            Failed to load history: {historyError}
          </Alert>
        )}
        {!historyLoading && !historyError && (history?.length ?? 0) === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            No historical entries available for this component yet.
          </Typography>
        )}
        {(history?.length ?? 0) > 0 && (
          <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {history!.slice(0, 6).map((entry) => (
              <ListItem key={entry.id} disableGutters sx={{ py: 0.25, display: "block" }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(entry.receivedAt).toLocaleString()}
                </Typography>
                <Typography variant="body2">{renderPayload(entry.payload)}</Typography>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}
