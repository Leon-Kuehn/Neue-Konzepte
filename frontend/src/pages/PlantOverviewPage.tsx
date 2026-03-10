import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import {
  Alert,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Slider,
  Stack,
  Chip,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import ComponentDetails from "../components/ComponentDetails";
import ComponentGroupList from "../components/ComponentGroupList";
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

import TopViewPng from "../png/TopView.png";

type Hotspot = {
  id: string;   // gleiche ID wie PlantComponent.id
  top: string; // Prozent relativ zum Bild
  left: string;
};

type CursorState = {
  xPx: number;
  yPx: number;
  xPct: number;
  yPct: number;
};

const SEEDED_HOTSPOTS: Hotspot[] = [
  { id: "conveyor-1", top: "87.52%", left: "34.23%" },
  { id: "conveyor-2", top: "87.52%", left: "43.88%" },
  { id: "conveyor-3", top: "70.17%", left: "55.50%" },
  { id: "conveyor-4", top: "87.81%", left: "66.05%" },
  { id: "conveyor-5", top: "87.81%", left: "71.03%" },
  { id: "conveyor-6", top: "55.17%", left: "34.08%" },
  { id: "conveyor-7", top: "54.87%", left: "43.88%" },
  { id: "conveyor-8", top: "37.81%", left: "55.50%" },
  { id: "conveyor-9", top: "22.52%", left: "27.14%" },
  { id: "conveyor-10", top: "21.34%", left: "34.38%" },
  { id: "conveyor-11", top: "21.05%", left: "43.73%" },
  { id: "conveyor-12", top: "21.34%", left: "64.24%" },
  { id: "conveyor-13", top: "87.81%", left: "28.95%" },
  { id: "rotating-1", top: "21.05%", left: "55.50%" },
  { id: "rotating-2", top: "54.87%", left: "55.35%" },
  { id: "rotating-3", top: "87.52%", left: "55.50%" },
  { id: "press-1", top: "60.46%", left: "43.88%" },
  { id: "press-2", top: "16.05%", left: "26.09%" },
  { id: "press-3", top: "16.05%", left: "28.80%" },
  { id: "ind-sensor-1", top: "73.40%", left: "57.91%" },
  { id: "ind-sensor-2", top: "68.99%", left: "58.06%" },
  { id: "ind-sensor-3", top: "20.75%", left: "26.09%" },
  { id: "ind-sensor-4", top: "21.05%", left: "28.35%" },
  { id: "ind-sensor-5", top: "83.40%", left: "27.30%" },
  { id: "ind-sensor-6", top: "83.11%", left: "34.08%" },
  { id: "ind-sensor-7", top: "83.40%", left: "39.51%" },
  { id: "ind-sensor-8", top: "83.40%", left: "43.88%" },
  { id: "ind-sensor-9", top: "83.70%", left: "47.81%" },
  { id: "ind-sensor-10", top: "83.40%", left: "55.80%" },
  { id: "ind-sensor-11", top: "50.17%", left: "34.08%" },
  { id: "ind-sensor-12", top: "50.46%", left: "39.66%" },
  { id: "ind-sensor-13", top: "50.46%", left: "43.88%" },
  { id: "ind-sensor-14", top: "50.46%", left: "55.65%" },
  { id: "ind-sensor-15", top: "37.23%", left: "57.91%" },
  { id: "ind-sensor-16", top: "16.64%", left: "34.38%" },
  { id: "ind-sensor-17", top: "16.64%", left: "39.81%" },
  { id: "ind-sensor-18", top: "16.05%", left: "47.65%" },
  { id: "ind-sensor-19", top: "16.34%", left: "55.65%" },
  { id: "rfid-1", top: "87.52%", left: "27.45%" },
  { id: "rfid-2", top: "87.81%", left: "39.81%" },
  { id: "rfid-3", top: "87.52%", left: "63.94%" },
  { id: "rfid-4", top: "54.87%", left: "39.51%" },
  { id: "rfid-5", top: "21.05%", left: "39.81%" },
  { id: "optical-1", top: "83.40%", left: "70.73%" },
  { id: "pneumatic-1", top: "93.70%", left: "39.81%" },
  { id: "pneumatic-2", top: "93.99%", left: "43.73%" },
  { id: "pneumatic-3", top: "94.28%", left: "47.81%" },
  { id: "pneumatic-4", top: "29.58%", left: "25.94%" },
  { id: "pneumatic-5", top: "29.28%", left: "28.95%" },
  { id: "crane-1", top: "41.64%", left: "34.23%" },
  { id: "storage-1", top: "51.34%", left: "77.51%" },
  { id: "input-1", top: "87.23%", left: "22.62%" },
];

const HOTSPOT_STORAGE_KEY = "plant-overview-hotspots-v2";

function buildInitialHotspots(): Hotspot[] {
  const seededById = new Map(SEEDED_HOTSPOTS.map((h) => [h.id, h]));

  return mockComponents.map((component) => {
    const seeded = seededById.get(component.id);
    if (seeded) return seeded;

    return {
      id: component.id,
      top: "50%",
      left: "50%",
    };
  });
}

function sanitizeStoredHotspots(raw: unknown): Hotspot[] | null {
  if (!Array.isArray(raw)) return null;

  const parsed = raw
    .filter((item): item is Hotspot => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof (item as Hotspot).id === "string" &&
        typeof (item as Hotspot).top === "string" &&
        typeof (item as Hotspot).left === "string"
      );
    })
    .map((item) => ({ id: item.id, top: item.top, left: item.left }));

  return parsed.length > 0 ? parsed : null;
}

