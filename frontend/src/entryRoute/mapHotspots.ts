import hotspotsConfig from "./hotspots.config.json";

export type HotspotState = "on" | "off" | "error";

export type HotspotIconId =
  | "sensor-generic"
  | "light-sensor"
  | "device-square"
  | "conveyor-belt"
  | "rotating-conveyor"
  | "rfid-sensor"
  | "inductive-sensor"
  | "lightbarrier-sensor"
  | "input-station"
  | "ball-loader"
  | "highbay-storage";

export type HotspotDirection = "left" | "right";

export type HotspotAction =
  | { type: "toggleState" }
  | { type: "openDetails"; target: string }
  | { type: "navigate"; path: string };

export type HotspotStateSource = {
  type: "values" | "local";
  key?: string;
};

export interface HotspotConfig {
  id: string;
  name: string;
  description?: string;
  iconId: HotspotIconId;
  layer?: number;
  direction?: HotspotDirection;
  iconSize?: number;
  rotation?: number;
  stateSource?: HotspotStateSource;
  x: number;
  y: number;
  initialState: HotspotState;
  action: HotspotAction;
  ariaLabel?: string;
}

export interface HotspotsConfigFile {
  hotspots: HotspotConfig[];
}

const rawConfig = hotspotsConfig as HotspotsConfigFile;
const DEFAULT_ICON_SIZE = 80;
const DEFAULT_LAYER = 2;

function assertHotspotConfig(config: HotspotsConfigFile): void {
  const ids = new Set<string>();

  for (const hotspot of config.hotspots) {
    const hasId = hotspot.id.trim().length > 0;
    const isFiniteX = Number.isFinite(hotspot.x);
    const isFiniteY = Number.isFinite(hotspot.y);
    const hasValidSize =
      hotspot.iconSize === undefined ||
      (Number.isFinite(hotspot.iconSize) && hotspot.iconSize > 0);
    const hasValidRotation =
      hotspot.rotation === undefined || Number.isFinite(hotspot.rotation);
    const hasValidLayer =
      hotspot.layer === undefined ||
      (Number.isInteger(hotspot.layer) && hotspot.layer >= 0);

    if (
      !hasId ||
      !isFiniteX ||
      !isFiniteY ||
      !hasValidSize ||
      !hasValidRotation ||
      !hasValidLayer
    ) {
      throw new Error(
        `Hotspot ${hotspot.id || "<missing-id>"} is invalid. id must be set, coordinates must be finite numbers, iconSize must be > 0, rotation must be finite, and layer must be an integer >= 0.`
      );
    }

    if (ids.has(hotspot.id)) {
      throw new Error(`Hotspot ${hotspot.id} is invalid. ids must be unique.`);
    }

    ids.add(hotspot.id);
  }
}

assertHotspotConfig(rawConfig);

export const MAP_HOTSPOTS: HotspotConfig[] = rawConfig.hotspots.map((hotspot) => ({
  ...hotspot,
  direction: hotspot.direction ?? "left",
  layer: hotspot.layer ?? DEFAULT_LAYER,
  iconSize: hotspot.iconSize ?? DEFAULT_ICON_SIZE,
  rotation: hotspot.rotation ?? 0,
  stateSource: hotspot.stateSource ?? { type: "local" },
}));
