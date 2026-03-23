/* @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SimulationStatusChip from "./SimulationStatusChip";

const { useSimulationStateMock } = vi.hoisted(() => ({
  useSimulationStateMock: vi.fn(),
}));

vi.mock("../hooks/useSimulationState", () => ({
  useSimulationState: useSimulationStateMock,
}));

describe("SimulationStatusChip", () => {
  it("renders nothing when simulation is disabled", () => {
    useSimulationStateMock.mockReturnValue({
      enabled: false,
      scenario: "plant-demo",
      speed: "normal",
      startedAt: null,
    });

    const { container } = render(<SimulationStatusChip />);
    expect(container.textContent).toBe("");
  });

  it("renders visible label when simulation is enabled", () => {
    useSimulationStateMock.mockReturnValue({
      enabled: true,
      scenario: "plant-demo",
      speed: "fast",
      startedAt: Date.now(),
    });

    render(<SimulationStatusChip />);
    expect(screen.getByText("Simulation mode active")).toBeTruthy();
  });
});