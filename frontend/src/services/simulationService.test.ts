import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { injectIncomingMessageMock, disconnectMock } = vi.hoisted(() => ({
  injectIncomingMessageMock: vi.fn(),
  disconnectMock: vi.fn().mockResolvedValue(undefined),
}));

const { ingestSensorDataMock } = vi.hoisted(() => ({
  ingestSensorDataMock: vi.fn().mockResolvedValue({ id: 1 }),
}));

const { setLiveConnectionStateMock } = vi.hoisted(() => ({
  setLiveConnectionStateMock: vi.fn(),
}));

vi.mock("./mqttClient", () => ({
  injectIncomingMessage: injectIncomingMessageMock,
  disconnect: disconnectMock,
}));

vi.mock("./sensorDataApi", () => ({
  ingestSensorData: ingestSensorDataMock,
}));

vi.mock("./liveComponentService", () => ({
  setLiveConnectionState: setLiveConnectionStateMock,
}));

describe("simulationService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    injectIncomingMessageMock.mockReset();
    ingestSensorDataMock.mockReset();
    setLiveConnectionStateMock.mockReset();
    ingestSensorDataMock.mockResolvedValue({ id: 1 });
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("enables simulation and emits simulated mqtt-like events", async () => {
    const service = await import("./simulationService");

    service.disableSimulation();
    service.enableSimulation();

    vi.advanceTimersByTime(7000);

    expect(service.getSimulationState().enabled).toBe(true);
    expect(injectIncomingMessageMock).toHaveBeenCalled();
    expect(ingestSensorDataMock).toHaveBeenCalled();
  });

  it("stops scheduled simulation events when disabled", async () => {
    const service = await import("./simulationService");

    service.enableSimulation();
    vi.advanceTimersByTime(5000);
    const callsBeforeDisable = injectIncomingMessageMock.mock.calls.length;
    const ingestCallsBeforeDisable = ingestSensorDataMock.mock.calls.length;

    service.disableSimulation();
    vi.advanceTimersByTime(20000);

    expect(service.getSimulationState().enabled).toBe(false);
    expect(injectIncomingMessageMock.mock.calls.length).toBe(callsBeforeDisable);
    expect(ingestSensorDataMock.mock.calls.length).toBe(ingestCallsBeforeDisable);
  });
});
