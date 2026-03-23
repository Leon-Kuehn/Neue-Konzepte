import { memo } from "react";
import { Chip } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useHealth } from "../hooks/useSensorData";

function BackendStatusInner() {
  const healthQuery = useHealth({
    refetchInterval: 45_000,
    refetchIntervalInBackground: true,
    retry: false,
  });

  const isOk = !healthQuery.error && healthQuery.data?.status === "ok";

  return (
    <Chip
      size="small"
      variant="outlined"
      icon={isOk ? <CheckCircleIcon /> : <ErrorOutlineIcon />}
      color={isOk ? "success" : "warning"}
      label={isOk ? "Backend: OK" : "Backend: Unreachable"}
      sx={{
        borderColor: "rgba(255, 255, 255, 0.6)",
        color: "inherit",
        "& .MuiChip-icon": {
          color: "inherit",
        },
      }}
    />
  );
}

const BackendStatus = memo(BackendStatusInner);

export default BackendStatus;