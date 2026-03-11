import { Chip, type ChipProps } from "@mui/material";

interface StatusChipProps extends Omit<ChipProps, "label" | "color"> {
  status: "on" | "off";
}

export function StatusChip({ status, ...rest }: StatusChipProps) {
  return (
    <Chip
      label={status.toUpperCase()}
      size="small"
      color={status === "on" ? "success" : "default"}
      {...rest}
    />
  );
}

interface OnlineChipProps extends Omit<ChipProps, "label" | "color"> {
  online: boolean;
}

export function OnlineChip({ online, ...rest }: OnlineChipProps) {
  return (
    <Chip
      label={online ? "Online" : "Offline"}
      size="small"
      color={online ? "success" : "error"}
      variant="outlined"
      {...rest}
    />
  );
}
