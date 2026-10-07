import type { CheckResult, JsCheck } from '../content/types';

/**
 * Checks for JavaScript lessons. They don't run in the app: each one becomes a small expression that is
 * evaluated inside the sandbox after the learner's script, with the helpers of `src/engine/js/runtime.ts` as `h`.
 * Arguments must be plain data (JSON values, RegExps, undefined) or other JS checks.
 */

type Pattern = RegExp | string;
type Arg = unknown;

const lit = (v: Arg): string => {
  if (v === undefined) return 'undefined';
  if (v instanceof RegExp) return v.toString();
  if (isJsCheck(v)) return `(h) => (${v.js})`;
  if (Array.isArray(v)) return `[${v.map(lit).join(', ')}]`;
  if (v && typeof v === 'object') return `{${Object.entries(v).map(([k, x]) => `${JSON.stringify(k)}: ${lit(x)}`).join(', ')}}`;
  if (typeof v === 'number' && !Number.isFinite(v)) return String(v);
  return JSON.stringify(v);
};

export const isJsCheck = (v: unknown): v is JsCheck => !!v && typeof v === 'object' && typeof (v as JsCheck).js === 'string';

const call = (name: string, ...args: Arg[]): JsCheck => {
  while (args.length && args[args.length - 1] === undefined) args.pop();
  return { js: `h.${name}(${args.map(lit).join(', ')})` };
};

/** Helpers available inside the sandbox; see the runtime for what each does. */
export interface Helpers {
  logs: { level: string; text: string }[];
  errors: { message: string; line?: number }[];
  alerts: string[];
  /** The learner's script, and the same with comments and string contents blanked. */
  source: string;
  code: string;
  document: Document;
  window: Window & Record<string, unknown>;
  storage: Storage;
  inspect(v: unknown): string;
  equal(a: unknown, b: unknown): boolean;
  /** Waits until timers and fetches are done (up to ~1.5 s). */
  settle(maxMs?: number): Promise<void>;
  wait(ms: number): Promise<void>;
  /** Reads a global variable, function or class by name (also top-level let/const). */
  get<T = unknown>(name: string): T;
  has(name: string): boolean;
  click(selector: string, times?: number): Promise<boolean>;
  type(selector: string, value: string): Promise<boolean>;
  key(selector: string, key: string): Promise<boolean>;
  submit(selector: string): Promise<boolean | null>;
}

// ---------- console ----------
/** Some console line matches `pattern` (a string must equal the whole line). */
export const logged = (pattern: Pattern, message?: string) => call('logged', pattern, message);
export const notLogged = (pattern: Pattern, message?: string) => call('notLogged', pattern, message);
export const logCount = (min: number, message?: string) => call('logCount', min, message);
/** Lines matching each pattern appear in this order (other lines may come in between). */
export const loggedInOrder = (patterns: Pattern[], message?: string) => call('loggedInOrder', patterns, message);
export const alerted = (pattern: Pattern, message?: string) => call('alerted', pattern, message);

// ---------- values ----------
export const definesFunction = (name: string, message?: string) => call('definesFunction', name, message);
export const definesClass = (name: string, message?: string) => call('definesClass', name, message);
/** A global (including top-level let/const) deep-equals `expected`. */
export const variableEquals = (name: string, expected: unknown, message?: string) => call('variableEquals', name, expected, message);
/** Calling the global function `name` with `args` returns (or resolves to) a value deep-equal to `expected`. */
export const returns = (name: string, args: unknown[], expected: unknown, message?: string) => call('returns', name, args, expected, message);

// ---------- source ----------
/** The code (without comments and string contents) matches `re`, e.g. usesMethod(/\.map\(/). */
export const codeMatches = (re: RegExp, message: string) => call('codeMatches', re, message);
export const codeNotMatches = (re: RegExp, message: string) => call('codeNotMatches', re, message);
export const usesMethod = (re: RegExp, message?: string) =>
  codeMatches(re, message ?? `Use ${re.source.replace(/\\/g, '').replace(/\($/, '()')}.`);
export const noVar = (message?: string) => call('noVar', message);
export const declaredWith = (name: string, kind: 'let' | 'const', message?: string) => call('declaredWith', name, kind, message);

// ---------- the page ----------
export const exists = (selector: string, message?: string) => call('exists', selector, message);
/** Some element matching `selector` has text matching `pattern` (a string must equal the whole text). */
export const domText = (selector: string, pattern: Pattern, message?: string) => call('domText', selector, pattern, message);
export const domCount = (selector: string, n: number | { min?: number; max?: number }, message?: string) =>
  call('domCount', selector, n, message);
export const hasClass = (selector: string, cls: string, expected = true, message?: string) => call('hasClass', selector, cls, expected, message);
/** `pattern` null means the attribute must be absent. */
export const attr = (selector: string, name: string, pattern: Pattern | null, message?: string) => call('attr', selector, name, pattern, message);
export const inlineStyle = (selector: string, prop: string, pattern: Pattern, message?: string) => call('style', selector, prop, pattern, message);

// ---------- interaction ----------
/** Clicks the element (`times` times), waits for timers and fetches, then runs `check`. */
export const clickThen = (selector: string, check: JsCheck, times = 1) => call('clickThen', selector, check, times);
/** Types `value` into an input (firing input and change events), then runs `check`. */
export const typeThen = (selector: string, value: string, check: JsCheck) => call('typeThen', selector, value, check);
export const keyThen = (selector: string, key: string, check: JsCheck) => call('keyThen', selector, key, check);
/** Submits the form; passes only if the handler called preventDefault() and `check` passes. */
export const submitThen = (selector: string, check: JsCheck) => call('submitThen', selector, check);
/** localStorage[key] equals `expected`; non-string expectations are compared after JSON.parse. */
export const storageEquals = (key: string, expected: unknown, message?: string) => call('storageEquals', key, expected, message);

export const pass: JsCheck = { js: 'true' };

/** Every check passes; reports the first failure. */
export const all = (...checks: JsCheck[]) => call('all', ...checks);

/**
 * A custom check. `fn` is converted to source and run in the sandbox, so it may only use its `h` argument and
 * browser globals — not variables or imports from the lesson file.
 */
export const check = (fn: (h: Helpers) => CheckResult | Promise<CheckResult>): JsCheck => ({ js: `(${fn.toString()})(h)` });
