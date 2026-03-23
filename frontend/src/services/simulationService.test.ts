import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { injectIncomingMessageMock } = vi.hoisted(() => ({
  injectIncomingMessageMock: vi.fn(),
}));

vi.mock("./mqttClient", () => ({
  injectIncomingMessage: injectIncomingMessageMock,
}));

describe("simulationService", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    injectIncomingMessageMock.mockReset();
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
  });

  it("stops scheduled simulation events when disabled", async () => {
    const service = await import("./simulationService");

    service.enableSimulation();
    vi.advanceTimersByTime(5000);
    const callsBeforeDisable = injectIncomingMessageMock.mock.calls.length;

    service.disableSimulation();
    vi.advanceTimersByTime(20000);

    expect(service.getSimulationState().enabled).toBe(false);
    expect(injectIncomingMessageMock.mock.calls.length).toBe(callsBeforeDisable);
  });
});