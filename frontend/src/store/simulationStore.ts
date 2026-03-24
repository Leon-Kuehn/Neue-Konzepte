import { MAP_HOTSPOTS } from "../entryRoute/mapHotspots";
import type {
  SimMotion,
  SimulationConfig,
  SimulationRuntimeState,
  SimulationStep,
  SimulationStepChange,
  SimulationStore,
} from "../types/simulation";

const STORAGE_KEY = "simulation-designer-state";

const listeners = new Set<(state: SimulationRuntimeState) => void>();
let runToken = 0;
let remainingRepeats = 0;

function generateId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

function sortSteps(steps: SimulationStep[]): SimulationStep[] {
  return [...steps].sort((a, b) => a.atMs - b.atMs);
}

function getHotspotDefaultStates(): SimulationRuntimeState["hotspotStates"] {
  const entries = MAP_HOTSPOTS.map((hotspot) => [
    hotspot.id,
    {
      state: "off" as const,
      rotationDeg: hotspot.rotation ?? 0,
      motion: "none" as SimMotion,
    },
  ]);

  return Object.fromEntries(entries);
}

function getDefaultDemoSimulation(): SimulationConfig {
  return {
    id: "entry-route-demo",
    name: "Entry Route Demo",
    description: "Default demo simulation for the entry route flow.",
    repeat: 1,
    steps: [
      {
        id: generateId("step"),
        label: "Entry starts",
        atMs: 0,
        changes: [
          { hotspotId: "inductive-1", state: "on" },
          { hotspotId: "conveyor-1", state: "on", motion: "rotate-clockwise" },
        ],
      },
      {
        id: generateId("step"),
        label: "Sensor 1 clears",
        atMs: 1000,
        changes: [{ hotspotId: "inductive-1", state: "off" }],
      },
      {
        id: generateId("step"),
        label: "Transfer to next section",
        atMs: 1500,
        changes: [
          { hotspotId: "inductive-2", state: "on" },
          { hotspotId: "rfid-1", state: "on" },
        ],
      },
      {
        id: generateId("step"),
        label: "Conveyor 2 moves",
        atMs: 2500,
        changes: [
          { hotspotId: "conveyor-2", state: "on", motion: "rotate-clockwise" },
          { hotspotId: "inductive-2", state: "off" },
          { hotspotId: "rfid-1", state: "off" },
        ],
      },
    ],
  };
}

function createDefaultState(): SimulationRuntimeState {
  return {
    simulationEnabled: false,
    currentSimulationId: undefined,
    running: false,
    nowMs: 0,
    timers: [],
    hotspotStates: getHotspotDefaultStates(),
    simulations: [getDefaultDemoSimulation()],
  };
}

function loadState(): SimulationRuntimeState {
  if (typeof localStorage === "undefined") {
    return createDefaultState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<SimulationRuntimeState>;
    const parsedSimulations = Array.isArray(parsed.simulations)
      ? parsed.simulations.filter((sim): sim is SimulationConfig => Boolean(sim && sim.id && sim.name))
      : [];

    return {
      ...createDefaultState(),
      simulationEnabled: parsed.simulationEnabled === true,
      simulations: parsedSimulations.length > 0 ? parsedSimulations : [getDefaultDemoSimulation()],
      hotspotStates: getHotspotDefaultStates(),
      timers: [],
      running: false,
      nowMs: 0,
      currentSimulationId: undefined,
    };
  } catch {
    return createDefaultState();
  }
}

let state: SimulationRuntimeState = loadState();

function persistState(): void {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      simulationEnabled: state.simulationEnabled,
      simulations: state.simulations,
    }),
  );
}

function publishState(): void {
  for (const listener of listeners) {
    listener(state);
  }
}

function setState(
  updater: (previous: SimulationRuntimeState) => SimulationRuntimeState,
  options?: { persist?: boolean },
): void {
  state = updater(state);
  if (options?.persist) {
    persistState();
  }
  publishState();
}

function withTimer(timerId: number): void {
  setState((previous) => ({
    ...previous,
    timers: [...previous.timers, timerId],
  }));
}

