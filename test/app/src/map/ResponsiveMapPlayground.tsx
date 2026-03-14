import { useState } from "react";

import ResponsiveMap1047x925 from "./ResponsiveMap1047x925";
import { MAP_HOTSPOTS } from "./mapHotspots";
import type { HotspotAction, HotspotState } from "./mapHotspots";

export function ResponsiveMapPlayground() {
  const [values, setValues] = useState<Record<string, HotspotState>>(() =>
    MAP_HOTSPOTS.reduce<Record<string, HotspotState>>((accumulator, hotspot) => {
      accumulator[hotspot.id] = hotspot.initialState;
      return accumulator;
    }, {})
  );
  const [detailsMessage, setDetailsMessage] = useState<string>("");

  const handleToggle = (id: string, action: HotspotAction) => {
    if (action.type === "toggleState") {
      setValues((previous) => ({
        ...previous,
        [id]: previous[id] === "on" ? "off" : "on",
      }));
      return;
    }

    if (action.type === "openDetails") {
      const target = MAP_HOTSPOTS.find((hotspot) => hotspot.id === action.target);
      const title = target?.name ?? action.target;
      const description = target?.description ?? "Keine Beschreibung hinterlegt.";
      setDetailsMessage(`Details zu ${title}: ${description}`);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>ResponsiveMap Playground</h1>
      <ResponsiveMap1047x925 values={values} onToggle={handleToggle} />
      {detailsMessage ? (
        <p style={{ marginTop: 16 }} aria-live="polite">
          {detailsMessage}
        </p>
      ) : null}
    </div>
  );
}
