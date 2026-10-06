import type { TaskResult } from '../engine/runTests';

export function TestPanel({ results, hidden, blind }: { results: TaskResult[]; hidden?: boolean; blind?: boolean }) {
  return (
    <ol className="tasks" aria-live="polite">
      {results.map((r, k) => {
        const state = hidden ? 'pending' : r.passed ? 'pass' : 'fail';
        // The last result is always the well-formedness check, which stays visible.
        const masked = blind && !r.passed && k < results.length - 1;
        return (
          <li key={k} className={`task ${state}`}>
            <span className="task-icon" aria-hidden="true">
              {state === 'pass' ? '✓' : state === 'fail' ? '✗' : '•'}
            </span>
            <span>
              <span className="visually-hidden">{state === 'pass' ? 'Done: ' : state === 'fail' ? 'Not yet: ' : ''}</span>
              {masked ? `Hidden requirement #${k + 1}` : r.text}
              {state === 'fail' && !masked && r.message && <span className="task-msg">{r.message}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
