import { useSyncExternalStore } from "react";
import {
  getLiveComponentsState,
  subscribeLiveComponentsState,
  type LiveComponentsState,
} from "../services/liveComponentService";

export function useLiveComponents(): LiveComponentsState {
  return useSyncExternalStore(
    subscribeLiveComponentsState,
    getLiveComponentsState,
    getLiveComponentsState,
  );
}