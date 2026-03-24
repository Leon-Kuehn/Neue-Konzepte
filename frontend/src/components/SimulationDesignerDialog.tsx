import { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { MAP_HOTSPOTS } from "../entryRoute/mapHotspots";
import type { SimMotion, SimState, SimulationConfig, SimulationStep } from "../types/simulation";
import { useSimulationDesigner } from "../context/SimulationDesignerContext";
import {
  deleteSimulation,
  getSimulation,
  runPreviewSimulation,
  setSimulations,
} from "../services/simulationService";
import {
  createSimulationConfig,
  deleteSimulationConfigRemote,
  getSimulationConfigs,
  updateSimulationConfigRemote,
} from "../services/simulationApi";

export interface SimulationDesignerDialogProps {
  open: boolean;
  onClose: () => void;
  initialSimulationId?: string;
}

const motionOptions: SimMotion[] = [
  "none",
  "rotate-clockwise",
  "rotate-counterclockwise",
  "oscillate",
];

const stateOptions: SimState[] = ["off", "on", "error"];

function cloneSimulation(config: SimulationConfig): SimulationConfig {
  return {
    ...config,
    steps: config.steps.map((step) => ({
      ...step,
      changes: step.changes.map((change) => ({ ...change })),
    })),
  };
}

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

function defaultDraft(): SimulationConfig {
  return {
    id: makeId("simulation-draft"),
    name: "",
    description: "",
    repeat: 1,
    steps: [],
  };
}

function sortSteps(steps: SimulationStep[]): SimulationStep[] {
  return [...steps].sort((a, b) => a.atMs - b.atMs);
}

export default function SimulationDesignerDialog({
  open,
  onClose,
  initialSimulationId,
}: SimulationDesignerDialogProps) {
  const { setVisibleHotspotIds } = useSimulationDesigner();
  const [draft, setDraft] = useState<SimulationConfig>(defaultDraft);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [hotspotQuickFilter, setHotspotQuickFilter] = useState("");
  const [showSelectedHotspotMode, setShowSelectedHotspotMode] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sortedSteps = useMemo(() => sortSteps(draft.steps), [draft.steps]);
  const selectedStep = sortedSteps.find((step) => step.id === selectedStepId) ?? sortedSteps[0] ?? null;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialSimulationId) {
      const existing = getSimulation(initialSimulationId);
      if (existing) {
        const cloned = cloneSimulation(existing);
        setDraft(cloned);
        setSelectedStepId(cloned.steps[0]?.id ?? null);
        setValidationError(null);
        return;
      }
    }

    const fresh = defaultDraft();
    setDraft(fresh);
    setSelectedStepId(null);
    setValidationError(null);
  }, [open, initialSimulationId]);

  // Update visible hotspots when in selected-only mode
  useEffect(() => {
    if (!open) {
      setVisibleHotspotIds(null);
      return;
    }

    if (showSelectedHotspotMode && selectedStep) {
      const visibleIds = selectedStep.changes.map((change) => change.hotspotId);
      setVisibleHotspotIds(visibleIds.length > 0 ? visibleIds : null);
    } else {
      setVisibleHotspotIds(null);
    }
  }, [open, showSelectedHotspotMode, selectedStep, setVisibleHotspotIds]);

  const hotspotOptions = useMemo(
    () => MAP_HOTSPOTS.map((hotspot) => ({ id: hotspot.id, label: `${hotspot.id} - ${hotspot.name}` })),
    [],
  );

  const quickFilteredHotspots = useMemo(() => {
    const query = hotspotQuickFilter.trim().toLowerCase();
    if (!query) {
      return hotspotOptions.slice(0, 14);
    }

    return hotspotOptions
      .filter((option) => option.label.toLowerCase().includes(query))
      .slice(0, 20);
  }, [hotspotOptions, hotspotQuickFilter]);

  const updateSelectedStep = (updater: (step: SimulationStep) => SimulationStep): void => {
    if (!selectedStep) {
      return;
    }

    setDraft((previous) => ({
      ...previous,
      steps: previous.steps.map((step) => (step.id === selectedStep.id ? updater(step) : step)),
    }));
  };

  const addHotspotToSelectedStep = (hotspotId: string): void => {
    if (!selectedStep) {
      return;
    }

    updateSelectedStep((step) => {
      if (step.changes.some((change) => change.hotspotId === hotspotId)) {
        return step;
      }

      return {
        ...step,
        changes: [...step.changes, { hotspotId, state: "off", motion: "none" }],
      };
    });
  };

  const handleAddStep = (): void => {
    const maxAt = sortedSteps.length > 0 ? sortedSteps[sortedSteps.length - 1]!.atMs : -500;
    const created: SimulationStep = {
      id: makeId("step"),
      label: "",
      atMs: Math.max(0, maxAt + 500),
      changes: [],
    };

    setDraft((previous) => ({
      ...previous,
      steps: sortSteps([...previous.steps, created]),
    }));
    setSelectedStepId(created.id);
  };

  const handleDuplicateStep = (): void => {
    if (!selectedStep) {
      return;
    }

    const duplicate: SimulationStep = {
      ...selectedStep,
      id: makeId("step"),
      atMs: selectedStep.atMs + 500,
      changes: selectedStep.changes.map((change) => ({ ...change })),
    };

    setDraft((previous) => ({
      ...previous,
      steps: sortSteps([...previous.steps, duplicate]),
    }));
    setSelectedStepId(duplicate.id);
  };

  const handleDeleteStep = (): void => {
    if (!selectedStep) {
      return;
    }

    setDraft((previous) => ({
      ...previous,
      steps: previous.steps.filter((step) => step.id !== selectedStep.id),
    }));

    const remaining = sortedSteps.filter((step) => step.id !== selectedStep.id);
    setSelectedStepId(remaining[0]?.id ?? null);
  };

  const validateDraft = (): string | null => {
    if (!draft.name.trim()) {
      return "Simulation name is required.";
    }

    const hasNegativeTime = draft.steps.some((step) => step.atMs < 0);
    if (hasNegativeTime) {
      return "Step times must be >= 0 ms.";
    }

    return null;
  };

  const normalizeDraft = (): SimulationConfig | null => {
    const error = validateDraft();
    if (error) {
      setValidationError(error);
      return null;
    }

    const normalized: SimulationConfig = {
      ...draft,
      name: draft.name.trim(),
      description: draft.description?.trim() || undefined,
      steps: sortSteps(draft.steps),
    };

    return normalized;
  };

  const handleSave = async (): Promise<void> => {
    const normalized = normalizeDraft();
    if (!normalized) {
      return;
    }

    try {
      setBusy(true);
      if (initialSimulationId) {
        await updateSimulationConfigRemote(normalized);
      } else {
        await createSimulationConfig(normalized);
      }

      const synced = await getSimulationConfigs();
      setSimulations(synced);
      setValidationError(null);
      onClose();
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Saving simulation failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleTest = (): void => {
    const normalized = normalizeDraft();
    if (!normalized) {
      return;
    }

    runPreviewSimulation(normalized);
  };

  const handleDeleteSimulation = async (): Promise<void> => {
    if (!initialSimulationId) {
      return;
    }

    if (!window.confirm("Simulation wirklich loeschen?")) {
      return;
    }

    try {
      setBusy(true);
      await deleteSimulationConfigRemote(initialSimulationId);
      deleteSimulation(initialSimulationId);
      const synced = await getSimulationConfigs();
      setSimulations(synced);
      onClose();
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : "Deleting simulation failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6">Simulation Designer</Typography>
        <Tooltip title={showSelectedHotspotMode ? "Show all hotspots" : "Show selected hotspots only"}>
          <IconButton
            size="small"
            onClick={() => setShowSelectedHotspotMode(!showSelectedHotspotMode)}
            color={showSelectedHotspotMode ? "primary" : "default"}
          >
            {showSelectedHotspotMode ? <VisibilityIcon /> : <VisibilityOffIcon />}
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Name"
              value={draft.name}
              onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Repeat"
              type="number"
              value={draft.repeat ?? 1}
              onChange={(event) => {
                const parsed = Number.parseInt(event.target.value, 10);
                setDraft((previous) => ({
                  ...previous,
                  repeat: Number.isFinite(parsed) ? parsed : 1,
                }));
              }}
              helperText="0/1 = once, >1 = fixed loops, -1 = infinite"
              sx={{ width: { xs: "100%", md: 260 } }}
            />
          </Stack>

          <TextField
            label="Description"
            multiline
            minRows={2}
            value={draft.description ?? ""}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                description: event.target.value,
              }))
            }
            fullWidth
          />

          <Divider />

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained" onClick={handleAddStep}>
              Add Step
            </Button>
            <Button variant="outlined" onClick={handleDuplicateStep} disabled={!selectedStep}>
              Duplicate Step
            </Button>
            <Button variant="outlined" color="error" onClick={handleDeleteStep} disabled={!selectedStep}>
              Delete Step
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper variant="outlined" sx={{ p: 1, minWidth: { xs: "100%", md: 280 }, maxHeight: 460, overflowY: "auto" }}>
              <Stack spacing={1}>
                {sortedSteps.map((step, index) => (
                  <Button
                    key={step.id}
                    variant={selectedStep?.id === step.id ? "contained" : "text"}
                    onClick={() => setSelectedStepId(step.id)}
                    sx={{ justifyContent: "flex-start", textTransform: "none" }}
                  >
                    {index + 1}. {step.label || "Unnamed step"} ({step.atMs} ms)
                  </Button>
                ))}
                {sortedSteps.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No steps yet. Add your first step.
                  </Typography>
                )}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
              {selectedStep ? (
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      label="At (ms)"
                      type="number"
                      value={selectedStep.atMs}
                      onChange={(event) => {
                        const atMs = Math.max(0, Number.parseInt(event.target.value, 10) || 0);
                        updateSelectedStep((step) => ({ ...step, atMs }));
                      }}
                      sx={{ width: { xs: "100%", sm: 200 } }}
                    />
                    <TextField
                      label="Label"
                      value={selectedStep.label ?? ""}
                      onChange={(event) => updateSelectedStep((step) => ({ ...step, label: event.target.value }))}
                      fullWidth
                    />
                  </Stack>

                  <Autocomplete
                    multiple
                    options={hotspotOptions}
                    getOptionLabel={(option) => option.label}
                    value={hotspotOptions.filter((option) =>
                      selectedStep.changes.some((change) => change.hotspotId === option.id),
                    )}
                    onChange={(_event, nextSelected) => {
                      const selectedIds = new Set(nextSelected.map((entry) => entry.id));
                      updateSelectedStep((step) => {
                        const preserved = step.changes.filter((change) => selectedIds.has(change.hotspotId));
                        const toAdd = [...selectedIds]
                          .filter((id) => !preserved.some((change) => change.hotspotId === id))
                          .map((id) => ({ hotspotId: id, state: "off" as SimState, motion: "none" as SimMotion }));

                        return {
                          ...step,
                          changes: [...preserved, ...toAdd],
                        };
                      });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Hotspots in this step"
                        placeholder="Select one or more hotspots"
                      />
                    )}
                  />

                  <TextField
                    label="Hotspot-Schnellsuche"
                    placeholder="z.B. sensor, conveyor, rfid"
                    value={hotspotQuickFilter}
                    onChange={(event) => setHotspotQuickFilter(event.target.value)}
                    size="small"
                  />

                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {quickFilteredHotspots.map((option) => (
                      <Button
                        key={option.id}
                        variant="outlined"
                        size="small"
                        onClick={() => addHotspotToSelectedStep(option.id)}
                        sx={{ textTransform: "none" }}
                      >
                        {option.id}
                      </Button>
                    ))}
                  </Stack>

                  <Stack spacing={1.25}>
                    {selectedStep.changes.map((change) => (
                      <Paper key={change.hotspotId} variant="outlined" sx={{ p: 1.5 }}>
                        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                          <Tooltip title={MAP_HOTSPOTS.find((item) => item.id === change.hotspotId)?.name ?? change.hotspotId}>
                            <Typography sx={{ minWidth: { md: 200 }, fontWeight: 600 }}>{change.hotspotId}</Typography>
                          </Tooltip>
                          <TextField
                            select
                            label="State"
                            size="small"
                            value={change.state ?? "off"}
                            onChange={(event) => {
                              const value = event.target.value as SimState;
                              updateSelectedStep((step) => ({
                                ...step,
                                changes: step.changes.map((entry) =>
                                  entry.hotspotId === change.hotspotId ? { ...entry, state: value } : entry,
                                ),
                              }));
                            }}
                            sx={{ minWidth: 120 }}
                          >
                            {stateOptions.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            label="Rotation (deg)"
                            type="number"
                            size="small"
                            value={change.rotationDeg ?? ""}
                            onChange={(event) => {
                              const text = event.target.value;
                              updateSelectedStep((step) => ({
                                ...step,
                                changes: step.changes.map((entry) => {
                                  if (entry.hotspotId !== change.hotspotId) {
                                    return entry;
                                  }
                                  if (text.trim().length === 0) {
                                    const { rotationDeg: _removed, ...rest } = entry;
                                    return rest;
                                  }
                                  return {
                                    ...entry,
                                    rotationDeg: Number.parseInt(text, 10) || 0,
                                  };
                                }),
                              }));
                            }}
                            sx={{ minWidth: 140 }}
                          />
                          <TextField
                            select
                            label="Motion"
                            size="small"
                            value={change.motion ?? "none"}
                            onChange={(event) => {
                              const value = event.target.value as SimMotion;
                              updateSelectedStep((step) => ({
                                ...step,
                                changes: step.changes.map((entry) =>
                                  entry.hotspotId === change.hotspotId ? { ...entry, motion: value } : entry,
                                ),
                              }));
                            }}
                            sx={{ minWidth: 220 }}
                          >
                            {motionOptions.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Select or create a step to edit details.
                </Typography>
              )}
            </Paper>
          </Stack>

          {validationError && (
            <Typography color="error" variant="body2">
              {validationError}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleTest} color="secondary" disabled={busy}>
          Test Simulation
        </Button>
        {initialSimulationId && (
          <Button onClick={handleDeleteSimulation} color="error" disabled={busy}>
            Delete Simulation
          </Button>
        )}
        <Button onClick={handleSave} variant="contained" disabled={busy}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
