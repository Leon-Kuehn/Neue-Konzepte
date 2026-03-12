import { MAP_HOTSPOTS } from "./mapHotspots";

const HOTSPOT_TO_COMPONENT: Record<string, string> = {
  "input-station-1": "input-1",
  "rotating-conveyor-1": "rotating-1",
  "inductive-1": "ind-sensor-1",
  "inductive-2": "ind-sensor-2",
  "inductive-3": "ind-sensor-3",
  "inductive-4": "ind-sensor-4",
  "inductive-5": "ind-sensor-5",
  "lightbarrier-1": "optical-1",
  "ball-loader-1": "pneumatic-1",
  "ball-loader-2": "pneumatic-2",
  "ball-loader-3": "pneumatic-3",
};

export function resolveComponentId(hotspotId: string): string {
  return HOTSPOT_TO_COMPONENT[hotspotId] ?? hotspotId;
}

export function getTopDownComponentIds(): Set<string> {
  const ids = new Set<string>();

  for (const hotspot of MAP_HOTSPOTS) {
    ids.add(resolveComponentId(hotspot.id));

    if (hotspot.action.type === "openDetails") {
      ids.add(hotspot.action.target);
    }
  }

  return ids;
}
