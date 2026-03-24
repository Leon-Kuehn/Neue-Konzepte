import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { disconnectMock } = vi.hoisted(() => ({
  disconnectMock: vi.fn().mockResolvedValue(undefined),
}));

const { setLiveConnectionStateMock } = vi.hoisted(() => ({
  setLiveConnectionStateMock: vi.fn(),
}));

vi.mock("./mqttClient", () => ({
  disconnect: disconnectMock,
}));

vi.mock("./liveComponentService", () => ({
  setLiveConnectionState: setLiveConnectionStateMock,
}));

describe("simulationService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    disconnectMock.mockReset();
    disconnectMock.mockResolvedValue(undefined);
    setLiveConnectionStateMock.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("enables and disables simulation mode", async () => {
    const service = await import("./simulationService");

    service.disableSimulation();
    service.enableSimulation();

    expect(service.getSimulationState().enabled).toBe(true);

    service.disableSimulation();
    expect(service.getSimulationState().enabled).toBe(false);
  });

  it("runs selected simulation and advances runtime", async () => {
    const service = await import("./simulationService");

    service.enableSimulation();
    const simulationId = service.getSimulations()[0]?.id;

    expect(simulationId).toBeTruthy();

    service.runSimulation(simulationId!);
    vi.advanceTimersByTime(1700);

    const state = service.getSimulationState();
    expect(state.running).toBe(true);
    expect(state.nowMs).toBeGreaterThanOrEqual(1500);

    service.stopSimulation();
    expect(service.getSimulationState().running).toBe(false);
  });
});
