import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  useQueryMock,
  getHealthMock,
  getAllSensorDataMock,
  getLatestSensorDataMock,
  getSensorDataByComponentMock,
  getSensorStatsMock,
  getSensorActivityMock,
} = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  getHealthMock: vi.fn(),
  getAllSensorDataMock: vi.fn(),
  getLatestSensorDataMock: vi.fn(),
  getSensorDataByComponentMock: vi.fn(),
  getSensorStatsMock: vi.fn(),
  getSensorActivityMock: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: useQueryMock,
}));

vi.mock("../services/sensorDataApi", () => ({
  getHealth: getHealthMock,
  getAllSensorData: getAllSensorDataMock,
  getLatestSensorData: getLatestSensorDataMock,
  getSensorDataByComponent: getSensorDataByComponentMock,
  getSensorStats: getSensorStatsMock,
  getSensorActivity: getSensorActivityMock,
}));

import {
  sensorDataQueryKeys,
  useAllSensorData,
  useComponentActivity,
  useComponentHistory,
  useComponentStats,
  useHealth,
  useLatestSensorData,
} from "./useSensorData";

describe("useSensorData hooks", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    getHealthMock.mockReset();
    getAllSensorDataMock.mockReset();
    getLatestSensorDataMock.mockReset();
    getSensorDataByComponentMock.mockReset();
    getSensorStatsMock.mockReset();
    getSensorActivityMock.mockReset();

    useQueryMock.mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
    });
  });

  it("useHealth creates stable key and calls health api from queryFn", async () => {
    useHealth();

    const options = useQueryMock.mock.calls[0][0];
    expect(options.queryKey).toEqual(sensorDataQueryKeys.health());

    await options.queryFn();
    expect(getHealthMock).toHaveBeenCalledTimes(1);
  });

  it("useAllSensorData passes params into key and api call", async () => {
    const params = { componentId: "entry-route", topic: "entry-route/state", limit: 20, offset: 5 };
    useAllSensorData(params);

    const options = useQueryMock.mock.calls[0][0];
    expect(options.queryKey).toEqual(sensorDataQueryKeys.all(params));

    await options.queryFn();
    expect(getAllSensorDataMock).toHaveBeenCalledWith(params);
  });

  it("useLatestSensorData calls latest api", async () => {
    useLatestSensorData();

    const options = useQueryMock.mock.calls[0][0];
    expect(options.queryKey).toEqual(sensorDataQueryKeys.latest());

    await options.queryFn();
    expect(getLatestSensorDataMock).toHaveBeenCalledTimes(1);
  });

  it("useComponentHistory is disabled when componentId is missing", () => {
    useComponentHistory(undefined, { limit: 100 });

    const options = useQueryMock.mock.calls[0][0];
    expect(options.queryKey).toEqual(sensorDataQueryKeys.componentHistory(undefined, { limit: 100 }));
    expect(options.enabled).toBe(false);
  });

  it("useComponentHistory calls component history api with componentId and options", async () => {
    useComponentHistory("entry-route", { limit: 50, since: "2026-03-23T00:00:00.000Z" });

    const options = useQueryMock.mock.calls[0][0];
    expect(options.enabled).toBe(true);

    await options.queryFn();
    expect(getSensorDataByComponentMock).toHaveBeenCalledWith("entry-route", {
      limit: 50,
      since: "2026-03-23T00:00:00.000Z",
    });
  });

  it("useComponentStats is disabled when componentId is empty", () => {
    useComponentStats("");

    const options = useQueryMock.mock.calls[0][0];
    expect(options.queryKey).toEqual(sensorDataQueryKeys.componentStats(""));
    expect(options.enabled).toBe(false);
  });

  it("useComponentStats calls stats api when componentId is present", async () => {
    useComponentStats("entry-route");

    const options = useQueryMock.mock.calls[0][0];
    expect(options.enabled).toBe(true);

    await options.queryFn();
    expect(getSensorStatsMock).toHaveBeenCalledWith("entry-route");
  });

  it("useComponentActivity uses interval in key and api call", async () => {
    useComponentActivity("entry-route", "hour", { refetchInterval: 10_000 });

    const options = useQueryMock.mock.calls[0][0];
    expect(options.queryKey).toEqual(sensorDataQueryKeys.componentActivity("entry-route", "hour"));
    expect(options.refetchInterval).toBe(10_000);

    await options.queryFn();
    expect(getSensorActivityMock).toHaveBeenCalledWith("entry-route", "hour");
  });
});