import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

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
    if (e.key === "focusnest-state-v1") hydrateFromStorage();
  });
}

function subscribe(listener: () => void) {
  wire();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => version;
const getServerSnapshot = () => 0;

const EMPTY: AppData = {
  tasks: [],
  notes: [],
  settings: {
    demoSeeded: false,
    theme: "system",
    skin: "sakura",
    focusSessions: 0,
    focusStreak: 0,
    lastFocusDate: "",
    soundOn: true,
    compactMode: false,
  },
};

/**
 * Reads the live FocusNest LocalStorage-backed state.
 * Storage keys and data shapes are untouched — this only observes them.
 * The legacy store mutates `data` in place, so we hand React a fresh
 * shallow snapshot on every version bump; otherwise memoised consumers
 * would never see new tasks/notes.
 */
export function useFocusNestData(): { data: AppData; hydrated: boolean } {
  const version = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    hydrateFromStorage();
    setMounted(true);
  }, []);

  return useMemo(() => {
    if (!mounted) return { data: EMPTY, hydrated: false };
    const live = getState().data;
    return {
      data: {
        tasks: [...(live.tasks ?? [])],
        notes: [...(live.notes ?? [])],
        settings: { ...live.settings },
      },
      hydrated: true,
    };
  }, [mounted, version]);
}
