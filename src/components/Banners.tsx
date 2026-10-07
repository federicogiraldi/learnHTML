import { useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { downloadProgress } from '../store/backup';
import { progress, useStorageWritable } from '../store/progress';
import { useStrings } from '../i18n';

/** Look for a new version this often while the app stays open. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

/** Shown while localStorage cannot be written (private mode, blocked storage, full quota). */
export function StorageBanner() {
  const writable = useStorageWritable();
  const [dismissed, setDismissed] = useState(false);
  const t = useStrings();
  if (writable || dismissed) return null;
  return (
    <div className="banner warn" role="alert">
      <p>
        <strong>{t.notSavedTitle}</strong> {t.notSavedText}
      </p>
      <button type="button" className="btn small ghost" onClick={downloadProgress}>
        {t.exportProgress}
      </button>
      <button type="button" className="btn small ghost" onClick={() => setDismissed(true)} aria-label={t.dismiss}>
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
  const t = useStrings();
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
      <p>{t.newVersion}</p>
      <button type="button" className="btn small primary" onClick={update}>
        {t.update}
      </button>
      <button type="button" className="btn small ghost" onClick={() => setNeedRefresh(false)}>
        {t.later}
      </button>
    </div>
  );
}
