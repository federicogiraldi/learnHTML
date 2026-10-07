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
  /** Interface and lesson language. English when unset. */
  lang?: 'en' | 'it';
  /** When progress was last exported to a file. */
  lastExportAt?: number;
  /** When the backup reminder was last dismissed with "Not now". */
  backupSnoozedAt?: number;
}

const KEY = 'learnhtml:v1';
const PROBE_KEY = 'learnhtml:probe';
const DAY_MS = 24 * 60 * 60 * 1000;
/** Days without an export before the home page suggests one. */
export const BACKUP_REMINDER_DAYS = 14;
const empty = (): ProgressState => ({ completed: {}, code: {}, unlocked: [] });

/** Whether localStorage can be written: it throws in some private modes, when blocked, or when full. */
function probe(): boolean {
  try {
    localStorage.setItem(PROBE_KEY, '1');
    localStorage.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

let state = load();
let writable = probe();
const listeners = new Set<() => void>();
/** Callbacks that write pending (debounced) changes into the store right away. */
const flushers = new Set<() => void>();

function set(next: ProgressState) {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    writable = true;
  } catch {
    // storage unavailable (private mode, quota): progress lives for this session only
    writable = false;
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

/** False while progress cannot be saved, so it would be lost when the tab closes. */
export const isStorageWritable = () => writable;

export function useStorageWritable(): boolean {
  return useSyncExternalStore(subscribe, isStorageWritable);
}

const hasProgress = (s: ProgressState) => Object.keys(s.completed).length > 0 || Object.keys(s.code).length > 0;

/**
 * Whether to suggest exporting a backup: there is progress, and nothing was exported (or the reminder dismissed)
 * in the last `days` days. Before the first export, the clock starts at the first completed lesson.
 */
export function needsBackup(s: ProgressState, now = Date.now(), days = BACKUP_REMINDER_DAYS): boolean {
  if (!hasProgress(s)) return false;
  const firstDone = Math.min(...Object.values(s.completed).map((c) => c.at));
  const since = Math.max(s.lastExportAt ?? 0, s.backupSnoozedAt ?? 0) || firstDone;
  return Number.isFinite(since) && now - since >= days * DAY_MS;
}

export const progress = {
  get: () => state,

  /** Registers a callback that saves pending edits; returns an unsubscribe function. */
  onFlush(fn: () => void) {
    flushers.add(fn);
    return () => {
      flushers.delete(fn);
    };
  },

  /** Saves pending edits now, e.g. before the page reloads. */
  flush() {
    flushers.forEach((f) => f());
  },

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

  setLang(lang: 'en' | 'it') {
    set({ ...state, lang });
  },

  export(): string {
    return JSON.stringify(state, null, 2);
  },

  markExported(at = Date.now()) {
    set({ ...state, lastExportAt: at });
  },

  snoozeBackupReminder(at = Date.now()) {
    set({ ...state, backupSnoozedAt: at });
  },

  import(json: string) {
    const parsed = JSON.parse(json) as Partial<ProgressState>;
    if (typeof parsed !== 'object' || parsed === null || typeof parsed.completed !== 'object') {
      throw new Error('This file is not a LearnHTML progress export.');
    }
    set({ ...empty(), ...parsed });
  },

  reset() {
    set({ ...empty(), theme: state.theme, lang: state.lang });
  },
};
