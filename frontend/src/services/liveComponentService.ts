import { mockComponents } from "../types/mockData";
import type { PlantComponent } from "../types/PlantComponent";
import { connect, loadSettings, onMessage, subscribe } from "./mqttClient";

export interface LiveComponentsState {
  components: PlantComponent[];
  mqttConnected: boolean;
}

const listeners = new Set<(state: LiveComponentsState) => void>();

let state: LiveComponentsState = {
  components: mockComponents.map((component) => ({
    ...component,
    status: "off",
    online: false,
    healthStatus: "offline",
    rotationDeg: 0,
    stats: {
      cycles: undefined,
      uptimeHours: undefined,
      lastValue: undefined,
    },
  })),
  mqttConnected: false,
};

let initialized = false;

type ComponentPayloadData = {
  status?: "on" | "off" | "error" | "offline";
  online?: boolean;
  cycles?: number;
  uptimeHours?: number;
  value?: number | boolean;
  rotationDeg?: number;
  faultMessage?: string;
  health?: "ok" | "error" | "offline";
};

function isSimulationModePersisted(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }

  try {
    const keys = ["simulation-designer-state", "simulation-state"];

    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw) as { enabled?: unknown; simulationEnabled?: unknown };
      if (parsed.enabled === true || parsed.simulationEnabled === true) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
}

function publishState(): void {
  for (const listener of listeners) {
    listener(state);
  }
}

function setState(next: LiveComponentsState): void {
  state = next;
  publishState();
}

function applyComponentPayload(componentId: string, data: ComponentPayloadData): void {
  const nextStatus = data.status === "on" ? "on" : "off";
  const healthStatus =
    data.health ??
    (data.status === "error"
      ? "error"
      : data.status === "offline"
        ? "offline"
        : "ok");

  setState({
    ...state,
    components: state.components.map((component) => {
      if (component.id !== componentId) {
        return component;
      }

      const previousCycles = component.stats.cycles ?? 0;
      const inferredCycles =
        data.cycles ?? (component.status !== "on" && nextStatus === "on" ? previousCycles + 1 : previousCycles);

      return {
        ...component,
        status: nextStatus,
        online: data.online ?? (healthStatus === "offline" ? false : true),
        healthStatus,
        faultMessage: data.faultMessage,
        rotationDeg: data.rotationDeg ?? component.rotationDeg,
        lastChanged: new Date().toISOString(),
        stats: {
          ...component.stats,
          cycles: inferredCycles,
          uptimeHours: data.uptimeHours ?? component.stats.uptimeHours,
          lastValue: data.value ?? component.stats.lastValue,
        },
      };
    }),
  });
}

function updateComponentFromPayload(componentId: string, payload: string): void {
  try {
    const data = JSON.parse(payload) as ComponentPayloadData;
    applyComponentPayload(componentId, data);
  } catch {
    // ignore malformed payloads
  }
}

export function applySimulationComponentPayload(componentId: string, data: ComponentPayloadData): void {
  applyComponentPayload(componentId, data);
}

export function initializeLiveComponentFeed(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  const topicToComponentId = new Map(
    mockComponents.map((component) => [component.mqttTopics.status, component.id]),
  );

  onMessage((topic, payload) => {
    const mappedCompId = topicToComponentId.get(topic);
    const parts = topic.split("/");
    const fallbackCompId = parts[1];
    const fallbackKind = parts[2];

    const componentId =
      mappedCompId ?? (fallbackKind === "status" ? fallbackCompId : undefined);

    if (!componentId) {
      return;
    }

    updateComponentFromPayload(componentId, payload);
  });

  const settings = loadSettings();
  if (!settings) {
    return;
  }

  if (isSimulationModePersisted()) {
    setState({
      ...state,
      mqttConnected: false,
    });
    return;
  }

  void (async () => {
    try {
      await connect(settings);
      const statusTopics = [...new Set(mockComponents.map((component) => component.mqttTopics.status))];
      await Promise.all(statusTopics.map((topic) => subscribe(topic)));
      setState({
        ...state,
        mqttConnected: true,
      });
    } catch {
      setState({
        ...state,
        mqttConnected: false,
      });
    }
  })();
}

export function setLiveConnectionState(connected: boolean): void {
  setState({
    ...state,
    mqttConnected: connected,
  });
}

export function getLiveComponentsState(): LiveComponentsState {
  return state;
}

export function subscribeLiveComponentsState(
  listener: (state: LiveComponentsState) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}