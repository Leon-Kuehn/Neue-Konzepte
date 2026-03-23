/* @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppPreferencesProvider } from "../context/AppPreferencesContext";
import PlantOverviewPage from "./PlantOverviewPage";

const { useLatestSensorDataMock, useComponentStatsMock, useComponentHistoryMock } = vi.hoisted(() => ({
  useLatestSensorDataMock: vi.fn(),
  useComponentStatsMock: vi.fn(),
  useComponentHistoryMock: vi.fn(),
}));

vi.mock("../hooks/useSensorData", () => ({
  useLatestSensorData: useLatestSensorDataMock,
  useComponentStats: useComponentStatsMock,
  useComponentHistory: useComponentHistoryMock,
}));

vi.mock("../services/mqttClient", () => ({
  loadSettings: vi.fn(() => null),
  connect: vi.fn(),
  disconnect: vi.fn(),
  subscribe: vi.fn(),
  onMessage: vi.fn(),
  getClient: vi.fn(() => null),
}));

vi.mock("../entryRoute/EntryRoutePanel", () => ({
  default: ({ onSelectComponent }: { onSelectComponent: (id: string | null) => void }) => (
    <button onClick={() => onSelectComponent("conveyor-1")} type="button">
      Select conveyor-1
    </button>
  ),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <AppPreferencesProvider>
        <PlantOverviewPage />
      </AppPreferencesProvider>
    </MemoryRouter>,
  );
}

describe("PlantOverviewPage sensor data integration", () => {
  beforeEach(() => {
    useLatestSensorDataMock.mockReset();
    useComponentStatsMock.mockReset();
    useComponentHistoryMock.mockReset();

    useLatestSensorDataMock.mockReturnValue({
      data: [
        {
          id: 101,
          componentId: "conveyor-1",
          topic: "plant/conveyor-1/status",
          payload: { value: 42 },
          receivedAt: "2026-03-23T12:00:00.000Z",
        },
      ],
      isLoading: false,
      error: null,
    });

    useComponentStatsMock.mockReturnValue({
      data: {
        count: 10,
        firstTimestamp: "2026-03-23T10:00:00.000Z",
        lastTimestamp: "2026-03-23T12:00:00.000Z",
        averageValue: 42,
        minValue: 10,
        maxValue: 90,
      },
      isLoading: false,
      error: null,
    });

    useComponentHistoryMock.mockReturnValue({
      data: [
        {
          id: 111,
          componentId: "conveyor-1",
          topic: "plant/conveyor-1/status",
          payload: { value: 40 },
          receivedAt: "2026-03-23T11:59:00.000Z",
        },
      ],
      isLoading: false,
      error: null,
    });
  });

  it("passes selected component id into stats/history hooks and renders backend values", () => {
    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Select conveyor-1" }));

    expect(useComponentStatsMock).toHaveBeenCalledWith(
      "conveyor-1",
      expect.objectContaining({ enabled: true, refetchInterval: 30_000 }),
    );
    expect(useComponentHistoryMock).toHaveBeenCalledWith(
      "conveyor-1",
      { limit: 10 },
      expect.objectContaining({ enabled: true }),
    );

    expect(screen.getByText('{"value":42}')).toBeTruthy();
    expect(screen.getByText("90")).toBeTruthy();
    expect(screen.getByText('{"value":40}')).toBeTruthy();
  });

  it("shows loading and error states from backend hooks in the details drawer", () => {
    useLatestSensorDataMock.mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });
    useComponentStatsMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "stats failed" },
    });
    useComponentHistoryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: { message: "history failed" },
    });

    renderPage();

    fireEvent.click(screen.getByRole("button", { name: "Select conveyor-1" }));

    expect(screen.getByText("Loading stored values...")).toBeTruthy();
    expect(screen.getByText(/Failed to load statistics: stats failed/i)).toBeTruthy();
    expect(screen.getByText(/Failed to load history: history failed/i)).toBeTruthy();
  });
});