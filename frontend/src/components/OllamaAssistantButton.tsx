import SmartToyIcon from "@mui/icons-material/SmartToy";
import { Fab, Tooltip } from "@mui/material";
import { useAppPreferences } from "../context/AppPreferencesContext";

interface OllamaAssistantButtonProps {
  open: boolean;
  onToggle: () => void;
}

export default function OllamaAssistantButton({
  open,
  onToggle,
}: OllamaAssistantButtonProps) {
  const { t } = useAppPreferences();

  return (
    <Tooltip title={open ? t("ollama.close") : t("ollama.open")} placement="left">
      <Fab
        color="primary"
        aria-label={open ? t("ollama.close") : t("ollama.open")}
        onClick={onToggle}
        sx={{
          position: "fixed",
          right: { xs: 16, md: 24 },
          bottom: { xs: 16, md: 24 },
          zIndex: (theme) => theme.zIndex.modal + 2,
        }}
      >
        <SmartToyIcon />
      </Fab>
    </Tooltip>
  );
}
