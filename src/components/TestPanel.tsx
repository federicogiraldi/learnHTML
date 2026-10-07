import type { TaskResult } from '../engine/runTests';
import { useStrings, useTranslateMessage } from '../i18n';

export function TestPanel({ results, hidden, blind }: { results: TaskResult[]; hidden?: boolean; blind?: boolean }) {
  const t = useStrings();
  const tr = useTranslateMessage();
  return (
    <ol className="tasks" aria-live="polite">
      {results.map((r, k) => {
        const state = hidden ? 'pending' : r.passed ? 'pass' : 'fail';
        // The runner's own checks (valid code) stay visible.
        const masked = blind && !r.passed && !r.implicit;
        // Lesson task texts are already translated; the runner's own tasks are written in English.
        const text = r.implicit ? tr(r.text) : r.text;
        return (
          <li key={k} className={`task ${state}`}>
            <span className="task-icon" aria-hidden="true">
              {state === 'pass' ? '✓' : state === 'fail' ? '✗' : '•'}
            </span>
            <span>
              <span className="visually-hidden">{state === 'pass' ? t.done : state === 'fail' ? t.notYet : ''}</span>
              {masked ? t.hiddenRequirement(k + 1) : text}
              {state === 'fail' && !masked && r.message && <span className="task-msg">{tr(r.message)}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
