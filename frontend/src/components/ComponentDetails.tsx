import { Alert, Box, Card, CardContent, Chip, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
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

interface TrendPoint {
  timestamp: number;
  value: number;
}

interface EventSnapshot {
  id: number;
  receivedAt: string;
  status?: string;
  online?: boolean;
  value?: number | boolean;
  cycles?: number;
  uptimeHours?: number;
}

interface DerivedHistory {
  cyclesPoints: TrendPoint[];
  uptimePoints: TrendPoint[];
  valuePoints: TrendPoint[];
  latestCycles?: number;
  latestUptimeHours?: number;
  latestValue?: number | boolean;
  cyclesDelta?: number;
  uptimeDelta?: number;
  snapshots: EventSnapshot[];
}

function renderNumber(value: number | undefined): string {
  return value === undefined ? "n/a" : Number(value.toFixed(2)).toString();
}

function readPayloadObject(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return null;
  }

  return payload as Record<string, unknown>;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }
    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return undefined;
}

function deriveFromHistory(history: SensorData[] | undefined): DerivedHistory {
  if (!history || history.length === 0) {
    return {
      cyclesPoints: [],
      uptimePoints: [],
      valuePoints: [],
      snapshots: [],
    };
  }

  const asc = [...history].sort(
    (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime(),
  );

  const cyclesPoints: TrendPoint[] = [];
  const uptimePoints: TrendPoint[] = [];
  const valuePoints: TrendPoint[] = [];

  for (const entry of asc) {
    const ts = new Date(entry.receivedAt).getTime();
    const payload = readPayloadObject(entry.payload);
    if (!payload) {
      continue;
    }

    const cycles = toNumber(payload.cycles);
    const uptimeHours = toNumber(payload.uptimeHours);
    const value = toNumber(payload.value);

    if (cycles !== undefined) {
      cyclesPoints.push({ timestamp: ts, value: cycles });
    }
    if (uptimeHours !== undefined) {
      uptimePoints.push({ timestamp: ts, value: uptimeHours });
    }
    if (value !== undefined) {
      valuePoints.push({ timestamp: ts, value });
    }
  }

  const latestEntry = asc.at(-1);
  const latestPayload = latestEntry ? readPayloadObject(latestEntry.payload) : null;
  const latestCycles = latestPayload ? toNumber(latestPayload.cycles) : undefined;
  const latestUptimeHours = latestPayload ? toNumber(latestPayload.uptimeHours) : undefined;
  const rawLatestValue = latestPayload?.value;
  const latestValue =
    typeof rawLatestValue === "boolean"
      ? rawLatestValue
      : toNumber(rawLatestValue);

  const snapshots: EventSnapshot[] = [...history]
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime())
    .slice(0, 8)
    .map((entry) => {
      const payload = readPayloadObject(entry.payload);
      return {
        id: entry.id,
        receivedAt: entry.receivedAt,
        status:
          payload && typeof payload.status === "string"
            ? payload.status
            : undefined,
        online: payload ? toBoolean(payload.online) : undefined,
        value:
          payload && typeof payload.value === "boolean"
            ? payload.value
            : payload
              ? toNumber(payload.value)
              : undefined,
        cycles: payload ? toNumber(payload.cycles) : undefined,
        uptimeHours: payload ? toNumber(payload.uptimeHours) : undefined,
      };
    });

  return {
    cyclesPoints,
    uptimePoints,
    valuePoints,
    latestCycles,
    latestUptimeHours,
    latestValue,
    cyclesDelta:
      cyclesPoints.length > 1
        ? cyclesPoints[cyclesPoints.length - 1]!.value - cyclesPoints[0]!.value
        : undefined,
    uptimeDelta:
      uptimePoints.length > 1
        ? uptimePoints[uptimePoints.length - 1]!.value - uptimePoints[0]!.value
        : undefined,
    snapshots,
  };
}

