import { useSyncExternalStore } from 'react';

/** Chromium's install prompt event (not in the DOM typings). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/** Captures the install prompt; call early, since the browser may fire it before React mounts. */
export function listenForInstallPrompt(win: Window = window) {
  win.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  win.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    notify();
  });
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** True when the browser offered to install the app and it is not installed yet. */
export function useCanInstall(): boolean {
  return useSyncExternalStore(subscribe, () => deferred !== null && !installed);
}

export function useInstalled(): boolean {
  return useSyncExternalStore(subscribe, () => installed || isStandalone());
}

/** Shows the browser's install dialog. The event can be used once. */
export async function promptInstall() {
  const e = deferred;
  if (!e) return;
  deferred = null;
  notify();
  await e.prompt();
  if ((await e.userChoice).outcome === 'accepted') installed = true;
  notify();
}

/** Running as an installed app rather than in a browser tab. */
export function isStandalone(win: Window = window): boolean {
  return (
    win.matchMedia?.('(display-mode: standalone)').matches === true ||
    (win.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iPhone and iPad have no install prompt: apps are added from Share → Add to Home Screen. */
export function isIos(nav: Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'> = navigator): boolean {
  return /iPad|iPhone|iPod/.test(nav.userAgent) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
}
