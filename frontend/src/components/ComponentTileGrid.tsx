import { Card, CardContent, Typography, Chip, Box, Grid } from "@mui/material";
import type { PlantComponent } from "../types/PlantComponent";

interface Props {
  components: PlantComponent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function typeColor(type: string): "primary" | "secondary" | "success" | "warning" | "info" {
  switch (type) {
    case "sensor":
      return "info";
    case "actuator":
      return "warning";
    case "station":
      return "success";
    case "segment":
      return "primary";
    default:
      return "secondary";
  }
}

function categoryLabel(category: string): string {
  return category.replace(/-/g, " ");
}

export default function ComponentTileGrid({ components, selectedId, onSelect }: Props) {
  return (
    <Grid container spacing={2}>
      {components.map((comp) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={comp.id}>
          <Card
            onClick={() => onSelect(comp.id)}
            sx={{
              cursor: "pointer",
              border: selectedId === comp.id ? "2px solid #E30613" : "2px solid transparent",
              transition: "border-color 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: 4,
                borderColor: "#E30613",
              },
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>
                {comp.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                {comp.id}
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                <Chip label={categoryLabel(comp.category)} size="small" color={typeColor(comp.role)} variant="outlined" />
                <Chip
                  label={comp.status.toUpperCase()}
                  size="small"
                  color={comp.status === "on" ? "success" : "default"}
                />
                <Chip
                  label={comp.online ? "Online" : "Offline"}
                  size="small"
                  color={comp.online ? "success" : "error"}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
