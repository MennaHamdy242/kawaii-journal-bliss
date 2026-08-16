import { loadState, saveState } from './storage.js';

const state = {
  data: loadState(),
  hydrated: typeof localStorage !== 'undefined',
  view: 'home',
  taskFilter: 'all',
  taskSort: 'date',
  notesPinnedOnly: false,
  favoriteTab: 'all',
  searchQuery: ''
};

export function getState() { return state; }

export function updateData(mutator) {
  mutator(state.data);
  saveState(state.data);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('state:change'));
}

export function setView(view) {
  state.view = view;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('view:change', { detail: { view } }));
}

export function patchUi(partial) {
  Object.assign(state, partial);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('ui:change'));
}

export function hydrateFromStorage() {
  state.data = loadState();
  state.hydrated = true;
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('state:change'));
}
