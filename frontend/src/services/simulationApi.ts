import { buildUrl } from "./sensorDataApi";
import type { SimulationConfig } from "../types/simulation";

type SimulationRow = {
  id: string;
  name: string;
  description: string | null;
  repeat: number | null;
  steps: unknown;
};

function parseSimulationRow(row: SimulationRow): SimulationConfig {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    repeat: row.repeat ?? undefined,
    steps: Array.isArray(row.steps) ? (row.steps as SimulationConfig["steps"]) : [],
  };
}

async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function getSimulationConfigs(): Promise<SimulationConfig[]> {
  const rows = await requestJson<SimulationRow[]>(buildUrl("/simulations"));
  return rows.map(parseSimulationRow);
}

export async function createSimulationConfig(config: SimulationConfig): Promise<SimulationConfig> {
  const row = await requestJson<SimulationRow>(buildUrl("/simulations"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  return parseSimulationRow(row);
}

export async function updateSimulationConfigRemote(config: SimulationConfig): Promise<SimulationConfig> {
  const row = await requestJson<SimulationRow>(buildUrl(`/simulations/${encodeURIComponent(config.id)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

  return parseSimulationRow(row);
}

export async function deleteSimulationConfigRemote(id: string): Promise<void> {
  await requestJson<{ deleted: boolean }>(buildUrl(`/simulations/${encodeURIComponent(id)}`), {
    method: "DELETE",
  });
}
