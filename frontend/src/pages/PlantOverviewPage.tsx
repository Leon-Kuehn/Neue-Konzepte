import { useState, useEffect, useRef, useCallback } from "react";
import { Typography, Card, CardContent, Box, Grid, Alert } from "@mui/material";
import ComponentTileGrid from "../components/ComponentTileGrid";
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

const SVG_HIGHLIGHT_CLASS = "svg-component-highlight";
const SVG_SELECTED_CLASS = "svg-component-selected";

export default function PlantOverviewPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [components, setComponents] = useState<PlantComponent[]>(mockComponents);
  const [mqttConnected, setMqttConnected] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const svgDocRef = useRef<Document | null>(null);

  const selectedComponent = components.find((c) => c.id === selectedId);

  // Highlight selected SVG element
  const highlightSvgElement = useCallback(
    (id: string | null) => {
      if (!svgDocRef.current) return;
      // Remove previous highlights
      const prev = svgDocRef.current.querySelectorAll(`.${SVG_SELECTED_CLASS}`);
      prev.forEach((el) => el.classList.remove(SVG_SELECTED_CLASS));

      if (id) {
        const el = svgDocRef.current.querySelector(`[data-component-id="${id}"]`);
        if (el) {
          el.classList.add(SVG_SELECTED_CLASS);
        }
      }
    },
    []
  );

  // Load SVG inline
  useEffect(() => {
    async function loadSvg() {
      try {
        const resp = await fetch(new URL("../svg/TopDown.drawio.svg", import.meta.url).href);
        const svgText = await resp.text();
        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = svgText;
          const svgEl = svgContainerRef.current.querySelector("svg");
          if (svgEl) {
            svgEl.style.width = "100%";
            svgEl.style.height = "auto";
            svgEl.style.maxWidth = "100%";
            svgDocRef.current = svgEl.ownerDocument;

            // Add hover class to interactive elements
            const interactiveEls = svgEl.querySelectorAll("[data-component-id]");
            interactiveEls.forEach((el) => {
              el.classList.add(SVG_HIGHLIGHT_CLASS);
            });
          }
        }
      } catch (err) {
        console.error("Failed to load SVG:", err);
      }
    }
    loadSvg();
  }, []);

  // Handle SVG click
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    const handler = (e: Event) => {
      const target = e.target as Element;
      const componentEl = target.closest("[data-component-id]");
      if (componentEl) {
        const id = componentEl.getAttribute("data-component-id");
        setSelectedId(id);
      }
    };

    container.addEventListener("click", handler);
    return () => container.removeEventListener("click", handler);
  }, []);

  // Highlight on selection change
  useEffect(() => {
    highlightSvgElement(selectedId);
  }, [selectedId, highlightSvgElement]);

  // MQTT auto-connect with saved settings
  useEffect(() => {
    const settings = loadSettings();
    if (!settings) return;

    let cancelled = false;

    (async () => {
      try {
        await connect(settings);
        if (cancelled) return;
        setMqttConnected(true);

        await subscribe("plant/#");
        onMessage((topic, payload) => {
          // Mock: update component based on topic
          const parts = topic.split("/");
          const compId = parts[1];
          if (!compId) return;
          try {
            const data = JSON.parse(payload);
            setComponents((prev) =>
              prev.map((c) =>
                c.id === compId
                  ? {
                      ...c,
                      status: data.status ?? c.status,
                      online: data.online ?? c.online,
                      lastChanged: new Date().toISOString(),
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
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Plant Overview
      </Typography>

      {mqttConnected && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Connected to MQTT broker — receiving live updates.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* SVG Card */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Top-Down View
              </Typography>
              <Box
                ref={svgContainerRef}
                sx={{
                  width: "100%",
                  overflow: "auto",
                  "& .svg-component-highlight:hover": {
                    filter: "brightness(0.85)",
                    transition: "filter 0.2s",
                  },
                  "& .svg-component-selected": {
                    filter: "brightness(0.7) sepia(1) hue-rotate(-10deg) saturate(5)",
                    transition: "filter 0.2s",
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Details Panel */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <ComponentDetails component={selectedComponent} />
        </Grid>
      </Grid>

      {/* Component Tiles */}
      <Typography variant="h5" fontWeight={600} sx={{ mt: 4, mb: 2 }}>
        Components
      </Typography>
      <ComponentTileGrid
        components={components}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
    </Box>
  );
}