function SimpleTrendChart({
  title,
  points,
  color,
  suffix,
}: {
  title: string;
  points: TrendPoint[];
  color: string;
  suffix?: string;
}) {
  if (points.length === 0) {
    return (
      <Box sx={{ border: "1px dashed", borderColor: "divider", borderRadius: 1.5, p: 1.25 }}>
        <Typography variant="caption" color="text.secondary">
          {title}: no numeric data in history yet.
        </Typography>
      </Box>
    );
  }

  const width = 420;
  const height = 140;
  const pad = 18;
  const min = Math.min(...points.map((point) => point.value));
  const max = Math.max(...points.map((point) => point.value));
  const span = max - min || 1;
  const xStep = points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;

  const coords = points.map((point, index) => {
    const x = pad + xStep * index;
    const y = height - pad - ((point.value - min) / span) * (height - pad * 2);
    return { x, y, point };
  });

  const path = coords.map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x} ${coord.y}`).join(" ");

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.25 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
        {title}
      </Typography>
      <Box
        component="svg"
        viewBox={`0 0 ${width} ${height}`}
        sx={{ width: "100%", height: 140, display: "block" }}
      >
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#9e9e9e" strokeWidth="1" />
        <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((coord) => (
          <circle key={`${coord.x}-${coord.y}`} cx={coord.x} cy={coord.y} r={2.5} fill={color} />
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          Min: {renderNumber(min)}{suffix ?? ""}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Max: {renderNumber(max)}{suffix ?? ""}
        </Typography>
      </Box>
    </Box>
  );
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
  const historyDerived = useMemo(() => deriveFromHistory(history), [history]);

  const backendCycles = historyDerived.latestCycles;
  const backendUptime = historyDerived.latestUptimeHours;
  const backendLastValue = historyDerived.latestValue;

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
        {component.healthStatus === "error" && (
          <Alert severity="error" sx={{ mb: 1 }}>
            Simulated fault active{component.faultMessage ? `: ${component.faultMessage}` : "."}
          </Alert>
        )}
        {component.healthStatus === "offline" && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            Component is currently offline.
          </Alert>
        )}
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>{t("componentDetails.lastChanged")}:</strong>{" "}
          {new Date(component.lastChanged).toLocaleString()}
        </Typography>
        {backendCycles !== undefined && (
          <Typography variant="body2">
            <strong>{t("componentDetails.cycles")}:</strong> {backendCycles}
          </Typography>
        )}
        {backendUptime !== undefined && (
          <Typography variant="body2">
            <strong>{t("componentDetails.uptime")}:</strong> {renderNumber(backendUptime)}h
          </Typography>
        )}
        {component.rotationDeg !== undefined && (
          <Typography variant="body2">
            <strong>Rotation:</strong> {component.rotationDeg} deg
          </Typography>
        )}
        {backendLastValue !== undefined && (
          <Typography variant="body2">
            <strong>Last Sensor Value:</strong> {String(backendLastValue)}
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
        {!latestStoredLoading && !latestStoredError && !latestStoredEntry && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 1.5 }}>
            No stored backend value available for this component yet.
          </Typography>
        )}
        {latestStoredEntry && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
            <Typography variant="body2">
              <strong>Latest stored at:</strong> {new Date(latestStoredEntry.receivedAt).toLocaleString()}
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
        {!statsLoading && !statsError && (!stats || stats.count === 0) && (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 1.5 }}>
            No backend statistics available for this component yet.
          </Typography>
        )}
        {stats && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2 }}>
            <Card variant="outlined"><CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Stored rows</Typography><Typography variant="h6" fontWeight={700}>{stats.count}</Typography></CardContent></Card>
            <Card variant="outlined"><CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Average value</Typography><Typography variant="h6" fontWeight={700}>{renderNumber(stats.averageValue)}</Typography></CardContent></Card>
            <Card variant="outlined"><CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Min value</Typography><Typography variant="h6" fontWeight={700}>{renderNumber(stats.minValue)}</Typography></CardContent></Card>
            <Card variant="outlined"><CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}><Typography variant="caption" color="text.secondary">Max value</Typography><Typography variant="h6" fontWeight={700}>{renderNumber(stats.maxValue)}</Typography></CardContent></Card>
          </Box>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 2 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}>
              <Typography variant="caption" color="text.secondary">Backend cycle change</Typography>
              <Typography variant="h6" fontWeight={700}>
                {historyDerived.cyclesDelta === undefined ? "n/a" : `+${Math.round(historyDerived.cyclesDelta)}`}
              </Typography>
            </CardContent>
          </Card>
          <Card variant="outlined">
            <CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}>
              <Typography variant="caption" color="text.secondary">Backend uptime change</Typography>
              <Typography variant="h6" fontWeight={700}>
                {historyDerived.uptimeDelta === undefined ? "n/a" : `+${renderNumber(historyDerived.uptimeDelta)}h`}
              </Typography>
            </CardContent>
          </Card>
        </Box>

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
          <Stack spacing={1}>
            <SimpleTrendChart
              title="Sensor Value Trend"
              points={historyDerived.valuePoints}
              color="#1976d2"
            />
            <SimpleTrendChart
              title="Cycles Trend"
              points={historyDerived.cyclesPoints}
              color="#2e7d32"
            />
            <SimpleTrendChart
              title="Uptime Trend"
              points={historyDerived.uptimePoints}
              color="#ed6c02"
              suffix="h"
            />

            <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1.5, p: 1.25 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                Recent event timeline
              </Typography>
              <Stack spacing={0.75}>
                {historyDerived.snapshots.map((snapshot) => (
                  <Box
                    key={snapshot.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 0.75,
                      gap: 0.5,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(snapshot.receivedAt).toLocaleString()}
                      </Typography>
                      <Typography variant="body2">
                        value: {snapshot.value === undefined ? "n/a" : String(snapshot.value)} | cycles: {snapshot.cycles ?? "n/a"} | uptime: {snapshot.uptimeHours === undefined ? "n/a" : `${renderNumber(snapshot.uptimeHours)}h`}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      {snapshot.status && (
                        <Chip
                          size="small"
                          label={snapshot.status}
                          color={snapshot.status === "error" ? "error" : snapshot.status === "on" ? "success" : "default"}
                          variant="outlined"
                        />
                      )}
                      {snapshot.online !== undefined && (
                        <Chip
                          size="small"
                          label={snapshot.online ? "online" : "offline"}
                          color={snapshot.online ? "success" : "warning"}
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
