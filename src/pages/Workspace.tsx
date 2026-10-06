import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { findItem } from '../content';
import type { Challenge } from '../content/types';
import { CodeEditor } from '../components/CodeEditor';
import { HintBox } from '../components/HintBox';
import { Markdown } from '../components/Markdown';
import { Preview } from '../components/Preview';
import { TestPanel } from '../components/TestPanel';
import { runTests, type TestRun } from '../engine/runTests';
import { progress, useProgress } from '../store/progress';

/** Failed submissions before a challenge offers its solution. */
const ATTEMPTS_FOR_SOLUTION = 3;

type Tab = 'learn' | 'code' | 'preview';

const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function Workspace({ id }: { id: string }) {
  const found = findItem(id);
  if (!found) {
    return (
      <main className="page">
        <h1>Lesson not found</h1>
        <Link to="/">Back to the course</Link>
      </main>
    );
  }
  return <WorkspaceInner {...found} />;
}

function WorkspaceInner({ module, item, isChallenge, prev, next }: NonNullable<ReturnType<typeof findItem>>) {
  const state = useProgress();
  const completion = state.completed[item.id];
  const [code, setCode] = useState(() => progress.get().code[item.id] ?? item.starterCode);
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [tab, setTab] = useState<Tab>('learn');

  // Lessons check live; challenges only on submit.
  const live = useMemo(() => runTests(item, code), [item, code]);
  const [submitted, setSubmitted] = useState<{ run: TestRun; code: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const startedAt = useRef(Date.now());
  const [finishedMs, setFinishedMs] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => progress.saveCode(item.id, code), 400);
    return () => clearTimeout(t);
  }, [item.id, code]);

  useEffect(() => {
    if (!isChallenge || finishedMs !== null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isChallenge, finishedMs]);

  const lessonPassed = !isChallenge && live.allPassed;
  useEffect(() => {
    if (lessonPassed && !progress.get().completed[item.id]) progress.complete(item.id);
  }, [lessonPassed, item.id]);

  const challengeStars = solutionShown ? 1 : Math.max(1, 3 - hintsShown);

  const submit = () => {
    const run = runTests(item, code);
    setSubmitted({ run, code });
    if (run.allPassed) {
      const ms = Date.now() - startedAt.current;
      setFinishedMs(ms);
      progress.complete(item.id, { stars: challengeStars, bestTimeMs: ms });
    } else {
      setAttempts((a) => a + 1);
    }
  };

  const loadCode = (c: string) => {
    setCode(c);
    setTab('code');
  };

  const reset = () => {
    if (code !== item.starterCode && !confirm('Replace your code with the starting code?')) return;
    setCode(item.starterCode);
  };

  const canSeeSolution = !isChallenge || attempts >= ATTEMPTS_FOR_SOLUTION || !!completion;
  const results = isChallenge ? (submitted?.run.results ?? live.results) : live.results;
  const passed = isChallenge ? submitted?.run.allPassed === true : live.allPassed;
  const stale = isChallenge && submitted && submitted.code !== code;

  return (
    <main className={`workspace tab-${tab}`}>
      <div className="tabs" role="tablist" aria-label="Workspace panels">
        {(['learn', 'code', 'preview'] as Tab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t === 'learn' ? (isChallenge ? 'Brief' : 'Lesson') : t === 'code' ? 'Code' : 'Preview'}
          </button>
        ))}
      </div>

      <section className="pane learn-pane" aria-label="Instructions">
        <div className="learn-scroll">
          <p className="crumbs">
            <Link to="/">Course</Link> / {module.title}
          </p>
          <h1>
            {isChallenge && <span aria-hidden="true">🏆 </span>}
            {item.title}
            {completion && <span className="badge">Completed</span>}
          </h1>
          {isChallenge && (
            <p className="challenge-meta">
              <span>Difficulty: {'🔥'.repeat((item as Challenge).difficulty)}</span>
              <span>⏱ {formatTime(finishedMs ?? now - startedAt.current)}</span>
              {completion?.bestTimeMs !== undefined && <span>Best: {formatTime(completion.bestTimeMs)}</span>}
              {completion?.stars && <span>Best stars: {'★'.repeat(completion.stars)}</span>}
            </p>
          )}
          <Markdown source={item.explanation} onTryIt={loadCode} />

          <h2>{isChallenge ? 'Requirements' : 'Your tasks'}</h2>
          {stale && <p className="note">You edited the code since your last check.</p>}
          <TestPanel results={results} hidden={isChallenge && !submitted} blind={isChallenge && (item as Challenge).blind} />

          {isChallenge && (
            <div className="row">
              <button type="button" className="btn primary" onClick={submit}>
                Check my solution
              </button>
              {!passed && (
                <span className="muted">
                  Worth {challengeStars} {challengeStars === 1 ? 'star' : 'stars'} now
                  {attempts > 0 && ` · ${attempts} attempt${attempts === 1 ? '' : 's'}`}
                </span>
              )}
            </div>
          )}

          {passed && (
            <div className="success" role="status">
              <strong>{isChallenge ? `Challenge complete! ${'★'.repeat(challengeStars)}` : 'Nice work — all tasks done!'}</strong>
              {next ? (
                <Link className="btn primary" to={`/learn/${next.item.id}`}>
                  Next: {next.item.title} →
                </Link>
              ) : (
                <Link className="btn primary" to="/">
                  You finished the course 🎉
                </Link>
              )}
            </div>
          )}

          <HintBox hints={item.hints} shown={hintsShown} onReveal={() => setHintsShown((n) => n + 1)} />

          <div className="solution">
            {solutionShown ? (
              <>
                <h2>Solution</h2>
                <pre>
                  <code>{item.solution}</code>
                </pre>
                <button type="button" className="btn small ghost" onClick={() => loadCode(item.solution)}>
                  Load into editor
                </button>
              </>
            ) : canSeeSolution ? (
              <button
                type="button"
                className="btn small ghost"
                onClick={() =>
                  (!isChallenge || completion || confirm('Seeing the solution limits this run to 1 star. Continue?')) &&
                  setSolutionShown(true)
                }
              >
                Show solution
              </button>
            ) : (
              <p className="muted">
                The solution unlocks after {ATTEMPTS_FOR_SOLUTION} checks ({attempts}/{ATTEMPTS_FOR_SOLUTION}).
              </p>
            )}
          </div>

          <nav className="pager" aria-label="Lesson navigation">
            {prev ? <Link to={`/learn/${prev.item.id}`}>← {prev.item.title}</Link> : <span />}
            {next && <Link to={`/learn/${next.item.id}`}>{next.item.title} →</Link>}
          </nav>
        </div>
      </section>

      <section className="pane editor-pane" aria-label="Code editor">
        <div className="pane-bar">
          <span>index.html</span>
          <button type="button" className="btn small ghost" onClick={reset}>
            Reset
          </button>
        </div>
        <CodeEditor value={code} onChange={setCode} />
      </section>

      <section className="pane preview-pane" aria-label="Preview">
        <div className="pane-bar">
          <span>Preview</span>
        </div>
        <Preview code={code} />
      </section>
    </main>
  );
}
