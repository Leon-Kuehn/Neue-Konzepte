import { MAP_HOTSPOTS, type HotspotState } from "../entryRoute/mapHotspots";
import { resolveComponentId } from "../entryRoute/componentBindings";
import { injectIncomingMessage, disconnect } from "./mqttClient";
import { ingestSensorData } from "./sensorDataApi";
import { setLiveConnectionState } from "./liveComponentService";

export type SimulationScenarioId = "plant-demo";
export type SimulationSpeed = "normal" | "fast";
export type SimulationRecipeId = "recipe-a" | "recipe-b" | "recipe-c";
export type SimulationRecipeStatus = "idle" | "running" | "finished" | "error";
export type SimulationGroupId = "entry-route" | "high-bay";

export interface SimulationState {
  enabled: boolean;
  scenario: SimulationScenarioId;
  speed: SimulationSpeed;
  startedAt: number | null;
  selectedRecipe: SimulationRecipeId;
  recipeStatus: SimulationRecipeStatus;
  recipeMessage: string | null;
  activeGroups: SimulationGroupId[];
  hotspotStates: Record<string, HotspotState>;
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
  start: () => () => void;
}

export interface SimulationRecipe {
  id: SimulationRecipeId;
  name: string;
  description: string;
}

export interface SimulationGroup {
  id: SimulationGroupId;
  name: string;
  description: string;
}

type RuntimeComponentState = {
  cycles: number;
  uptimeHours: number;
};

const STORAGE_KEY = "simulation-state";
const DEFAULT_GROUPS: SimulationGroupId[] = ["entry-route", "high-bay"];

const runtimeByComponent = new Map<string, RuntimeComponentState>();
const intervals = new Set<ReturnType<typeof setInterval>>();
const timeouts = new Set<ReturnType<typeof setTimeout>>();
const listeners = new Set<(state: SimulationState) => void>();

let isInitialized = false;
let recipeRunToken = 0;

const defaultState: SimulationState = {
  enabled: false,
  scenario: "plant-demo",
  speed: "normal",
  startedAt: null,
  selectedRecipe: "recipe-a",
  recipeStatus: "idle",
  recipeMessage: null,
  activeGroups: DEFAULT_GROUPS,
  hotspotStates: {},
};

let state: SimulationState = loadState();
const knownHotspotIds = MAP_HOTSPOTS.map((hotspot) => hotspot.id);

const simulationGroups: SimulationGroup[] = [
  {
    id: "entry-route",
    name: "Entry Route",
    description: "Conveyors and sensors in the entry route area.",
  },
  {
    id: "high-bay",
    name: "High-Bay Storage",
    description: "High-bay storage actuator and related indicators.",
  },
];

const recipes: SimulationRecipe[] = [
  {
    id: "recipe-a",
    name: "Recipe A - Entry Route",
    description: "Runs the entry-route transfer sequence with sensors and conveyors.",
  },
  {
    id: "recipe-b",
    name: "Recipe B - Alternate Path",
    description: "Reserved for alternate transfer flow.",
  },
  {
    id: "recipe-c",
    name: "Recipe C - Buffer Cycle",
    description: "Reserved for buffering and release flow.",
  },
];

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
    const parsedGroups = Array.isArray(parsed.activeGroups)
      ? parsed.activeGroups.filter(
          (group): group is SimulationGroupId => group === "entry-route" || group === "high-bay",
        )
      : [];

    return {
      enabled: Boolean(parsed.enabled),
      scenario: parsed.scenario === "plant-demo" ? parsed.scenario : "plant-demo",
      speed: parsed.speed === "fast" ? "fast" : "normal",
      startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : null,
      selectedRecipe:
        parsed.selectedRecipe === "recipe-b"
          ? "recipe-b"
          : parsed.selectedRecipe === "recipe-c"
            ? "recipe-c"
            : "recipe-a",
      recipeStatus: "idle",
      recipeMessage: null,
      activeGroups: parsedGroups.length > 0 ? parsedGroups : [...DEFAULT_GROUPS],
      hotspotStates: {},
    };
  } catch {
    return { ...defaultState };
  }
}

function persistState(): void {
  if (typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      enabled: state.enabled,
      scenario: state.scenario,
      speed: state.speed,
      startedAt: state.startedAt,
      selectedRecipe: state.selectedRecipe,
      activeGroups: state.activeGroups,
    }),
  );
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

function groupForHotspot(hotspotId: string): SimulationGroupId {
  if (hotspotId.startsWith("highbay-storage")) {
    return "high-bay";
  }
  return "entry-route";
}

