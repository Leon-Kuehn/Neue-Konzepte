import { useMemo } from "react";
import EntryRouteMap from "./EntryRouteMap";
import { MAP_HOTSPOTS } from "./mapHotspots";
import type { HotspotAction, HotspotState } from "./mapHotspots";
import type { PlantComponent } from "../types/PlantComponent";

/**
 * Maps SVG hotspot IDs to PlantComponent IDs where they differ.
 * Hotspots whose IDs already match a component ID (e.g. "conveyor-1") need
 * no explicit entry here.
 */
const HOTSPOT_TO_COMPONENT: Record<string, string> = {
  "input-station-1": "input-1",
  "rotating-conveyor-1": "rotating-1",
  "inductive-1": "ind-sensor-1",
  "inductive-2": "ind-sensor-2",
  "inductive-3": "ind-sensor-3",
  "inductive-4": "ind-sensor-4",
  "inductive-5": "ind-sensor-5",
  "lightbarrier-1": "optical-1",
};

function resolveComponentId(hotspotId: string): string {
  return HOTSPOT_TO_COMPONENT[hotspotId] ?? hotspotId;
}

interface EntryRoutePanelProps {
  components: PlantComponent[];
  onSelectComponent: (id: string | null) => void;
  className?: string;
}

export default function EntryRoutePanel({
  components,
  onSelectComponent,
  className,
}: EntryRoutePanelProps) {
  const componentById = useMemo(() => {
    const map = new Map<string, PlantComponent>();
    for (const comp of components) {
      map.set(comp.id, comp);
    }
    return map;
  }, [components]);

  const values = useMemo(() => {
    const result: Record<string, HotspotState> = {};
    for (const hotspot of MAP_HOTSPOTS) {
      const compId = resolveComponentId(hotspot.id);
      const comp = componentById.get(compId);
      if (comp) {
        result[hotspot.id] = comp.status === "on" ? "on" : "off";
      } else {
        result[hotspot.id] = hotspot.initialState;
      }
    }
    return result;
  }, [componentById]);

  const handleToggle = (_id: string, action: HotspotAction) => {
    if (action.type === "openDetails") {
      onSelectComponent(action.target);
    }
  };

  return (
    <EntryRouteMap
      values={values}
      onToggle={handleToggle}
      className={className}
    />
  );
}
