import { useEffect, useState } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
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

export default function PlantOverviewPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [components, setComponents] = useState<PlantComponent[]>(mockComponents);
  const [mqttConnected, setMqttConnected] = useState(false);

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
        height: { lg: "calc(100vh - 110px)" },
      }}
    >
      {mqttConnected && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Connected to MQTT broker — receiving live updates.
        </Alert>
      )}

      <Card sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
        <CardContent sx={{ pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
            Top Down View (Entry Route)
          </Typography>

          <Divider sx={{ mb: 1 }} />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 260px" },
              gap: 2,
              alignItems: "start",
              minHeight: 0,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <EntryRoutePanel
                components={components}
                onSelectComponent={setSelectedId}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: "rgba(227, 6, 19, 0.35)",
                  bgcolor: "#fff",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "#E30613",
                    boxShadow: "0 0 0 1px rgba(227, 6, 19, 0.25)",
                  },
                }}
                onClick={() => navigate("/hochregallager")}
              >
                <CardContent sx={{ p: 1.25, "&:last-child": { pb: 1.25 } }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                    Hochregallager
                  </Typography>

                  <Box sx={{ border: "1px solid #ddd", borderRadius: 1, overflow: "hidden" }}>
                    <svg viewBox="0 0 320 190" width="100%" role="img" aria-label="Hochregallager Top Down Kacheln">
                      <rect x={0} y={0} width={320} height={190} fill="#f2f2f2" />
                      <rect x={14} y={14} width={292} height={162} fill="#ffffff" stroke="#b9b9b9" strokeWidth={2} rx={6} />

                      {Array.from({ length: 12 }, (_, idx) => {
                        const col = idx % 4;
                        const row = Math.floor(idx / 4);
                        const x = 30 + col * 68;
                        const y = 28 + row * 48;
                        return (
                          <rect
                            key={`slot-${idx}`}
                            x={x}
                            y={y}
                            width={52}
                            height={30}
                            rx={4}
                            fill="#d8a164"
                            stroke="#8f5d34"
                            strokeWidth={1.5}
                          />
                        );
                      })}
                    </svg>
                  </Box>
                </CardContent>
              </Card>
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
            aria-label="Close details"
          >
            <CloseIcon fontSize="small" />
          </MuiIconButton>
        </Box>
        {selectedComponent && <ComponentDetails component={selectedComponent} />}
      </Drawer>
    </Box>
  );
}
