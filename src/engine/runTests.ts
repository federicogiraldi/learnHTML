import { isCssLesson, isJsPageLesson, type Check, type Lesson, type SqlRun } from '../content/types';
import { validateCss } from './cssValidator';
import { runInSandbox } from './js/sandbox';
import { isJsCheck } from './jsChecks';
import { runSql } from './sql/runner';
import type { SqlResponse } from './sql/protocol';
import { isSqlCheck } from './sqlChecks';
import { renderPage } from './render';
import { validate, type Issue } from './validator';

export interface TaskResult {
  text: string;
  passed: boolean;
  message?: string;
  /** Added by the runner for every lesson (valid code), not one of the lesson's own tasks. */
  implicit?: boolean;
}

export interface TestRun {
  results: TaskResult[];
  issues: Issue[];
  cssIssues: Issue[];
  allPassed: boolean;
}

export function parse(code: string): Document {
  return new DOMParser().parseFromString(code, 'text/html');
}

const wellFormed = (text: string, issues: Issue[]): TaskResult =>
  issues.length === 0
    ? { text, passed: true, implicit: true }
    : { text, passed: false, message: `Line ${issues[0].line}: ${issues[0].message}`, implicit: true };

const toResult = (text: string, r: true | string): TaskResult =>
  r === true ? { text, passed: true } : { text, passed: false, message: r };

/**
 * Runs a lesson's checks. HTML lessons parse the code with DOMParser; CSS lessons render HTML + CSS in a
 * hidden frame so checks can read computed styles and layout. JavaScript lessons use `runJsTests`.
 */
export function runTests(lesson: Pick<Lesson, 'tasks' | 'starterCss'>, code: string, css = ''): TestRun {
  const cssMode = isCssLesson(lesson as Lesson);
  const doc = cssMode ? renderPage(code, css) : parse(code);
  const issues = validate(code);
  const cssIssues = cssMode ? validateCss(css) : [];
  const results: TaskResult[] = lesson.tasks.map(({ text, check }) => {
    let r: true | string;
    try {
      r = isJsCheck(check)
        ? 'This check needs the JavaScript runner.'
        : isSqlCheck(check)
          ? 'This check needs the SQL runner.'
          : (check as Check)(doc, code, css);
    } catch (err) {
      r = `Check failed to run: ${(err as Error).message}`;
    }
    return toResult(text, r);
  });
  results.push(wellFormed('Your HTML is well-formed (no structural errors).', issues));
  if (cssMode) results.push(wellFormed('Your CSS is valid (no syntax errors).', cssIssues));
  return { results, issues, cssIssues, allPassed: results.every((r) => r.passed) };
}

export interface JsFiles {
  js: string;
  html?: string;
  css?: string;
}

/**
 * Runs a JavaScript lesson's checks in a fresh sandbox: the learner's script runs first, then every check,
 * in order. Page lessons also get the HTML (and CSS) validity tasks.
 */
export async function runJsTests(lesson: Lesson, files: JsFiles, signal?: AbortSignal): Promise<TestRun> {
  const page = isJsPageLesson(lesson);
  const html = page ? (files.html ?? '') : '';
  const css = page && lesson.starterCss !== undefined ? (files.css ?? '') : undefined;
  const checks = lesson.tasks.map(({ check }) => (isJsCheck(check) ? check.js : '"This check only works on HTML lessons."'));
  const out = await runInSandbox({ html, css, js: files.js }, { checks, mocks: lesson.fetchMocks, storage: lesson.storage }, signal);

  const results = lesson.tasks.map(({ text }, k) => toResult(text, out.results[k] ?? 'Not checked.'));
  const firstError = out.errors[0];
  const runs = out.failure ?? (firstError ? `${firstError.line ? `Line ${firstError.line}: ` : ''}${firstError.message}` : true);
  results.push({ ...toResult('Your JavaScript runs without errors.', runs), implicit: true });

  const issues = page ? validate(html) : [];
  const cssIssues = css !== undefined ? validateCss(css) : [];
  if (page) results.push(wellFormed('Your HTML is well-formed (no structural errors).', issues));
  if (css !== undefined) results.push(wellFormed('Your CSS is valid (no syntax errors).', cssIssues));
  return { results, issues, cssIssues, allPassed: results.every((r) => r.passed) };
}

export interface SqlTestRun extends TestRun {
  /** What the script did, for the results pane: null when the run didn't finish (stopped, engine failed). */
  output: SqlResponse | null;
  /** Why the run didn't finish. */
  failure?: string;
}

/**
 * Runs an SQL lesson's script on a new copy of its database, together with the extra queries of its checks, then
 * judges every task. Also returns the statements' results and the tables, for the results pane.
 */
export async function runSqlTests(lesson: Lesson, script: string, signal?: AbortSignal): Promise<SqlTestRun> {
  const checks = lesson.tasks.map(({ check }) => (isSqlCheck(check) ? check : null));
  const out = await runSql({ setup: lesson.db ?? '', script, queries: checks.flatMap((c) => c?.queries ?? []), snapshot: true }, signal);
  if ('failure' in out) {
    const results = lesson.tasks.map(({ text }) => toResult(text, 'Not checked.'));
    results.push({ ...toResult('Your SQL runs without errors.', out.failure), implicit: true });
    return { results, issues: [], cssIssues: [], allPassed: false, output: null, failure: out.failure };
  }

  const run: SqlRun = { script, statements: out.statements, error: out.error };
  let at = 0;
  const results = lesson.tasks.map(({ text }, k) => {
    const check = checks[k];
    if (!check) return toResult(text, 'Not checked.');
    const answers = out.answers.slice(at, at + check.queries.length);
    at += check.queries.length;
    let r: true | string;
    try {
      r = check.verify(run, answers);
    } catch (err) {
      r = `Check failed to run: ${(err as Error).message}`;
    }
    return toResult(text, r);
  });
  const runs = out.error ? `${out.error.line ? `Line ${out.error.line}: ` : ''}${out.error.message}` : true;
  results.push({ ...toResult('Your SQL runs without errors.', runs), implicit: true });
  return { results, issues: [], cssIssues: [], allPassed: results.every((r) => r.passed), output: out };
}
