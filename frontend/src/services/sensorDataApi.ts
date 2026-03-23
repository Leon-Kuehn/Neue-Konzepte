const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

export type SensorPayload = unknown;

export interface HealthResponse {
  status: string;
}

export interface SensorData {
  id: number;
  componentId: string;
  topic: string;
  payload: SensorPayload;
  receivedAt: string;
}

export interface SensorStats {
  count: number;
  firstTimestamp: string | null;
  lastTimestamp: string | null;
  averageValue?: number;
  minValue?: number;
  maxValue?: number;
}

export interface SensorActivityBucket {
  time: string;
  count: number;
}

export type SensorActivityInterval = "minute" | "hour";

export interface GetAllSensorDataParams {
  componentId?: string;
  topic?: string;
  limit?: number;
  offset?: number;
}

export interface GetSensorDataByComponentOptions {
  limit?: number;
  since?: string;
}

export interface GetSensorDataRangeParams {
  from: string;
  to: string;
}

const normalizeBase = (base: string): string => base.replace(/\/+$/, "");

const buildUrl = (
  path: string,
  query?: Record<string, string | number | undefined>,
  base = API_BASE,
): string => {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const normalizedBase = normalizeBase(base);
  return `${normalizedBase}${path}${queryString ? `?${queryString}` : ""}`;
};

const requestJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(
      message
        ? `Request failed (${response.status}): ${message}`
        : `Request failed (${response.status})`,
    );
  }

  return response.json() as Promise<T>;
};

/** Fetches backend health status. */
const getHealth = async (): Promise<HealthResponse> => {
  return requestJson<HealthResponse>(buildUrl("/health"));
};

/** Fetches sensor readings with optional component/topic/limit/offset filters. */
const getAllSensorData = async (
  params?: GetAllSensorDataParams,
): Promise<SensorData[]> => {
  return requestJson<SensorData[]>(
    buildUrl("/sensor-data", {
      componentId: params?.componentId,
      topic: params?.topic,
      limit: params?.limit,
      offset: params?.offset,
    }),
  );
};

/** Fetches the latest reading for each component. */
const getLatestSensorData = async (): Promise<SensorData[]> => {
  return requestJson<SensorData[]>(buildUrl("/sensor-data/latest"));
};

/** Fetches sensor readings for a component, optionally limited and filtered by since timestamp. */
const getSensorDataByComponent = async (
  componentId: string,
  options?: GetSensorDataByComponentOptions,
): Promise<SensorData[]> => {
  return requestJson<SensorData[]>(
    buildUrl(`/sensor-data/${encodeURIComponent(componentId)}`, {
      limit: options?.limit,
      since: options?.since,
    }),
  );
};

/** Fetches sensor readings in a required inclusive time range. */
const getSensorDataRange = async (
  params: GetSensorDataRangeParams,
): Promise<SensorData[]> => {
  return requestJson<SensorData[]>(
    buildUrl("/sensor-data/range", {
      from: params.from,
      to: params.to,
    }),
  );
};

/** Fetches aggregated statistics for one component. */
const getSensorStats = async (componentId: string): Promise<SensorStats> => {
  return requestJson<SensorStats>(
    buildUrl(`/sensor-data/stats/${encodeURIComponent(componentId)}`),
  );
};

/** Fetches per-bucket activity counts for one component. */
const getSensorActivity = async (
  componentId: string,
  interval: SensorActivityInterval = "minute",
): Promise<SensorActivityBucket[]> => {
  return requestJson<SensorActivityBucket[]>(
    buildUrl(`/sensor-data/activity/${encodeURIComponent(componentId)}`, {
      interval,
    }),
  );
};

export const sensorDataApi = {
  getHealth,
  getAllSensorData,
  getLatestSensorData,
  getSensorDataByComponent,
  getSensorDataRange,
  getSensorStats,
  getSensorActivity,
};

export {
  API_BASE,
  buildUrl,
  getHealth,
  getAllSensorData,
  getLatestSensorData,
  getSensorDataByComponent,
  getSensorDataRange,
  getSensorStats,
  getSensorActivity,
};