import { describe, expect, it } from "vitest";
import {
  DEFAULT_RADIUS_PERCENT,
  pixelsToPercent,
  percentToPixels,
  sanitizeHotspotList,
  buildHotspotVisualState,
} from "./hotspot";

describe("coordinate conversion", () => {
  it("converts pixel coordinates to percentage coordinates", () => {
    const { xPercent, yPercent } = pixelsToPercent(200, 120, 800, 600);
    expect(xPercent).toBeCloseTo(25);
    expect(yPercent).toBeCloseTo(20);
  });

  it("keeps hotspot alignment consistent after resizing", () => {
    const { xPercent, yPercent } = pixelsToPercent(160, 90, 640, 360);
    const resized = percentToPixels(xPercent, yPercent, 1280, 720);
    expect(resized.xPx).toBeCloseTo(320);
    expect(resized.yPx).toBeCloseTo(180);
  });

  it("round-trips across multiple sizes without drift", () => {
    const sizes = [
      { w: 500, h: 300 },
      { w: 1280, h: 720 },
      { w: 1920, h: 1080 },
    ];
    sizes.forEach(({ w, h }) => {
      const pct = pixelsToPercent(w * 0.42, h * 0.58, w, h);
      const px = percentToPixels(pct.xPercent, pct.yPercent, w * 1.5, h * 1.5);
      expect(px.xPx / (w * 1.5)).toBeCloseTo(0.42);
      expect(px.yPx / (h * 1.5)).toBeCloseTo(0.58);
    });
  });
});

describe("hotspot structure", () => {
  it("sanitizes hotspot lists and enforces percent ranges", () => {
    const sanitized = sanitizeHotspotList(
      [
        { id: "legacy", top: "120%", left: "-5%", description: "legacy strings" },
        { id: "modern", xPercent: 55.678, yPercent: 44.321, radiusPercent: 8 },
        { xPercent: 10, yPercent: 10 },
        { id: "rect", x: 10, y: 20, widthPercent: 400, heightPercent: -10 },
      ],
      { radiusPercent: DEFAULT_RADIUS_PERCENT }
    );

    expect(sanitized).toHaveLength(3);

    const legacy = sanitized.find((h) => h.id === "legacy");
    expect(legacy?.xPercent).toBe(0);
    expect(legacy?.yPercent).toBe(100);
    expect(legacy?.radiusPercent).toBe(DEFAULT_RADIUS_PERCENT);

    const modern = sanitized.find((h) => h.id === "modern");
    expect(modern?.xPercent).toBeCloseTo(55.678);
    expect(modern?.yPercent).toBeCloseTo(44.321);
    expect(modern?.radiusPercent).toBe(8);

    const rect = sanitized.find((h) => h.id === "rect");
    expect(rect?.widthPercent).toBe(100);
    expect(rect?.heightPercent).toBe(0);
  });

  it("computes visual states for active and inactive hotspots", () => {
    const active = buildHotspotVisualState(
      { id: "a", xPercent: 10, yPercent: 10, description: "a", isActive: true },
      false
    );
    expect(active.opacity).toBe(1);
    expect(active.animation).toContain("pulseHalo");
    expect(active.showHalo).toBe(true);

    const hiddenInactive = buildHotspotVisualState(
      { id: "b", xPercent: 10, yPercent: 10, description: "b", isActive: false },
      false
    );
    expect(hiddenInactive.opacity).toBe(0);
    expect(hiddenInactive.animation).toBeUndefined();
    expect(hiddenInactive.showHalo).toBe(false);

    const shownInactive = buildHotspotVisualState(
      { id: "c", xPercent: 10, yPercent: 10, description: "c" },
      true
    );
    expect(shownInactive.opacity).toBeGreaterThan(0);
    expect(shownInactive.animation).toBeUndefined();
  });
});
