import { useSyncExternalStore } from 'react';

export interface Completion {
  at: number;
  /** Challenges only: 1–3. */
  stars?: number;
  bestTimeMs?: number;
}

export interface ProgressState {
  completed: Record<string, Completion>;
  /** Saved editor content, per lesson id. */
  code: Record<string, string>;
  /** Module ids unlocked manually ("skip ahead"). */
  unlocked: string[];
  theme?: 'light' | 'dark';
}

const KEY = 'learnhtml:v1';
const empty = (): ProgressState => ({ completed: {}, code: {}, unlocked: [] });

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

let state = load();
const listeners = new Set<() => void>();

function set(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage unavailable (private mode, quota): progress lives for this session only
  }
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, () => state);
}

export const progress = {
  get: () => state,

  saveCode(id: string, code: string) {
    set({ ...state, code: { ...state.code, [id]: code } });
  },

  clearCode(id: string) {
    const code = { ...state.code };
    delete code[id];
    set({ ...state, code });
  },

  complete(id: string, extra: Omit<Completion, 'at'> = {}) {
    const prev = state.completed[id];
    const stars = Math.max(prev?.stars ?? 0, extra.stars ?? 0) || undefined;
    const times = [prev?.bestTimeMs, extra.bestTimeMs].filter((t): t is number => t !== undefined);
    const bestTimeMs = times.length ? Math.min(...times) : undefined;
    set({ ...state, completed: { ...state.completed, [id]: { at: prev?.at ?? Date.now(), stars, bestTimeMs } } });
  },

  unlock(moduleId: string) {
    if (!state.unlocked.includes(moduleId)) set({ ...state, unlocked: [...state.unlocked, moduleId] });
  },

  setTheme(theme: 'light' | 'dark') {
    set({ ...state, theme });
  },

  export(): string {
    return JSON.stringify(state, null, 2);
  },

  import(json: string) {
    const parsed = JSON.parse(json) as Partial<ProgressState>;
    if (typeof parsed !== 'object' || parsed === null || typeof parsed.completed !== 'object') {
      throw new Error('This file is not a LearnHTML progress export.');
    }
    set({ ...empty(), ...parsed });
  },

  reset() {
    set({ ...empty(), theme: state.theme });
  },
};
