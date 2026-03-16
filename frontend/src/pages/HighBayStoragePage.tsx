import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAppPreferences } from "../context/AppPreferencesContext";

type StorageItem = {
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  monthlyDemand: number;
  daysInStock: number;
};

type StorageSlot = {
  id: string;
  col: number;
  row: number;
  item: StorageItem | null;
};

const COLS = 10;
const ROWS = 5;

function buildDummySlots(): StorageSlot[] {
  const itemBySlot: Record<string, StorageItem> = {
    R1C2: {
      sku: "BRG-6001",
      name: "Kugellager 6001",
      quantity: 120,
      unitCost: 2.4,
      unitPrice: 4.1,
      monthlyDemand: 95,
      daysInStock: 18,
    },
    R1C4: {
      sku: "SEN-IND-12",
      name: "Induktivsensor 12mm",
      quantity: 35,
      unitCost: 18,
      unitPrice: 31,
      monthlyDemand: 22,
      daysInStock: 26,
    },
    R1C9: {
      sku: "PLC-IOMOD",
      name: "I/O Modul",
      quantity: 14,
      unitCost: 145,
      unitPrice: 219,
      monthlyDemand: 4,
      daysInStock: 91,
    },
    R2C1: {
      sku: "CAB-M12-5M",
      name: "Sensorleitung M12 5m",
      quantity: 84,
      unitCost: 6.5,
      unitPrice: 11.9,
      monthlyDemand: 40,
      daysInStock: 22,
    },
    R2C6: {
      sku: "MOT-24V-DC",
      name: "DC Motor 24V",
      quantity: 10,
      unitCost: 88,
      unitPrice: 139,
      monthlyDemand: 3,
      daysInStock: 74,
    },
    R2C8: {
      sku: "RFID-TAG-HT",
      name: "RFID Tag HT",
      quantity: 210,
      unitCost: 0.95,
      unitPrice: 2.2,
      monthlyDemand: 130,
      daysInStock: 11,
    },
    R3C3: {
      sku: "SEN-OPT-RED",
      name: "Lichttaster Rot",
      quantity: 48,
      unitCost: 14,
      unitPrice: 24,
      monthlyDemand: 27,
      daysInStock: 30,
    },
    R3C7: {
      sku: "LEG-OLD-01",
      name: "Altmodul Serie A",
      quantity: 16,
      unitCost: 120,
      unitPrice: 123,
      monthlyDemand: 0,
      daysInStock: 310,
    },
    R4C5: {
      sku: "PNE-VAL-3_2",
      name: "Pneumatikventil 3/2",
      quantity: 26,
      unitCost: 22,
      unitPrice: 38,
      monthlyDemand: 8,
      daysInStock: 52,
    },
    R4C10: {
      sku: "SAF-REL-24",
      name: "Sicherheitsrelais 24V",
      quantity: 9,
      unitCost: 64,
      unitPrice: 104,
      monthlyDemand: 2,
      daysInStock: 138,
    },
    R5C2: {
      sku: "SCR-M6-SET",
      name: "Montageschrauben M6",
      quantity: 600,
      unitCost: 0.12,
      unitPrice: 0.45,
      monthlyDemand: 180,
      daysInStock: 14,
    },
    R5C4: {
      sku: "CONV-BELT-S",
      name: "Foerderband Segment S",
      quantity: 7,
      unitCost: 310,
      unitPrice: 445,
      monthlyDemand: 1,
      daysInStock: 166,
    },
    R5C6: {
      sku: "LEG-RET-09",
      name: "Rückläufer Ventil alt",
      quantity: 42,
      unitCost: 9,
      unitPrice: 11,
      monthlyDemand: 0,
      daysInStock: 420,
    },
    R5C8: {
      sku: "WAGO-5X",
      name: "Klemmenblock 5x",
      quantity: 160,
      unitCost: 1.3,
      unitPrice: 3.2,
      monthlyDemand: 70,
      daysInStock: 19,
    },
  };

  const slots: StorageSlot[] = [];
  for (let row = 1; row <= ROWS; row += 1) {
    for (let col = 1; col <= COLS; col += 1) {
      const id = `R${row}C${col}`;
      slots.push({ id, row, col, item: itemBySlot[id] ?? null });
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
  const { t } = useAppPreferences();
  const [slots] = useState<StorageSlot[]>(() => buildDummySlots());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  const selectedSlot = useMemo(
    () => slots.find((slot) => slot.id === selectedSlotId) ?? null,
    [selectedSlotId, slots],
  );

  const occupiedCount = useMemo(
    () => slots.filter((slot) => slot.item !== null).length,
    [slots]
  );
  const fillPercent = Math.round((occupiedCount / slots.length) * 100);

  const analysis = useMemo(() => {
    const occupiedSlots = slots.filter((slot) => slot.item !== null);
    const inventoryValue = occupiedSlots.reduce(
      (sum, slot) => sum + (slot.item?.quantity ?? 0) * (slot.item?.unitCost ?? 0),
      0,
    );

    const monthlyRevenue = occupiedSlots.reduce(
      (sum, slot) => sum + (slot.item?.monthlyDemand ?? 0) * (slot.item?.unitPrice ?? 0),
      0,
    );

    const monthlyProfit = occupiedSlots.reduce(
      (sum, slot) =>
        sum +
        (slot.item?.monthlyDemand ?? 0) *
          ((slot.item?.unitPrice ?? 0) - (slot.item?.unitCost ?? 0)),
      0,
    );

    const deadStock = occupiedSlots.filter((slot) => {
      if (!slot.item) return false;
      return slot.item.monthlyDemand === 0 || (slot.item.daysInStock > 180 && slot.item.monthlyDemand < 3);
    });

    const topPerformer = occupiedSlots.reduce<StorageSlot | null>((best, slot) => {
      if (!slot.item) return best;
      if (!best?.item) return slot;

      const slotRevenue = slot.item.monthlyDemand * slot.item.unitPrice;
      const bestRevenue = best.item.monthlyDemand * best.item.unitPrice;
      return slotRevenue > bestRevenue ? slot : best;
    }, null);

    const slowMovers = occupiedSlots
      .filter((slot) => slot.item && slot.item.monthlyDemand > 0 && slot.item.monthlyDemand <= 3)
      .sort((a, b) => (b.item?.daysInStock ?? 0) - (a.item?.daysInStock ?? 0));

    return {
      inventoryValue,
      monthlyRevenue,
      monthlyProfit,
      deadStock,
      topPerformer,
      slowMovers,
      deadStockRatio: occupiedSlots.length === 0 ? 0 : Math.round((deadStock.length / occupiedSlots.length) * 100),
    };
  }, [slots]);

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
              {t("highBay.title")}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={`${t("highBay.occupied")}: ${occupiedCount}/${slots.length}`} color="primary" variant="outlined" />
              <Chip label={`${fillPercent}% ${t("highBay.utilization")}`} color="default" variant="outlined" />
            </Stack>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t("highBay.dummyInfo")}
          </Typography>

          <Alert severity="info" sx={{ mb: 1.5 }}>
            {t("highBay.clickHint")}
          </Alert>

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
            <svg viewBox={`0 0 ${view.width} ${view.height}`} width="100%" role="img" aria-label={t("highBay.ariaLabel")}>
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
                const cellX = view.rackX + (slot.col - 1) * cellW;
                const cellY = view.rackY + (slot.row - 1) * cellH;
                const isSelected = slot.id === selectedSlotId;

                return (
                  <g
                    key={slot.id}
                    onClick={() => setSelectedSlotId(slot.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={cellX + 3}
                      y={cellY + 3}
                      width={cellW - 6}
                      height={cellH - 6}
                      fill={isSelected ? "rgba(227, 6, 19, 0.12)" : "transparent"}
                      stroke={isSelected ? "#E30613" : "rgba(90, 90, 90, 0.3)"}
                      strokeWidth={isSelected ? 2.5 : 1}
                      rx={4}
                    />

                    <text
                      x={cellX + 8}
                      y={cellY + 18}
                      fontSize={11}
                      fill="#555"
                      fontWeight={600}
                    >
                      {slot.id}
                    </text>

                    {slot.item && (
                      <>
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

                        {(() => {
                          const cartonW = cellW * 0.58;
                          const cartonH = cellH * 0.56;
                          const cartonX = cellX + (cellW - cartonW) / 2;
                          const cartonY = cellY + (cellH - cartonH) / 2;
                          return <Carton x={cartonX} y={cartonY} width={cartonW} height={cartonH} />;
                        })()}
                      </>
                    )}
                  </g>
                );
              })}

              <rect x={view.rackX} y={view.rackY + view.rackH + 10} width={view.rackW} height={20} rx={4} fill="#c2c2c2" />
            </svg>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
            {t("highBay.analysisTitle")}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t("highBay.analysisHint")}
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 1.5 }}>
            <Chip label={`${t("highBay.inventoryValue")}: ${analysis.inventoryValue.toFixed(2)} EUR`} color="primary" variant="outlined" />
            <Chip label={`${t("highBay.monthlyRevenue")}: ${analysis.monthlyRevenue.toFixed(2)} EUR`} color="default" variant="outlined" />
            <Chip label={`${t("highBay.monthlyProfit")}: ${analysis.monthlyProfit.toFixed(2)} EUR`} color="success" variant="outlined" />
            <Chip label={`${t("highBay.deadStockRatio")}: ${analysis.deadStockRatio}%`} color="warning" variant="outlined" />
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  {t("highBay.topPerformer")}
                </Typography>
                {analysis.topPerformer?.item ? (
                  <List dense disablePadding>
                    <ListItem disableGutters>
                      <ListItemText
                        primary={analysis.topPerformer.item.name}
                        secondary={`${analysis.topPerformer.id} - ${analysis.topPerformer.item.monthlyDemand} ${t("highBay.demandPerMonth")}`}
                      />
                    </ListItem>
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  {t("highBay.deadStock")}
                </Typography>
                {analysis.deadStock.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t("highBay.noDeadStock")}
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {analysis.deadStock.map((slot) => (
                      <ListItem key={slot.id} disableGutters>
                        <ListItemText
                          primary={`${slot.item?.name} (${slot.id})`}
                          secondary={`${slot.item?.monthlyDemand ?? 0} ${t("highBay.demandPerMonth")} - ${slot.item?.daysInStock ?? 0} ${t("highBay.idleDays")}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>

            <Card variant="outlined" sx={{ gridColumn: { xs: "auto", lg: "1 / -1" } }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  {t("highBay.slowMovers")}
                </Typography>
                {analysis.slowMovers.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    -
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {analysis.slowMovers.slice(0, 6).map((slot) => (
                      <ListItem key={`slow-${slot.id}`} disableGutters>
                        <ListItemText
                          primary={`${slot.item?.name} (${slot.id})`}
                          secondary={`${slot.item?.monthlyDemand ?? 0} ${t("highBay.demandPerMonth")} - ${slot.item?.daysInStock ?? 0} ${t("highBay.idleDays")}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Box>
        </CardContent>
      </Card>

      <Drawer
        anchor="right"
        open={Boolean(selectedSlot)}
        onClose={() => setSelectedSlotId(null)}
        PaperProps={{ sx: { width: { xs: 320, sm: 380 }, p: 2 } }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {t("highBay.slotDetails")}
          </Typography>
          <IconButton size="small" onClick={() => setSelectedSlotId(null)} aria-label={t("common.closeDetails")}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 1.5 }} />

        {selectedSlot && (
          <>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Chip label={`${t("highBay.slot")} ${selectedSlot.id}`} variant="outlined" />
              <Chip
                label={selectedSlot.item ? t("highBay.occupied") : t("highBay.empty")}
                color={selectedSlot.item ? "success" : "default"}
                variant={selectedSlot.item ? "filled" : "outlined"}
              />
            </Stack>

            {selectedSlot.item ? (
              <List dense disablePadding>
                <ListItem disableGutters>
                  <ListItemText primary={t("highBay.item")} secondary={`${selectedSlot.item.name} (${selectedSlot.item.sku})`} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={t("highBay.quantity")} secondary={`${selectedSlot.item.quantity}`} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={t("highBay.unitCost")} secondary={`${selectedSlot.item.unitCost.toFixed(2)} EUR`} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={t("highBay.unitPrice")} secondary={`${selectedSlot.item.unitPrice.toFixed(2)} EUR`} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary={t("highBay.totalValue")}
                    secondary={`${(selectedSlot.item.quantity * selectedSlot.item.unitCost).toFixed(2)} EUR`}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={t("highBay.monthlyDemand")} secondary={`${selectedSlot.item.monthlyDemand}`} />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary={t("highBay.monthlyRevenue")}
                    secondary={`${(selectedSlot.item.monthlyDemand * selectedSlot.item.unitPrice).toFixed(2)} EUR`}
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText primary={t("highBay.daysInStock")} secondary={`${selectedSlot.item.daysInStock}`} />
                </ListItem>
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t("highBay.emptyDetails")}
              </Typography>
            )}
          </>
        )}
      </Drawer>
    </Box>
  );
}
