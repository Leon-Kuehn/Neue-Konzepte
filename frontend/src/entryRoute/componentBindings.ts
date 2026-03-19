import { MAP_HOTSPOTS } from "./mapHotspots";

const HOTSPOT_TO_COMPONENT: Record<string, string> = {
  "input-station-1": "input-1",
  "rotating-conveyor-1": "rotating-1",
  "inductive-0": "ind-sensor-1",
  "inductive-1": "ind-sensor-1",
  "inductive-2": "ind-sensor-2",
  "inductive-3": "ind-sensor-3",
  "inductive-4": "ind-sensor-4",
  "inductive-5": "ind-sensor-5",
  "lightbarrier-1": "optical-1",
  "ball-loader-1": "pneumatic-1",
  "ball-loader-2": "pneumatic-2",
  "ball-loader-3": "pneumatic-3",
  "ball-loader-4": "pneumatic-4",
  "ball-loader-5": "pneumatic-5",
  "ball-loader-6": "pneumatic-5",
  "highbay-storage-1": "storage-1",
};

function normalizeToComponentId(value: string): string {
  const withoutDetails = value.endsWith("-details")
    ? value.slice(0, -"-details".length)
    : value;

  const direct = HOTSPOT_TO_COMPONENT[withoutDetails];
  if (direct) {
    return direct;
  }

  const inputMatch = withoutDetails.match(/^input-station-(\d+)$/);
  if (inputMatch) {
    return `input-${inputMatch[1]}`;
  }

  const rotatingMatch = withoutDetails.match(/^rotating-conveyor-(\d+)$/);
  if (rotatingMatch) {
    return `rotating-${rotatingMatch[1]}`;
  }

  const pneumaticMatch = withoutDetails.match(/^ball-loader-(\d+)$/);
  if (pneumaticMatch) {
    return `pneumatic-${pneumaticMatch[1]}`;
  }

  const inductiveMatch = withoutDetails.match(/^inductive-(\d+)$/);
  if (inductiveMatch) {
    return `ind-sensor-${inductiveMatch[1]}`;
  }

  const opticalMatch = withoutDetails.match(/^lightbarrier-(\d+)$/);
  if (opticalMatch) {
    return `optical-${opticalMatch[1]}`;
  }

  const storageMatch = withoutDetails.match(/^highbay-storage-(\d+)$/);
  if (storageMatch) {
    return `storage-${storageMatch[1]}`;
  }

  return withoutDetails;
}

export function resolveComponentId(hotspotId: string): string {
  return normalizeToComponentId(hotspotId);
}

export function getTopDownComponentIds(): Set<string> {
  const ids = new Set<string>();

  for (const hotspot of MAP_HOTSPOTS) {
    ids.add(resolveComponentId(hotspot.id));

    if (hotspot.action.type === "openDetails") {
      ids.add(resolveComponentId(hotspot.action.target));
    }
  }

  return ids;
}

export function getHotspotIdsForComponent(componentId: string): string[] {
  const matchingHotspots: string[] = [];

  for (const hotspot of MAP_HOTSPOTS) {
    if (resolveComponentId(hotspot.id) === componentId) {
      matchingHotspots.push(hotspot.id);
      continue;
    }

    if (
      hotspot.action.type === "openDetails" &&
      resolveComponentId(hotspot.action.target) === componentId
    ) {
      matchingHotspots.push(hotspot.id);
    }
  }

  return [...new Set(matchingHotspots)];
}
