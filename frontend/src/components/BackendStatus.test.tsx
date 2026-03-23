/* @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BackendStatus from "./BackendStatus";

const { useHealthMock } = vi.hoisted(() => ({
  useHealthMock: vi.fn(),
}));

vi.mock("../hooks/useSensorData", () => ({
  useHealth: useHealthMock,
}));

describe("BackendStatus", () => {
  it("renders Backend: OK when health endpoint returns ok", () => {
    useHealthMock.mockReturnValue({
      data: { status: "ok" },
      error: null,
    });

    render(<BackendStatus />);

    expect(screen.getByText("Backend: OK")).toBeTruthy();
  });

  it("renders Backend: Unreachable when query has an error", () => {
    useHealthMock.mockReturnValue({
      data: undefined,
      error: new Error("Network failure"),
    });

    render(<BackendStatus />);

    expect(screen.getByText("Backend: Unreachable")).toBeTruthy();
  });
});