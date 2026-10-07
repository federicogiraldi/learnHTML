import { useSyncExternalStore } from 'react';

/**
 * Persistent storage asks the browser not to evict this site's data (localStorage included) when the disk is
 * low. Without it, data is "best effort" and may be cleared under storage pressure.
 */
export type PersistStatus = 'checking' | 'persisted' | 'best-effort' | 'unsupported';

let status: PersistStatus = 'checking';
const listeners = new Set<() => void>();

function setStatus(next: PersistStatus) {
  status = next;
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function usePersistStatus(): PersistStatus {
  return useSyncExternalStore(subscribe, () => status);
}

/** Checks whether storage is already persistent and, if not, asks for it. Never throws. */
export async function requestPersistentStorage(storage: StorageManager | undefined = navigator.storage) {
  if (!storage?.persist) {
    setStatus('unsupported');
    return status;
  }
  try {
    const persisted = (await storage.persisted?.()) || (await storage.persist());
    setStatus(persisted ? 'persisted' : 'best-effort');
  } catch {
    setStatus('best-effort');
  }
  return status;
}
