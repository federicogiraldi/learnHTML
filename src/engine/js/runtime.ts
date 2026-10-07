/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The script that runs first inside the sandbox iframe. It is serialized with `toString()`, so it must be
 * completely self-contained: no imports and no references to anything outside the function.
 *
 * It captures the console and errors, replaces fetch and localStorage with in-memory fakes, guards loops,
 * runs the learner's script where index.html loads script.js and, in test mode, runs the lesson's checks.
 * Everything is reported to the app with postMessage.
 */

export interface FetchMock {
  /** JSON-serializable body (sent as JSON) or a string (sent as text). */
  body?: unknown;
  status?: number;
  /** Response delay in ms (default 300). */
  delay?: number;
  /** Reject like a network failure instead of responding. */
  networkError?: boolean;
}

export interface RuntimeConfig {
  runId: string;
  mode: 'preview' | 'test';
  /** The learner's script, with loop guards inserted. */
  code: string;
  /** The script as written, and with comments and strings blanked (for source checks). */
  source: string;
  stripped: string;
  /** Check expressions (test mode), evaluated with the helpers as `h`. */
  checks: string[];
  mocks: Record<string, FetchMock>;
  storage: Record<string, string>;
  /** Multiplier for timer and fetch delays: 1 in the preview, smaller in tests so they run fast. */
  timeScale: number;
  /** A loop running longer than this (ms) is stopped. */
  loopLimitMs: number;
  loopGuard: string;
  /** Whether index.html loads script.js (always true for console lessons). */
  scriptTag: boolean;
}

