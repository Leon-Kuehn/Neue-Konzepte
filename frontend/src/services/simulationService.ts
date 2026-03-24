import { disconnect } from "./mqttClient";
import { applySimulationComponentPayload, setLiveConnectionState } from "./liveComponentService";
import { resolveComponentId } from "../entryRoute/componentBindings";
import { ingestSensorData } from "./sensorDataApi";
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
let simulationBridgeInitialized = false;
let previousBridgeState: SimulationRuntimeState | null = null;

function pushSimulationEventToBackend(
  componentId: string,
  hotspotId: string,
  state: SimState,
  rotationDeg?: number,
): void {
  const health = state === "error" ? "error" : "ok";
  const status = state === "on" ? "on" : "off";

  void ingestSensorData({
    componentId,
    topic: `plant/${componentId}/status`,
    payload: {
      status,
      online: true,
      health,
      rotationDeg,
      value: status === "on",
      source: "simulation",
      hotspotId,
    },
  }).catch(() => {
    // Simulation should continue even if backend ingest is temporarily unavailable.
  });
}

function bridgeHotspotStateChange(
  hotspotId: string,
  nextHotspot: SimulationRuntimeState["hotspotStates"][string],
): void {
  const componentId = resolveComponentId(hotspotId);
  const health = nextHotspot.state === "error" ? "error" : "ok";
  const status = nextHotspot.state === "on" ? "on" : "off";

  applySimulationComponentPayload(componentId, {
    status,
    online: true,
    health,
    rotationDeg: nextHotspot.rotationDeg,
    value: status === "on",
  });

  pushSimulationEventToBackend(componentId, hotspotId, nextHotspot.state, nextHotspot.rotationDeg);
}

function initializeSimulationDataBridge(): void {
  if (simulationBridgeInitialized) {
    return;
  }

  simulationBridgeInitialized = true;

  subscribeSimulationStore((nextState) => {
    const previousState = previousBridgeState;
    previousBridgeState = nextState;

    if (!previousState) {
      return;
    }

    // Process while simulation is active and also for the transition back to live mode.
    if (!nextState.simulationEnabled && !previousState.simulationEnabled) {
      return;
    }

    for (const [hotspotId, nextHotspot] of Object.entries(nextState.hotspotStates)) {
      const prevHotspot = previousState.hotspotStates[hotspotId];
      if (!prevHotspot) {
        continue;
      }

      if (
        prevHotspot.state === nextHotspot.state &&
        prevHotspot.rotationDeg === nextHotspot.rotationDeg &&
        prevHotspot.motion === nextHotspot.motion
      ) {
        continue;
      }

      bridgeHotspotStateChange(hotspotId, nextHotspot);
    }
  });
}

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
  initializeSimulationDataBridge();

  const runtime = simulationStore.state;
  previousBridgeState = runtime;
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
