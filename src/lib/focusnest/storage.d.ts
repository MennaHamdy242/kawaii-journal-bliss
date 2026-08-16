import type { AppData } from "./types";

export function loadState(): AppData;
export function saveState(state: AppData): void;
export function clearAppState(): void;
