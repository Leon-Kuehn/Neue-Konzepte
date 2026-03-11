import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from "react";
import {
  Alert,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
  Drawer,
  IconButton,
  Slider,
  Stack,
  Chip,
  Tabs,
  Tab,
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
  DEFAULT_RADIUS_PERCENT,
  type Hotspot,
  sanitizeHotspotList,
  pixelsToPercent,
  percentToPixels,
} from "../utils/hotspot";
import {
  loadSettings,
  connect,
  disconnect,
  subscribe,
  onMessage,
  getClient,
} from "../services/mqttClient";

import TopViewPng from "../png/TopView.png";

type CursorState = {
  xPx: number;
  yPx: number;
  xPct: number;
  yPct: number;
};

const SEEDED_HOTSPOTS: Array<
  Pick<Hotspot, "id" | "xPercent" | "yPercent"> & { radiusPercent?: number }
> = [
  { id: "conveyor-1", xPercent: 34.23, yPercent: 87.52 },
  { id: "conveyor-2", xPercent: 43.88, yPercent: 87.52 },
  { id: "conveyor-3", xPercent: 55.5, yPercent: 70.17 },
  { id: "conveyor-4", xPercent: 66.05, yPercent: 87.81 },
  { id: "conveyor-5", xPercent: 71.03, yPercent: 87.81 },
  { id: "conveyor-6", xPercent: 34.08, yPercent: 55.17 },
  { id: "conveyor-7", xPercent: 43.88, yPercent: 54.87 },
  { id: "conveyor-8", xPercent: 55.5, yPercent: 37.81 },
  { id: "conveyor-9", xPercent: 27.14, yPercent: 22.52 },
  { id: "conveyor-10", xPercent: 34.38, yPercent: 21.34 },
  { id: "conveyor-11", xPercent: 43.73, yPercent: 21.05 },
  { id: "conveyor-12", xPercent: 64.24, yPercent: 21.34 },
  { id: "conveyor-13", xPercent: 28.95, yPercent: 87.81 },
  { id: "rotating-1", xPercent: 55.5, yPercent: 21.05 },
  { id: "rotating-2", xPercent: 55.35, yPercent: 54.87 },
  { id: "rotating-3", xPercent: 55.5, yPercent: 87.52 },
  { id: "press-1", xPercent: 43.88, yPercent: 60.46 },
  { id: "press-2", xPercent: 26.09, yPercent: 16.05 },
  { id: "press-3", xPercent: 28.8, yPercent: 16.05 },
  { id: "ind-sensor-1", xPercent: 57.91, yPercent: 73.4 },
  { id: "ind-sensor-2", xPercent: 58.06, yPercent: 68.99 },
  { id: "ind-sensor-3", xPercent: 26.09, yPercent: 20.75 },
  { id: "ind-sensor-4", xPercent: 28.35, yPercent: 21.05 },
  { id: "ind-sensor-5", xPercent: 27.3, yPercent: 83.4 },
  { id: "ind-sensor-6", xPercent: 34.08, yPercent: 83.11 },
  { id: "ind-sensor-7", xPercent: 39.51, yPercent: 83.4 },
  { id: "ind-sensor-8", xPercent: 43.88, yPercent: 83.4 },
  { id: "ind-sensor-9", xPercent: 47.81, yPercent: 83.7 },
  { id: "ind-sensor-10", xPercent: 55.8, yPercent: 83.4 },
  { id: "ind-sensor-11", xPercent: 34.08, yPercent: 50.17 },
  { id: "ind-sensor-12", xPercent: 39.66, yPercent: 50.46 },
  { id: "ind-sensor-13", xPercent: 43.88, yPercent: 50.46 },
  { id: "ind-sensor-14", xPercent: 55.65, yPercent: 50.46 },
  { id: "ind-sensor-15", xPercent: 57.91, yPercent: 37.23 },
  { id: "ind-sensor-16", xPercent: 34.38, yPercent: 16.64 },
  { id: "ind-sensor-17", xPercent: 39.81, yPercent: 16.64 },
  { id: "ind-sensor-18", xPercent: 47.65, yPercent: 16.05 },
  { id: "ind-sensor-19", xPercent: 55.65, yPercent: 16.34 },
  { id: "rfid-1", xPercent: 27.45, yPercent: 87.52 },
  { id: "rfid-2", xPercent: 39.81, yPercent: 87.81 },
  { id: "rfid-3", xPercent: 63.94, yPercent: 87.52 },
  { id: "rfid-4", xPercent: 39.51, yPercent: 54.87 },
  { id: "rfid-5", xPercent: 39.81, yPercent: 21.05 },
  { id: "optical-1", xPercent: 70.73, yPercent: 83.4 },
  { id: "pneumatic-1", xPercent: 39.81, yPercent: 93.7 },
  { id: "pneumatic-2", xPercent: 43.73, yPercent: 93.99 },
  { id: "pneumatic-3", xPercent: 47.81, yPercent: 94.28 },
  { id: "pneumatic-4", xPercent: 25.94, yPercent: 29.58 },
  { id: "pneumatic-5", xPercent: 28.95, yPercent: 29.28 },
  { id: "crane-1", xPercent: 34.23, yPercent: 41.64 },
  { id: "storage-1", xPercent: 77.51, yPercent: 51.34 },
  { id: "input-1", xPercent: 22.62, yPercent: 87.23 },
];

