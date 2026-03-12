import { useState } from "react";
import type { ComponentType, KeyboardEvent, SVGProps } from "react";

import "./EntryRouteMap.css";
import { ConveyorBeltIcon } from "./icons/ConveyorBeltIcon";
import { DeviceSquareIcon } from "./icons/DeviceSquareIcon";
import { InductiveSensorIcon } from "./icons/InductiveSensorIcon";
import { BallLoaderIcon } from "./icons/BallLoaderIcon";
import { InputStationIcon } from "./icons/InputStationIcon";
import { LightSensorIcon } from "./icons/LightSensorIcon";
import { LightBarrierIcon } from "./icons/LightBarrierIcon";
import { RfidSensorIcon } from "./icons/RfidSensorIcon";
import { RotatingConveyorIcon } from "./icons/RotatingConveyorIcon";
import { SensorGenericIcon } from "./icons/SensorGenericIcon";
import { MAP_HOTSPOTS } from "./mapHotspots";
import type {
  HotspotAction,
  HotspotConfig,
  HotspotDirection,
  HotspotIconId,
  HotspotStateSource,
  HotspotState,
} from "./mapHotspots";

export type EntryRouteMapProps = {
  values: Record<string, HotspotState>;
  onToggle?: (id: string, action: HotspotAction) => void;
  className?: string;
};

const BASE_AREA_WIDTH = 3840;
const BASE_AREA_HEIGHT = 2160;
const DEFAULT_ICON_SIZE = 80;

type IconComponentProps = SVGProps<SVGSVGElement> & {
  direction?: HotspotDirection;
  active?: boolean;
};

const iconRegistry: Record<HotspotIconId, ComponentType<IconComponentProps>> = {
  "sensor-generic": SensorGenericIcon,
  "light-sensor": LightSensorIcon,
  "device-square": DeviceSquareIcon,
  "conveyor-belt": ConveyorBeltIcon,
  "rotating-conveyor": RotatingConveyorIcon,
  "rfid-sensor": RfidSensorIcon,
  "inductive-sensor": InductiveSensorIcon,
  "lightbarrier-sensor": LightBarrierIcon,
  "input-station": InputStationIcon,
  "ball-loader": BallLoaderIcon,
};

export default function EntryRouteMap({
  values,
  onToggle,
  className,
}: EntryRouteMapProps) {
  const [localStates, setLocalStates] = useState<Record<string, HotspotState>>({});
  const sortedHotspots = [...MAP_HOTSPOTS].sort(
    (left, right) => (left.layer ?? 2) - (right.layer ?? 2)
  );
  const aspect = BASE_AREA_HEIGHT / BASE_AREA_WIDTH;

  const containerClassName = ["responsive-map-container", className]
    .filter(Boolean)
    .join(" ");

  const getStateFromSource = (hotspot: HotspotConfig, source: HotspotStateSource) => {
    if (source.type === "values") {
      const key = source.key ?? hotspot.id;
      return values[key] ?? hotspot.initialState;
    }

    return localStates[hotspot.id] ?? hotspot.initialState;
  };

  const toggleLocalState = (hotspot: HotspotConfig) => {
    const source = hotspot.stateSource ?? { type: "local" as const };

    if (source.type !== "local") {
      return;
    }

    setLocalStates((previous) => {
      const current = previous[hotspot.id] ?? hotspot.initialState;
      const next = current === "on" ? "off" : "on";
      return { ...previous, [hotspot.id]: next };
    });
  };

  const handleActivate = (hotspot: HotspotConfig) => {
    toggleLocalState(hotspot);
    onToggle?.(hotspot.id, hotspot.action);
  };

  const handleKeyDown = (
    event: KeyboardEvent<SVGGElement>,
    hotspot: HotspotConfig
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleActivate(hotspot);
    }
  };

  return (
    <div
      className={containerClassName}
      style={{
        width: "min(100%, calc(100dvh * 1.7777778))",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <div
        style={{
          width: "100%",
          paddingBottom: `${aspect * 100}%`,
          position: "relative",
        }}
      >
        <svg
          viewBox={`0 0 ${BASE_AREA_WIDTH} ${BASE_AREA_HEIGHT}`}
          aria-label="Responsive map"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <image
            href="/static/map.svg"
            x={0}
            y={0}
            width={BASE_AREA_WIDTH}
            height={BASE_AREA_HEIGHT}
            preserveAspectRatio="none"
          />

          <defs>
            <clipPath id="map-work-area-clip">
              <rect x={0} y={0} width={BASE_AREA_WIDTH} height={BASE_AREA_HEIGHT} />
            </clipPath>
          </defs>

          <g clipPath="url(#map-work-area-clip)">
            {sortedHotspots.map((hotspot) => {
              const stateSource = hotspot.stateSource ?? { type: "local" };
              const currentState = getStateFromSource(hotspot, stateSource);
              const active = currentState === "on";
              const Icon = iconRegistry[hotspot.iconId] ?? SensorGenericIcon;
              const direction = hotspot.direction ?? "left";
              const iconSize = hotspot.iconSize ?? DEFAULT_ICON_SIZE;
              const rotation = hotspot.rotation ?? 0;

              return (
                <g
                  key={hotspot.id}
                  transform={`translate(${hotspot.x}, ${hotspot.y}) rotate(${rotation})`}
                  className={`hotspot hotspot--${currentState}`}
                  role="button"
                  tabIndex={0}
                  aria-label={hotspot.ariaLabel ?? hotspot.name ?? hotspot.id}
                  aria-pressed={currentState === "on"}
                  onClick={() => handleActivate(hotspot)}
                  onKeyDown={(event) => handleKeyDown(event, hotspot)}
                >
                  <Icon
                    className="hotspot__icon"
                    x={-iconSize / 2}
                    y={-iconSize / 2}
                    width={iconSize}
                    height={iconSize}
                    preserveAspectRatio="xMidYMid meet"
                    direction={direction}
                    active={
                      hotspot.iconId === "rfid-sensor" ||
                      hotspot.iconId === "inductive-sensor" ||
                      hotspot.iconId === "lightbarrier-sensor" ||
                      hotspot.iconId === "input-station" ||
                      hotspot.iconId === "ball-loader"
                        ? active
                        : undefined
                    }
                    data-testid={`icon-for-${hotspot.id}`}
                    data-icon-id={hotspot.iconId}
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
