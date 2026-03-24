import { disconnect } from "./mqttClient";
import { setLiveConnectionState } from "./liveComponentService";
import {
  getSimulationRuntimeState,
  replaceSimulations,
  runSimulationPreview,
  simulationStore,
  subscribeSimulationStore,
} from "../store/simulationStore";
import type {
  SimMotion,
  SimState,
  SimulationConfig,
  SimulationRuntimeState,
  SimulationStep,
  SimulationStore,
} from "../types/simulation";

export type SimulationScenarioId = "plant-designer";
export type SimulationSpeed = "normal";

export type SimulationState = SimulationRuntimeState & {
  enabled: boolean;
  scenario: SimulationScenarioId;
  speed: SimulationSpeed;
  startedAt: number | null;
};

let lastRuntimeSnapshot: SimulationRuntimeState | null = null;
let lastCompatibilitySnapshot: SimulationState | null = null;

function toCompatibilityState(state: SimulationRuntimeState): SimulationState {
  if (lastRuntimeSnapshot === state && lastCompatibilitySnapshot) {
    return lastCompatibilitySnapshot;
  }

  const compatibility: SimulationState = {
    ...state,
    enabled: state.simulationEnabled,
    scenario: "plant-designer",
    speed: "normal",
    startedAt: state.running ? Date.now() - state.nowMs : null,
  };

  lastRuntimeSnapshot = state;
  lastCompatibilitySnapshot = compatibility;
  return compatibility;
}

function disconnectLiveMqtt(): void {
  void disconnect().catch(() => {
    // Simulation mode should still work even if disconnect fails.
  });
  setLiveConnectionState(false);
}

export function initializeSimulation(): void {
  const runtime = simulationStore.state;
  if (runtime.simulationEnabled) {
    disconnectLiveMqtt();
  }
}

export function getSimulationState(): SimulationState {
  return toCompatibilityState(getSimulationRuntimeState());
}

export function subscribeSimulationState(listener: (nextState: SimulationState) => void): () => void {
  return subscribeSimulationStore((next) => {
    listener(toCompatibilityState(next));
  });
}

export function enableSimulation(): void {
  disconnectLiveMqtt();
  simulationStore.enableSimulation();
}

export function disableSimulation(): void {
  simulationStore.disableSimulation();
}

export function updateSimulationConfig(_partialConfig?: unknown): void {
  // Compatibility no-op: speed/scenario are not used in designer mode.
}

export function getSimulationScenarios(): Array<{ id: SimulationScenarioId; name: string }> {
  return [{ id: "plant-designer", name: "Simulation Designer" }];
}

export function startSimulation(): void {
  enableSimulation();
}

export function stopSimulation(): void {
  simulationStore.stopSimulation();
}

export function runSimulation(simId: string): void {
  simulationStore.runSimulation(simId);
}

export function runPreviewSimulation(config: SimulationConfig): void {
  runSimulationPreview(config);
}

export function getSimulations(): SimulationConfig[] {
  return simulationStore.getSimulations();
}

export function getSimulation(id: string): SimulationConfig | undefined {
  return simulationStore.getSimulation(id);
}

export function createSimulation(input: {
  name: string;
  description?: string;
  repeat?: number;
}): SimulationConfig {
  return simulationStore.createSimulation(input);
}

export function updateSimulation(config: SimulationConfig): void {
  simulationStore.updateSimulation(config);
}

export function deleteSimulation(id: string): void {
  simulationStore.deleteSimulation(id);
}

export function setSimulations(simulations: SimulationConfig[]): void {
  replaceSimulations(simulations);
}

export function addStep(simId: string, step: Omit<SimulationStep, "id">): void {
  simulationStore.addStep(simId, step);
}

export function updateStep(simId: string, stepId: string, patch: Partial<SimulationStep>): void {
  simulationStore.updateStep(simId, stepId, patch);
}

export function deleteStep(simId: string, stepId: string): void {
  simulationStore.deleteStep(simId, stepId);
}

export function resetHotspotStates(): void {
  simulationStore.resetHotspotStates();
}

export function setHotspotState(
  hotspotId: string,
  partial: {
    state?: SimState;
    rotationDeg?: number;
    motion?: SimMotion;
  },
): void {
  simulationStore.setHotspotState(hotspotId, partial);
}

export const simulationApi: SimulationStore = simulationStore;