export function sandboxRuntime(cfg: RuntimeConfig) {
  const w = window as any;
  const post = (msg: Record<string, unknown>) => parent.postMessage({ ...msg, __learnweb: cfg.runId }, '*');
  const realSetTimeout = window.setTimeout.bind(window);
  const realClearTimeout = window.clearTimeout.bind(window);
  const realSetInterval = window.setInterval.bind(window);
  const realClearInterval = window.clearInterval.bind(window);
  const now = () => performance.now();

  // ---------- formatting values like a browser console ----------
  const quote = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
  const keyText = (k: string) => (/^[A-Za-z_$][\w$]*$/.test(k) ? k : quote(k));
  function inspect(v: any, depth: number, seen: any[]): string {
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    const t = typeof v;
    if (t === 'string') return depth === 0 ? v : quote(v);
    if (t === 'number') return Object.is(v, -0) ? '-0' : String(v);
    if (t === 'bigint') return `${v}n`;
    if (t === 'boolean' || t === 'symbol') return String(v);
    if (t === 'function') {
      if (/^class\b/.test(Function.prototype.toString.call(v))) return `[class ${v.name || '(anonymous)'}]`;
      return `[Function: ${v.name || '(anonymous)'}]`;
    }
    if (seen.includes(v)) return '[Circular]';
    if (v instanceof Error) return `${v.name}: ${v.message}`;
    if (v instanceof Date) return isNaN(v.getTime()) ? 'Invalid Date' : v.toISOString();
    if (v instanceof RegExp) return String(v);
    if (typeof Element !== 'undefined' && v instanceof Element) {
      const id = v.id ? `#${v.id}` : '';
      const cls = typeof v.className === 'string' && v.className.trim() ? `.${v.className.trim().split(/\s+/).join('.')}` : '';
      return `<${v.tagName.toLowerCase()}${id}${cls}>`;
    }
    if (typeof Node !== 'undefined' && v instanceof Node) return `[${v.nodeName}]`;
    if (v instanceof Promise) return 'Promise { … }';
    const next = [...seen, v];
    const tooDeep = depth > 3;
    const join = (items: string[], open: string, close: string) =>
      items.length === 0 ? `${open}${close}` : open === '[' ? `[${items.join(', ')}]` : `${open} ${items.join(', ')} ${close}`;
    if (Array.isArray(v)) {
      if (tooDeep) return '[Array]';
      const items = v.slice(0, 100).map((x: any) => inspect(x, depth + 1, next));
      if (v.length > 100) items.push(`… ${v.length - 100} more items`);
      return join(items, '[', ']');
    }
    if (v instanceof Map) {
      if (tooDeep) return '[Map]';
      return `Map(${v.size}) ${join([...v].map(([k, x]) => `${inspect(k, depth + 1, next)} => ${inspect(x, depth + 1, next)}`), '{', '}')}`;
    }
    if (v instanceof Set) {
      if (tooDeep) return '[Set]';
      return `Set(${v.size}) ${join([...v].map((x) => inspect(x, depth + 1, next)), '{', '}')}`;
    }
    const proto = Object.getPrototypeOf(v);
    const name = proto && proto !== Object.prototype && proto.constructor && proto.constructor.name;
    if (tooDeep) return name ? `[${name}]` : '[Object]';
    const items = Object.keys(v).map((k) => `${keyText(k)}: ${inspect(v[k], depth + 1, next)}`);
    return (name ? `${name} ` : '') + join(items, '{', '}');
  }
  const format = (args: any[]) => args.map((a) => inspect(a, 0, [])).join(' ');

  // ---------- console ----------
  const logs: { level: string; text: string }[] = [];
  for (const level of ['log', 'info', 'warn', 'error', 'debug']) {
    const original = (console as any)[level];
    (console as any)[level] = (...args: any[]) => {
      const entry = { level: level === 'debug' ? 'log' : level, text: format(args) };
      logs.push(entry);
      post({ type: 'log', ...entry });
      original.apply(console, args);
    };
  }
  console.table = (data: any) => console.log(data);
  console.clear = () => {
    logs.length = 0;
    post({ type: 'clear' });
  };

  // ---------- errors ----------
  const errors: { message: string; line?: number }[] = [];
  const lineOf = (err: any): number | undefined => {
    const m = /script\.js:(\d+)/.exec(String(err && err.stack));
    return m ? Number(m[1]) : undefined;
  };
  const describe = (err: any) =>
    err && typeof err === 'object' && 'message' in err ? `${err.name || 'Error'}: ${err.message}` : `Uncaught ${inspect(err, 1, [])}`;
  let running = false;
  let syntaxError = false;
  function report(err: any, line?: number) {
    if (err && err.__learnwebLoop) return; // already reported as a timeout
    const entry = { message: describe(err), line };
    errors.push(entry);
    post({ type: 'error', ...entry });
  }
  window.addEventListener('error', (e) => {
    e.preventDefault();
    if (running && e.error instanceof SyntaxError) syntaxError = true;
    const fromScript = /script\.js$/.test(e.filename || '') || running;
    report(e.error ?? { name: 'Error', message: e.message }, lineOf(e.error) ?? (fromScript ? e.lineno || undefined : undefined));
  });
  window.addEventListener('unhandledrejection', (e) => {
    e.preventDefault();
    report(e.reason, lineOf(e.reason));
  });

  // ---------- loop guard ----------
  let stopped = false;
  let burstStart = 0;
  let ticks = 0;
  const loopError = (line: number) => {
    const err: any = new Error(
      `Stopped: the loop on line ${line} ran for more than ${cfg.loopLimitMs / 1000} seconds. Is it infinite? Check its condition and that its counter changes.`,
    );
    err.__learnwebLoop = true;
    return err;
  };
  Object.defineProperty(window, cfg.loopGuard, {
    value: (line: number) => {
      if (stopped) throw loopError(line);
      if (++ticks % 1000 !== 0) return;
      const t = now();
      if (!burstStart) {
        // The burst lasts until the current task ends.
        burstStart = t;
        realSetTimeout(() => (burstStart = 0));
        return;
      }
      if (t - burstStart > cfg.loopLimitMs) {
        stopped = true;
        post({ type: 'timeout', line, message: loopError(line).message });
        throw loopError(line);
      }
    },
  });

  // ---------- timers (scaled in tests) and pending work ----------
  const timeouts = new Set<number>();
  let pendingFetches = 0;
  const scaled = (ms: any) => Math.max(0, (Number(ms) || 0) * cfg.timeScale);
  w.setTimeout = (fn: any, ms?: any, ...args: any[]) => {
    const id: number = realSetTimeout(() => {
      timeouts.delete(id);
      if (typeof fn === 'function') fn(...args);
    }, scaled(ms));
    timeouts.add(id);
    return id;
  };
  w.clearTimeout = (id: number) => {
    timeouts.delete(id);
    realClearTimeout(id);
  };
  w.setInterval = (fn: any, ms?: any, ...args: any[]) =>
    realSetInterval(() => typeof fn === 'function' && fn(...args), Math.max(scaled(ms), 1));
  w.clearInterval = (id: number) => realClearInterval(id);

  // ---------- fetch with fake data: there is no network in the sandbox ----------
  const mockFor = (url: string, method: string) => {
    const bare = url.replace(/[?#].*$/, '');
    for (const key of [`${method} ${url}`, `${method} ${bare}`, url, bare]) {
      if (Object.prototype.hasOwnProperty.call(cfg.mocks, key)) return cfg.mocks[key];
    }
    return undefined;
  };
  const known = Object.keys(cfg.mocks);
  w.fetch = (input: any, init?: any) => {
    const url = String(input && typeof input === 'object' && 'url' in input ? input.url : input);
    const method = String((init && init.method) || 'GET').toUpperCase();
    const mock = mockFor(url, method);
    pendingFetches++;
    return new Promise((resolve, reject) => {
      realSetTimeout(() => {
        pendingFetches--;
        if (!mock) {
          const list = known.length ? ` Available in this lesson: ${known.join(', ')}` : '';
          reject(new TypeError(`Failed to fetch ${url}: LearnWeb's sandbox has no network.${list}`));
        } else if (mock.networkError) {
          reject(new TypeError('Failed to fetch'));
        } else {
          const text = typeof mock.body === 'string';
          const body = text ? (mock.body as string) : JSON.stringify(mock.body ?? null);
          const status = mock.status ?? 200;
          resolve(
            new Response([204, 304].includes(status) ? null : body, {
              status,
              headers: { 'Content-Type': text ? 'text/plain' : 'application/json' },
            }),
          );
        }
      }, scaled(mock?.delay ?? 300));
    });
  };

  // ---------- localStorage / sessionStorage: in memory, reported to the app ----------
  const makeStorage = (initial: Record<string, string>, sync: boolean) => {
    const data = new Map(Object.entries(initial));
    const changed = () => sync && post({ type: 'storage', data: Object.fromEntries(data) });
    return {
      getItem: (k: any) => (data.has(String(k)) ? data.get(String(k)) : null),
      setItem: (k: any, v: any) => {
        data.set(String(k), String(v));
        changed();
      },
      removeItem: (k: any) => {
        data.delete(String(k));
        changed();
      },
      clear: () => {
        data.clear();
        changed();
      },
      key: (i: number) => [...data.keys()][i] ?? null,
      get length() {
        return data.size;
      },
    };
  };
  const storage = makeStorage(cfg.storage, true);
  Object.defineProperty(window, 'localStorage', { value: storage, configurable: true });
  Object.defineProperty(window, 'sessionStorage', { value: makeStorage({}, false), configurable: true });

  // ---------- dialogs: in tests they are recorded instead of shown ----------
  const alerts: string[] = [];
  if (cfg.mode === 'test') {
    w.alert = (m?: any) => {
      alerts.push(String(m));
    };
    w.confirm = () => true;
    w.prompt = () => null;
  }

  // ---------- running the learner's script ----------
  let ran = false;
  function runScript(placeholder: Element | null) {
    if (ran) return;
    ran = true;
    const s = document.createElement('script');
    s.textContent = `${cfg.code}\n//# sourceURL=script.js`;
    running = true;
    // Inserting an inline script runs it right away; errors go to the 'error' listener above.
    if (placeholder) placeholder.replaceWith(s);
    else (document.body || document.documentElement).appendChild(s);
    running = false;
    post({ type: 'ran', syntaxError });
    if (cfg.mode === 'test') void runChecks();
  }
  Object.defineProperty(window, '__learnwebRun', {
    value: (deferred: boolean) => {
      const placeholder = document.currentScript;
      if (!deferred) return runScript(placeholder);
      // Deferred and module scripts run once the page is parsed.
      placeholder?.remove();
      document.addEventListener('DOMContentLoaded', () => runScript(null));
    },
  });
  if (!cfg.scriptTag) {
    document.addEventListener('DOMContentLoaded', () => {
      post({ type: 'missing-script' });
      if (cfg.mode === 'test') void runChecks();
    });
  }

  // ---------- test helpers, available to checks as `h` ----------
  async function settle(maxMs = 1500) {
    const end = now() + maxMs;
    let quiet = 0;
    while (now() < end) {
      await new Promise((r) => realSetTimeout(r, 0));
      if (timeouts.size === 0 && pendingFetches === 0) {
        if (++quiet >= 3) return;
      } else quiet = 0;
    }
  }
  // Called as a method, eval is indirect: it runs in global scope and sees top-level let/const.
  const evalGlobal = window.eval;
  const lookup = (name: string): { found: boolean; value?: any } => {
    try {
      return { found: true, value: evalGlobal(name) };
    } catch {
      return { found: false }; // not declared (ReferenceError) or not a name
    }
  };
  const equal = (a: any, b: any): boolean => {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || !a || !b) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && equal(a[k], b[k]));
  };
  const show = (v: any) => inspect(v, 1, []);
  const test = (p: any, s: string) => (p instanceof RegExp ? p.test(s) : s.trim() === String(p));
  const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const $ = (sel: string) => document.querySelector(sel);
  const missing = (sel: string) => `There is no "${sel}" element on the page.`;
  const run = async (check: (hh: any) => any) => check(h);

  const h: any = {
    logs,
    errors,
    alerts,
    source: cfg.source,
    code: cfg.stripped,
    document,
    window,
    storage,
    inspect: show,
    equal,
    settle,
    /** Waits `ms` of the lesson's (possibly sped-up) time. */
    wait: (ms: number) => new Promise((r) => realSetTimeout(r, scaled(ms))),
    get: (name: string) => lookup(name).value,
    has: (name: string) => lookup(name).found,

    logged: (pattern: any, message?: string) =>
      logs.some((l) => test(pattern, l.text)) ||
      message ||
      (logs.length ? `Nothing in the console matches yet. Last line: "${logs[logs.length - 1].text}".` : 'Nothing was logged to the console yet.'),
    notLogged: (pattern: any, message?: string) => (logs.some((l) => test(pattern, l.text)) ? message || 'Something was logged that shouldn’t be.' : true),
    logCount: (min: number, message?: string) =>
      logs.length >= min || message || `Log at least ${min} line${min === 1 ? '' : 's'} (now ${logs.length}).`,
    loggedInOrder: (patterns: any[], message?: string) => {
      let i = 0;
      for (const l of logs) if (i < patterns.length && test(patterns[i], l.text)) i++;
      return i === patterns.length || message || `The console output isn't in the expected order (matched ${i} of ${patterns.length}).`;
    },
    alerted: (pattern: any, message?: string) => alerts.some((a) => test(pattern, a)) || message || 'Show the message with alert().',

    definesFunction: (name: string, message?: string) => {
      const r = lookup(name);
      if (!r.found) return message || `Define a function called ${name}.`;
      return typeof r.value === 'function' || message || `${name} should be a function (it is ${typeof r.value}).`;
    },
    definesClass: (name: string, message?: string) => {
      const r = lookup(name);
      return (r.found && typeof r.value === 'function' && /^class\b/.test(Function.prototype.toString.call(r.value))) || message || `Define a class called ${name}.`;
    },
    variableEquals: (name: string, expected: any, message?: string) => {
      const r = lookup(name);
      if (!r.found) return message || `Declare a variable called ${name}.`;
      return equal(r.value, expected) || message || `${name} should be ${show(expected)} (it is ${show(r.value)}).`;
    },
    returns: async (name: string, args: any[], expected: any, message?: string) => {
      const r = lookup(name);
      if (!r.found || typeof r.value !== 'function') return `Define a function called ${name}.`;
      const call = `${name}(${args.map(show).join(', ')})`;
      let got;
      try {
        got = r.value(...args);
        if (got instanceof Promise) got = await got;
      } catch (err) {
        return `${call} threw ${describe(err)}${lineOf(err) ? ` (line ${lineOf(err)})` : ''}.`;
      }
      return equal(got, expected) || message || `${call} should return ${show(expected)}, but returned ${show(got)}.`;
    },

    codeMatches: (re: RegExp, message: string) => re.test(cfg.stripped) || message,
    codeNotMatches: (re: RegExp, message: string) => !re.test(cfg.stripped) || message,
    noVar: (message?: string) => !/\bvar\s/.test(cfg.stripped) || message || 'Use let or const instead of var.',
    declaredWith: (name: string, kind: string, message?: string) =>
      new RegExp(`\\b${kind}\\s+(?:[^;=]*[,{\\[]\\s*)?${name}\\b`).test(cfg.stripped) || message || `Declare ${name} with ${kind}.`,

    exists: (sel: string, message?: string) => !!$(sel) || message || missing(sel),
    domText: (sel: string, pattern: any, message?: string) => {
      const els = [...document.querySelectorAll(sel)];
      if (els.length === 0) return message || missing(sel);
      return els.some((el) => test(pattern, text(el))) || message || `"${sel}" shows "${text(els[0])}", which isn't what was asked.`;
    },
    domCount: (sel: string, n: any, message?: string) => {
      const got = document.querySelectorAll(sel).length;
      const { min, max } = typeof n === 'number' ? { min: n, max: n } : n;
      const ok = (min === undefined || got >= min) && (max === undefined || got <= max);
      return ok || message || `Expected ${min === max ? min : `${min ?? 0}–${max ?? '∞'}`} "${sel}" on the page, found ${got}.`;
    },
    hasClass: (sel: string, cls: string, expected = true, message?: string) => {
      const el = $(sel);
      if (!el) return message || missing(sel);
      return el.classList.contains(cls) === expected || message || `"${sel}" should ${expected ? '' : 'not '}have the class "${cls}".`;
    },
    attr: (sel: string, name: string, pattern: any, message?: string) => {
      const el = $(sel);
      if (!el) return message || missing(sel);
      const v = el.getAttribute(name);
      if (pattern === null) return v === null || message || `"${sel}" should not have ${name}.`;
      return (v !== null && test(pattern, v)) || message || `"${sel}" should have ${name}="${pattern instanceof RegExp ? '…' : pattern}" (now: ${v === null ? 'none' : `"${v}"`}).`;
    },
    style: (sel: string, prop: string, pattern: any, message?: string) => {
      const el = $(sel) as HTMLElement | null;
      if (!el) return message || missing(sel);
      const v = el.style.getPropertyValue(prop);
      return test(pattern, v) || message || `"${sel}" should have the inline style ${prop} set as asked (now: ${v || 'none'}).`;
    },

    click: async (sel: string, times = 1) => {
      const el = $(sel) as HTMLElement | null;
      if (!el) return false;
      for (let k = 0; k < times; k++) el.click();
      await settle();
      return true;
    },
    type: async (sel: string, value: string) => {
      const el = $(sel) as HTMLInputElement | null;
      if (!el) return false;
      el.focus();
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      await settle();
      return true;
    },
    key: async (sel: string, key: string) => {
      const el = ($(sel) || document.body) as HTMLElement;
      for (const type of ['keydown', 'keyup']) el.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }));
      await settle();
      return true;
    },
    submit: async (sel: string) => {
      const form = $(sel) as HTMLFormElement | null;
      if (!form) return null;
      const e = new SubmitEvent('submit', { bubbles: true, cancelable: true });
      form.dispatchEvent(e);
      await settle();
      return !unprevented.has(e);
    },
    clickThen: async (sel: string, check: any, times = 1) => ((await h.click(sel, times)) ? run(check) : missing(sel)),
    typeThen: async (sel: string, value: string, check: any) => ((await h.type(sel, value)) ? run(check) : missing(sel)),
    keyThen: async (sel: string, key: string, check: any) => (await h.key(sel, key), run(check)),
    submitThen: async (sel: string, check: any) => {
      const prevented = await h.submit(sel);
      if (prevented === null) return missing(sel);
      if (!prevented) return 'Call event.preventDefault() in the submit handler, or the page reloads.';
      return run(check);
    },
    storageEquals: (key: string, expected: any, message?: string) => {
      const raw = storage.getItem(key);
      if (raw === null) return message || `Nothing is saved under "${key}" in localStorage.`;
      let value: any = raw;
      if (typeof expected !== 'string') {
        try {
          value = JSON.parse(raw as string);
        } catch {
          return `localStorage "${key}" isn't valid JSON: use JSON.stringify().`;
        }
      }
      return equal(value, expected) || message || `localStorage "${key}" should be ${show(expected)} (now ${show(value)}).`;
    },
    all: async (...checks: any[]) => {
      for (const c of checks) {
        const r = await run(c);
        if (r !== true) return r;
      }
      return true;
    },
  };

  async function runChecks() {
    await settle();
    const results: (true | string)[] = [];
    for (const src of cfg.checks) {
      let r: any;
      if (syntaxError) {
        r = `Fix the syntax error first (line ${errors[0]?.line ?? '?'}).`;
      } else {
        try {
          const check = new Function('h', `return (${src});`);
          r = await Promise.race([
            Promise.resolve(check(h)),
            new Promise((res) => realSetTimeout(() => res('This check timed out: is something waiting forever?'), 3000)),
          ]);
        } catch (err: any) {
          r = err && err.__learnwebLoop ? err.message : `Your code threw ${describe(err)}${lineOf(err) ? ` (line ${lineOf(err)})` : ''}.`;
        }
      }
      results.push(r === true ? true : typeof r === 'string' && r ? r : 'Not yet.');
    }
    post({ type: 'results', results, errors, logs });
  }

  // ---------- page behaviour in the preview ----------
  /** Submit events the learner's code didn't cancel (the sandbox cancels them so the frame never navigates). */
  const unprevented = new WeakSet<Event>();
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest?.('a[href]');
    if (!a || e.defaultPrevented) return;
    const href = a.getAttribute('href') || '';
    e.preventDefault();
    if (href.charAt(0) === '#') {
      const t = document.getElementById(decodeURIComponent(href.slice(1)));
      if (t) t.scrollIntoView({ behavior: 'smooth' });
    } else if (cfg.mode === 'preview') {
      window.open((a as HTMLAnchorElement).href, '_blank', 'noopener');
    }
  });
  // Registered on window so the learner's own submit handlers run first.
  window.addEventListener('submit', (e) => {
    if (e.defaultPrevented) return;
    unprevented.add(e);
    e.preventDefault();
    console.warn('The form was submitted, so a real page would reload here. Call event.preventDefault() in your submit handler.');
  });
}
