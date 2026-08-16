const KEY = 'focusnest-state-v1';

const DEFAULT_STATE = {
  tasks: [],
  notes: [],
  settings: { demoSeeded: false, theme: 'system', skin: 'sakura', focusSessions: 0, focusStreak: 0, lastFocusDate: '', soundOn: true, compactMode: false }
};

export function loadState() {
  if (typeof localStorage === 'undefined') return structuredClone(DEFAULT_STATE);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return {
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) }
    };
  } catch (error) {
    throw new Error('Your local app data could not be loaded safely.');
  }
}

export function saveState(state) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (error) {
    throw new Error('Local storage is full or unavailable. Delete some content or attachments and try again.');
  }
}

export function clearAppState() { if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY); }
