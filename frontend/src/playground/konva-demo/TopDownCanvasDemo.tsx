import { useState, useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Circle, Text, Group } from "react-konva";
import type Konva from "konva";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CanvasItem {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  kind: "rect" | "circle";
}

/* ------------------------------------------------------------------ */
/*  Seed data – small top-down factory floor                           */
/* ------------------------------------------------------------------ */

const INITIAL_ITEMS: CanvasItem[] = [
  { id: "conv-1", label: "Conveyor 1", x: 80, y: 200, width: 200, height: 40, fill: "#42a5f5", kind: "rect" },
  { id: "conv-2", label: "Conveyor 2", x: 80, y: 350, width: 200, height: 40, fill: "#42a5f5", kind: "rect" },
  { id: "conv-3", label: "Conveyor 3", x: 500, y: 275, width: 200, height: 40, fill: "#42a5f5", kind: "rect" },
  { id: "press-1", label: "Press", x: 370, y: 180, width: 80, height: 80, fill: "#ef5350", kind: "rect" },
  { id: "sensor-1", label: "Sensor A", x: 320, y: 360, width: 30, height: 30, fill: "#66bb6a", kind: "circle" },
  { id: "sensor-2", label: "Sensor B", x: 480, y: 200, width: 30, height: 30, fill: "#66bb6a", kind: "circle" },
  { id: "storage-1", label: "Storage", x: 740, y: 240, width: 100, height: 120, fill: "#ffa726", kind: "rect" },
];

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TopDownCanvasDemo() {
  const [items, setItems] = useState<CanvasItem[]>(INITIAL_ITEMS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: CANVAS_WIDTH, height: CANVAS_HEIGHT });

  /* Responsive: fit stage into parent container */
  const fitStage = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cw = container.clientWidth;
    const scale = Math.min(cw / CANVAS_WIDTH, 1);
    setStageSize({
      width: CANVAS_WIDTH * scale,
      height: CANVAS_HEIGHT * scale,
    });
  }, []);

  useEffect(() => {
    fitStage();
    window.addEventListener("resize", fitStage);
    return () => window.removeEventListener("resize", fitStage);
  }, [fitStage]);

  const scale = stageSize.width / CANVAS_WIDTH;

  /* Click on empty canvas area deselects */
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null);
    }
  };

  /* Drag end – update item position (in logical coords) */
  const handleDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, x: node.x(), y: node.y() }
          : item,
      ),
    );
  };

  /* Selected item for the info panel */
  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <h2 style={{ margin: 0 }}>🏭 Konva Playground – Top-Down Layout</h2>
      <p style={{ margin: 0, color: "#666" }}>
        Drag items to rearrange. Click an item to select it.
      </p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Canvas */}
        <div
          ref={containerRef}
          style={{
            flex: "1 1 600px",
            border: "1px solid #ccc",
            borderRadius: 8,
            overflow: "hidden",
            background: "#fafafa",
          }}
        >
          <Stage
            width={stageSize.width}
            height={stageSize.height}
            scaleX={scale}
            scaleY={scale}
            onClick={handleStageClick}
          >
            <Layer>
              {/* Grid lines */}
              {Array.from({ length: Math.floor(CANVAS_WIDTH / 60) + 1 }).map((_, i) => (
                <Rect
                  key={`gv-${i}`}
                  x={i * 60}
                  y={0}
                  width={1}
                  height={CANVAS_HEIGHT}
                  fill="#e0e0e0"
                  listening={false}
                />
              ))}
              {Array.from({ length: Math.floor(CANVAS_HEIGHT / 60) + 1 }).map((_, i) => (
                <Rect
                  key={`gh-${i}`}
                  x={0}
                  y={i * 60}
                  width={CANVAS_WIDTH}
                  height={1}
                  fill="#e0e0e0"
                  listening={false}
                />
              ))}

              {/* Items */}
              {items.map((item) => {
                const isSelected = item.id === selectedId;
                return (
                  <Group
                    key={item.id}
                    x={item.x}
                    y={item.y}
                    draggable
                    onClick={(e) => {
                      e.cancelBubble = true;
                      setSelectedId(item.id);
                    }}
                    onDragEnd={(e) => handleDragEnd(item.id, e)}
                  >
                    {item.kind === "circle" ? (
                      <Circle
                        x={item.width / 2}
                        y={item.height / 2}
                        radius={item.width / 2}
                        fill={item.fill}
                        stroke={isSelected ? "#E30613" : "#555"}
                        strokeWidth={isSelected ? 3 : 1}
                        shadowBlur={isSelected ? 8 : 0}
                        shadowColor="#E30613"
                      />
                    ) : (
                      <Rect
                        width={item.width}
                        height={item.height}
                        fill={item.fill}
                        cornerRadius={4}
                        stroke={isSelected ? "#E30613" : "#555"}
                        strokeWidth={isSelected ? 3 : 1}
                        shadowBlur={isSelected ? 8 : 0}
                        shadowColor="#E30613"
                      />
                    )}
                    <Text
                      text={item.label}
                      x={item.kind === "circle" ? -item.width : 0}
                      y={item.kind === "circle" ? item.height + 4 : item.height + 4}
                      width={item.kind === "circle" ? item.width * 3 : item.width}
                      fontSize={12}
                      fill="#333"
                      align="center"
                    />
                  </Group>
                );
              })}
            </Layer>
          </Stage>
        </div>

        {/* Info panel */}
        <div
          style={{
            flex: "0 0 220px",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 16,
            background: "#fff",
            alignSelf: "flex-start",
          }}
        >
          <h3 style={{ margin: "0 0 8px" }}>Selected</h3>
          {selected ? (
            <div style={{ fontSize: 14, lineHeight: 1.6 }}>
              <div><strong>ID:</strong> {selected.id}</div>
              <div><strong>Label:</strong> {selected.label}</div>
              <div><strong>Kind:</strong> {selected.kind}</div>
              <div><strong>Position:</strong> ({Math.round(selected.x)}, {Math.round(selected.y)})</div>
              <div><strong>Size:</strong> {selected.width} × {selected.height}</div>
              <div>
                <strong>Color:</strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    width: 14,
                    height: 14,
                    background: selected.fill,
                    borderRadius: 3,
                    verticalAlign: "middle",
                    marginLeft: 4,
                  }}
                />
              </div>
            </div>
          ) : (
            <p style={{ color: "#999", fontSize: 14 }}>Click an item on the canvas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
