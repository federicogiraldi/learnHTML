import { combine } from '../render';
import { instrumentLoops, LOOP_GUARD, stripCommentsAndStrings } from './instrument';
import { sandboxRuntime, type FetchMock, type RuntimeConfig } from './runtime';

/** A loop that runs longer than this is stopped, and so is a script that doesn't finish in this time. */
export const TIME_LIMIT_MS = 2000;
/** Timers and fake network delays run this much faster while checks run. */
const TEST_TIME_SCALE = 0.05;

export interface SandboxFiles {
  /** index.html, or '' for console-only lessons. */
  html: string;
  css?: string;
  js: string;
}

export interface ConsoleEntry {
  level: 'log' | 'info' | 'warn' | 'error';
  text: string;
  /** Line in script.js, for errors. */
  line?: number;
}

export interface SandboxOptions {
  mode: 'preview' | 'test';
  checks?: string[];
  mocks?: Record<string, FetchMock>;
  storage?: Record<string, string>;
}

const SCRIPT_TAG = /<script\b([^>]*)\bsrc\s*=\s*["']?(?:\.\/)?script\.js["']?([^>]*)>\s*<\/script\s*>/i;

/** Keeps JSON safe inside an inline <script>. */
const scriptJson = (v: unknown) =>
  JSON.stringify(v).replace(/[<\u2028\u2029]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);

/**
 * The srcdoc of a sandbox frame: the learner's page (or an empty page for console lessons) with the runtime
 * first in <head>, and script.js run where index.html loads it.
 */
export function buildSandboxDoc(files: SandboxFiles, runId: string, opts: SandboxOptions): string {
  const page = files.html.trim() !== '';
  let html = page ? files.html : '<!DOCTYPE html>\n<html lang="en">\n<head><meta charset="utf-8"></head>\n<body>\n<script src="script.js"></script>\n</body>\n</html>';
  const tag = SCRIPT_TAG.exec(html);
  if (tag) {
    const deferred = /\b(defer|async)\b|type\s*=\s*["']?module/i.test(tag[1] + tag[2]);
    html = html.replace(SCRIPT_TAG, () => `<script>__learnwebRun(${deferred})</script>`);
  }
  const cfg: RuntimeConfig = {
    runId,
    mode: opts.mode,
    code: instrumentLoops(files.js),
    source: files.js,
    stripped: stripCommentsAndStrings(files.js),
    checks: opts.checks ?? [],
    mocks: opts.mocks ?? {},
    storage: opts.storage ?? {},
    timeScale: opts.mode === 'test' ? TEST_TIME_SCALE : 1,
    loopLimitMs: TIME_LIMIT_MS,
    loopGuard: LOOP_GUARD,
    scriptTag: !!tag,
  };
  // No network at all: fetch is faked by the runtime, and the CSP blocks anything that gets around it.
  const head =
    `<meta http-equiv="Content-Security-Policy" content="connect-src 'none'">` +
    `<script>(${sandboxRuntime.toString()})(${scriptJson(cfg)});</script>`;
  return combine(html, files.css, head);
}

type Message = { type: string; [k: string]: unknown };

export interface RunHandlers {
  onLog?: (entry: ConsoleEntry) => void;
  onClear?: () => void;
  onStorage?: (data: Record<string, string>) => void;
  onMissingScript?: () => void;
  /** The script finished its first (synchronous) run. */
  onRan?: (info: { syntaxError: boolean }) => void;
  /** The script was stopped (infinite loop, or it didn't finish in time). The frame is gone. */
  onStopped?: (message: string) => void;
  onResults?: (msg: { results: (true | string)[]; errors: { message: string; line?: number }[] }) => void;
}

let counter = 0;

/**
 * One sandbox iframe: `allow-scripts` without `allow-same-origin`, so the learner's code gets an opaque origin
 * and can't reach the app, its storage or its cookies. Every run gets a fresh frame.
 */
export class Sandbox {
  private frame: HTMLIFrameElement | null = null;
  private runId = '';
  private watchdog = 0;
  private handlers: RunHandlers = {};
  private readonly host: HTMLElement;
  private readonly visible: boolean;
  private readonly title: string;

  constructor(host: HTMLElement, { visible = false, title = 'Preview' }: { visible?: boolean; title?: string } = {}) {
    this.host = host;
    this.visible = visible;
    this.title = title;
    window.addEventListener('message', this.onMessage);
  }

  run(files: SandboxFiles, opts: SandboxOptions, handlers: RunHandlers) {
    this.stop();
    this.handlers = handlers;
    const runId = (this.runId = `run-${++counter}-${Math.random().toString(36).slice(2)}`);
    const frame = document.createElement('iframe');
    frame.title = this.title;
    frame.className = 'preview';
    frame.setAttribute(
      'sandbox',
      this.visible ? 'allow-scripts allow-forms allow-modals allow-popups' : 'allow-scripts allow-forms',
    );
    if (!this.visible) {
      frame.setAttribute('aria-hidden', 'true');
      frame.tabIndex = -1;
      Object.assign(frame.style, {
        position: 'fixed',
        left: '-10000px',
        top: '0',
        width: '800px',
        height: '600px',
        border: '0',
        visibility: 'hidden',
        pointerEvents: 'none',
      });
    }
    frame.srcdoc = buildSandboxDoc(files, runId, opts);
    this.frame = frame;
    this.host.appendChild(frame);
    // The loop guard stops most runaway code from inside; this catches anything else that never finishes.
    this.watchdog = window.setTimeout(() => this.halt(runId, timeoutMessage), TIME_LIMIT_MS + 1500);
  }

  /** Removes the frame (and with it any code still running in it). */
  stop() {
    clearTimeout(this.watchdog);
    this.runId = '';
    this.frame?.remove();
    this.frame = null;
  }

  dispose() {
    this.stop();
    window.removeEventListener('message', this.onMessage);
  }

  private halt(runId: string, message: string) {
    if (runId !== this.runId) return;
    const { onStopped } = this.handlers;
    this.stop();
    onStopped?.(message);
  }

  private onMessage = (e: MessageEvent) => {
    const data = e.data as Message & { __learnweb?: string };
    if (!this.frame || e.source !== this.frame.contentWindow || !data || data.__learnweb !== this.runId) return;
    const h = this.handlers;
    switch (data.type) {
      case 'log':
        h.onLog?.({ level: data.level as ConsoleEntry['level'], text: String(data.text) });
        break;
      case 'error':
        h.onLog?.({ level: 'error', text: String(data.message), line: data.line as number | undefined });
        break;
      case 'clear':
        h.onClear?.();
        break;
      case 'storage':
        h.onStorage?.(data.data as Record<string, string>);
        break;
      case 'missing-script':
        clearTimeout(this.watchdog);
        h.onMissingScript?.();
        break;
      case 'ran':
        clearTimeout(this.watchdog);
        h.onRan?.({ syntaxError: !!data.syntaxError });
        if (h.onResults) this.watchdog = window.setTimeout(() => this.halt(data.__learnweb!, 'The checks took too long to finish.'), 20000);
        break;
      case 'timeout':
        this.halt(this.runId, String(data.message));
        break;
      case 'results':
        clearTimeout(this.watchdog);
        h.onResults?.(data as unknown as Parameters<NonNullable<RunHandlers['onResults']>>[0]);
        break;
    }
  };
}

export const timeoutMessage = `Stopped: your code ran for more than ${TIME_LIMIT_MS / 1000} seconds. Is there an infinite loop?`;
export const missingScriptMessage =
  'index.html doesn’t load script.js, so your JavaScript isn’t running. Add <script src="script.js"></script> before </body>.';

export interface SandboxResult {
  results: (true | string)[];
  errors: { message: string; line?: number }[];
  /** Set when the code was stopped or never ran. */
  failure?: string;
}

/**
 * Runs the learner's files with `checks` in a fresh hidden sandbox and resolves with each check's result.
 * Aborting `signal` removes the sandbox right away (e.g. when a newer run replaces this one).
 */
export function runInSandbox(files: SandboxFiles, opts: Omit<SandboxOptions, 'mode'>, signal?: AbortSignal): Promise<SandboxResult> {
  return new Promise((resolve) => {
    const sandbox = new Sandbox(document.body);
    let missing = false;
    const n = opts.checks?.length ?? 0;
    const onAbort = () => done({ results: Array(n).fill('Cancelled.'), errors: [], failure: 'Cancelled.' });
    const done = (r: SandboxResult) => {
      signal?.removeEventListener('abort', onAbort);
      sandbox.dispose();
      resolve(r);
    };
    if (signal?.aborted) return onAbort();
    signal?.addEventListener('abort', onAbort);
    sandbox.run(
      files,
      { ...opts, mode: 'test' },
      {
        onMissingScript: () => (missing = true),
        onStopped: (message) => done({ results: Array(n).fill(message), errors: [], failure: message }),
        onResults: ({ results, errors }) =>
          done({ results, errors, failure: missing ? missingScriptMessage : undefined }),
      },
    );
  });
}
