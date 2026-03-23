import { useQuery, type UseQueryOptions, type UseQueryResult } from "@tanstack/react-query";
import {
  getAllSensorData,
  getHealth,
  getLatestSensorData,
  getSensorActivity,
  getSensorDataByComponent,
  getSensorStats,
  type GetAllSensorDataParams,
  type GetSensorDataByComponentOptions,
  type HealthResponse,
  type SensorActivityBucket,
  type SensorActivityInterval,
  type SensorData,
  type SensorStats,
} from "../services/sensorDataApi";

const SENSOR_DATA_STALE_MS = 10_000;
const SENSOR_DATA_GC_MS = 5 * 60_000;
const HEALTH_STALE_MS = 60_000;

type QueryOptions<TData, TQueryKey extends readonly unknown[]> = Omit<
  UseQueryOptions<TData, Error, TData, TQueryKey>,
  "queryKey" | "queryFn"
>;

export const sensorDataQueryKeys = {
  health: () => ["health"] as const,
  all: (params?: GetAllSensorDataParams) => ["sensorData", "all", params ?? {}] as const,
  latest: () => ["sensorData", "latest"] as const,
  componentHistory: (componentId?: string, options?: GetSensorDataByComponentOptions) =>
    ["sensorData", "component", componentId ?? "", options ?? {}] as const,
  componentStats: (componentId?: string) => ["sensorData", "stats", componentId ?? ""] as const,
  componentActivity: (componentId?: string, interval: SensorActivityInterval = "minute") =>
    ["sensorData", "activity", componentId ?? "", interval] as const,
};

/** Fetches backend health status and caches the result for a minute. */
export const useHealth = (
  options?: QueryOptions<HealthResponse, ReturnType<typeof sensorDataQueryKeys.health>>,
): UseQueryResult<HealthResponse, Error> => {
  return useQuery<HealthResponse, Error, HealthResponse, ReturnType<typeof sensorDataQueryKeys.health>>({
    queryKey: sensorDataQueryKeys.health(),
    queryFn: getHealth,
    staleTime: HEALTH_STALE_MS,
    gcTime: SENSOR_DATA_GC_MS,
    ...options,
  });
};

/** Fetches sensor readings with optional component/topic/limit/offset filters. */
export const useAllSensorData = (
  params?: GetAllSensorDataParams,
  options?: QueryOptions<SensorData[], ReturnType<typeof sensorDataQueryKeys.all>>,
): UseQueryResult<SensorData[], Error> => {
  return useQuery<SensorData[], Error, SensorData[], ReturnType<typeof sensorDataQueryKeys.all>>({
    queryKey: sensorDataQueryKeys.all(params),
    queryFn: () => getAllSensorData(params),
    staleTime: SENSOR_DATA_STALE_MS,
    gcTime: SENSOR_DATA_GC_MS,
    ...options,
  });
};

/** Fetches the most recent reading for each component. */
export const useLatestSensorData = (
  options?: QueryOptions<SensorData[], ReturnType<typeof sensorDataQueryKeys.latest>>,
): UseQueryResult<SensorData[], Error> => {
  return useQuery<SensorData[], Error, SensorData[], ReturnType<typeof sensorDataQueryKeys.latest>>({
    queryKey: sensorDataQueryKeys.latest(),
    queryFn: getLatestSensorData,
    staleTime: 5_000,
    gcTime: SENSOR_DATA_GC_MS,
    ...options,
  });
};

/** Fetches historical readings for a single component. Query stays disabled if componentId is empty. */
export const useComponentHistory = (
  componentId?: string,
  historyOptions?: GetSensorDataByComponentOptions,
  options?: QueryOptions<SensorData[], ReturnType<typeof sensorDataQueryKeys.componentHistory>>,
): UseQueryResult<SensorData[], Error> => {
  return useQuery<
    SensorData[],
    Error,
    SensorData[],
    ReturnType<typeof sensorDataQueryKeys.componentHistory>
  >({
    queryKey: sensorDataQueryKeys.componentHistory(componentId, historyOptions),
    queryFn: () => getSensorDataByComponent(componentId ?? "", historyOptions),
    enabled: Boolean(componentId) && (options?.enabled ?? true),
    staleTime: SENSOR_DATA_STALE_MS,
    gcTime: SENSOR_DATA_GC_MS,
    ...options,
  });
};

/** Fetches aggregate statistics for a single component. Query stays disabled if componentId is empty. */
export const useComponentStats = (
  componentId?: string,
  options?: QueryOptions<SensorStats, ReturnType<typeof sensorDataQueryKeys.componentStats>>,
): UseQueryResult<SensorStats, Error> => {
  return useQuery<SensorStats, Error, SensorStats, ReturnType<typeof sensorDataQueryKeys.componentStats>>({
    queryKey: sensorDataQueryKeys.componentStats(componentId),
    queryFn: () => getSensorStats(componentId ?? ""),
    enabled: Boolean(componentId) && (options?.enabled ?? true),
    staleTime: 30_000,
    gcTime: SENSOR_DATA_GC_MS,
    ...options,
  });
};

/** Fetches per-bucket component activity (minute/hour). Query stays disabled if componentId is empty. */
export const useComponentActivity = (
  componentId?: string,
  interval: SensorActivityInterval = "minute",
  options?: QueryOptions<
    SensorActivityBucket[],
    ReturnType<typeof sensorDataQueryKeys.componentActivity>
  >,
): UseQueryResult<SensorActivityBucket[], Error> => {
  return useQuery<
    SensorActivityBucket[],
    Error,
    SensorActivityBucket[],
    ReturnType<typeof sensorDataQueryKeys.componentActivity>
  >({
    queryKey: sensorDataQueryKeys.componentActivity(componentId, interval),
    queryFn: () => getSensorActivity(componentId ?? "", interval),
    enabled: Boolean(componentId) && (options?.enabled ?? true),
    staleTime: SENSOR_DATA_STALE_MS,
    gcTime: SENSOR_DATA_GC_MS,
    ...options,
  });
};