const HOTSPOT_STORAGE_KEY = "plant-overview-hotspots-v3";

function buildInitialHotspots(): Hotspot[] {
  const seededById = new Map(SEEDED_HOTSPOTS.map((h) => [h.id, h]));

  return mockComponents.map((component) => {
    const seeded = seededById.get(component.id);
    return {
      id: component.id,
      xPercent: seeded?.xPercent ?? 50,
      yPercent: seeded?.yPercent ?? 50,
      description: component.name,
      radiusPercent: seeded?.radiusPercent ?? DEFAULT_RADIUS_PERCENT,
    };
  });
}

function loadInitialHotspots(): Hotspot[] {
  const initial = buildInitialHotspots();

  try {
    const raw = localStorage.getItem(HOTSPOT_STORAGE_KEY);
    if (!raw) return initial;

    const stored = sanitizeHotspotList(JSON.parse(raw), {
      radiusPercent: DEFAULT_RADIUS_PERCENT,
    });
    if (!stored.length) return initial;

    const storedById = new Map(stored.map((item) => [item.id, item]));
    return initial.map((item) => {
      const incoming = storedById.get(item.id);
      if (!incoming) return item;
      return {
        ...item,
        ...incoming,
        description: incoming.description || item.description,
        radiusPercent: incoming.radiusPercent ?? item.radiusPercent,
      };
    });
  } catch {
    return initial;
  }
}

