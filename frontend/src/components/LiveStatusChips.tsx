import { Chip, Stack } from "@mui/material";
import { useAppPreferences } from "../context/AppPreferencesContext";

interface LiveStatusChipsProps {
  status: "on" | "off";
  online: boolean;
  healthStatus?: "ok" | "error" | "offline";
  size?: "small" | "medium";
}

export default function LiveStatusChips({
  status,
  online,
  healthStatus,
  size = "small",
}: LiveStatusChipsProps) {
  const { t } = useAppPreferences();

  return (
    <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
      <Chip
        label={`${t("componentDetails.status")}: ${status === "on" ? t("status.on") : t("status.off")}`}
        size={size}
        color={status === "on" ? "success" : "default"}
      />
      <Chip
        label={online ? t("componentDetails.online") : t("componentDetails.offline")}
        size={size}
        color={online ? "success" : "error"}
        variant="outlined"
      />
      {healthStatus === "error" && (
        <Chip
          label={t("status.error")}
          size={size}
          color="error"
        />
      )}
    </Stack>
  );
}
