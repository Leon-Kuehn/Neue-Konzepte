import { buildUrl } from "./sensorDataApi";

export type WarehouseSimulatorStatus = {
  running: boolean;
  intervalMs: number;
  totalEvents: number;
  storedCount: number;
  retrievedCount: number;
  occupiedSlots: number;
  totalSlots: number;
  lastEventAt: string | null;
  slots: Array<{
    slotId: string;
    occupied: boolean;
    quantity: number;
  }>;
};

export type WarehouseSimulatorLogEvent = {
  id: number;
  receivedAt: string;
  action: "store" | "retrieve";
  slotId: string;
  occupied: boolean;
  quantity: number;
  eventIndex: number;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function getWarehouseSimulatorStatus(): Promise<WarehouseSimulatorStatus> {
  return requestJson<WarehouseSimulatorStatus>(buildUrl("/warehouse-simulator/status"));
}

export async function getWarehouseSimulatorLogs(
  limit = 30,
): Promise<WarehouseSimulatorLogEvent[]> {
  return requestJson<WarehouseSimulatorLogEvent[]>(
    buildUrl("/warehouse-simulator/logs", { limit }),
  );
}

export async function startWarehouseSimulator(
  intervalMs?: number,
): Promise<WarehouseSimulatorStatus> {
  return requestJson<WarehouseSimulatorStatus>(buildUrl("/warehouse-simulator/start"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(intervalMs ? { intervalMs } : {}),
  });
}

export async function stopWarehouseSimulator(): Promise<WarehouseSimulatorStatus> {
  return requestJson<WarehouseSimulatorStatus>(buildUrl("/warehouse-simulator/stop"), {
    method: "POST",
  });
}

export async function tickWarehouseSimulator(): Promise<WarehouseSimulatorLogEvent> {
  return requestJson<WarehouseSimulatorLogEvent>(buildUrl("/warehouse-simulator/tick"), {
    method: "POST",
  });
}