function isHotspotActive(hotspotId: string): boolean {
  return state.activeGroups.includes(groupForHotspot(hotspotId));
}

function getRuntime(componentId: string): RuntimeComponentState {
  const existing = runtimeByComponent.get(componentId);
  if (existing) {
    return existing;
  }

  const created: RuntimeComponentState = {
    cycles: 0,
    uptimeHours: 0,
  };
  runtimeByComponent.set(componentId, created);
  return created;
}

function emit(event: Omit<SimulatedEvent, "timestamp">): void {
  const completeEvent: SimulatedEvent = {
    ...event,
    timestamp: Date.now(),
  };
  injectIncomingMessage(completeEvent.topic, JSON.stringify(completeEvent.payload));

  // Mirror simulated events into backend history so analytics and timelines can be tested.
  void ingestSensorData({
    topic: completeEvent.topic,
    payload: completeEvent.payload,
    receivedAt: new Date(completeEvent.timestamp).toISOString(),
  }).catch(() => {
    // Ignore transient API failures so local simulation remains responsive.
  });
}

function scheduleTimeout(callback: () => void, baseMs: number): void {
  const timeoutId = setTimeout(() => {
    timeouts.delete(timeoutId);
    callback();
  }, Math.max(200, Math.floor(baseMs / speedFactor(state.speed))));
  timeouts.add(timeoutId);
}

function emitComponentState(componentId: string, nextState: HotspotState): void {
  const runtime = getRuntime(componentId);
  if (nextState === "on") {
    runtime.cycles += 1;
    runtime.uptimeHours += 0.02;
  }

  emit({
    kind: nextState === "error" ? "fault" : "component",
    topic: `plant/${componentId}/status`,
    payload: {
      status: nextState,
      online: nextState !== "error",
      health: nextState === "error" ? "error" : "ok",
      cycles: runtime.cycles,
      uptimeHours: Number(runtime.uptimeHours.toFixed(2)),
      fault: nextState === "error",
      faultMessage: nextState === "error" ? "Simulated recipe fault" : undefined,
      simulated: true,
    },
  });
}

function setSimStateInternal(hotspotId: string, nextState: HotspotState): void {
  if (!knownHotspotIds.includes(hotspotId)) {
    return;
  }

  if (!isHotspotActive(hotspotId)) {
    return;
  }

  const componentId = resolveComponentId(hotspotId);

  state = {
    ...state,
    hotspotStates: {
      ...state.hotspotStates,
      [hotspotId]: nextState,
    },
  };

  emitComponentState(componentId, nextState);
  notifyState();
}

function applyAllStates(nextState: HotspotState): void {
  for (const hotspotId of knownHotspotIds) {
    if (!isHotspotActive(hotspotId)) {
      continue;
    }
    setSimStateInternal(hotspotId, nextState);
  }
}

function runInitialCheckSequence(): void {
  applyAllStates("on");

  scheduleTimeout(() => {
    applyAllStates("off");

    // Rare startup fault injection to test operator reaction flows.
    if (Math.random() < 0.08) {
      const activeIds = knownHotspotIds.filter((id) => isHotspotActive(id));
      if (activeIds.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeIds.length);
        const hotspotId = activeIds[randomIndex];
        if (hotspotId) {
          setSimStateInternal(hotspotId, "error");
        }
      }
    }
  }, 1400);
}

function resetRecipeRuntime(status: SimulationRecipeStatus = "idle", message: string | null = null): void {
  recipeRunToken += 1;
  state = {
    ...state,
    recipeStatus: status,
    recipeMessage: message,
  };
  notifyState();
}

function runRecipeA(token: number): void {
  const steps: Array<{ delayMs: number; hotspotId: string; state: HotspotState }> = [
    { delayMs: 300, hotspotId: "input-station-1", state: "on" },
    { delayMs: 700, hotspotId: "inductive-1", state: "on" },
    { delayMs: 1100, hotspotId: "conveyor-1", state: "on" },
    { delayMs: 1700, hotspotId: "inductive-2", state: "on" },
    { delayMs: 2300, hotspotId: "rfid-1", state: "on" },
    { delayMs: 2900, hotspotId: "conveyor-2", state: "on" },
    { delayMs: 4000, hotspotId: "inductive-1", state: "off" },
    { delayMs: 4300, hotspotId: "inductive-2", state: "off" },
    { delayMs: 4600, hotspotId: "rfid-1", state: "off" },
    { delayMs: 5000, hotspotId: "conveyor-1", state: "off" },
    { delayMs: 5300, hotspotId: "conveyor-2", state: "off" },
    { delayMs: 5600, hotspotId: "input-station-1", state: "off" },
  ];

  for (const step of steps) {
    scheduleTimeout(() => {
      if (!state.enabled || recipeRunToken !== token) {
        return;
      }
      setSimStateInternal(step.hotspotId, step.state);
    }, step.delayMs);
  }

  scheduleTimeout(() => {
    if (!state.enabled || recipeRunToken !== token) {
      return;
    }
    state = {
      ...state,
      recipeStatus: "finished",
      recipeMessage: "Recipe A finished successfully.",
    };
    notifyState();
  }, 6100);
}

