import { isCssLesson, type Lesson } from '../content/types';
import { validateCss } from './cssValidator';
import { renderPage } from './render';
import { validate, type Issue } from './validator';

export interface TaskResult {
  text: string;
  passed: boolean;
  message?: string;
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
    ? { text, passed: true }
    : { text, passed: false, message: `Line ${issues[0].line}: ${issues[0].message}` };

/**
 * Runs a lesson's checks. HTML lessons parse the code with DOMParser; CSS lessons render HTML + CSS in a
 * hidden frame so checks can read computed styles and layout.
 */
export function runTests(lesson: Pick<Lesson, 'tasks' | 'starterCss'>, code: string, css = ''): TestRun {
  const cssMode = isCssLesson(lesson as Lesson);
  const doc = cssMode ? renderPage(code, css) : parse(code);
  const issues = validate(code);
  const cssIssues = cssMode ? validateCss(css) : [];
  const results: TaskResult[] = lesson.tasks.map(({ text, check }) => {
    let r: true | string;
    try {
      r = check(doc, code, css);
    } catch (err) {
      r = `Check failed to run: ${(err as Error).message}`;
    }
    return r === true ? { text, passed: true } : { text, passed: false, message: r };
  });
  results.push(wellFormed('Your HTML is well-formed (no structural errors).', issues));
  if (cssMode) results.push(wellFormed('Your CSS is valid (no syntax errors).', cssIssues));
  return { results, issues, cssIssues, allPassed: results.every((r) => r.passed) };
}