function runSimulationConfig(simulation: SimulationConfig): void {
  clearAllTimers();
  simulationStore.resetHotspotStates();
  runToken += 1;
  remainingRepeats = simulation.repeat === -1 ? -1 : Math.max(1, simulation.repeat ?? 1);

  const token = runToken;

  setState((previous) => ({
    ...previous,
    currentSimulationId: simulation.id,
    running: true,
    nowMs: 0,
  }));

  scheduleSimulationSteps(simulation, token);
}

function clearAllTimers(): void {
  for (const timerId of state.timers) {
    clearTimeout(timerId);
    clearInterval(timerId);
  }

  setState((previous) => ({
    ...previous,
    timers: [],
  }));
}

function applyStepChanges(changes: SimulationStepChange[]): void {
  setState((previous) => {
    const nextHotspotStates = { ...previous.hotspotStates };

    for (const change of changes) {
      if (!nextHotspotStates[change.hotspotId]) {
        continue;
      }

      nextHotspotStates[change.hotspotId] = {
        ...nextHotspotStates[change.hotspotId],
        ...(change.state !== undefined ? { state: change.state } : {}),
        ...(change.rotationDeg !== undefined ? { rotationDeg: change.rotationDeg } : {}),
        ...(change.motion !== undefined ? { motion: change.motion } : {}),
      };
    }

    return {
      ...previous,
      hotspotStates: nextHotspotStates,
    };
  });
}

function finishRun(token: number): void {
  if (token !== runToken) {
    return;
  }

  setState((previous) => ({
    ...previous,
    running: false,
  }));
}

function scheduleSimulationSteps(simulation: SimulationConfig, token: number): void {
  const sortedSteps = sortSteps(simulation.steps);
  const lastStepAt = sortedSteps.at(-1)?.atMs ?? 0;

  for (const step of sortedSteps) {
    const timeoutId = setTimeout(() => {
      if (token !== runToken) {
        return;
      }

      setState((previous) => ({
        ...previous,
        nowMs: step.atMs,
      }));
      applyStepChanges(step.changes);
    }, Math.max(0, step.atMs));

    withTimer(timeoutId as unknown as number);
  }

  const cycleEndTimer = setTimeout(() => {
    if (token !== runToken) {
      return;
    }

    if (simulation.repeat === -1) {
      simulationStore.resetHotspotStates();
      scheduleSimulationSteps(simulation, token);
      return;
    }

    if (remainingRepeats > 1) {
      remainingRepeats -= 1;
      simulationStore.resetHotspotStates();
      scheduleSimulationSteps(simulation, token);
      return;
    }

    finishRun(token);
  }, Math.max(0, lastStepAt + 10));

  withTimer(cycleEndTimer as unknown as number);
}

function runInitialCheck(): void {
  const allHotspotIds = Object.keys(state.hotspotStates);

  setState((previous) => {
    const nextStates = { ...previous.hotspotStates };
    for (const hotspotId of allHotspotIds) {
      nextStates[hotspotId] = {
        ...nextStates[hotspotId],
        state: "on",
      };
    }

    return {
      ...previous,
      hotspotStates: nextStates,
    };
  });

  const backToOffTimer = setTimeout(() => {
    simulationStore.resetHotspotStates();

    if (Math.random() < 0.08) {
      const hotspotId = allHotspotIds[Math.floor(Math.random() * allHotspotIds.length)];
      if (hotspotId) {
        simulationStore.setHotspotState(hotspotId, { state: "error" });
      }
    }
  }, 450);

  withTimer(backToOffTimer as unknown as number);
}

