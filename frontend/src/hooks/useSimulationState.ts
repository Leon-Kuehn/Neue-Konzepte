import { useSyncExternalStore } from "react";
import {
  getSimulationState,
  subscribeSimulationState,
  type SimulationState,
} from "../services/simulationService";

export function useSimulationState(): SimulationState {
  return useSyncExternalStore(subscribeSimulationState, getSimulationState, getSimulationState);
}