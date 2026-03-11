export type Hotspot = {
  id: string;
  xPercent: number; // 0-100 from left to right
  yPercent: number; // 0-100 from top to bottom
  description: string;
  radiusPercent?: number; // optional circular radius in percent of image width
  widthPercent?: number; // optional rectangular width in percent
  heightPercent?: number; // optional rectangular height in percent
};

export const DEFAULT_RADIUS_PERCENT = 2;

const clampPercent = (value: number): number => Math.min(100, Math.max(0, value));

export const parsePercent = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampPercent(value);
  }

  if (typeof value === "string") {
    const normalized = Number.parseFloat(value.replace("%", ""));
    if (!Number.isNaN(normalized)) {
      return clampPercent(normalized);
    }
  }

  return null;
};

export const pixelsToPercent = (
  xPx: number,
  yPx: number,
  containerWidth: number,
  containerHeight: number
): { xPercent: number; yPercent: number } => {
  const safeWidth = Math.max(containerWidth, 1);
  const safeHeight = Math.max(containerHeight, 1);

  const xPercent = clampPercent((xPx / safeWidth) * 100);
  const yPercent = clampPercent((yPx / safeHeight) * 100);

  return { xPercent, yPercent };
};

export const percentToPixels = (
  xPercent: number,
  yPercent: number,
  containerWidth: number,
  containerHeight: number
): { xPx: number; yPx: number } => {
  const clampedX = clampPercent(xPercent);
  const clampedY = clampPercent(yPercent);
  return {
    xPx: (clampedX / 100) * containerWidth,
    yPx: (clampedY / 100) * containerHeight,
  };
};

export const sanitizeHotspot = (raw: unknown, defaults?: Partial<Hotspot>): Hotspot | null => {
  if (typeof raw !== "object" || raw === null) return null;
  const candidate = raw as Record<string, unknown>;
  if (typeof candidate.id !== "string") return null;

  const xPercent =
    parsePercent(candidate.xPercent ?? candidate.left ?? candidate.x) ??
    parsePercent(candidate.xPct);
  const yPercent =
    parsePercent(candidate.yPercent ?? candidate.top ?? candidate.y) ??
    parsePercent(candidate.yPct);

  if (xPercent === null || yPercent === null) return null;

  const radiusPercent =
    parsePercent(candidate.radiusPercent ?? candidate.radius) ?? defaults?.radiusPercent;
  const widthPercent = parsePercent(candidate.widthPercent ?? candidate.width);
  const heightPercent = parsePercent(candidate.heightPercent ?? candidate.height);

  const description =
    typeof candidate.description === "string"
      ? candidate.description
      : defaults?.description ?? candidate.id;

  return {
    id: candidate.id,
    xPercent,
    yPercent,
    description,
    radiusPercent,
    widthPercent: widthPercent ?? undefined,
    heightPercent: heightPercent ?? undefined,
  };
};

export const sanitizeHotspotList = (
  raw: unknown,
  defaults?: Partial<Hotspot>
): Hotspot[] => {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<string>();
  const sanitized: Hotspot[] = [];

  raw.forEach((item) => {
    const parsed = sanitizeHotspot(item, defaults);
    if (parsed && !seen.has(parsed.id)) {
      seen.add(parsed.id);
      sanitized.push(parsed);
    }
  });

  return sanitized;
};
