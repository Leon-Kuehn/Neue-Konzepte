import { mockComponents } from "../types/mockData";
import type { PlantComponent } from "../types/PlantComponent";
import { injectIncomingMessage } from "./mqttClient";

export type SimulationScenarioId = "plant-demo";
export type SimulationSpeed = "normal" | "fast";

export interface SimulationState {
  enabled: boolean;
  scenario: SimulationScenarioId;
  speed: SimulationSpeed;
  startedAt: number | null;
}

export interface SimulatedEvent {
  kind: "component" | "sensor" | "warehouse" | "fault";
  topic: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

export interface SimulationScenario {
  id: SimulationScenarioId;
  name: string;
  description: string;
  start: (context: SimulationContext) => () => void;
}

interface SimulationContext {
  emit: (event: Omit<SimulatedEvent, "timestamp">) => void;
  speedFactor: number;
  trackInterval: (callback: () => void, ms: number) => void;
  trackTimeout: (callback: () => void, ms: number) => void;
}

type RuntimeComponentState = {
  cycles: number;
  uptimeHours: number;
  rotationDeg: number;
  online: boolean;
};

const STORAGE_KEY = "simulation-state";

const runtimeByComponent = new Map<string, RuntimeComponentState>();
const intervals = new Set<ReturnType<typeof setInterval>>();
const timeouts = new Set<ReturnType<typeof setTimeout>>();
const listeners = new Set<(state: SimulationState) => void>();

let scenarioCleanup: (() => void) | null = null;
let isInitialized = false;

const defaultState: SimulationState = {
  enabled: false,
  scenario: "plant-demo",
  speed: "normal",
  startedAt: null,
};

let state: SimulationState = loadState();

const randomPick = <T>(items: readonly T[]): T => {
  return items[Math.floor(Math.random() * items.length)] as T;
};

const speedFactor = (speed: SimulationSpeed): number => (speed === "fast" ? 2 : 1);

function loadState(): SimulationState {
  if (typeof localStorage === "undefined") {
    return { ...defaultState };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...defaultState };
    }
    const parsed = JSON.parse(raw) as Partial<SimulationState>;
    return {
      enabled: Boolean(parsed.enabled),
      scenario: parsed.scenario === "plant-demo" ? parsed.scenario : "plant-demo",
      speed: parsed.speed === "fast" ? "fast" : "normal",
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
    };
  } catch {
    return { ...defaultState };
  }
}