function loadInitialHotspots(): Hotspot[] {
  const initial = buildInitialHotspots();

  try {
    const raw = localStorage.getItem(HOTSPOT_STORAGE_KEY);
    if (!raw) return initial;

    const stored = sanitizeStoredHotspots(JSON.parse(raw));
    if (!stored) return initial;

    const storedById = new Map(stored.map((item) => [item.id, item]));
    return initial.map((item) => storedById.get(item.id) ?? item);
  } catch {
    return initial;
  }
}

function mergeHotspotsWithInitial(base: Hotspot[], incoming: Hotspot[]): Hotspot[] {
  const incomingById = new Map(incoming.map((item) => [item.id, item]));
  return base.map((item) => incomingById.get(item.id) ?? item);
}

function categoryLabel(category: string): string {
  return category.replace(/-/g, " ");
}

export default function PlantOverviewPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [components, setComponents] = useState<PlantComponent[]>(mockComponents);
  const [mqttConnected, setMqttConnected] = useState(false);
  const [hotspots, setHotspots] = useState<Hotspot[]>(loadInitialHotspots);
  const [editMode, setEditMode] = useState(false);
  const [hotspotSize, setHotspotSize] = useState<number>(30);
  const [cursorState, setCursorState] = useState<CursorState | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);

  const selectedComponent = components.find((c) => c.id === selectedId);
  const selectedHotspot = selectedId ? hotspots.find((h) => h.id === selectedId) : undefined;

  // MQTT auto-connect with saved settings + Live-Update
  useEffect(() => {
    const settings = loadSettings();
    if (!settings) return;

    let cancelled = false;

    (async () => {
      try {
        await connect(settings);
        if (cancelled) return;
        setMqttConnected(true);

        // Subscribe all configured status topics from mock data.
        const statusTopics = [...new Set(components.map((c) => c.mqttTopics.status))];
        await Promise.all(statusTopics.map((topic) => subscribe(topic)));

        const topicToComponentId = new Map(
          components.map((component) => [component.mqttTopics.status, component.id])
        );

        onMessage((topic, payload) => {
          const mappedCompId = topicToComponentId.get(topic);
          const parts = topic.split("/");
          const fallbackCompId = parts[1];
          const fallbackKind = parts[2];

          const compId = mappedCompId ?? (fallbackKind === "status" ? fallbackCompId : undefined);
          if (!compId) return;

          try {
            const data = JSON.parse(payload as string);
            // Erwartetes JSON:
            // { "status":"on","online":true,"cycles":123,"uptimeHours":10.5 }

            setComponents((prev) =>
              prev.map((c) =>
                c.id === compId
                  ? {
                      ...c,
                      status: data.status ?? c.status,
                      online: data.online ?? c.online,
                      lastChanged: new Date().toISOString(),
                      stats: {
                        ...c.stats,
                        cycles: data.cycles ?? c.stats.cycles,
                        uptimeHours: data.uptimeHours ?? c.stats.uptimeHours,
                      },
                    }
                  : c
              )
            );
          } catch {
            // ignore non-JSON
          }
        });
      } catch {
        if (!cancelled) setMqttConnected(false);
      }
    })();

    return () => {
      cancelled = true;
      if (getClient()) disconnect();
    };
  }, [components]);

  useEffect(() => {
    localStorage.setItem(HOTSPOT_STORAGE_KEY, JSON.stringify(hotspots));
  }, [hotspots]);

  useEffect(() => {
    const parsePct = (value: string) => Number.parseFloat(value.replace("%", ""));

    const updatePopupPosition = () => {
      if (!selectedHotspot || !selectedComponent) {
        setPopupPosition(null);
        return;
      }

      const container = mapContainerRef.current;
      const popup = popupRef.current;
      if (!container || !popup) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const hotspotX = (parsePct(selectedHotspot.left) / 100) * containerWidth;
      const hotspotY = (parsePct(selectedHotspot.top) / 100) * containerHeight;
      const popupWidth = popup.offsetWidth;
      const popupHeight = popup.offsetHeight;
      const offset = 14;
      const edgePadding = 8;

      let top = hotspotY + offset;
      if (top + popupHeight + edgePadding > containerHeight) {
        top = hotspotY - offset - popupHeight;
      }
      if (top < edgePadding) {
        top = edgePadding;
      }

      let left = hotspotX + offset;
      if (left + popupWidth + edgePadding > containerWidth) {
        left = hotspotX - offset - popupWidth;
      }
      if (left < edgePadding) {
        left = edgePadding;
      }

      setPopupPosition({ top, left });
    };

    updatePopupPosition();
    const rafId = window.requestAnimationFrame(updatePopupPosition);
    window.addEventListener("resize", updatePopupPosition);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updatePopupPosition);
    };
  }, [selectedHotspot, selectedComponent]);

  const getPointerPosition = (event: MouseEvent<HTMLDivElement>): CursorState => {
    const rect = event.currentTarget.getBoundingClientRect();
    const xPx = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    const yPx = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
    const xPct = rect.width > 0 ? (xPx / rect.width) * 100 : 0;
    const yPct = rect.height > 0 ? (yPx / rect.height) * 100 : 0;
    return { xPx, yPx, xPct, yPct };
  };

  const handleTopViewClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!editMode) {
      setSelectedId(null);
      return;
    }

    if (!editMode || !selectedId) return;

    const pos = getPointerPosition(event);
    setHotspots((prev) =>
      prev.map((h) =>
        h.id === selectedId
          ? {
              ...h,
              left: `${pos.xPct.toFixed(2)}%`,
              top: `${pos.yPct.toFixed(2)}%`,
            }
          : h
      )
    );
  };

  const handleTopViewMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!editMode) return;
    setCursorState(getPointerPosition(event));
  };

  const exportHotspots = () => {
    const exportPayload = JSON.stringify(hotspots, null, 2);
    const blob = new Blob([exportPayload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plant-hotspots.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = sanitizeStoredHotspots(JSON.parse(text));
      if (!parsed) return;

      const initial = buildInitialHotspots();
      const merged = mergeHotspotsWithInitial(initial, parsed);
      setHotspots(merged);
    } catch {
      // Ignore invalid import files.
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: { lg: "calc(100vh - 110px)" },
      }}
    >
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Plant Overview
      </Typography>

      {mqttConnected && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Connected to MQTT broker — receiving live updates.
        </Alert>
      )}

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ height: { lg: 430 }, display: "flex", flexDirection: "column" }}>
            <CardContent sx={{ pb: 1 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  Top-Down View
                </Typography>
                <Stack direction={{ xs: "column", md: "row" }} spacing={0.75} alignItems={{ xs: "stretch", md: "center" }}>
                  {editMode && (
                    <Box sx={{ minWidth: { xs: "100%", md: 180 } }}>
                      <Typography variant="caption" color="text.secondary">
                        Hotspot Size: {hotspotSize}px
                      </Typography>
                      <Slider
                        size="small"
                        min={10}
                        max={52}
                        step={2}
                        value={hotspotSize}
                        onChange={(_, value) => setHotspotSize(value as number)}
                        sx={{ width: { xs: "100%", md: 160 } }}
                      />
                    </Box>
                  )}
                  {editMode && selectedHotspot && (
                    <Tooltip title={`Selected: ${selectedHotspot.id} (${selectedHotspot.left}, ${selectedHotspot.top})`}>
                      <Chip
                        label={`Sel: ${selectedHotspot.id}`}
                        size="small"
                        color="primary"
                        sx={{ maxWidth: 180, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
                      />
                    </Tooltip>
                  )}
                  {editMode && cursorState && (
                    <Tooltip title={`Cursor: ${cursorState.xPx.toFixed(0)}px / ${cursorState.yPx.toFixed(0)}px`}>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Cur: ${cursorState.xPx.toFixed(0)} / ${cursorState.yPx.toFixed(0)}`}
                      />
                    </Tooltip>
                  )}
                  <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="flex-end" sx={{ flexWrap: "wrap" }}>
                    <Button size="small" variant="outlined" onClick={exportHotspots}>
                      Export
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => importInputRef.current?.click()}
                    >
                      Import
                    </Button>
                    <Tooltip title={editMode ? "Disable calibration" : "Enable calibration"}>
                      <IconButton
                        size="small"
                        color={editMode ? "warning" : "default"}
                        onClick={() => setEditMode((prev) => !prev)}
                      >
                        <SettingsSuggestIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Stack>
              </Stack>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                hidden
                onChange={handleImportFileChange}
              />

              <Divider sx={{ mb: 1 }} />

              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", flex: 1, minHeight: 0 }}>
                <Box
                  ref={mapContainerRef}
                  onClick={handleTopViewClick}
                  onMouseMove={handleTopViewMove}
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 760,
                    aspectRatio: "16 / 10",
                    maxHeight: { xs: 300, lg: 340 },
                    cursor: editMode ? "crosshair" : "default",
                  }}
                >
                  <img
                    src={TopViewPng}
                    alt="Top-down plant view"
                    style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                  />

                  {hotspots.map((h) => {
                    const comp = components.find((c) => c.id === h.id);
                    const isSelected = selectedId === h.id;
                    let color = "#9e9e9e";
                    if (comp?.online === false) color = "#d32f2f";
                    else if (comp?.status === "on") color = "#2e7d32";

                    return (
                      <Box
                        key={h.id}
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedId((prev) => (prev === h.id ? null : h.id));
                        }}
                        title={comp ? comp.name : h.id}
                        sx={{
                          position: "absolute",
                          top: h.top,
                          left: h.left,
                          width: hotspotSize,
                          height: hotspotSize,
                          borderRadius: "50%",
                          bgcolor: editMode ? color : "transparent",
                          border: editMode ? "2px solid #fff" : "none",
                          boxShadow: editMode ? 2 : "none",
                          cursor: "pointer",
                          transform: "translate(-50%, -50%)",
                          transition: "all 0.15s ease",
                          ...(isSelected && {
                            ...(editMode
                              ? { boxShadow: 6, transform: "translate(-50%, -50%) scale(1.1)" }
                              : {
                                  boxShadow: "0 0 0 2px #fff, 0 0 0 5px rgba(227, 6, 19, 0.85)",
                                  bgcolor: "rgba(227, 6, 19, 0.1)",
                                }),
                          }),
                          "&:hover": !editMode
                            ? {
                                boxShadow: "0 0 0 2px rgba(227, 6, 19, 0.7)",
                                bgcolor: "rgba(227, 6, 19, 0.08)",
                              }
                            : undefined,
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={comp ? `Open details for ${comp.name}` : `Open details for ${h.id}`}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId((prev) => (prev === h.id ? null : h.id));
                          }
                        }}
                      />
                    );
                  })}

                  {selectedHotspot && selectedComponent && (
                    <Box
                      ref={popupRef}
                      sx={{
                        position: "absolute",
                        top: popupPosition ? `${popupPosition.top}px` : 8,
                        left: popupPosition ? `${popupPosition.left}px` : 8,
                        minWidth: 220,
                        maxWidth: 280,
                        bgcolor: "rgba(18, 18, 18, 0.92)",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: 1,
                        p: 1,
                        boxShadow: 6,
                        zIndex: 3,
                        backdropFilter: "blur(2px)",
                        opacity: popupPosition ? 1 : 0,
                        transition: "top 0.12s ease, left 0.12s ease, opacity 0.12s ease",
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        {selectedComponent.name}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.95 }}>
                        {selectedComponent.id} - {categoryLabel(selectedComponent.category)}
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                        <Chip
                          label={selectedComponent.status.toUpperCase()}
                          size="small"
                          color={selectedComponent.status === "on" ? "success" : "default"}
                        />
                        <Chip
                          label={selectedComponent.online ? "Online" : "Offline"}
                          size="small"
                          color={selectedComponent.online ? "success" : "error"}
                          variant="outlined"
                          sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.45)" }}
                        />
                      </Stack>
                      <Typography variant="caption" sx={{ display: "block", mt: 0.8 }}>
                        Cycles: {selectedComponent.stats.cycles ?? "-"}
                      </Typography>
                      <Typography variant="caption" sx={{ display: "block" }}>
                        Uptime: {selectedComponent.stats.uptimeHours ?? "-"}h
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ height: { lg: 430 } }}>
            <ComponentDetails component={selectedComponent} />
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }} sx={{ minHeight: 0 }}>
          <Card sx={{ display: "flex", flexDirection: "column", height: isDesktop ? "100%" : "auto" }}>
            <CardContent sx={{ pb: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                Component Browser
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Grouped by category. Click a row or hotspot to sync list, map and details.
              </Typography>
              <ComponentGroupList
                components={components}
                selectedId={selectedId}
                onSelect={setSelectedId}
                maxHeight={isDesktop ? 320 : 420}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
