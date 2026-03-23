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
      ...component.stats,
      lastValue: undefined,
    },
  })),
  mqttConnected: false,
};

let initialized = false;

function publishState(): void {
  for (const listener of listeners) {
    listener(state);
  }
}

function setState(next: LiveComponentsState): void {
  state = next;
  publishState();
}

function updateComponentFromPayload(componentId: string, payload: string): void {
  try {
    const data = JSON.parse(payload) as {
      status?: "on" | "off" | "error" | "offline";
      online?: boolean;
      cycles?: number;
      uptimeHours?: number;
      value?: number | boolean;
      rotationDeg?: number;
      faultMessage?: string;
      health?: "ok" | "error" | "offline";
    };

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
      components: state.components.map((component) =>
        component.id === componentId
          ? {
              ...component,
              status: nextStatus,
              online: data.online ?? (healthStatus === "offline" ? false : component.online),
              healthStatus,
              faultMessage: data.faultMessage,
              rotationDeg: data.rotationDeg ?? component.rotationDeg,
              lastChanged: new Date().toISOString(),
              stats: {
                ...component.stats,
                cycles: data.cycles ?? component.stats.cycles,
                uptimeHours: data.uptimeHours ?? component.stats.uptimeHours,
                lastValue: data.value ?? component.stats.lastValue,
              },
            }
          : component,
      ),
    });
  } catch {
    // ignore malformed payloads
  }
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