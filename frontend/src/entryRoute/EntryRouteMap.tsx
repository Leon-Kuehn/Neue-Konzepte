import { useEffect, useMemo, useState } from "react";
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
import { useAppPreferences } from "../context/AppPreferencesContext";

export type EntryRouteMapProps = {
  values: Record<string, HotspotState>;
  onToggle?: (id: string, action: HotspotAction) => void;
  className?: string;
};

const DEFAULT_ICON_SIZE = 80;
const VIEWPORT_PADDING = 140;

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
  const { t } = useAppPreferences();
  const [localStates, setLocalStates] = useState<Record<string, HotspotState>>({});
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const sortedHotspots = [...MAP_HOTSPOTS].sort(
    (left, right) => (left.layer ?? 2) - (right.layer ?? 2)
  );

  useEffect(() => {
    const updateViewportMode = () => {
      const isMobile = window.innerWidth <= 900;
      const isPortrait = window.innerHeight > window.innerWidth;
      setIsPortraitMobile(isMobile && isPortrait);
    };

    updateViewportMode();
    window.addEventListener("resize", updateViewportMode);
    return () => window.removeEventListener("resize", updateViewportMode);
  }, []);

  const viewBounds = useMemo(() => {
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const hotspot of sortedHotspots) {
      const iconSize = hotspot.iconSize ?? DEFAULT_ICON_SIZE;
      const halfSize = iconSize / 2;
      minX = Math.min(minX, hotspot.x - halfSize);
      minY = Math.min(minY, hotspot.y - halfSize);
      maxX = Math.max(maxX, hotspot.x + halfSize);
      maxY = Math.max(maxY, hotspot.y + halfSize);
    }

    if (
      !Number.isFinite(minX) ||
      !Number.isFinite(minY) ||
      !Number.isFinite(maxX) ||
      !Number.isFinite(maxY)
    ) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }

    const x = Math.max(0, minX - VIEWPORT_PADDING);
    const y = Math.max(0, minY - VIEWPORT_PADDING);
    const width = Math.max(1, maxX - minX + VIEWPORT_PADDING * 2);
    const height = Math.max(1, maxY - minY + VIEWPORT_PADDING * 2);

    return { x, y, width, height };
  }, [sortedHotspots]);

  const aspect = viewBounds.height / viewBounds.width;

  const containerClassName = ["responsive-map-container", className]
    .filter(Boolean)
    .join(" ");

  const mobileWidth = `max(100%, calc(72vh / ${aspect}))`;

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
        width: "100%",
        margin: "0 auto",
        position: "relative",
        overflowX: isPortraitMobile ? "auto" : "visible",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          width: isPortraitMobile ? mobileWidth : "min(100%, 1300px)",
          maxWidth: isPortraitMobile ? "none" : "1300px",
          height: isPortraitMobile ? "72vh" : "auto",
          minHeight: isPortraitMobile ? 420 : undefined,
          paddingBottom: isPortraitMobile ? 0 : `${aspect * 100}%`,
          position: "relative",
        }}
      >
        <svg
          viewBox={`${viewBounds.x} ${viewBounds.y} ${viewBounds.width} ${viewBounds.height}`}
          aria-label={t("map.responsive")}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <defs>
            <clipPath id="map-work-area-clip">
              <rect
                x={viewBounds.x}
                y={viewBounds.y}
                width={viewBounds.width}
                height={viewBounds.height}
              />
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