function mergeHotspotsWithInitial(base: Hotspot[], incoming: Hotspot[]): Hotspot[] {
  const incomingById = new Map(incoming.map((item) => [item.id, item]));
  return base.map((item) => {
    const incoming = incomingById.get(item.id);
    if (!incoming) return item;
    return {
      ...item,
      ...incoming,
      description: incoming.description || item.description,
      radiusPercent: incoming.radiusPercent ?? item.radiusPercent,
    };
  });
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
  const [hotspotRadiusPercent, setHotspotRadiusPercent] = useState<number>(DEFAULT_RADIUS_PERCENT);
  const [cursorState, setCursorState] = useState<CursorState | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ top: number; left: number } | null>(null);
  const [tab, setTab] = useState<"hidden" | "components">("hidden");

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
      const { xPx: hotspotX, yPx: hotspotY } = percentToPixels(
        selectedHotspot.xPercent,
        selectedHotspot.yPercent,
        containerWidth,
        containerHeight
      );
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
    const { xPercent, yPercent } = pixelsToPercent(xPx, yPx, rect.width, rect.height);
    return { xPx, yPx, xPct: xPercent, yPct: yPercent };
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
              xPercent: Number(pos.xPct.toFixed(2)),
              yPercent: Number(pos.yPct.toFixed(2)),
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
    const exportPayload = JSON.stringify(
      hotspots.map((hotspot) => ({
        ...hotspot,
        xPercent: Number(hotspot.xPercent.toFixed(2)),
        yPercent: Number(hotspot.yPercent.toFixed(2)),
        radiusPercent: hotspot.radiusPercent ?? hotspotRadiusPercent,
      })),
      null,
      2
    );
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
      const parsed = sanitizeHotspotList(JSON.parse(text), {
        radiusPercent: hotspotRadiusPercent,
      });
      if (!parsed.length) return;

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

      <Card sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ pb: 1 }}>
          <Stack
            direction="row"
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 1, flexWrap: "wrap" }}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              Top-Down View
            </Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={0.75}
              alignItems={{ xs: "flex-start", md: "center" }}
              sx={{ flexWrap: "wrap" }}
            >
              {editMode && (
                <Box sx={{ minWidth: { xs: "100%", md: 220 } }}>
                  <Typography variant="caption" color="text.secondary">
                    Hotspot radius: {hotspotRadiusPercent.toFixed(2)}%
                  </Typography>
                  <Slider
                    size="small"
                    min={0.5}
                    max={6}
                    step={0.25}
                    value={hotspotRadiusPercent}
                    onChange={(_, value) => setHotspotRadiusPercent(value as number)}
                    sx={{ width: { xs: "100%", md: 180 } }}
                  />
                </Box>
              )}
              {editMode && selectedHotspot && (
                <Tooltip
                  title={`Selected: ${selectedHotspot.id} (${selectedHotspot.xPercent.toFixed(2)}%, ${selectedHotspot.yPercent.toFixed(2)}%)`}
                >
                  <Chip
                    label={`Sel: ${selectedHotspot.id}`}
                    size="small"
                    color="primary"
                    sx={{ maxWidth: 200, "& .MuiChip-label": { overflow: "hidden", textOverflow: "ellipsis" } }}
                  />
                </Tooltip>
              )}
              {editMode && cursorState && (
                <Tooltip title={`Cursor: ${cursorState.xPx.toFixed(0)}px / ${cursorState.yPx.toFixed(0)}px`}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Cur: ${cursorState.xPct.toFixed(2)}% / ${cursorState.yPct.toFixed(2)}%`}
                  />
                </Tooltip>
              )}
              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                justifyContent="flex-end"
                sx={{ flexWrap: "wrap" }}
              >
                <Button size="small" variant="outlined" onClick={exportHotspots}>
                  Export
                </Button>
                <Button size="small" variant="outlined" onClick={() => importInputRef.current?.click()}>
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
                aspectRatio: "16 / 10",
                maxHeight: { xs: "70vh", lg: "72vh" },
                cursor: editMode ? "crosshair" : "default",
                borderRadius: 2,
                overflow: "hidden",
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
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

                const diameterPercent = (h.radiusPercent ?? hotspotRadiusPercent) * 2;

                return (
                  <Box
                    key={h.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedId((prev) => (prev === h.id ? null : h.id));
                    }}
                    title={h.description || comp?.name || h.id}
                    sx={{
                      position: "absolute",
                      top: `${h.yPercent}%`,
                      left: `${h.xPercent}%`,
                      width: `${diameterPercent}%`,
                      height: `${diameterPercent}%`,
                      borderRadius: "50%",
                      bgcolor: editMode ? color : "rgba(227, 6, 19, 0.12)",
                      border: editMode ? "2px solid #fff" : `2px solid rgba(227, 6, 19, 0.6)`,
                      boxShadow: editMode
                        ? 2
                        : isSelected
                          ? "0 0 0 2px #fff, 0 0 0 6px rgba(227, 6, 19, 0.35)"
                          : "0 0 0 1px rgba(0,0,0,0.08)",
                      cursor: "pointer",
                      transform: "translate(-50%, -50%)",
                      transition: "all 0.15s ease",
                      ...(isSelected && {
                        ...(editMode
                          ? { boxShadow: 6, transform: "translate(-50%, -50%) scale(1.08)" }
                          : {
                              bgcolor: "rgba(227, 6, 19, 0.18)",
                            }),
                      }),
                      "&:hover": {
                        boxShadow: "0 0 0 2px rgba(227, 6, 19, 0.7)",
                        bgcolor: "rgba(227, 6, 19, 0.12)",
                      },
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

      <Card sx={{ display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ pb: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Typography variant="h6" fontWeight={700}>
              Component Tiles
            </Typography>
            <Tabs
              value={tab}
              onChange={(_, next) => setTab(next as "hidden" | "components")}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
            >
              <Tab value="hidden" label="Keep view clean" />
              <Tab value="components" label="Component Browser" />
            </Tabs>
          </Stack>
          <Divider sx={{ my: 1 }} />
          {tab === "components" ? (
            <ComponentGroupList
              components={components}
              selectedId={selectedId}
              onSelect={setSelectedId}
              maxHeight={isDesktop ? 360 : 420}
            />
          ) : (
            <Typography variant="body2" color="text.secondary">
              Component tiles are hidden to keep the top-down view uncluttered. Switch to the Component Browser tab to
              browse and select parts without covering the map.
            </Typography>
          )}
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={Boolean(selectedComponent)}
        onClose={() => setSelectedId(null)}
        PaperProps={{ sx: { width: { xs: 320, sm: 380 }, p: 2 } }}
      >
        <ComponentDetails component={selectedComponent} />
      </Drawer>
    </Box>
  );
}