function runRecipePlaceholder(token: number, recipeName: string): void {
  scheduleTimeout(() => {
    if (!state.enabled || recipeRunToken !== token) {
      return;
    }
    state = {
      ...state,
      recipeStatus: "finished",
      recipeMessage: `${recipeName} placeholder completed.`,
    };
    notifyState();
  }, 1800);
}

export function initializeSimulation(): void {
  if (isInitialized) {
    return;
  }
  isInitialized = true;

  if (state.enabled) {
    state = { ...state, startedAt: state.startedAt ?? Date.now() };
    void disconnect().catch(() => {
      // MQTT disconnect failures should not block simulation startup.
    });
    setLiveConnectionState(false);
    runInitialCheckSequence();
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
  void disconnect().catch(() => {
    // MQTT disconnect failures should not block simulation startup.
  });
  setLiveConnectionState(false);

  state = {
    ...state,
    ...partialConfig,
    enabled: true,
    startedAt: Date.now(),
    recipeStatus: "idle",
    recipeMessage: null,
  };

  clearScheduledTasks();
  runInitialCheckSequence();
  persistState();
  notifyState();
}

export function disableSimulation(): void {
  state = {
    ...state,
    enabled: false,
    startedAt: null,
    recipeStatus: "idle",
    recipeMessage: null,
  };

  resetRecipeRuntime("idle", null);
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

  persistState();
  notifyState();
}

export function getSimulationScenarios(): SimulationScenario[] {
  return [
    {
      id: "plant-demo",
      name: "Plant Demo",
      description: "Simulation recipes and hotspot state machine.",
      start: () => () => {
        // Scenario start is not used in the recipe-based simulation mode.
      },
    },
  ];
}

export function getSimulationRecipes(): SimulationRecipe[] {
  return recipes;
}

export function getSimulationGroups(): SimulationGroup[] {
  return simulationGroups;
}

export function setSimulationGroups(groups: SimulationGroupId[]): void {
  const uniqueGroups = [...new Set(groups)].filter(
    (group): group is SimulationGroupId => group === "entry-route" || group === "high-bay",
  );

  state = {
    ...state,
    activeGroups: uniqueGroups.length > 0 ? uniqueGroups : [...DEFAULT_GROUPS],
  };

  persistState();
  notifyState();
}

export function setSelectedRecipe(recipeId: SimulationRecipeId): void {
  state = {
    ...state,
    selectedRecipe: recipeId,
    recipeStatus: state.recipeStatus === "running" ? "running" : "idle",
    recipeMessage: null,
  };

  persistState();
  notifyState();
}

export function startSimulation(
  partialConfig?: Partial<Pick<SimulationState, "scenario" | "speed">>,
): void {
  enableSimulation(partialConfig);
}

export function stopSimulation(): void {
  disableSimulation();
}

export function startRecipe(recipeId?: SimulationRecipeId): void {
  if (!state.enabled) {
    return;
  }

  const selected = recipeId ?? state.selectedRecipe;
  setSelectedRecipe(selected);

  clearScheduledTasks();
  resetRecipeRuntime("running", `${selected.toUpperCase()} started.`);
  const token = recipeRunToken;

  if (selected === "recipe-a") {
    runRecipeA(token);
    return;
  }

  if (selected === "recipe-b") {
    runRecipePlaceholder(token, "Recipe B");
    return;
  }

  runRecipePlaceholder(token, "Recipe C");
}

export function resetRecipeState(): void {
  if (!state.enabled) {
    return;
  }

  clearScheduledTasks();
  resetRecipeRuntime("idle", "Recipe state reset.");
  applyAllStates("off");
}

export function setSimState(hotspotId: string, nextState: HotspotState): void {
  if (!state.enabled) {
    return;
  }
  setSimStateInternal(hotspotId, nextState);
}

export function getSimulationHotspotStates(): Record<string, HotspotState> {
  return state.hotspotStates;
}