export const simulationStore: SimulationStore = {
  get state() {
    return state;
  },

  enableSimulation() {
    clearAllTimers();
    setState((previous) => ({
      ...previous,
      simulationEnabled: true,
      running: false,
      nowMs: 0,
      currentSimulationId: undefined,
    }), { persist: true });

    runInitialCheck();
  },

  disableSimulation() {
    clearAllTimers();
    runToken += 1;
    remainingRepeats = 0;

    setState((previous) => ({
      ...previous,
      simulationEnabled: false,
      running: false,
      nowMs: 0,
      currentSimulationId: undefined,
      hotspotStates: getHotspotDefaultStates(),
    }), { persist: true });
  },

  getSimulations() {
    return state.simulations;
  },

  getSimulation(id) {
    return state.simulations.find((simulation) => simulation.id === id);
  },

  createSimulation(input) {
    const created: SimulationConfig = {
      id: generateId("simulation"),
      name: input.name,
      description: input.description,
      repeat: input.repeat,
      steps: [],
    };

    setState((previous) => ({
      ...previous,
      simulations: [...previous.simulations, created],
    }), { persist: true });

    return created;
  },

  updateSimulation(config) {
    setState((previous) => ({
      ...previous,
      simulations: previous.simulations.map((simulation) =>
        simulation.id === config.id
          ? {
              ...config,
              steps: sortSteps(config.steps),
            }
          : simulation,
      ),
    }), { persist: true });
  },

  deleteSimulation(id) {
    setState((previous) => ({
      ...previous,
      simulations: previous.simulations.filter((simulation) => simulation.id !== id),
      ...(previous.currentSimulationId === id ? { currentSimulationId: undefined, running: false } : {}),
    }), { persist: true });
  },

  addStep(simId, step) {
    const createdStep: SimulationStep = {
      ...step,
      id: generateId("step"),
      changes: [...step.changes],
    };

    setState((previous) => ({
      ...previous,
      simulations: previous.simulations.map((simulation) =>
        simulation.id === simId
          ? {
              ...simulation,
              steps: sortSteps([...simulation.steps, createdStep]),
            }
          : simulation,
      ),
    }), { persist: true });
  },

  updateStep(simId, stepId, patch) {
    setState((previous) => ({
      ...previous,
      simulations: previous.simulations.map((simulation) => {
        if (simulation.id !== simId) {
          return simulation;
        }

        const updatedSteps = simulation.steps.map((step) =>
          step.id === stepId
            ? {
                ...step,
                ...patch,
                changes: patch.changes ?? step.changes,
              }
            : step,
        );

        return {
          ...simulation,
          steps: sortSteps(updatedSteps),
        };
      }),
    }), { persist: true });
  },

  deleteStep(simId, stepId) {
    setState((previous) => ({
      ...previous,
      simulations: previous.simulations.map((simulation) =>
        simulation.id === simId
          ? {
              ...simulation,
              steps: simulation.steps.filter((step) => step.id !== stepId),
            }
          : simulation,
      ),
    }), { persist: true });
  },

  runSimulation(simId) {
    const simulation = simulationStore.getSimulation(simId);
    if (!simulation || !state.simulationEnabled) {
      return;
    }

    runSimulationConfig(simulation);
  },

  stopSimulation() {
    clearAllTimers();
    runToken += 1;
    remainingRepeats = 0;

    setState((previous) => ({
      ...previous,
      running: false,
      nowMs: 0,
      currentSimulationId: undefined,
    }));
  },

  resetHotspotStates() {
    setState((previous) => ({
      ...previous,
      hotspotStates: getHotspotDefaultStates(),
    }));
  },

  setHotspotState(hotspotId, partial) {
    if (!state.hotspotStates[hotspotId]) {
      return;
    }

    setState((previous) => ({
      ...previous,
      hotspotStates: {
        ...previous.hotspotStates,
        [hotspotId]: {
          ...previous.hotspotStates[hotspotId],
          ...partial,
        },
      },
    }));
  },
};

export function subscribeSimulationStore(
  listener: (state: SimulationRuntimeState) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getSimulationRuntimeState(): SimulationRuntimeState {
  return simulationStore.state;
}

export function replaceSimulations(simulations: SimulationConfig[]): void {
  setState(
    (previous) => ({
      ...previous,
      simulations: simulations.length > 0 ? simulations.map((entry) => ({
        ...entry,
        steps: sortSteps(entry.steps ?? []),
      })) : [getDefaultDemoSimulation()],
    }),
    { persist: true },
  );
}

export function runSimulationPreview(config: SimulationConfig): void {
  const normalized: SimulationConfig = {
    ...config,
    id: config.id || generateId('simulation-preview'),
    steps: sortSteps(config.steps ?? []),
  };

  if (!state.simulationEnabled) {
    simulationStore.enableSimulation();
  }

  clearAllTimers();
  simulationStore.resetHotspotStates();
  runToken += 1;
  remainingRepeats = normalized.repeat === -1 ? -1 : Math.max(1, normalized.repeat ?? 1);

  const token = runToken;

  setState((previous) => ({
    ...previous,
    currentSimulationId: normalized.id,
    running: true,
    nowMs: 0,
  }));

  scheduleSimulationSteps(normalized, token);
}
