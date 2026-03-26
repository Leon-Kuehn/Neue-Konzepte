import { Card, CardContent, Typography, Chip, Box, Grid } from "@mui/material";
import type { PlantComponent } from "../types/PlantComponent";
import { useAppPreferences } from "../context/AppPreferencesContext";

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
  const { t, accessibility } = useAppPreferences();

  return (
    <Grid container spacing={2}>
      {components.map((comp) => {
        const shouldPulseError = accessibility.errorPulse && comp.healthStatus === "error";

        return (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={comp.id}>
          <Card
            onClick={() => onSelect(comp.id)}
            sx={(theme) => ({
              cursor: "pointer",
              border: "2px solid",
              borderColor: selectedId === comp.id ? "primary.main" : "transparent",
              transition: "border-color 0.2s, box-shadow 0.2s",
              "&:hover": {
                boxShadow: 4,
                borderColor: "primary.main",
              },
              ...(shouldPulseError
                ? {
                    animation: "componentErrorPulse 1.2s ease-in-out infinite",
                    "@keyframes componentErrorPulse": {
                      "0%, 100%": {
                        borderColor:
                          selectedId === comp.id ? theme.palette.primary.main : "transparent",
                        backgroundColor: theme.palette.background.paper,
                      },
                      "50%": {
                        borderColor: theme.palette.error.main,
                        backgroundColor: theme.palette.error.light,
                      },
                    },
                  }
                : {}),
            })}
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
                  label={comp.online ? t("componentDetails.online") : t("componentDetails.offline")}
                  size="small"
                  color={comp.online ? "success" : "error"}
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        );
      })}
    </Grid>
  );
}
