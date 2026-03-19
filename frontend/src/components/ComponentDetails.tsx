import { Card, CardContent, Typography, Divider, Box } from "@mui/material";
import type { PlantComponent } from "../types/PlantComponent";
import { useAppPreferences } from "../context/AppPreferencesContext";
import LiveStatusChips from "./LiveStatusChips";

interface Props {
  component: PlantComponent | undefined;
}

export default function ComponentDetails({ component }: Props) {
  const { t } = useAppPreferences();

  if (!component) {
    return (
      <Card sx={{ height: "100%", overflow: "auto" }}>
        <CardContent>
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            {t("componentDetails.empty")}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: "100%", overflow: "auto" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {component.name}
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        {/* Basic Info */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("componentDetails.basicInformation")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <Typography variant="body2">
            <strong>{t("componentDetails.id")}:</strong> {component.id}
          </Typography>
          <Typography variant="body2">
            <strong>{t("componentDetails.role")}:</strong> {component.role}
          </Typography>
          <Typography variant="body2">
            <strong>{t("componentDetails.category")}:</strong> {component.category}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Live Status */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("componentDetails.liveStatus")}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
          <LiveStatusChips status={component.status} online={component.online} />
        </Box>
        <Typography variant="body2" sx={{ mb: 0.5 }}>
          <strong>{t("componentDetails.lastChanged")}:</strong>{" "}
          {new Date(component.lastChanged).toLocaleString()}
        </Typography>
        {component.stats.cycles !== undefined && (
          <Typography variant="body2">
            <strong>{t("componentDetails.cycles")}:</strong> {component.stats.cycles}
          </Typography>
        )}
        {component.stats.uptimeHours !== undefined && (
          <Typography variant="body2">
            <strong>{t("componentDetails.uptime")}:</strong> {component.stats.uptimeHours}h
          </Typography>
        )}
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          <strong>{t("componentDetails.mqttStatusTopic")}:</strong> {component.mqttTopics.status}
        </Typography>
        {component.mqttTopics.command && (
          <Typography variant="body2">
            <strong>{t("componentDetails.mqttCommandTopic")}:</strong> {component.mqttTopics.command}
          </Typography>
        )}

        <Divider sx={{ my: 1.5 }} />

        {/* Placeholder sections */}
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("componentDetails.historicalData")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 2 }}>
          {t("componentDetails.todoApi")}
        </Typography>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {t("componentDetails.trendChart")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
          {t("componentDetails.todoTrend")}
        </Typography>
      </CardContent>
    </Card>
  );
}
