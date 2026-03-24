import { Box } from "@mui/material";
import { ConveyorBeltIcon } from "../entryRoute/icons/ConveyorBeltIcon";
import { RotatingConveyorIcon } from "../entryRoute/icons/RotatingConveyorIcon";
import { DeviceSquareIcon } from "../entryRoute/icons/DeviceSquareIcon";
import { InductiveSensorIcon } from "../entryRoute/icons/InductiveSensorIcon";
import { RfidSensorIcon } from "../entryRoute/icons/RfidSensorIcon";
import { LightSensorIcon } from "../entryRoute/icons/LightSensorIcon";
import { BallLoaderIcon } from "../entryRoute/icons/BallLoaderIcon";
import { HighBayStorageIcon } from "../entryRoute/icons/HighBayStorageIcon";
import { InputStationIcon } from "../entryRoute/icons/InputStationIcon";
import { PusherIcon } from "../entryRoute/icons/PusherIcon";
import { DepositPlaceIcon } from "../entryRoute/icons/DepositPlaceIcon";
import type { Category } from "../types/PlantComponent";

interface ComponentCategoryIconProps {
  category: Category;
  active: boolean;
}

export default function ComponentCategoryIcon({ category, active }: ComponentCategoryIconProps) {
  switch (category) {
    case "conveyor":
      return <ConveyorBeltIcon width={46} height={16} direction="left" />;
    case "rotating-conveyor":
      return <RotatingConveyorIcon width={46} height={20} direction="left" />;
    case "press":
      return <DeviceSquareIcon width={22} height={22} color={active ? "#10B981" : "#6B7280"} />;
    case "pusher":
      return <PusherIcon width={42} height={20} active={active} />;
    case "inductive-sensor":
      return <InductiveSensorIcon width={42} height={20} active={active} />;
    case "rfid-sensor":
      return <RfidSensorIcon width={42} height={20} active={active} />;
    case "optical-sensor":
      return <LightSensorIcon width={22} height={22} color={active ? "#10B981" : "#6B7280"} />;
    case "pneumatic-unit":
      return <DeviceSquareIcon width={22} height={22} color={active ? "#10B981" : "#6B7280"} />;
    case "crane":
      return <BallLoaderIcon width={18} height={34} active={active} />;
    case "storage":
      return <HighBayStorageIcon width={14} height={34} active={active} />;
    case "deposit-place":
      return <DepositPlaceIcon width={42} height={20} active={active} />;
    case "input":
      return <InputStationIcon width={26} height={26} active={active} />;
    default:
      return <Box sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: active ? "success.main" : "text.disabled" }} />;
  }
}
