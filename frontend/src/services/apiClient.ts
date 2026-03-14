/**
 * REST API client for the NestJS backend.
 *
 * Base URL defaults to the same origin so the Nginx reverse-proxy
 * (configured in the Dockerfile) forwards /api/* requests to the backend.
 * Override VITE_API_BASE_URL in your .env for local development when the
 * backend runs on a different host/port (e.g. http://localhost:3000).
 */

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "";

export interface SensorDataEntry {
  id: number;
  componentId: string;
  topic: string;
  payload: unknown;
  receivedAt: string;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Fetch paginated sensor data.
 * @param options.componentId  Filter by component ID (optional).
 * @param options.topic        Filter by MQTT topic (optional).
 * @param options.limit        Max number of rows (default 100).
 * @param options.offset       Skip N rows for pagination (default 0).
 */
export function getSensorData(options?: {
  componentId?: string;
  topic?: string;
  limit?: number;
  offset?: number;
}): Promise<SensorDataEntry[]> {
  const params = new URLSearchParams();
  if (options?.componentId) params.set("componentId", options.componentId);
  if (options?.topic) params.set("topic", options.topic);
  if (options?.limit !== undefined) params.set("limit", String(options.limit));
  if (options?.offset !== undefined) params.set("offset", String(options.offset));

  const query = params.toString();
  return get<SensorDataEntry[]>(`/api/sensor-data${query ? `?${query}` : ""}`);
}

/**
 * Fetch the most recent reading for every component.
 * Useful for initialising the dashboard with live state.
 */
export function getLatestSensorData(): Promise<SensorDataEntry[]> {
  return get<SensorDataEntry[]>("/api/sensor-data/latest");
}

/**
 * Fetch the last N readings for a single component.
 */
export function getSensorDataByComponent(
  componentId: string,
  limit?: number,
): Promise<SensorDataEntry[]> {
  const params = new URLSearchParams();
  if (limit !== undefined) params.set("limit", String(limit));
  const query = params.toString();
  return get<SensorDataEntry[]>(
    `/api/sensor-data/${encodeURIComponent(componentId)}${query ? `?${query}` : ""}`,
  );
}

/** Health-check: returns true when the backend is reachable. */
export async function checkHealth(): Promise<boolean> {
  try {
    const data = await get<{ status: string }>("/api/health");
    return data.status === "ok";
  } catch {
    return false;
  }
}
