export type SimState = "off" | "on" | "error";

export type SimMotion =
  | "none"
  | "rotate-clockwise"
  | "rotate-counterclockwise"
  | "oscillate";

export interface SimulationStepChange {
  hotspotId: string;
  state?: SimState;
  rotationDeg?: number;
  motion?: SimMotion;
}

export interface SimulationStep {
  id: string;
  label?: string;
  atMs: number;
  changes: SimulationStepChange[];
}

export interface SimulationConfig {
  id: string;
  name: string;
  description?: string;
  repeat?: number;
  steps: SimulationStep[];
}

export interface SimulationRuntimeState {
  simulationEnabled: boolean;
  currentSimulationId?: string;
  running: boolean;
  nowMs: number;
  timers: number[];
  hotspotStates: Record<
    string,
    {
      state: SimState;
      rotationDeg?: number;
      motion?: SimMotion;
    }
  >;
  simulations: SimulationConfig[];
}

export interface SimulationStore {
  state: SimulationRuntimeState;
  enableSimulation(): void;
  disableSimulation(): void;
  getSimulations(): SimulationConfig[];
  getSimulation(id: string): SimulationConfig | undefined;
  createSimulation(input: { name: string; description?: string; repeat?: number }): SimulationConfig;
  updateSimulation(config: SimulationConfig): void;
  deleteSimulation(id: string): void;
  addStep(simId: string, step: Omit<SimulationStep, "id">): void;
  updateStep(simId: string, stepId: string, patch: Partial<SimulationStep>): void;
  deleteStep(simId: string, stepId: string): void;
  runSimulation(simId: string): void;
  stopSimulation(): void;
  resetHotspotStates(): void;
  setHotspotState(
    hotspotId: string,
    partial: {
      state?: SimState;
      rotationDeg?: number;
      motion?: SimMotion;
    }
  ): void;
}
