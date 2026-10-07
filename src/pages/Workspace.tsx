import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { findItem } from '../content';
import { isCssLesson, isJsLesson, isJsPageLesson, type Challenge } from '../content/types';
import { CodeEditor, fileNames, type EditorLanguage } from '../components/CodeEditor';
import { HintBox } from '../components/HintBox';
import { JsPreview } from '../components/JsPreview';
import { Markdown } from '../components/Markdown';
import { Preview } from '../components/Preview';
import { TestPanel } from '../components/TestPanel';
import { hasSyntaxError } from '../engine/js/instrument';
import { runJsTests, runTests, type TestRun } from '../engine/runTests';
import { progress, useProgress } from '../store/progress';

/** Failed submissions before a challenge offers its solution. */
const ATTEMPTS_FOR_SOLUTION = 3;
/** Live checks wait for a pause in typing (CSS lessons render a whole page per run). */
const CHECK_DELAY_MS = 250;
/** JavaScript runs on Run / Ctrl+Enter, or after this long a pause, and only if it parses: never half-typed code. */
const AUTO_RUN_MS = 1500;

interface Files {
  code: string;
  css: string;
  js: string;
}

const sameFiles = (a: Files, b: Files) => a.code === b.code && a.css === b.css && a.js === b.js;

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
  const jsMode = isJsLesson(item);
  const jsPage = isJsPageLesson(item);
  const cssMode = isCssLesson(item);
  const hasCss = cssMode || (jsPage && item.starterCss !== undefined);
  const hasHtml = !jsMode || jsPage;
  const cssKey = `${item.id}:css`;
  const jsKey = `${item.id}:js`;
  // script.js comes first in JavaScript lessons, style.css first in CSS lessons.
  const files: EditorLanguage[] = jsMode
    ? (['js', 'html', 'css'] as const).filter((f) => f === 'js' || (f === 'html' ? jsPage : hasCss))
    : cssMode
      ? ['css', 'html']
      : ['html'];

  const [code, setCode] = useState(() => progress.get().code[item.id] ?? item.starterCode);
  const [css, setCss] = useState(() => progress.get().code[cssKey] ?? item.starterCss ?? '');
  const [js, setJs] = useState(() => progress.get().code[jsKey] ?? item.starterJs ?? '');
  const [file, setFile] = useState<EditorLanguage>(files[0]);
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [tab, setTab] = useState<Tab>('learn');
  const [view, setView] = useState<'result' | 'target'>('result');

  // Debounced snapshot of the code that the live checks run against (HTML and CSS lessons).
  const [checked, setChecked] = useState({ code, css });
  useEffect(() => {
    if (jsMode) return;
    const t = setTimeout(() => setChecked({ code, css }), CHECK_DELAY_MS);
    return () => clearTimeout(t);
  }, [code, css, jsMode]);

  // JavaScript runs as a whole, on demand: `ran` is the snapshot of the last run (preview and checks).
  const latestFiles = useRef<Files>({ code, css, js });
  const [ran, setRan] = useState(() => ({ n: 0, files: { code, css, js } }));
  const [jsLive, setJsLive] = useState<TestRun | null>(null);
  const runCode = useCallback((force = true) => {
    setRan((r) => (!force && sameFiles(r.files, latestFiles.current) ? r : { n: r.n + 1, files: latestFiles.current }));
  }, []);
  useEffect(() => {
    if (!jsMode) return;
    const t = setTimeout(() => !hasSyntaxError(js) && runCode(false), AUTO_RUN_MS);
    return () => clearTimeout(t);
  }, [js, code, css, jsMode, runCode]);
  useEffect(() => {
    if (!jsMode || isChallenge) return;
    const run = new AbortController();
    runJsTests(item, { js: ran.files.js, html: ran.files.code, css: ran.files.css }, run.signal).then(
      (r) => !run.signal.aborted && setJsLive(r),
    );
    return () => run.abort();
  }, [jsMode, isChallenge, item, ran]);

  // Lessons check live; challenges only on submit.
  const syncLive = useMemo(() => (jsMode ? null : runTests(item, checked.code, checked.css)), [jsMode, item, checked]);
  const live = syncLive ?? jsLive;
  const [submitted, setSubmitted] = useState<{ run: TestRun; files: Files } | null>(null);
  const [checking, setChecking] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const startedAt = useRef(Date.now());
  const [finishedMs, setFinishedMs] = useState<number | null>(null);

  // Saves are debounced; pending edits are flushed when the page is hidden or about to reload (e.g. app update).
  const dirty = useRef(false);
  useEffect(() => {
    const save = () => {
      if (!dirty.current) return;
      dirty.current = false;
      const f = latestFiles.current;
      if (hasHtml) progress.saveCode(item.id, f.code);
      if (hasCss) progress.saveCode(cssKey, f.css);
      if (jsMode) progress.saveCode(jsKey, f.js);
    };
    const onHide = () => document.visibilityState === 'hidden' && save();
    const off = progress.onFlush(save);
    window.addEventListener('pagehide', save);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      save();
      off();
      window.removeEventListener('pagehide', save);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, [item.id, cssKey, jsKey, hasHtml, hasCss, jsMode]);

  useEffect(() => {
    latestFiles.current = { code, css, js };
    dirty.current = true;
    const t = setTimeout(() => progress.flush(), 400);
    return () => clearTimeout(t);
  }, [code, css, js]);

  useEffect(() => {
    if (!isChallenge || finishedMs !== null) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isChallenge, finishedMs]);

  const lessonPassed = !isChallenge && !!live?.allPassed;
  useEffect(() => {
    if (lessonPassed && !progress.get().completed[item.id]) progress.complete(item.id);
  }, [lessonPassed, item.id]);

  const challengeStars = solutionShown ? 1 : Math.max(1, 3 - hintsShown);

  const record = (run: TestRun, f: Files) => {
    setSubmitted({ run, files: f });
    if (run.allPassed) {
      const ms = Date.now() - startedAt.current;
      setFinishedMs(ms);
      progress.complete(item.id, { stars: challengeStars, bestTimeMs: ms });
    } else {
      setAttempts((a) => a + 1);
    }
  };

  const submit = async () => {
    const f = { code, css, js };
    if (!jsMode) return record(runTests(item, code, css), f);
    setChecking(true);
    runCode();
    try {
      record(await runJsTests(item, { js, html: code, css }), f);
    } finally {
      setChecking(false);
    }
  };

  const setters: Record<EditorLanguage, (v: string) => void> = { html: setCode, css: setCss, js: setJs };
  const values: Record<EditorLanguage, string> = { html: code, css, js };
  const starters: Record<EditorLanguage, string> = { html: item.starterCode, css: item.starterCss ?? '', js: item.starterJs ?? '' };

  const tryIt = (snippet: string, lang: EditorLanguage) => {
    const target = files.includes(lang) ? lang : files[0];
    setters[target](snippet);
    setFile(target);
    setTab('code');
  };

  const loadSolution = () => {
    if (hasHtml) setCode(item.solution);
    if (hasCss) setCss(item.solutionCss ?? '');
    if (jsMode) setJs(item.solutionJs ?? '');
    setTab('code');
  };

  const reset = () => {
    if (values[file] !== starters[file] && !confirm(`Replace ${fileNames[file]} with the starting code?`)) return;
    setters[file](starters[file]);
  };

  const canSeeSolution = !isChallenge || attempts >= ATTEMPTS_FOR_SOLUTION || !!completion;
  const pending = item.tasks.map(({ text }) => ({ text, passed: false }));
  const results = (isChallenge ? submitted?.run.results : live?.results) ?? pending;
  const passed = isChallenge ? submitted?.run.allPassed === true : !!live?.allPassed;
  const stale = isChallenge && submitted && !sameFiles(submitted.files, { code, css, js });
  const showTarget = isChallenge && (item as Challenge).showTarget;

  return (
    <main className={`workspace tab-${tab}`}>
      <div className="tabs" role="tablist" aria-label="Workspace panels">
        {(['learn', 'code', 'preview'] as Tab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>
            {t === 'learn' ? (isChallenge ? 'Brief' : 'Lesson') : t === 'code' ? 'Code' : jsMode && !jsPage ? 'Console' : 'Preview'}
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
          {jsMode && !isChallenge && <p className="muted">Checks run when you press Run (or Ctrl+Enter).</p>}
          <TestPanel results={results} hidden={isChallenge ? !submitted : !live} blind={isChallenge && (item as Challenge).blind} />

          {isChallenge && (
            <div className="row">
              <button type="button" className="btn primary" onClick={submit} disabled={checking}>
                {checking ? 'Checking…' : 'Check my solution'}
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
                {files.map((f) => (
                  <div key={f}>
                    {files.length > 1 && <h3 className="file-label">{fileNames[f]}</h3>}
                    <pre>
                      <code>{f === 'js' ? item.solutionJs : f === 'css' ? item.solutionCss : item.solution}</code>
                    </pre>
                  </div>
                ))}
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
          {files.length > 1 ? (
            <div className="file-tabs" role="tablist" aria-label="Files">
              {files.map((f) => (
                <button key={f} type="button" role="tab" aria-selected={file === f} onClick={() => setFile(f)}>
                  {fileNames[f]}
                </button>
              ))}
            </div>
          ) : (
            <span>{fileNames[files[0]]}</span>
          )}
          <span className="pane-actions">
            <button type="button" className="btn small ghost" onClick={reset}>
              Reset
            </button>
            {jsMode && (
              <button type="button" className="btn small run" onClick={() => runCode()} title="Run (Ctrl+Enter)">
                ▶ Run
              </button>
            )}
          </span>
        </div>
        <CodeEditor key={file} language={file} value={values[file]} onChange={setters[file]} onRun={jsMode ? runCode : undefined} />
      </section>

      <section className="pane preview-pane" aria-label={jsMode && !jsPage ? 'Output' : 'Preview'}>
        {jsMode ? (
          <>
            {jsPage && (
              <div className="pane-bar">
                <span>Preview</span>
              </div>
            )}
            <JsPreview
              files={{ html: jsPage ? ran.files.code : '', css: hasCss ? ran.files.css : undefined, js: ran.files.js }}
              runKey={ran.n}
              page={jsPage}
              storageId={item.id}
              storage={item.storage}
              mocks={item.fetchMocks}
              onRun={runCode}
            />
          </>
        ) : (
          <>
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
          </>
        )}
      </section>
    </main>
  );
}
