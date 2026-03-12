import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ResponsiveMap1047x925 from "../src/map/ResponsiveMap1047x925";
import { MAP_HOTSPOTS } from "../src/map/mapHotspots";
import type { HotspotAction, HotspotState } from "../src/map/mapHotspots";

function buildDefaultValues(): Record<string, HotspotState> {
  return MAP_HOTSPOTS.reduce<Record<string, HotspotState>>((accumulator, hotspot) => {
    accumulator[hotspot.id] = hotspot.initialState;
    return accumulator;
  }, {});
}

function getPrimaryHotspot() {
  expect(MAP_HOTSPOTS.length).toBeGreaterThan(0);
  return MAP_HOTSPOTS[0];
}

describe("ResponsiveMap1047x925", () => {
  it("rendert alle Hotspots", () => {
    render(<ResponsiveMap1047x925 values={buildDefaultValues()} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(MAP_HOTSPOTS.length);
  });

  it("ruft onToggle mit korrekter ID auf", () => {
    const primaryHotspot = getPrimaryHotspot();
    const onToggle = vi.fn<(id: string, action: HotspotAction) => void>();

    render(<ResponsiveMap1047x925 values={buildDefaultValues()} onToggle={onToggle} />);

    const button = screen.getByRole("button", {
      name: primaryHotspot.ariaLabel ?? primaryHotspot.name ?? primaryHotspot.id,
    });
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledWith(
      primaryHotspot.id,
      expect.objectContaining({ type: primaryHotspot.action.type })
    );
  });

  it("setzt korrekte CSS-Klasse fuer Status", () => {
    const primaryHotspot = getPrimaryHotspot();
    render(
      <ResponsiveMap1047x925
        values={{
          ...buildDefaultValues(),
          [primaryHotspot.id]: "on",
        }}
      />
    );

    const button = screen.getByRole("button", {
      name: primaryHotspot.ariaLabel ?? primaryHotspot.name ?? primaryHotspot.id,
    });
    expect(button.getAttribute("class") ?? "").toContain("hotspot--on");

    const iconElement = button.querySelector(".hotspot__icon");
    expect(iconElement).not.toBeNull();
  });

  it("unterstuetzt Tastatursteuerung mit Enter und Space", () => {
    const primaryHotspot = getPrimaryHotspot();
    const onToggle = vi.fn<(id: string, action: HotspotAction) => void>();

    render(<ResponsiveMap1047x925 values={buildDefaultValues()} onToggle={onToggle} />);

    const button = screen.getByRole("button", {
      name: primaryHotspot.ariaLabel ?? primaryHotspot.name ?? primaryHotspot.id,
    });

    fireEvent.keyDown(button, { key: "Enter" });
    fireEvent.keyDown(button, { key: " " });

    expect(onToggle).toHaveBeenCalledWith(
      primaryHotspot.id,
      expect.objectContaining({ type: primaryHotspot.action.type })
    );
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("uebernimmt aria-labels aus der JSON-Konfiguration", () => {
    render(<ResponsiveMap1047x925 values={buildDefaultValues()} />);

    for (const hotspot of MAP_HOTSPOTS) {
      const accessibleName = hotspot.ariaLabel ?? hotspot.name ?? hotspot.id;
      expect(screen.getByRole("button", { name: accessibleName })).toBeInTheDocument();
    }
  });

  it("rendert iconIds aus der JSON-Konfiguration", () => {
    render(<ResponsiveMap1047x925 values={buildDefaultValues()} />);

    for (const hotspot of MAP_HOTSPOTS) {
      const icon = screen.getByTestId(`icon-for-${hotspot.id}`);
      expect(icon.getAttribute("data-icon-id")).toBe(hotspot.iconId);
    }
  });

  it("rendert die Input Station aus der JSON-Konfiguration", () => {
    render(<ResponsiveMap1047x925 values={buildDefaultValues()} />);

    const inputStationIcon = screen.getByTestId("icon-for-input-station-1");
    expect(inputStationIcon.getAttribute("data-icon-id")).toBe("input-station");
  });

  it("uebernimmt iconSize aus der JSON-Konfiguration", () => {
    render(<ResponsiveMap1047x925 values={buildDefaultValues()} />);

    const primaryHotspot = getPrimaryHotspot();
    const icon = screen.getByTestId(`icon-for-${primaryHotspot.id}`);
    const expectedSize = String(primaryHotspot.iconSize ?? 80);
    expect(icon.getAttribute("width")).toBe(expectedSize);
    expect(icon.getAttribute("height")).toBe(expectedSize);
  });

  it("uebernimmt rotation aus der JSON-Konfiguration", () => {
    const primaryHotspot = getPrimaryHotspot();
    render(<ResponsiveMap1047x925 values={buildDefaultValues()} />);

    const button = screen.getByRole("button", {
      name: primaryHotspot.ariaLabel ?? primaryHotspot.name ?? primaryHotspot.id,
    });
    const rotation = primaryHotspot.rotation ?? 0;
    expect(button.getAttribute("transform") ?? "").toContain(`rotate(${rotation})`);
  });

  it("nutzt lokale Toggle-Logik ohne values-stateSource", () => {
    const primaryHotspot = getPrimaryHotspot();
    render(<ResponsiveMap1047x925 values={{}} />);

    const button = screen.getByRole("button", {
      name: primaryHotspot.ariaLabel ?? primaryHotspot.name ?? primaryHotspot.id,
    });

    const initialPressed = button.getAttribute("aria-pressed") === "true";
    fireEvent.click(button);
    const toggledPressed = button.getAttribute("aria-pressed") === "true";

    expect(toggledPressed).toBe(!initialPressed);
  });

  it("rendert die Kugellade-Station aus der JSON-Konfiguration", () => {
    render(<ResponsiveMap1047x925 values={buildDefaultValues()} />);

    const icon = screen.getByTestId("icon-for-ball-loader-1");
    expect(icon.getAttribute("data-icon-id")).toBe("ball-loader");
  });

  it("rendert das Drehfoerderband mit konfigurierter Laufrichtung", () => {
    render(<ResponsiveMap1047x925 values={buildDefaultValues()} />);

    const icon = screen.getByTestId("icon-for-rotating-conveyor-1");
    expect(icon.getAttribute("data-icon-id")).toBe("rotating-conveyor");
    expect(icon.getAttribute("class") ?? "").toContain("belt--right");
  });
});
