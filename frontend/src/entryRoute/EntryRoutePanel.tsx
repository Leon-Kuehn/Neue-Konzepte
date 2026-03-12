import { useMemo } from "react";
import EntryRouteMap from "./EntryRouteMap";
import { MAP_HOTSPOTS } from "./mapHotspots";
import type { HotspotAction, HotspotState } from "./mapHotspots";
import { resolveComponentId } from "./componentBindings";
import type { PlantComponent } from "../types/PlantComponent";

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
