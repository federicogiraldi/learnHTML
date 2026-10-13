import type { SqlRequest, SqlResponse, WorkerMessage } from './protocol';

/** A run that takes longer than this is stopped (a runaway recursive query, a huge cross join…). */
export const SQL_TIME_LIMIT_MS = 3000;

export const stoppedMessage = `Stopped: your SQL ran for more than ${SQL_TIME_LIMIT_MS / 1000} seconds.`;
export const engineFailedMessage = 'The SQL engine couldn’t start. Reload the page to try again.';

export type SqlOutcome = SqlResponse | { failure: string };

interface Pending {
  resolve: (r: SqlOutcome) => void;
  timer: ReturnType<typeof setTimeout>;
}

let worker: Worker | null = null;
let ready: Promise<void> | null = null;
const pending = new Map<number, Pending>();
let nextId = 0;

function stop(failure: string) {
  worker?.terminate();
  worker = null;
  ready = null;
  for (const [id, p] of pending) {
    clearTimeout(p.timer);
    p.resolve({ failure });
    pending.delete(id);
  }
}

function start() {
  if (worker && ready) return ready;
  const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  worker = w;
  ready = new Promise<void>((resolve, reject) => {
    w.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const m = e.data;
      if (m.type === 'ready') resolve();
      else if (m.type === 'failed') reject(new Error(m.message));
      else {
        const p = pending.get(m.id);
        if (!p) return;
        clearTimeout(p.timer);
        pending.delete(m.id);
        p.resolve(m);
      }
    };
    w.onerror = (e) => reject(new Error(e.message));
  });
  // A failed start is retried on the next run.
  ready.catch(() => worker === w && stop(engineFailedMessage));
  return ready;
}

/**
 * Runs the learner's script on a new copy of the lesson's database, then the checks' extra queries. Runs that take
 * too long terminate the worker (a new one starts on the next run).
 */
export async function runSql(request: Omit<SqlRequest, 'id'>, signal?: AbortSignal): Promise<SqlOutcome> {
  try {
    await start();
  } catch {
    return { failure: engineFailedMessage };
  }
  if (signal?.aborted) return { failure: 'Cancelled.' };
  const id = ++nextId;
  return new Promise<SqlOutcome>((resolve) => {
    const timer = setTimeout(() => stop(stoppedMessage), SQL_TIME_LIMIT_MS);
    pending.set(id, { resolve, timer });
    worker!.postMessage({ ...request, id } satisfies SqlRequest);
  });
}
