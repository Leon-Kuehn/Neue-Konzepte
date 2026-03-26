import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
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
import KpiSummaryBar from "../components/KpiSummaryBar";
import { onMessage } from "../services/mqttClient";
import {
  getWarehouseSimulatorStatus,
  startWarehouseSimulator,
  stopWarehouseSimulator,
  tickWarehouseSimulator,
  type WarehouseSimulatorStatus,
} from "../services/warehouseSimulatorApi";

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
  const slots: StorageSlot[] = [];
  for (let row = 1; row <= ROWS; row += 1) {
    for (let col = 1; col <= COLS; col += 1) {
      const id = `R${row}C${col}`;
      slots.push({ id, row, col, item: null });
    }
  }

  return slots;
}

function Carton({ x, y, width, height }: { x: number; y: number; width: number; height: number }) {
  const lidHeight = height * 0.24;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={0} y={lidHeight} width={width} height={height - lidHeight} rx={4} fill="#FACC15" stroke="#F59E0B" strokeWidth={2} />
      <polygon points={`0,${lidHeight} ${width * 0.5},0 ${width},${lidHeight}`} fill="#FDE68A" stroke="#F59E0B" strokeWidth={2} />
      <line x1={width * 0.5} y1={0} x2={width * 0.5} y2={height} stroke="#EA580C" strokeWidth={1.5} />
    </g>
  );
}

function buildSimulatedItem(slotId: string, quantity: number): StorageItem {
  return {
    sku: `SIM-${slotId}`,
    name: `Simulated Load ${slotId}`,
    quantity,
    unitCost: 4 + (quantity % 7),
    unitPrice: 8 + (quantity % 11),
    monthlyDemand: Math.max(1, Math.floor(quantity / 3)),
    daysInStock: 1 + (quantity % 28),
  };
}

function applySimulatorStatusToSlots(
  previousSlots: StorageSlot[],
  simulatorStatus: WarehouseSimulatorStatus,
): StorageSlot[] {
  const occupancyBySlot = new Map(
    simulatorStatus.slots.map((slot) => [slot.slotId, slot]),
  );

  return previousSlots.map((slot) => {
    const backendSlot = occupancyBySlot.get(slot.id);
    if (!backendSlot || !backendSlot.occupied) {
      return { ...slot, item: null };
    }

    return {
      ...slot,
      item: buildSimulatedItem(slot.id, backendSlot.quantity),
    };
  });
}

