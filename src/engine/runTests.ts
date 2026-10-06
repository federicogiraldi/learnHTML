import type { Lesson } from '../content/types';
import { validate, type Issue } from './validator';

export interface TaskResult {
  text: string;
  passed: boolean;
  message?: string;
}

export interface TestRun {
  results: TaskResult[];
  issues: Issue[];
  allPassed: boolean;
}

export function parse(code: string): Document {
  return new DOMParser().parseFromString(code, 'text/html');
}

export function runTests(lesson: Pick<Lesson, 'tasks'>, code: string): TestRun {
  const doc = parse(code);
  const issues = validate(code);
  const results: TaskResult[] = lesson.tasks.map(({ text, check }) => {
    let r: true | string;
    try {
      r = check(doc, code);
    } catch (err) {
      r = `Check failed to run: ${(err as Error).message}`;
    }
    return r === true ? { text, passed: true } : { text, passed: false, message: r };
  });
  results.push(
    issues.length === 0
      ? { text: 'Your HTML is well-formed (no structural errors).', passed: true }
      : {
          text: 'Your HTML is well-formed (no structural errors).',
          passed: false,
          message: `Line ${issues[0].line}: ${issues[0].message}`,
        },
  );
  return { results, issues, allPassed: results.every((r) => r.passed) };
}
