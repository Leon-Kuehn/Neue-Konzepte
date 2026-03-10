import { Card, CardContent, Typography, Divider, Chip, Box } from "@mui/material";
import type { PlantComponent } from "../types/PlantComponent";

interface Props {
  component: PlantComponent | undefined;
}

export default function ComponentDetails({ component }: Props) {
  if (!component) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Select a component from the SVG or tile grid to view details.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {component.name}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {/* Basic Info */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Basic Information
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <Typography variant="body2">
            <strong>ID:</strong> {component.id}
          </Typography>
          <Typography variant="body2">
            <strong>Type:</strong> {component.type}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Live Status */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Live Status
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
          <Chip
            label={`Status: ${component.status.toUpperCase()}`}
            color={component.status === "on" ? "success" : "default"}
            size="small"
          />
          <Chip
            label={component.online ? "Online" : "Offline"}
            color={component.online ? "success" : "error"}
            size="small"
          />
        </Box>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>Last Changed:</strong>{" "}
          {new Date(component.lastChanged).toLocaleString()}
        </Typography>
        {component.stats.cycles !== undefined && (
          <Typography variant="body2">
            <strong>Cycles:</strong> {component.stats.cycles}
          </Typography>
        )}
        {component.stats.uptimeHours !== undefined && (
          <Typography variant="body2">
            <strong>Uptime:</strong> {component.stats.uptimeHours}h
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Placeholder sections */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Historical Data
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 2 }}>
          REST/API – TODO
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Trend Chart
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
          Trend chart – TODO
        </Typography>
      </CardContent>
    </Card>
  );
}