function persistState(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function notifyState(): void {
  for (const listener of listeners) {
    listener(state);
  }
}

function clearScheduledTasks(): void {
  for (const id of intervals) {
    clearInterval(id);
  }
  intervals.clear();

  for (const id of timeouts) {
    clearTimeout(id);
  }
  timeouts.clear();
}

function emit(event: Omit<SimulatedEvent, "timestamp">): void {
  const completeEvent: SimulatedEvent = {
    ...event,
    timestamp: Date.now(),
  };
  injectIncomingMessage(completeEvent.topic, JSON.stringify(completeEvent.payload));
}

function scheduleInterval(callback: () => void, baseMs: number): void {
  const intervalId = setInterval(callback, Math.max(400, Math.floor(baseMs / speedFactor(state.speed))));
  intervals.add(intervalId);
}

function scheduleTimeout(callback: () => void, baseMs: number): void {
  const timeoutId = setTimeout(() => {
    timeouts.delete(timeoutId);
    callback();
  }, Math.max(200, Math.floor(baseMs / speedFactor(state.speed))));
  timeouts.add(timeoutId);
}

function getRuntime(component: PlantComponent): RuntimeComponentState {
  const existing = runtimeByComponent.get(component.id);
  if (existing) {
    return existing;
  }

  const created: RuntimeComponentState = {
    cycles: component.stats.cycles ?? 0,
    uptimeHours: component.stats.uptimeHours ?? 0,
    rotationDeg: 0,
    online: component.online,
  };
  runtimeByComponent.set(component.id, created);
  return created;
}

function getRandomSensorValue(componentId: string): number | boolean {
  if (componentId.includes("rfid")) {
    return Math.random() > 0.55;
  }
  if (componentId.includes("inductive") || componentId.includes("lightbarrier")) {
    return Math.random() > 0.45;
  }
  return Number((Math.random() * 100).toFixed(1));
}

const plantDemoScenario: SimulationScenario = {
  id: "plant-demo",
  name: "Plant Demo",
  description: "Simulates moving conveyors, sensor activity, warehouse changes, and occasional faults.",
  start: (context) => {
    const actuators = mockComponents.filter((component) => component.role === "actuator");
    const sensors = mockComponents.filter((component) => component.role === "sensor");
    const rotatingConveyors = mockComponents.filter(
      (component) => component.category === "rotating-conveyor",
    );
    const faultCandidates = mockComponents.filter((component) => component.category !== "storage");
    const highBayStorage = mockComponents.find((component) => component.category === "storage");
    const warehouseSlots = ["R1C2", "R2C6", "R3C7", "R4C10", "R5C4", "R5C8"];
    const slotOccupancy = new Map<string, boolean>(warehouseSlots.map((slot) => [slot, false]));

    // Start from a clean baseline so the scenario visibly "comes alive" over time.
    for (const component of mockComponents) {
      const runtime = getRuntime(component);
      runtime.online = true;

      context.emit({
        kind: "component",
        topic: `plant/${component.id}/status`,
        payload: {
          status: "off",
          online: true,
          cycles: runtime.cycles,
          uptimeHours: Number(runtime.uptimeHours.toFixed(2)),
          health: "ok",
          rotationDeg: 0,
        },
      });
    }

    for (const slot of warehouseSlots) {
      context.emit({
        kind: "warehouse",
        topic: `hochregallager/slot/${slot}/status`,
        payload: {
          slotId: slot,
          occupied: false,
          status: "ok",
          quantity: 0,
          updatedAt: new Date().toISOString(),
        },
      });
    }

    context.trackInterval(() => {
      const component = randomPick(actuators);
      const runtime = getRuntime(component);
      runtime.online = true;
      runtime.cycles += 1 + Math.floor(Math.random() * 4);
      runtime.uptimeHours += 0.03;

      const isRunning = Math.random() > 0.35;
      context.emit({
        kind: "component",
        topic: `plant/${component.id}/status`,
        payload: {
          status: isRunning ? "on" : "off",
          online: true,
          cycles: runtime.cycles,
          uptimeHours: Number(runtime.uptimeHours.toFixed(2)),
          health: "ok",
        },
      });
    }, 4200);

    context.trackInterval(() => {
      if (rotatingConveyors.length === 0) {
        return;
      }
      const component = randomPick(rotatingConveyors);
      const runtime = getRuntime(component);
      runtime.online = true;
      runtime.rotationDeg = (runtime.rotationDeg + 90) % 360;
      runtime.cycles += 1;
      runtime.uptimeHours += 0.02;

      context.emit({
        kind: "component",
        topic: `plant/${component.id}/status`,
        payload: {
          status: "on",
          online: true,
          cycles: runtime.cycles,
          uptimeHours: Number(runtime.uptimeHours.toFixed(2)),
          rotationDeg: runtime.rotationDeg,
          health: "ok",
        },
      });
    }, 5800);

    context.trackInterval(() => {
      const sensor = randomPick(sensors);
      const runtime = getRuntime(sensor);
      runtime.online = true;
      runtime.cycles += 1;
      runtime.uptimeHours += 0.01;

      const injectAnomaly = Math.random() < 0.08;
      const value = injectAnomaly ? 9999 : getRandomSensorValue(sensor.id);

      context.emit({
        kind: "sensor",
        topic: `plant/${sensor.id}/status`,
        payload: {
          status: injectAnomaly ? "error" : "on",
          online: true,
          cycles: runtime.cycles,
          uptimeHours: Number(runtime.uptimeHours.toFixed(2)),
          value,
          sensorError: injectAnomaly,
          health: injectAnomaly ? "error" : "ok",
        },
      });
    }, 2600);

    context.trackInterval(() => {
      const slot = randomPick(warehouseSlots);
      const occupied = !(slotOccupancy.get(slot) ?? false);
      slotOccupancy.set(slot, occupied);

      context.emit({
        kind: "warehouse",
        topic: `hochregallager/slot/${slot}/status`,
        payload: {
          slotId: slot,
          occupied,
          status: "ok",
          quantity: occupied ? 1 + Math.floor(Math.random() * 50) : 0,
          updatedAt: new Date().toISOString(),
        },
      });

      if (highBayStorage) {
        const runtime = getRuntime(highBayStorage);
        runtime.online = true;
        runtime.cycles += 1;
        runtime.uptimeHours += 0.02;

        context.emit({
          kind: "component",
          topic: `plant/${highBayStorage.id}/status`,
          payload: {
            status: "on",
            online: true,
            cycles: runtime.cycles,
            uptimeHours: Number(runtime.uptimeHours.toFixed(2)),
            health: "ok",
          },
        });

        context.trackTimeout(() => {
          context.emit({
            kind: "component",
            topic: `plant/${highBayStorage.id}/status`,
            payload: {
              status: "off",
              online: true,
              cycles: runtime.cycles,
              uptimeHours: Number(runtime.uptimeHours.toFixed(2)),
              health: "ok",
            },
          });
        }, 3200);
      }
    }, 6400);

    context.trackInterval(() => {
      const component = randomPick(faultCandidates);
      const runtime = getRuntime(component);
      runtime.online = false;

      context.emit({
        kind: "fault",
        topic: `plant/${component.id}/status`,
        payload: {
          status: "error",
          online: false,
          cycles: runtime.cycles,
          uptimeHours: Number(runtime.uptimeHours.toFixed(2)),
          fault: true,
          faultMessage: "Simulated transient fault",
          health: "error",
        },
      });

      context.trackTimeout(() => {
        runtime.online = true;
        context.emit({
          kind: "component",
          topic: `plant/${component.id}/status`,
          payload: {
            status: component.role === "actuator" ? "on" : "off",
            online: true,
            cycles: runtime.cycles + 1,
            uptimeHours: Number((runtime.uptimeHours + 0.02).toFixed(2)),
            fault: false,
            health: "ok",
          },
        });
      }, 7200);
    }, 19000);

    return () => {
      // All cleanup is handled centrally by clearScheduledTasks.
    };
  },
};

const scenarios: Record<SimulationScenarioId, SimulationScenario> = {
  "plant-demo": plantDemoScenario,
};

function startScenario(): void {
  clearScheduledTasks();

  const scenario = scenarios[state.scenario];
  scenarioCleanup = scenario.start({
    emit,
    speedFactor: speedFactor(state.speed),
    trackInterval: scheduleInterval,
    trackTimeout: scheduleTimeout,
  });
}

export function initializeSimulation(): void {
  if (isInitialized) {
    return;
  }
  isInitialized = true;

  if (state.enabled) {
    state = { ...state, startedAt: state.startedAt ?? Date.now() };
    startScenario();
    notifyState();
  }
}

export function getSimulationState(): SimulationState {
  return state;
}

export function subscribeSimulationState(listener: (nextState: SimulationState) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function enableSimulation(
  partialConfig?: Partial<Pick<SimulationState, "scenario" | "speed">>,
): void {
  state = {
    ...state,
    ...partialConfig,
    enabled: true,
    startedAt: Date.now(),
  };

  startScenario();
  persistState();
  notifyState();
}

export function disableSimulation(): void {
  state = {
    ...state,
    enabled: false,
    startedAt: null,
  };

  scenarioCleanup?.();
  scenarioCleanup = null;
  clearScheduledTasks();
  persistState();
  notifyState();
}

export function updateSimulationConfig(
  partialConfig: Partial<Pick<SimulationState, "scenario" | "speed">>,
): void {
  state = {
    ...state,
    ...partialConfig,
  };

  if (state.enabled) {
    startScenario();
  }

  persistState();
  notifyState();
}

export function getSimulationScenarios(): SimulationScenario[] {
  return Object.values(scenarios);
}