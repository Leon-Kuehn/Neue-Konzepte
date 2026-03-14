import { useMemo, useState } from "react";
import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";

type StorageSlot = {
  id: string;
  col: number;
  row: number;
  occupied: boolean;
};

const COLS = 10;
const ROWS = 5;

function buildDummySlots(): StorageSlot[] {
  const occupiedIds = new Set([
    "R1C2",
    "R1C4",
    "R1C9",
    "R2C1",
    "R2C6",
    "R2C8",
    "R3C3",
    "R3C7",
    "R4C5",
    "R4C10",
    "R5C2",
    "R5C4",
    "R5C6",
    "R5C8",
  ]);

  const slots: StorageSlot[] = [];
  for (let row = 1; row <= ROWS; row += 1) {
    for (let col = 1; col <= COLS; col += 1) {
      const id = `R${row}C${col}`;
      slots.push({ id, row, col, occupied: occupiedIds.has(id) });
    }
  }

  return slots;
}

function Carton({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  const lidHeight = height * 0.24;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={0} y={lidHeight} width={width} height={height - lidHeight} rx={4} fill="#D9A05C" stroke="#9C6237" strokeWidth={2} />
      <polygon points={`0,${lidHeight} ${width * 0.5},0 ${width},${lidHeight}`} fill="#E6B376" stroke="#9C6237" strokeWidth={2} />
      <line x1={width * 0.5} y1={0} x2={width * 0.5} y2={height} stroke="#9C6237" strokeWidth={1.5} />
    </g>
  );
}

export default function HighBayStoragePage() {
  const [slots] = useState<StorageSlot[]>(() => buildDummySlots());

  const occupiedCount = useMemo(
    () => slots.filter((slot) => slot.occupied).length,
    [slots]
  );
  const fillPercent = Math.round((occupiedCount / slots.length) * 100);

  const view = {
    width: 1280,
    height: 760,
    rackX: 120,
    rackY: 110,
    rackW: 1040,
    rackH: 520,
  };

  const cellW = view.rackW / COLS;
  const cellH = view.rackH / ROWS;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              Hochregallager
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={`Belegt: ${occupiedCount}/${slots.length}`} color="primary" variant="outlined" />
              <Chip label={`${fillPercent}% Auslastung`} color="default" variant="outlined" />
            </Stack>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Dummy-Daten aktiv. Spater kann die Belegung slot-genau uber die API geladen werden.
          </Typography>

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
            <svg viewBox={`0 0 ${view.width} ${view.height}`} width="100%" role="img" aria-label="Hochregallager mit 10x5 Lagerplaetzen">
              <rect x={0} y={0} width={view.width} height={view.height} fill="#f2f2f2" rx={10} />

              <rect x={view.rackX} y={view.rackY} width={view.rackW} height={view.rackH} fill="#ffffff" stroke="#8f8f8f" strokeWidth={4} />

              {Array.from({ length: COLS + 1 }, (_, i) => {
                const x = view.rackX + i * cellW;
                return <line key={`v-${i}`} x1={x} y1={view.rackY} x2={x} y2={view.rackY + view.rackH} stroke="#d0d0d0" strokeWidth={2} />;
              })}

              {Array.from({ length: ROWS + 1 }, (_, i) => {
                const y = view.rackY + i * cellH;
                return <line key={`h-${i}`} x1={view.rackX} y1={y} x2={view.rackX + view.rackW} y2={y} stroke="#d0d0d0" strokeWidth={2} />;
              })}

              {slots.map((slot) => {
                if (!slot.occupied) return null;

                const cellX = view.rackX + (slot.col - 1) * cellW;
                const cellY = view.rackY + (slot.row - 1) * cellH;

                const cartonW = cellW * 0.58;
                const cartonH = cellH * 0.56;
                const cartonX = cellX + (cellW - cartonW) / 2;
                const cartonY = cellY + (cellH - cartonH) / 2;

                return (
                  <g key={slot.id}>
                    <rect
                      x={cellX + cellW * 0.1}
                      y={cellY + cellH * 0.22}
                      width={cellW * 0.8}
                      height={cellH * 0.64}
                      fill="rgba(227, 6, 19, 0.08)"
                      stroke="rgba(227, 6, 19, 0.2)"
                      strokeWidth={1.5}
                      rx={4}
                    />
                    <Carton x={cartonX} y={cartonY} width={cartonW} height={cartonH} />
                  </g>
                );
              })}

              <rect x={view.rackX} y={view.rackY + view.rackH + 10} width={view.rackW} height={20} rx={4} fill="#c2c2c2" />
            </svg>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
