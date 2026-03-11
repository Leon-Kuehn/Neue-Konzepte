import { describe, expect, it } from "vitest";
import {
  DEFAULT_RADIUS_PERCENT,
  pixelsToPercent,
  percentToPixels,
  sanitizeHotspotList,
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
});
