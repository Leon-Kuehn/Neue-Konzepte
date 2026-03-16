import { useEffect, useState, useRef } from "react";
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

export default function PlantOverviewPage() {
  const { t } = useAppPreferences();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [components, setComponents] = useState<PlantComponent[]>(mockComponents);
  const [mqttConnected, setMqttConnected] = useState(false);
  const mapRef = useRef<EntryRouteMapHandle>(null);

  const selectedComponent = components.find((c) => c.id === selectedId) ?? null;

  useEffect(() => {
    const settings = loadSettings();
    if (!settings) return;

    let cancelled = false;

    (async () => {
      try {
        await connect(settings);
        if (cancelled) return;
        setMqttConnected(true);

        const statusTopics = [...new Set(components.map((c) => c.mqttTopics.status))];
        await Promise.all(statusTopics.map((topic) => subscribe(topic)));

        const topicToComponentId = new Map(
          components.map((component) => [component.mqttTopics.status, component.id]),
        );

        onMessage((topic, payload) => {
          const mappedCompId = topicToComponentId.get(topic);
          const parts = topic.split("/");
          const fallbackCompId = parts[1];
          const fallbackKind = parts[2];

          const compId =
            mappedCompId ?? (fallbackKind === "status" ? fallbackCompId : undefined);
          if (!compId) return;

          try {
            const data = JSON.parse(payload as string);

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
                  : c,
              ),
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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {mqttConnected && (
        <Alert severity="success" sx={{ mb: 2 }}>
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
                onSelectComponent={setSelectedId}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={Boolean(selectedComponent)}
        onClose={() => setSelectedId(null)}
        PaperProps={{ sx: { width: { xs: 320, sm: 380 }, p: 2 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <MuiIconButton
            size="small"
            onClick={() => setSelectedId(null)}
            aria-label={t("common.closeDetails")}
          >
            <CloseIcon fontSize="small" />
          </MuiIconButton>
        </Box>
        {selectedComponent && <ComponentDetails component={selectedComponent} />}
      </Drawer>
    </Box>
  );
}