export default function HighBayStoragePage() {
  const { t, simulatorVisibility } = useAppPreferences();
  const [slots, setSlots] = useState<StorageSlot[]>(() => buildDummySlots());
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [simulatorStatus, setSimulatorStatus] = useState<WarehouseSimulatorStatus | null>(null);
  const [simulatorLoading, setSimulatorLoading] = useState(false);
  const [simulatorError, setSimulatorError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onMessage((topic, payload) => {
      if (!topic.startsWith("hochregallager/slot/")) {
        return;
      }

      const topicParts = topic.split("/");
      const slotId = topicParts[2];
      if (!slotId) {
        return;
      }

      try {
        const data = JSON.parse(payload) as {
          occupied?: boolean;
          quantity?: number;
        };

        setSlots((prev) =>
          prev.map((slot) => {
            if (slot.id !== slotId) {
              return slot;
            }

            if (!data.occupied) {
              return { ...slot, item: null };
            }

            const quantity = data.quantity ?? 1;
            return {
              ...slot,
              item: buildSimulatedItem(slot.id, quantity),
            };
          }),
        );
      } catch {
        // ignore malformed payloads
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshSimulator = async () => {
      try {
        const status = await getWarehouseSimulatorStatus();

        if (cancelled) {
          return;
        }

        setSimulatorStatus(status);
        setSimulatorError(null);
        setSlots((previousSlots) => applySimulatorStatusToSlots(previousSlots, status));
      } catch (error) {
        if (cancelled) {
          return;
        }

        setSimulatorError(
          error instanceof Error ? error.message : "Failed to load warehouse simulator state.",
        );
      }
    };

    void refreshSimulator();
    const intervalId = window.setInterval(() => {
      void refreshSimulator();
    }, 4_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const refreshSimulatorState = async () => {
    const status = await getWarehouseSimulatorStatus();
    setSimulatorStatus(status);
    setSlots((previousSlots) => applySimulatorStatusToSlots(previousSlots, status));
  };

  const handleStartSimulator = async () => {
    setSimulatorLoading(true);
    try {
      await startWarehouseSimulator(4_000);
      await refreshSimulatorState();
      setSimulatorError(null);
    } catch (error) {
      setSimulatorError(error instanceof Error ? error.message : "Failed to start simulator.");
    } finally {
      setSimulatorLoading(false);
    }
  };

  const handleStopSimulator = async () => {
    setSimulatorLoading(true);
    try {
      await stopWarehouseSimulator();
      await refreshSimulatorState();
      setSimulatorError(null);
    } catch (error) {
      setSimulatorError(error instanceof Error ? error.message : "Failed to stop simulator.");
    } finally {
      setSimulatorLoading(false);
    }
  };

  const handleSingleTick = async () => {
    setSimulatorLoading(true);
    try {
      await tickWarehouseSimulator();
      await refreshSimulatorState();
      setSimulatorError(null);
    } catch (error) {
      setSimulatorError(error instanceof Error ? error.message : "Failed to execute simulator tick.");
    } finally {
      setSimulatorLoading(false);
    }
  };

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

  const kpiItems = useMemo(
    () => [
      { label: t("highBay.totalSlots"), value: `${slots.length}` },
      { label: t("highBay.occupied"), value: `${occupiedCount}` },
      { label: t("highBay.utilization"), value: `${fillPercent}%` },
      { label: t("highBay.inventoryValue"), value: `${analysis.inventoryValue.toFixed(2)} EUR` },
    ],
    [analysis.inventoryValue, fillPercent, occupiedCount, slots.length, t],
  );

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
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            {t("highBay.title")}
          </Typography>

          {simulatorVisibility.warehouseSimulator && (
            <Card variant="outlined" sx={{ mb: 1.5 }}>
              <CardContent>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  {t("highBay.simulatorTitle")}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  {t("highBay.simulatorHint")}
                </Typography>

                {simulatorError && (
                  <Alert severity="error" sx={{ mb: 1.5 }}>
                    {simulatorError}
                  </Alert>
                )}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1.5 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStartSimulator}
                    disabled={simulatorLoading || Boolean(simulatorStatus?.running)}
                  >
                    {t("highBay.simulatorStart")}
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={handleStopSimulator}
                    disabled={simulatorLoading || !simulatorStatus?.running}
                  >
                    {t("highBay.simulatorStop")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleSingleTick}
                    disabled={simulatorLoading}
                  >
                    {t("highBay.simulatorTick")}
                  </Button>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1} useFlexGap flexWrap="wrap">
                  <Chip
                    label={`${t("highBay.simulatorState")}: ${simulatorStatus?.running ? t("status.on") : t("status.off")}`}
                    color={simulatorStatus?.running ? "success" : "default"}
                    variant={simulatorStatus?.running ? "filled" : "outlined"}
                  />
                  <Chip
                    label={`${t("highBay.simulatorEvents")}: ${simulatorStatus?.totalEvents ?? 0}`}
                    variant="outlined"
                  />
                  <Chip
                    label={`${t("highBay.simulatorStored")} / ${t("highBay.simulatorRetrieved")}: ${simulatorStatus?.storedCount ?? 0} / ${simulatorStatus?.retrievedCount ?? 0}`}
                    variant="outlined"
                  />
                </Stack>

                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2" color="text.secondary">
                  {t("highBay.simulatorNoLogs")}
                </Typography>
              </CardContent>
            </Card>
          )}

          <KpiSummaryBar items={kpiItems} />

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t("highBay.dummyInfo")}
          </Typography>

          <Alert severity="info" sx={{ mb: 1.5 }}>
            {t("highBay.clickHint")}
          </Alert>

          <Divider sx={{ mb: 1.5 }} />

          <Box sx={{ width: "100%", maxWidth: 1200, margin: "0 auto" }}>
            <svg viewBox={`0 0 ${view.width} ${view.height}`} width="100%" role="img" aria-label={t("highBay.ariaLabel")}>
              <rect x={0} y={0} width={view.width} height={view.height} fill="#FFF7ED" rx={10} />

              <rect x={view.rackX} y={view.rackY} width={view.rackW} height={view.rackH} fill="#FEF3C7" stroke="#EA580C" strokeWidth={4} />

              <rect x={view.rackX - 8} y={view.rackY - 8} width={12} height={view.rackH + 16} rx={4} fill="#F97316" />
              <rect x={view.rackX + view.rackW - 4} y={view.rackY - 8} width={12} height={view.rackH + 16} rx={4} fill="#F97316" />

              {Array.from({ length: COLS + 1 }, (_, i) => {
                const x = view.rackX + i * cellW;
                return <line key={`v-${i}`} x1={x} y1={view.rackY} x2={x} y2={view.rackY + view.rackH} stroke="#F59E0B" strokeWidth={1.5} opacity={0.45} />;
              })}

              {Array.from({ length: ROWS + 1 }, (_, i) => {
                const y = view.rackY + i * cellH;
                return <line key={`h-${i}`} x1={view.rackX} y1={y} x2={view.rackX + view.rackW} y2={y} stroke="#F59E0B" strokeWidth={1.5} opacity={0.45} />;
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
                      fill={isSelected ? "rgba(227, 6, 19, 0.12)" : "rgba(255, 255, 255, 0.35)"}
                      stroke={isSelected ? "#E30613" : "rgba(245, 158, 11, 0.4)"}
                      strokeWidth={isSelected ? 2.5 : 1}
                      rx={4}
                    />

                    <text
                      x={cellX + 8}
                      y={cellY + 18}
                      fontSize={11}
                      fill="#9A3412"
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
                          fill="rgba(249, 115, 22, 0.14)"
                          stroke="rgba(245, 158, 11, 0.65)"
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

              <rect x={view.rackX} y={view.rackY + view.rackH + 10} width={view.rackW} height={10} rx={4} fill="#F97316" />
              <rect x={view.rackX} y={view.rackY + view.rackH + 20} width={view.rackW} height={22} rx={6} fill="#FACC15" stroke="#F59E0B" strokeWidth={2.5} />
              {Array.from({ length: COLS * 2 }, (_, i) => {
                const segW = view.rackW / (COLS * 2);
                const segX = view.rackX + i * segW + 3;
                return (
                  <rect
                    key={`belt-seg-${i}`}
                    x={segX}
                    y={view.rackY + view.rackH + 21.5}
                    width={Math.max(segW - 6, 6)}
                    height={19}
                    rx={2.5}
                    fill="#F59E0B"
                    opacity={0.7}
                  />
                );
              })}
              <rect x={view.rackX} y={view.rackY + view.rackH + 42} width={view.rackW} height={8} rx={4} fill="#F97316" />
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
