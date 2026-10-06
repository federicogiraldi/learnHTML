import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { findItem } from '../content';
import { isCssLesson, type Challenge } from '../content/types';
import { CodeEditor, type EditorLanguage } from '../components/CodeEditor';
import { HintBox } from '../components/HintBox';
import { Markdown } from '../components/Markdown';
import { Preview } from '../components/Preview';
import { TestPanel } from '../components/TestPanel';
import { runTests, type TestRun } from '../engine/runTests';
import { progress, useProgress } from '../store/progress';

/** Failed submissions before a challenge offers its solution. */
const ATTEMPTS_FOR_SOLUTION = 3;
/** Live checks wait for a pause in typing (CSS lessons render a whole page per run). */
const CHECK_DELAY_MS = 250;

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
        <Link to="/">Back to the courses</Link>
      </main>
    );
  }
  return <WorkspaceInner {...found} />;
}

function WorkspaceInner({ course, module, item, isChallenge, prev, next }: NonNullable<ReturnType<typeof findItem>>) {
  const state = useProgress();
  const completion = state.completed[item.id];
  const cssMode = isCssLesson(item);
  const cssKey = `${item.id}:css`;

  const [code, setCode] = useState(() => progress.get().code[item.id] ?? item.starterCode);
  const [css, setCss] = useState(() => progress.get().code[cssKey] ?? item.starterCss ?? '');
  const [file, setFile] = useState<EditorLanguage>(cssMode ? 'css' : 'html');
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [tab, setTab] = useState<Tab>('learn');
  const [view, setView] = useState<'result' | 'target'>('result');

  // Debounced snapshot of the code that the live checks run against.
  const [checked, setChecked] = useState({ code, css });
  useEffect(() => {
    const t = setTimeout(() => setChecked({ code, css }), CHECK_DELAY_MS);
    return () => clearTimeout(t);
  }, [code, css]);

  // Lessons check live; challenges only on submit.
  const live = useMemo(() => runTests(item, checked.code, checked.css), [item, checked]);
  const [submitted, setSubmitted] = useState<{ run: TestRun; code: string; css: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const startedAt = useRef(Date.now());
  const [finishedMs, setFinishedMs] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      progress.saveCode(item.id, code);
      if (cssMode) progress.saveCode(cssKey, css);
    }, 400);
    return () => clearTimeout(t);
  }, [item.id, cssKey, cssMode, code, css]);

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
    const run = runTests(item, code, css);
    setSubmitted({ run, code, css });
    if (run.allPassed) {
      const ms = Date.now() - startedAt.current;
      setFinishedMs(ms);
      progress.complete(item.id, { stars: challengeStars, bestTimeMs: ms });
    } else {
      setAttempts((a) => a + 1);
    }
  };

  const tryIt = (snippet: string, lang: EditorLanguage) => {
    if (lang === 'css' && cssMode) setCss(snippet);
    else setCode(snippet);
    setFile(lang === 'css' && cssMode ? 'css' : 'html');
    setTab('code');
  };

  const loadSolution = () => {
    setCode(item.solution);
    if (cssMode) setCss(item.solutionCss ?? '');
    setTab('code');
  };

  const reset = () => {
    const isCss = file === 'css';
    const current = isCss ? css : code;
    const starter = isCss ? (item.starterCss ?? '') : item.starterCode;
    if (current !== starter && !confirm(`Replace ${isCss ? 'style.css' : 'index.html'} with the starting code?`)) return;
    if (isCss) setCss(starter);
    else setCode(starter);
  };

  const canSeeSolution = !isChallenge || attempts >= ATTEMPTS_FOR_SOLUTION || !!completion;
  const results = isChallenge ? (submitted?.run.results ?? live.results) : live.results;
  const passed = isChallenge ? submitted?.run.allPassed === true : live.allPassed;
  const stale = isChallenge && submitted && (submitted.code !== code || submitted.css !== css);
  const showTarget = isChallenge && (item as Challenge).showTarget;

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
            <Link to={`/course/${course.id}`}>{course.title} course</Link> / {module.title}
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
          <Markdown source={item.explanation} onTryIt={tryIt} />

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
                <Link className="btn primary" to={`/course/${course.id}`}>
                  You finished the {course.title} course 🎉
                </Link>
              )}
            </div>
          )}

          <HintBox hints={item.hints} shown={hintsShown} onReveal={() => setHintsShown((n) => n + 1)} />

          <div className="solution">
            {solutionShown ? (
              <>
                <h2>Solution</h2>
                {cssMode && (
                  <>
                    <h3 className="file-label">style.css</h3>
                    <pre>
                      <code>{item.solutionCss}</code>
                    </pre>
                    <h3 className="file-label">index.html</h3>
                  </>
                )}
                <pre>
                  <code>{item.solution}</code>
                </pre>
                <button type="button" className="btn small ghost" onClick={loadSolution}>
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
          {cssMode ? (
            <div className="file-tabs" role="tablist" aria-label="Files">
              {(['css', 'html'] as EditorLanguage[]).map((f) => (
                <button key={f} type="button" role="tab" aria-selected={file === f} onClick={() => setFile(f)}>
                  {f === 'css' ? 'style.css' : 'index.html'}
                </button>
              ))}
            </div>
          ) : (
            <span>index.html</span>
          )}
          <button type="button" className="btn small ghost" onClick={reset}>
            Reset
          </button>
        </div>
        {file === 'css' ? (
          <CodeEditor key="css" language="css" value={css} onChange={setCss} />
        ) : (
          <CodeEditor key="html" language="html" value={code} onChange={setCode} />
        )}
      </section>

      <section className="pane preview-pane" aria-label="Preview">
        <div className="pane-bar">
          {showTarget ? (
            <div className="file-tabs" role="tablist" aria-label="Preview">
              <button type="button" role="tab" aria-selected={view === 'result'} onClick={() => setView('result')}>
                Your result
              </button>
              <button type="button" role="tab" aria-selected={view === 'target'} onClick={() => setView('target')}>
                Target
              </button>
            </div>
          ) : (
            <span>Preview</span>
          )}
        </div>
        {view === 'target' && showTarget ? (
          <Preview code={item.solution} css={item.solutionCss} title="Target design" />
        ) : (
          <Preview code={code} css={cssMode ? css : undefined} />
        )}
      </section>
    </main>
  );
}
