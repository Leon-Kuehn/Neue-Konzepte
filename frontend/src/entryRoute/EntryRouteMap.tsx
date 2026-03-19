import { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";
import type { ComponentType, KeyboardEvent, SVGProps } from "react";

import "./EntryRouteMap.css";
import { ConveyorBeltIcon } from "./icons/ConveyorBeltIcon";
import { DeviceSquareIcon } from "./icons/DeviceSquareIcon";
import { InductiveSensorIcon } from "./icons/InductiveSensorIcon";
import { BallLoaderIcon } from "./icons/BallLoaderIcon";
import { InputStationIcon } from "./icons/InputStationIcon";
import { LightSensorIcon } from "./icons/LightSensorIcon";
import { LightBarrierIcon } from "./icons/LightBarrierIcon";
import { HighBayStorageIcon } from "./icons/HighBayStorageIcon";
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
  highlightedHotspotIds?: string[];
  onToggle?: (id: string, action: HotspotAction) => void;
  className?: string;
};

export type EntryRouteMapHandle = {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
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
  "highbay-storage": HighBayStorageIcon,
};

export default forwardRef<EntryRouteMapHandle, EntryRouteMapProps>(
  function EntryRouteMap({ values, highlightedHotspotIds = [], onToggle, className }: EntryRouteMapProps, ref) {
    const { t } = useAppPreferences();
    const [localStates, setLocalStates] = useState<Record<string, HotspotState>>({});
    const [isPortraitMobile, setIsPortraitMobile] = useState(false);
    const [scale, setScale] = useState(1);
    const [panX, setPanX] = useState(0);
    const [panY, setPanY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    
    const sortedHotspots = [...MAP_HOTSPOTS].sort(
      (left, right) => (left.layer ?? 2) - (right.layer ?? 2)
    );

    useImperativeHandle(ref, () => ({
      zoomIn: () => setScale((prev) => Math.min(prev + 0.2, 3)),
      zoomOut: () => setScale((prev) => Math.max(prev - 0.2, 0.5)),
      resetView: () => {
        setScale(1);
        setPanX(0);
        setPanY(0);
      },
    }), []);

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
      const iconWidth = hotspot.iconWidth ?? hotspot.iconSize ?? DEFAULT_ICON_SIZE;
      const iconHeight = hotspot.iconHeight ?? hotspot.iconSize ?? DEFAULT_ICON_SIZE;
      const halfWidth = iconWidth / 2;
      const halfHeight = iconHeight / 2;
      minX = Math.min(minX, hotspot.x - halfWidth);
      minY = Math.min(minY, hotspot.y - halfHeight);
      maxX = Math.max(maxX, hotspot.x + halfWidth);
      maxY = Math.max(maxY, hotspot.y + halfHeight);
    }

    if (
      !Number.isFinite(minX) ||
      !Number.isFinite(minY) ||
      !Number.isFinite(maxX) ||
      !Number.isFinite(maxY)
    ) {
      return { x: 0, y: 0, width: 1, height: 1 };
    }

    const x = minX - VIEWPORT_PADDING;
    const y = minY - VIEWPORT_PADDING;
    const width = Math.max(1, maxX - minX + VIEWPORT_PADDING * 2);
    const height = Math.max(1, maxY - minY + VIEWPORT_PADDING * 2);

    return { x, y, width, height };
  }, [sortedHotspots]);

  const aspect = viewBounds.height / viewBounds.width;

  const containerClassName = ["responsive-map-container", className]
    .filter(Boolean)
    .join(" ");

  const mobileWidth = `max(100%, calc(72vh / ${aspect}))`;
  const desktopHeight = "68vh";
  const desktopWidth = `min(100%, min(1300px, calc(${desktopHeight} / ${aspect})))`;
  const hasActiveHighlight = highlightedHotspotIds.length > 0;

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

  const handleMouseDown = (e: React.MouseEvent<SVGElement>) => {
    if (e.button !== 0) return; // Only left button
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setPanX((prev) => prev + dragOffset.x);
      setPanY((prev) => prev + dragOffset.y);
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleWheel = (e: React.WheelEvent<SVGElement>) => {
    if (!e.ctrlKey && !e.metaKey) return;
    
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.2 : 0.2;
    setScale((prev) => Math.max(0.5, Math.min(prev + zoomDelta, 3)));
  };

  return (
    <div
      className={containerClassName}
      style={{
        width: "100%",
        margin: "0 auto",
        position: "relative",
        overflowX: isPortraitMobile ? "auto" : "hidden",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          width: isPortraitMobile ? mobileWidth : desktopWidth,
          maxWidth: isPortraitMobile ? "none" : "1300px",
          height: isPortraitMobile ? "72vh" : desktopHeight,
          minHeight: isPortraitMobile ? 420 : undefined,
          paddingBottom: 0,
          position: "relative",
          cursor: isDragging ? "grabbing" : "grab",
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
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
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

          <g
            clipPath="url(#map-work-area-clip)"
            style={{
              transform: `translate(${panX + dragOffset.x}px, ${panY + dragOffset.y}px) scale(${scale})`,
              transformOrigin: `${viewBounds.x + viewBounds.width / 2}px ${viewBounds.y + viewBounds.height / 2}px`,
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
          >
            {sortedHotspots.map((hotspot) => {
              const stateSource = hotspot.stateSource ?? { type: "local" };
              const currentState = getStateFromSource(hotspot, stateSource);
              const active = currentState === "on";
              const Icon = iconRegistry[hotspot.iconId] ?? SensorGenericIcon;
              const direction = hotspot.direction ?? "left";
              const iconWidth = hotspot.iconWidth ?? hotspot.iconSize ?? DEFAULT_ICON_SIZE;
              const iconHeight = hotspot.iconHeight ?? hotspot.iconSize ?? DEFAULT_ICON_SIZE;
              const rotation = hotspot.rotation ?? 0;
              const isHighlighted = highlightedHotspotIds.includes(hotspot.id);
              const isDeemphasized = hasActiveHighlight && !isHighlighted;

              return (
                <g
                  key={hotspot.id}
                  transform={`translate(${hotspot.x}, ${hotspot.y}) rotate(${rotation})`}
                  className={`hotspot hotspot--${currentState}${isHighlighted ? " hotspot--selected" : ""}${isDeemphasized ? " hotspot--deemphasized" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-label={hotspot.ariaLabel ?? hotspot.name ?? hotspot.id}
                  aria-pressed={currentState === "on"}
                  onClick={() => handleActivate(hotspot)}
                  onKeyDown={(event) => handleKeyDown(event, hotspot)}
                >
                  <Icon
                    className="hotspot__icon"
                    x={-iconWidth / 2}
                    y={-iconHeight / 2}
                    width={iconWidth}
                    height={iconHeight}
                    preserveAspectRatio="xMidYMid meet"
                    direction={direction}
                    active={
                      hotspot.iconId === "rfid-sensor" ||
                      hotspot.iconId === "inductive-sensor" ||
                      hotspot.iconId === "lightbarrier-sensor" ||
                      hotspot.iconId === "input-station" ||
                      hotspot.iconId === "ball-loader" ||
                      hotspot.iconId === "highbay-storage"
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
);
