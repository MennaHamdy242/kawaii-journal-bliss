import { useEffect, useSyncExternalStore } from "react";

import { getState, hydrateFromStorage } from "./state.js";
import type { AppData } from "./types";

let version = 0;
const listeners = new Set<() => void>();

function emit() {
  version += 1;
  listeners.forEach((l) => l());
}

let wired = false;
function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.addEventListener("state:change", emit);
  window.addEventListener("storage", (e) => {
    if (e.key === "focusnest-state-v1") {
      hydrateFromStorage();
    }
  });
}

function subscribe(listener: () => void) {
  wire();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => version;
const getServerSnapshot = () => 0;

/**
 * Reads the live FocusNest LocalStorage-backed state.
 * Storage keys and data shapes are untouched — this only observes them.
 */
export function useFocusNestData(): { data: AppData; hydrated: boolean } {
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const state = getState();
    if (!state.hydrated) hydrateFromStorage();
  }, []);

  const state = getState();
  return { data: state.data, hydrated: state.hydrated };
}
