import type { AppData } from "./types";

export interface FocusNestState {
  data: AppData;
  hydrated: boolean;
  view: string;
  taskFilter: string;
  taskSort: string;
  notesPinnedOnly: boolean;
  favoriteTab: string;
  searchQuery: string;
}

export function getState(): FocusNestState;
export function updateData(mutator: (data: AppData) => void): void;
export function setView(view: string): void;
export function patchUi(partial: Partial<FocusNestState>): void;
export function hydrateFromStorage(): void;
