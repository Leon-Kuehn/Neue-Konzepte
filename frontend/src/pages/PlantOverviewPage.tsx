import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Drawer,
  Typography,
  IconButton as MuiIconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import ComponentDetails from "../components/ComponentDetails";
import KpiSummaryBar from "../components/KpiSummaryBar";
import { mockComponents } from "../types/mockData";
import type { PlantComponent } from "../types/PlantComponent";
import {
  loadSettings,
  connect,
  disconnect,
  subscribe,
  onMessage,
  getClient,
} from "../services/mqttClient";
import EntryRoutePanel from "../entryRoute/EntryRoutePanel";
import type { EntryRouteMapHandle } from "../entryRoute/EntryRouteMap";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useComponentHistory, useComponentStats, useLatestSensorData } from "../hooks/useSensorData";
import type { SensorData } from "../services/sensorDataApi";

export default function PlantOverviewPage() {
  const { t } = useAppPreferences();
  const location = useLocation();
  const showFromNavigation =
    typeof (location.state as { showComponentId?: unknown } | null)?.showComponentId === "string"
      ? ((location.state as { showComponentId: string }).showComponentId)
      : null;
  const [selectedId, setSelectedId] = useState<string | null>(showFromNavigation);
  const [focusComponentId, setFocusComponentId] = useState<string | null>(showFromNavigation);
  const [components, setComponents] = useState<PlantComponent[]>(() =>
    mockComponents.map((component) => ({
      ...component,
      status: "off",
      online: false,
      healthStatus: "offline",
      rotationDeg: 0,
      stats: {
        ...component.stats,
        lastValue: undefined,
      },
    })),
  );
  const [mqttConnected, setMqttConnected] = useState(false);
  const mapRef = useRef<EntryRouteMapHandle>(null);

  const selectedComponent = components.find((c) => c.id === selectedId) ?? null;
  const selectedComponentId = selectedComponent?.id;

  const latestStoredQuery = useLatestSensorData({
    refetchInterval: 15_000,
  });

  const selectedStatsQuery = useComponentStats(selectedComponentId, {
    enabled: Boolean(selectedComponentId),
    refetchInterval: 30_000,
  });

  const selectedHistoryQuery = useComponentHistory(
    selectedComponentId,
    { limit: 10 },
    {
      enabled: Boolean(selectedComponentId),
    },
  );

  const latestStoredByComponent = useMemo(() => {
    const byComponent = new Map<string, SensorData>();
    for (const row of latestStoredQuery.data ?? []) {
      if (!byComponent.has(row.componentId)) {
        byComponent.set(row.componentId, row);
      }
    }
    return byComponent;
  }, [latestStoredQuery.data]);

  const selectedStoredEntry = useMemo(
    () => (selectedComponentId ? latestStoredByComponent.get(selectedComponentId) : undefined),
    [latestStoredByComponent, selectedComponentId],
  );

  const onlineCount = useMemo(() => components.filter((component) => component.online).length, [components]);
  const activeCount = useMemo(() => components.filter((component) => component.status === "on").length, [components]);
  const latestChange = useMemo(() => {
    if (components.length === 0) return null;
    const latest = components.reduce((best, component) => {
      const timestamp = new Date(component.lastChanged).getTime();
      return timestamp > best ? timestamp : best;
    }, 0);
    return latest > 0 ? new Date(latest).toLocaleString() : null;
  }, [components]);

  useEffect(() => {
    const topicToComponentId = new Map(
      mockComponents.map((component) => [component.mqttTopics.status, component.id]),
    );

    const unsubscribe = onMessage((topic, payload) => {
      const mappedCompId = topicToComponentId.get(topic);
      const parts = topic.split("/");
      const fallbackCompId = parts[1];
      const fallbackKind = parts[2];

      const compId =
        mappedCompId ?? (fallbackKind === "status" ? fallbackCompId : undefined);
      if (!compId) return;

      try {
        const data = JSON.parse(payload as string) as {
          status?: "on" | "off" | "error" | "offline";
          online?: boolean;
          cycles?: number;
          uptimeHours?: number;
          value?: number | boolean;
          rotationDeg?: number;
          faultMessage?: string;
          health?: "ok" | "error" | "offline";
        };

        const nextStatus = data.status === "on" ? "on" : "off";
        const healthStatus =
          data.health ??
          (data.status === "error"
            ? "error"
            : data.status === "offline"
              ? "offline"
              : "ok");

        setComponents((prev) =>
          prev.map((c) =>
            c.id === compId
              ? {
                  ...c,
                  status: nextStatus,
                  online: data.online ?? (healthStatus === "offline" ? false : c.online),
                  healthStatus,
                  faultMessage: data.faultMessage,
                  rotationDeg: data.rotationDeg ?? c.rotationDeg,
                  lastChanged: new Date().toISOString(),
                  stats: {
                    ...c.stats,
                    cycles: data.cycles ?? c.stats.cycles,
                    uptimeHours: data.uptimeHours ?? c.stats.uptimeHours,
                    lastValue: data.value ?? c.stats.lastValue,
                  },
                }
              : c,
          ),
        );
      } catch {
        // ignore non-JSON
      }
    });

    const settings = loadSettings();
    if (!settings) {
      return () => {
        unsubscribe();
      };
    }

    let cancelled = false;

    (async () => {
      try {
        await connect(settings);
        if (cancelled) return;
        setMqttConnected(true);

        const statusTopics = [...new Set(mockComponents.map((c) => c.mqttTopics.status))];
        await Promise.all(statusTopics.map((topic) => subscribe(topic)));
      } catch {
        if (!cancelled) setMqttConnected(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe();
      if (getClient()) disconnect();
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <KpiSummaryBar
        items={[
          { label: t("plant.kpiTotalComponents"), value: `${components.length}` },
          { label: t("plant.kpiOnlineComponents"), value: `${onlineCount}` },
          { label: t("plant.kpiActiveComponents"), value: `${activeCount}` },
          { label: t("plant.kpiLastUpdate"), value: latestChange ?? t("common.notAvailable") },
        ]}
      />

      {mqttConnected && (
        <Alert severity="success">
          {t("plant.connectedLive")}
        </Alert>
      )}

      <Card sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {t("plant.topDownEntryRoute")}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <MuiIconButton
                size="small"
                onClick={() => mapRef.current?.zoomIn()}
                aria-label="Zoom in"
                title="Zoom in"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <AddIcon fontSize="small" />
              </MuiIconButton>
              <MuiIconButton
                size="small"
                onClick={() => mapRef.current?.zoomOut()}
                aria-label="Zoom out"
                title="Zoom out"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <RemoveIcon fontSize="small" />
              </MuiIconButton>
              <MuiIconButton
                size="small"
                onClick={() => mapRef.current?.resetView()}
                aria-label="Reset view"
                title="Reset view"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <RestartAltIcon fontSize="small" />
              </MuiIconButton>
            </Box>
          </Box>

          <Divider sx={{ mb: 1 }} />

          <Box
            sx={{
              display: "block",
              minHeight: 0,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <EntryRoutePanel
                ref={mapRef}
                components={components}
                onSelectComponent={(componentId) => {
                  setSelectedId(componentId);
                  setFocusComponentId(null);
                }}
                highlightedComponentId={focusComponentId}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={Boolean(selectedComponent)}
        onClose={() => {
          setSelectedId(null);
          setFocusComponentId(null);
        }}
        PaperProps={{ sx: { width: { xs: 320, sm: 380 }, p: 2 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {selectedComponent?.name ?? t("componentDetails.liveStatus")}
          </Typography>
          <MuiIconButton
            size="small"
            onClick={() => {
              setSelectedId(null);
              setFocusComponentId(null);
            }}
            aria-label={t("common.closeDetails")}
          >
            <CloseIcon fontSize="small" />
          </MuiIconButton>
        </Box>
        <Divider sx={{ mb: 1.5 }} />
        {selectedComponent && (
          <ComponentDetails
            component={selectedComponent}
            latestStoredEntry={selectedStoredEntry}
            latestStoredLoading={latestStoredQuery.isLoading}
            latestStoredError={latestStoredQuery.error?.message}
            stats={selectedStatsQuery.data}
            statsLoading={selectedStatsQuery.isLoading}
            statsError={selectedStatsQuery.error?.message}
            history={selectedHistoryQuery.data}
            historyLoading={selectedHistoryQuery.isLoading}
            historyError={selectedHistoryQuery.error?.message}
          />
        )}
      </Drawer>
    </Box>
  );
}
