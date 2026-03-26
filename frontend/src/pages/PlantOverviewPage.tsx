import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Drawer,
  MenuItem,
  Stack,
  Switch,
  FormControlLabel,
  TextField,
  Typography,
  IconButton as MuiIconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CloseIcon from "@mui/icons-material/Close";
import ComponentDetails from "../components/ComponentDetails";
import KpiSummaryBar from "../components/KpiSummaryBar";
import EntryRoutePanel from "../entryRoute/EntryRoutePanel";
import type { EntryRouteMapHandle } from "../entryRoute/EntryRouteMap";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useComponentHistory, useComponentStats, useLatestSensorData } from "../hooks/useSensorData";
import type { SensorData } from "../services/sensorDataApi";
import { useLiveComponents } from "../hooks/useLiveComponents";
import { useSimulationState } from "../hooks/useSimulationState";
import {
  disableSimulation,
  enableSimulation,
  resetHotspotStates,
  runSimulation,
  setSimulations,
  stopSimulation,
} from "../services/simulationService";
import SimulationDesignerDialog from "../components/SimulationDesignerDialog";
import { getSimulationConfigs } from "../services/simulationApi";

export default function PlantOverviewPage() {
  const { t, simulatorVisibility } = useAppPreferences();
  const location = useLocation();
  const showFromNavigation =
    typeof (location.state as { showComponentId?: unknown } | null)?.showComponentId === "string"
      ? ((location.state as { showComponentId: string }).showComponentId)
      : null;
  const [selectedId, setSelectedId] = useState<string | null>(showFromNavigation);
  const [focusComponentId, setFocusComponentId] = useState<string | null>(showFromNavigation);
  const [selectedSimulationId, setSelectedSimulationId] = useState<string>("");
  const [designerOpen, setDesignerOpen] = useState(false);
  const [designerSimulationId, setDesignerSimulationId] = useState<string | undefined>(undefined);
  const { components, mqttConnected } = useLiveComponents();
  const simulation = useSimulationState();
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
    { limit: 120 },
    {
      enabled: Boolean(selectedComponentId),
      refetchInterval: 15_000,
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

  const availableSimulations = simulation.simulations;

  useEffect(() => {
    let mounted = true;

    void getSimulationConfigs()
      .then((configs) => {
        if (!mounted) {
          return;
        }
        setSimulations(configs);
      })
      .catch(() => {
        // Keep local fallback simulations when backend is unavailable.
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (selectedSimulationId) {
      const stillExists = availableSimulations.some((entry) => entry.id === selectedSimulationId);
      if (stillExists) {
        return;
      }
    }

    if (availableSimulations.length > 0 && !selectedSimulationId) {
      setSelectedSimulationId(availableSimulations[0]!.id);
    }
  }, [availableSimulations, selectedSimulationId]);

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
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems="stretch">
            <Box sx={{ flex: 1, minWidth: 0 }}>
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
            </Box>

            {simulatorVisibility.plantSimulator && (
              <>
                <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", lg: "block" } }} />

                <Stack spacing={1.5} sx={{ width: { xs: "100%", lg: 360 }, flexShrink: 0 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    Simulation Mode
                  </Typography>

                  <Alert severity={simulation.enabled ? "warning" : "info"}>
                    {simulation.enabled
                      ? "Simulation mode is active. Hotspot state comes from the simulation engine only."
                      : "Simulation mode is off. Hotspot state comes from live MQTT/backend data."}
                  </Alert>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={simulation.enabled}
                        onChange={(_event, checked) => {
                          if (checked) {
                            enableSimulation();
                            return;
                          }
                          disableSimulation();
                        }}
                      />
                    }
                    label="Simulation Mode"
                  />

                  <TextField
                    select
                    size="small"
                    label="Simulation"
                    value={selectedSimulationId}
                    onChange={(event) => setSelectedSimulationId(event.target.value)}
                  >
                    {availableSimulations.map((entry) => (
                      <MenuItem key={entry.id} value={entry.id}>
                        {entry.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Stack direction={{ xs: "column", sm: "row", lg: "column" }} spacing={1}>
                    <Button
                      variant="contained"
                      disabled={!simulation.enabled || !selectedSimulationId}
                      onClick={() => runSimulation(selectedSimulationId)}
                    >
                      Start
                    </Button>
                    <Button
                      variant="outlined"
                      disabled={!simulation.enabled}
                      onClick={() => {
                        stopSimulation();
                        resetHotspotStates();
                      }}
                    >
                      Stop / Reset
                    </Button>
                  </Stack>

                  <Stack direction={{ xs: "column", sm: "row", lg: "column" }} spacing={1}>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setDesignerSimulationId(selectedSimulationId || undefined);
                        setDesignerOpen(true);
                      }}
                    >
                      Edit Simulation
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      onClick={() => {
                        setDesignerSimulationId(undefined);
                        setDesignerOpen(true);
                      }}
                    >
                      New Simulation
                    </Button>
                  </Stack>

                  <Typography variant="body2" color="text.secondary">
                    Running: {simulation.running ? "yes" : "no"} | Elapsed: {simulation.nowMs} ms
                  </Typography>
                </Stack>
              </>
            )}
          </Stack>
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

      {simulatorVisibility.plantSimulator && (
        <SimulationDesignerDialog
          open={designerOpen}
          onClose={() => {
            setDesignerOpen(false);
            setDesignerSimulationId(undefined);
          }}
          initialSimulationId={designerSimulationId}
        />
      )}
    </Box>
  );
}
