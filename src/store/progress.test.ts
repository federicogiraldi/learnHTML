import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProgressState } from './progress';

const KEY = 'learnhtml:v1';
const DAY = 24 * 60 * 60 * 1000;

/** The store reads localStorage when imported, so each test loads a fresh copy. */
async function loadStore() {
  vi.resetModules();
  return import('./progress');
}

const state = (over: Partial<ProgressState> = {}): ProgressState => ({ completed: {}, code: {}, unlocked: [], ...over });

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe('saved progress', () => {
  it('reads existing progress from the same key and keeps fields it does not know', async () => {
    const saved = { completed: { 'html-1-1': { at: 1 } }, code: { 'html-1-1': '<p>hi</p>' }, unlocked: [], theme: 'light' };
    localStorage.setItem(KEY, JSON.stringify(saved));
    const { progress } = await loadStore();
    expect(progress.get()).toEqual(saved);

    progress.markExported(123);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual({ ...saved, lastExportAt: 123 });
  });

  it('records the last export and a dismissed reminder', async () => {
    const { progress } = await loadStore();
    progress.markExported(1000);
    progress.snoozeBackupReminder(2000);
    expect(progress.get()).toMatchObject({ lastExportAt: 1000, backupSnoozedAt: 2000 });
    expect(JSON.parse(progress.export())).toMatchObject({ lastExportAt: 1000 });
  });

  it('saves the chosen language and keeps it, like the theme, on reset', async () => {
    const { progress } = await loadStore();
    progress.setTheme('light');
    progress.setLang('it');
    progress.complete('html-1-1');
    progress.reset();
    expect(progress.get()).toEqual(state({ theme: 'light', lang: 'it' }));
    expect(JSON.parse(localStorage.getItem(KEY)!).lang).toBe('it');
  });

  it('runs registered flushers on flush until they unsubscribe', async () => {
    const { progress } = await loadStore();
    const save = vi.fn();
    const off = progress.onFlush(save);
    progress.flush();
    off();
    progress.flush();
    expect(save).toHaveBeenCalledTimes(1);
  });
});

describe('storage availability', () => {
  it('is writable with a working localStorage', async () => {
    const { progress, isStorageWritable } = await loadStore();
    expect(isStorageWritable()).toBe(true);
    progress.saveCode('x', 'y');
    expect(JSON.parse(localStorage.getItem(KEY)!).code).toEqual({ x: 'y' });
  });

  it('keeps progress in memory and reports it when localStorage throws', async () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('denied', 'SecurityError');
    });
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    const { progress, isStorageWritable } = await loadStore();
    expect(isStorageWritable()).toBe(false);

    progress.complete('html-1-1');
    expect(progress.get().completed['html-1-1']).toBeDefined();
    expect(isStorageWritable()).toBe(false);

    // Storage frees up (e.g. quota): the next save succeeds and the warning goes away.
    setItem.mockRestore();
    getItem.mockRestore();
    progress.saveCode('html-1-1', '<p></p>');
    expect(isStorageWritable()).toBe(true);
    expect(JSON.parse(localStorage.getItem(KEY)!).completed['html-1-1']).toBeDefined();
  });

  it('notices when a save starts failing', async () => {
    const { progress, isStorageWritable } = await loadStore();
    expect(isStorageWritable()).toBe(true);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('full', 'QuotaExceededError');
    });
    progress.saveCode('a', 'b');
    expect(isStorageWritable()).toBe(false);
    expect(progress.get().code).toEqual({ a: 'b' });
  });
});

describe('needsBackup', () => {
  const now = 100 * DAY;

  it('is false without progress', async () => {
    const { needsBackup } = await loadStore();
    expect(needsBackup(state(), now)).toBe(false);
  });

  it('starts counting from the first completed lesson when nothing was exported', async () => {
    const { needsBackup } = await loadStore();
    expect(needsBackup(state({ completed: { a: { at: now - 13 * DAY } } }), now)).toBe(false);
    expect(needsBackup(state({ completed: { a: { at: now - 14 * DAY }, b: { at: now } } }), now)).toBe(true);
  });

  it('waits the given days after the last export or dismissal', async () => {
    const { needsBackup } = await loadStore();
    const completed = { a: { at: 0 } };
    expect(needsBackup(state({ completed, lastExportAt: now - 3 * DAY }), now)).toBe(false);
    expect(needsBackup(state({ completed, lastExportAt: now - 20 * DAY }), now)).toBe(true);
    expect(needsBackup(state({ completed, lastExportAt: now - 20 * DAY, backupSnoozedAt: now - DAY }), now)).toBe(false);
    expect(needsBackup(state({ completed, lastExportAt: now - 8 * DAY }), now, 7)).toBe(true);
  });

  it('does not remind about saved code alone before any lesson is completed', async () => {
    const { needsBackup } = await loadStore();
    expect(needsBackup(state({ code: { a: '<p>' } }), now)).toBe(false);
  });
});
