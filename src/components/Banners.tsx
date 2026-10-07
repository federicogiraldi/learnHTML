import { useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { downloadProgress } from '../store/backup';
import { progress, useStorageWritable } from '../store/progress';

/** Look for a new version this often while the app stays open. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

/** Shown while localStorage cannot be written (private mode, blocked storage, full quota). */
export function StorageBanner() {
  const writable = useStorageWritable();
  const [dismissed, setDismissed] = useState(false);
  if (writable || dismissed) return null;
  return (
    <div className="banner warn" role="alert">
      <p>
        <strong>Your progress isn’t being saved.</strong> This browser is blocking storage (private window, blocked
        site data or full disk), so everything is lost when you close the tab. Export it to keep a copy.
      </p>
      <button type="button" className="btn small ghost" onClick={downloadProgress}>
        Export progress
      </button>
      <button type="button" className="btn small ghost" onClick={() => setDismissed(true)} aria-label="Dismiss">
        ✕
      </button>
    </div>
  );
}

/**
 * A new service worker waits until the learner chooses to update, so the page never reloads by surprise.
 * Pending edits are saved first, and only the tab that asked reloads.
 */
export function UpdateBanner() {
  const registration = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const requested = useRef(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, r) {
      registration.current = r;
      if (r) setInterval(() => r.update().catch(() => {}), UPDATE_CHECK_MS);
    },
    // Called when the new worker takes control. Other tabs keep running the loaded version until reloaded.
    onNeedReload() {
      progress.flush();
      if (requested.current) location.reload();
    },
  });

  if (!needRefresh) return null;

  const update = () => {
    requested.current = true;
    progress.flush();
    // Another tab already activated the new version: there is nothing waiting, just reload.
    if (!registration.current?.waiting) location.reload();
    else void updateServiceWorker(true);
  };

  return (
    <div className="banner info" role="status">
      <p>New version available.</p>
      <button type="button" className="btn small primary" onClick={update}>
        Update
      </button>
      <button type="button" className="btn small ghost" onClick={() => setNeedRefresh(false)}>
        Later
      </button>
    </div>
  );
}
