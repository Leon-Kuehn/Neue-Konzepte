import { MAP_HOTSPOTS } from "./mapHotspots";

/**
 * Component ID Mapping:
 * 
 * hotspots.config.json uses IDs like:
 * - conveyor-1, conveyor-2, ..., conveyor-14
 * - rotating-conveyor-1, rotating-conveyor-2, rotating-conveyor-3
 * - inductive-1, inductive-2, ..., inductive-18 (1-based, not 0-based)
 * - rfid-1, rfid-2, ..., rfid-5
 * - ball-loader-1, ball-loader-2, ..., ball-loader-4
 * - pusher-1, pusher-2
 * - deposit-place-1, deposit-place-2
 * - lightbarrier-1
 * - input-station-1
 * - highbay-storage-1
 * 
 * mockData.ts uses the SAME IDs, so direct mapping works.
 */

function normalizeToComponentId(value: string): string {
  // Remove "-details" suffix if present
  const withoutDetails = value.endsWith("-details")
    ? value.slice(0, -"-details".length)
    : value;

  // Direct pass-through: hotspot IDs match component IDs exactly
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
