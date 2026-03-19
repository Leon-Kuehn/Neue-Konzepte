import { useMemo, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import EntryRouteMap from "./EntryRouteMap";
import type { EntryRouteMapHandle } from "./EntryRouteMap";
import { MAP_HOTSPOTS } from "./mapHotspots";
import type { HotspotAction, HotspotState } from "./mapHotspots";
import { getHotspotIdsForComponent, resolveComponentId } from "./componentBindings";
import type { PlantComponent } from "../types/PlantComponent";

interface EntryRoutePanelProps {
  components: PlantComponent[];
  onSelectComponent: (id: string | null) => void;
  highlightedComponentId?: string | null;
  className?: string;
}

const EntryRoutePanel = forwardRef<EntryRouteMapHandle, EntryRoutePanelProps>(
  (
    { components, onSelectComponent, highlightedComponentId, className }: EntryRoutePanelProps,
    ref
  ) => {
    const navigate = useNavigate();
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

    const highlightedHotspotIds = useMemo(
      () => (highlightedComponentId ? getHotspotIdsForComponent(highlightedComponentId) : []),
      [highlightedComponentId],
    );

    const handleToggle = (_id: string, action: HotspotAction) => {
      if (action.type === "openDetails") {
        const resolvedId = resolveComponentId(action.target);
        onSelectComponent(componentById.has(resolvedId) ? resolvedId : action.target);
        return;
      }

      if (action.type === "navigate") {
        navigate(action.path);
      }
    };

    return (
      <EntryRouteMap
        ref={ref}
        values={values}
        highlightedHotspotIds={highlightedHotspotIds}
        onToggle={handleToggle}
        className={className}
      />
    );
  }
);

EntryRoutePanel.displayName = "EntryRoutePanel";

export default EntryRoutePanel;
