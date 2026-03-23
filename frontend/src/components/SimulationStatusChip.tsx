import { memo } from "react";
import ScienceIcon from "@mui/icons-material/Science";
import { Chip } from "@mui/material";
import { useSimulationState } from "../hooks/useSimulationState";

function SimulationStatusChipInner() {
  const simulation = useSimulationState();

  if (!simulation.enabled) {
    return null;
  }

  return (
    <Chip
      size="small"
      icon={<ScienceIcon />}
      label="Simulation mode active"
      color="warning"
      sx={{
        mr: 1,
        backgroundColor: "rgba(255,255,255,0.18)",
        color: "inherit",
        "& .MuiChip-icon": {
          color: "inherit",
        },
      }}
    />
  );
}

const SimulationStatusChip = memo(SimulationStatusChipInner);

export default SimulationStatusChip;