import { describe, expect, it, vi } from 'vitest';
import { requestPersistentStorage } from './persistence';

const storage = (over: Partial<StorageManager>) => over as StorageManager;

describe('requestPersistentStorage', () => {
  it('does not ask again when storage is already persistent', async () => {
    const persist = vi.fn();
    expect(await requestPersistentStorage(storage({ persisted: async () => true, persist }))).toBe('persisted');
    expect(persist).not.toHaveBeenCalled();
  });

  it('asks for persistence and reports the answer', async () => {
    const persisted = async () => false;
    expect(await requestPersistentStorage(storage({ persisted, persist: async () => true }))).toBe('persisted');
    expect(await requestPersistentStorage(storage({ persisted, persist: async () => false }))).toBe('best-effort');
  });

  it('handles browsers without the API or that reject the request', async () => {
    expect(await requestPersistentStorage(undefined)).toBe('unsupported');
    expect(await requestPersistentStorage(storage({}))).toBe('unsupported');
    const persist = () => Promise.reject(new Error('nope'));
    expect(await requestPersistentStorage(storage({ persisted: async () => false, persist }))).toBe('best-effort');
  });
});
