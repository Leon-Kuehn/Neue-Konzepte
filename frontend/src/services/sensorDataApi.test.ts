import { afterEach, describe, expect, it, vi } from "vitest";
import {
  API_BASE,
  buildUrl,
  getAllSensorData,
  getHealth,
  getLatestSensorData,
  getSensorActivity,
  getSensorDataByComponent,
  getSensorDataRange,
  getSensorStats,
  type HealthResponse,
  type SensorActivityBucket,
  type SensorData,
  type SensorStats,
} from "./sensorDataApi";

const fetchMock = vi.fn<typeof fetch>();

const mockOkJson = (data: unknown) => {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
  } as Response);
};

describe("sensorDataApi", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    fetchMock.mockReset();
  });

  it("uses /api as default base", () => {
    expect(API_BASE).toBe("/api");
  });

  it("builds health URL", () => {
    expect(buildUrl("/health")).toBe("/api/health");
  });

  it("getHealth calls /api/health and returns typed response", async () => {
    const response: HealthResponse = { status: "ok" };
    mockOkJson(response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getHealth();

    expect(fetchMock).toHaveBeenCalledWith("/api/health");
    expect(result).toEqual({ status: "ok" });
  });

  it("getAllSensorData calls /api/sensor-data without params", async () => {
    const response: SensorData[] = [];
    mockOkJson(response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getAllSensorData();

    expect(fetchMock).toHaveBeenCalledWith("/api/sensor-data");
    expect(result).toEqual([]);
  });

  it("getAllSensorData appends optional query params", async () => {
    const response: SensorData[] = [];
    mockOkJson(response);
    vi.stubGlobal("fetch", fetchMock);

    await getAllSensorData({
      componentId: "entry-route",
      topic: "entry-route/state",
      limit: 25,
      offset: 5,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sensor-data?componentId=entry-route&topic=entry-route%2Fstate&limit=25&offset=5",
    );
  });

  it("getLatestSensorData calls latest endpoint", async () => {
    const response: SensorData[] = [];
    mockOkJson(response);
    vi.stubGlobal("fetch", fetchMock);

    await getLatestSensorData();

    expect(fetchMock).toHaveBeenCalledWith("/api/sensor-data/latest");
  });

  it("getSensorDataByComponent encodes componentId and query params", async () => {
    const response: SensorData[] = [];
    mockOkJson(response);
    vi.stubGlobal("fetch", fetchMock);

    await getSensorDataByComponent("entry route", {
      limit: 100,
      since: "2026-03-23T00:00:00.000Z",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sensor-data/entry%20route?limit=100&since=2026-03-23T00%3A00%3A00.000Z",
    );
  });

  it("getSensorDataRange sends required from/to query params", async () => {
    const response: SensorData[] = [];
    mockOkJson(response);
    vi.stubGlobal("fetch", fetchMock);

    await getSensorDataRange({
      from: "2026-03-23T00:00:00.000Z",
      to: "2026-03-23T01:00:00.000Z",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sensor-data/range?from=2026-03-23T00%3A00%3A00.000Z&to=2026-03-23T01%3A00%3A00.000Z",
    );
  });

  it("getSensorStats returns typed aggregate response", async () => {
    const response: SensorStats = {
      count: 10,
      firstTimestamp: "2026-03-22T10:00:00.000Z",
      lastTimestamp: "2026-03-23T10:00:00.000Z",
      averageValue: 50,
      minValue: 10,
      maxValue: 90,
    };
    mockOkJson(response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getSensorStats("entry-route");

    expect(fetchMock).toHaveBeenCalledWith("/api/sensor-data/stats/entry-route");
    expect(result.averageValue).toBe(50);
  });

  it("getSensorActivity uses minute interval by default", async () => {
    const response: SensorActivityBucket[] = [{ time: "2026-03-23T10:00:00.000Z", count: 5 }];
    mockOkJson(response);
    vi.stubGlobal("fetch", fetchMock);

    const result = await getSensorActivity("entry-route");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sensor-data/activity/entry-route?interval=minute",
    );
    expect(result[0]?.count).toBe(5);
  });

  it("getSensorActivity accepts explicit hour interval", async () => {
    const response: SensorActivityBucket[] = [];
    mockOkJson(response);
    vi.stubGlobal("fetch", fetchMock);

    await getSensorActivity("entry-route", "hour");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/sensor-data/activity/entry-route?interval=hour",
    );
  });

  it("throws on non-2xx responses", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: "error" }),
      text: async () => "Internal Server Error",
    } as Response);
    vi.stubGlobal("fetch", fetchMock);

    await expect(getLatestSensorData()).rejects.toThrow(
      "Request failed (500): Internal Server Error",
    );
  });
});