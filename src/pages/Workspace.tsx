import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { findItem } from '../content';
import { isCssLesson, isJsLesson, isJsPageLesson, isSqlLesson, type Challenge } from '../content/types';
import { CodeEditor, fileNames, type EditorLanguage } from '../components/CodeEditor';
import { HintBox } from '../components/HintBox';
import { JsPreview } from '../components/JsPreview';
import { Markdown } from '../components/Markdown';
import { Preview } from '../components/Preview';
import { SqlPreview } from '../components/SqlPreview';
import { TestPanel } from '../components/TestPanel';
import { hasSyntaxError } from '../engine/js/instrument';
import { runJsTests, runSqlTests, runTests, type SqlTestRun, type TestRun } from '../engine/runTests';
import { progress, useProgress } from '../store/progress';
import { useLang, useStrings } from '../i18n';

/** Failed submissions before a challenge offers its solution. */
const ATTEMPTS_FOR_SOLUTION = 3;
/** Live checks wait for a pause in typing (CSS lessons render a whole page per run). */
const CHECK_DELAY_MS = 250;
/** JavaScript runs on Run / Ctrl+Enter, or after this long a pause, and only if it parses: never half-typed code. */
const AUTO_RUN_MS = 1500;
/** SQL is quick and harmless to run (every run starts from a fresh database), so it runs after a shorter pause. */
const SQL_AUTO_RUN_MS = 1000;

interface Files {
  code: string;
  css: string;
  js: string;
  sql: string;
}

const sameFiles = (a: Files, b: Files) => a.code === b.code && a.css === b.css && a.js === b.js && a.sql === b.sql;

type Tab = 'learn' | 'code' | 'preview';

const formatTime = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

export function Workspace({ id }: { id: string }) {
  const lang = useLang();
  const t = useStrings();
  const found = findItem(id, lang);
  if (!found) {
    return (
      <main className="page">
        <h1>{t.lessonNotFound}</h1>
        <Link to="/">{t.backToCourses}</Link>
      </main>
    );
  }
  return <WorkspaceInner {...found} />;
}

function WorkspaceInner({ course, module, item, isChallenge, prev, next }: NonNullable<ReturnType<typeof findItem>>) {
  const state = useProgress();
  const t = useStrings();
  const completion = state.completed[item.id];
  const jsMode = isJsLesson(item);
  const sqlMode = isSqlLesson(item);
  /** JavaScript and SQL run as a whole, on Run or after a pause; HTML and CSS are checked as you type. */
  const runMode = jsMode || sqlMode;
  const jsPage = isJsPageLesson(item);
  const cssMode = isCssLesson(item);
  const hasCss = cssMode || (jsPage && item.starterCss !== undefined);
  const hasHtml = (!jsMode && !sqlMode) || jsPage;
  const cssKey = `${item.id}:css`;
  const jsKey = `${item.id}:js`;
  const sqlKey = `${item.id}:sql`;
  // script.js comes first in JavaScript lessons, style.css first in CSS lessons; SQL lessons have only query.sql.
  const files: EditorLanguage[] = sqlMode
    ? ['sql']
    : jsMode
      ? (['js', 'html', 'css'] as const).filter((f) => f === 'js' || (f === 'html' ? jsPage : hasCss))
      : cssMode
        ? ['css', 'html']
        : ['html'];

  const [code, setCode] = useState(() => progress.get().code[item.id] ?? item.starterCode);
  const [css, setCss] = useState(() => progress.get().code[cssKey] ?? item.starterCss ?? '');
  const [js, setJs] = useState(() => progress.get().code[jsKey] ?? item.starterJs ?? '');
  const [sql, setSql] = useState(() => progress.get().code[sqlKey] ?? item.starterSql ?? '');
  const [file, setFile] = useState<EditorLanguage>(files[0]);
  const [hintsShown, setHintsShown] = useState(0);
  const [solutionShown, setSolutionShown] = useState(false);
  const [tab, setTab] = useState<Tab>('learn');
  const [view, setView] = useState<'result' | 'target'>('result');

  // Debounced snapshot of the code that the live checks run against (HTML and CSS lessons).
  const [checked, setChecked] = useState({ code, css });
  useEffect(() => {
    if (runMode) return;
    const t = setTimeout(() => setChecked({ code, css }), CHECK_DELAY_MS);
    return () => clearTimeout(t);
  }, [code, css, runMode]);

  // JavaScript and SQL run as a whole, on demand: `ran` is the snapshot of the last run (output and checks).
  const latestFiles = useRef<Files>({ code, css, js, sql });
  const [ran, setRan] = useState(() => ({ n: 0, files: { code, css, js, sql } }));
  const [asyncLive, setAsyncLive] = useState<TestRun | null>(null);
  const [sqlRun, setSqlRun] = useState<SqlTestRun | null>(null);
  const runCode = useCallback((force = true) => {
    setRan((r) => (!force && sameFiles(r.files, latestFiles.current) ? r : { n: r.n + 1, files: latestFiles.current }));
  }, []);
  useEffect(() => {
    if (!jsMode) return;
    const t = setTimeout(() => !hasSyntaxError(js) && runCode(false), AUTO_RUN_MS);
    return () => clearTimeout(t);
  }, [js, code, css, jsMode, runCode]);
  useEffect(() => {
    if (!sqlMode) return;
    const t = setTimeout(() => runCode(false), SQL_AUTO_RUN_MS);
    return () => clearTimeout(t);
  }, [sql, sqlMode, runCode]);
  useEffect(() => {
    if (!jsMode || isChallenge) return;
    const run = new AbortController();
    runJsTests(item, { js: ran.files.js, html: ran.files.code, css: ran.files.css }, run.signal).then(
      (r) => !run.signal.aborted && setAsyncLive(r),
    );
    return () => run.abort();
  }, [jsMode, isChallenge, item, ran]);
  // SQL runs show their results in challenges too; only the checks wait for a submit.
  useEffect(() => {
    if (!sqlMode) return;
    const run = new AbortController();
    runSqlTests(item, ran.files.sql, run.signal).then((r) => {
      if (run.signal.aborted) return;
      setSqlRun(r);
      if (!isChallenge) setAsyncLive(r);
    });
    return () => run.abort();
  }, [sqlMode, isChallenge, item, ran]);

  // Lessons check live; challenges only on submit.
  const syncLive = useMemo(() => (runMode ? null : runTests(item, checked.code, checked.css)), [runMode, item, checked]);
  const live = syncLive ?? asyncLive;
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
      if (sqlMode) progress.saveCode(sqlKey, f.sql);
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
  }, [item.id, cssKey, jsKey, sqlKey, hasHtml, hasCss, jsMode, sqlMode]);

  useEffect(() => {
    latestFiles.current = { code, css, js, sql };
    dirty.current = true;
    const t = setTimeout(() => progress.flush(), 400);
    return () => clearTimeout(t);
  }, [code, css, js, sql]);

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
    const f = { code, css, js, sql };
    if (!runMode) return record(runTests(item, code, css), f);
    setChecking(true);
    runCode();
    try {
      record(sqlMode ? await runSqlTests(item, sql) : await runJsTests(item, { js, html: code, css }), f);
    } finally {
      setChecking(false);
    }
  };

  const setters: Record<EditorLanguage, (v: string) => void> = { html: setCode, css: setCss, js: setJs, sql: setSql };
  const values: Record<EditorLanguage, string> = { html: code, css, js, sql };
  const starters: Record<EditorLanguage, string> = {
    html: item.starterCode,
    css: item.starterCss ?? '',
    js: item.starterJs ?? '',
    sql: item.starterSql ?? '',
  };

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
    if (sqlMode) setSql(item.solutionSql ?? '');
    setTab('code');
  };

  const reset = () => {
    if (values[file] !== starters[file] && !confirm(t.confirmReplace(fileNames[file]))) return;
    setters[file](starters[file]);
  };

  const canSeeSolution = !isChallenge || attempts >= ATTEMPTS_FOR_SOLUTION || !!completion;
  const pending = item.tasks.map(({ text }) => ({ text, passed: false }));
  const results = (isChallenge ? submitted?.run.results : live?.results) ?? pending;
  const passed = isChallenge ? submitted?.run.allPassed === true : !!live?.allPassed;
  const stale = isChallenge && submitted && !sameFiles(submitted.files, { code, css, js, sql });
  const showTarget = isChallenge && (item as Challenge).showTarget;

  return (
    <main className={`workspace tab-${tab}`}>
      <div className="tabs" role="tablist" aria-label={t.workspacePanels}>
        {(['learn', 'code', 'preview'] as Tab[]).map((p) => (
          <button key={p} type="button" role="tab" aria-selected={tab === p} onClick={() => setTab(p)}>
            {p === 'learn'
              ? isChallenge
                ? t.tabBrief
                : t.tabLesson
              : p === 'code'
                ? t.tabCode
                : sqlMode
                  ? t.tabResults
                  : jsMode && !jsPage
                    ? t.tabConsole
                    : t.tabPreview}
          </button>
        ))}
      </div>

      <section className="pane learn-pane" aria-label={t.instructions}>
        <div className="learn-scroll">
          <p className="crumbs">
            <Link to={`/course/${course.id}`}>{t.courseCrumb(course.title)}</Link> / {module.title}
          </p>
          <h1>
            {isChallenge && <span aria-hidden="true">🏆 </span>}
            {item.title}
            {completion && <span className="badge">{t.completed}</span>}
          </h1>
          {isChallenge && (
            <p className="challenge-meta">
              <span>{t.difficulty}: {'🔥'.repeat((item as Challenge).difficulty)}</span>
              <span>⏱ {formatTime(finishedMs ?? now - startedAt.current)}</span>
              {completion?.bestTimeMs !== undefined && <span>{t.best}: {formatTime(completion.bestTimeMs)}</span>}
              {completion?.stars && <span>{t.bestStars}: {'★'.repeat(completion.stars)}</span>}
            </p>
          )}
          <Markdown source={item.explanation} onTryIt={tryIt} />

          <h2>{isChallenge ? t.requirements : t.yourTasks}</h2>
          {stale && <p className="note">{t.staleNote}</p>}
          {jsMode && !isChallenge && <p className="muted">{t.checksOnRun}</p>}
          {sqlMode && !isChallenge && <p className="muted">{t.sqlChecksOnRun}</p>}
          <TestPanel results={results} hidden={isChallenge ? !submitted : !live} blind={isChallenge && (item as Challenge).blind} />

          {isChallenge && (
            <div className="row">
              <button type="button" className="btn primary" onClick={submit} disabled={checking}>
                {checking ? t.checking : t.checkSolution}
              </button>
              {!passed && (
                <span className="muted">
                  {t.worth(challengeStars)}
                  {attempts > 0 && ` · ${t.attempts(attempts)}`}
                </span>
              )}
            </div>
          )}

          {passed && (
            <div className="success" role="status">
              <strong>{isChallenge ? `${t.challengeComplete} ${'★'.repeat(challengeStars)}` : t.allDone}</strong>
              {next ? (
                <Link className="btn primary" to={`/learn/${next.item.id}`}>
                  {t.next(next.item.title)} →
                </Link>
              ) : (
                <Link className="btn primary" to={`/course/${course.id}`}>
                  {t.finishedCourse(course.title)}
                </Link>
              )}
            </div>
          )}

          <HintBox hints={item.hints} shown={hintsShown} onReveal={() => setHintsShown((n) => n + 1)} />

          <div className="solution">
            {solutionShown ? (
              <>
                <h2>{t.solution}</h2>
                {files.map((f) => (
                  <div key={f}>
                    {files.length > 1 && <h3 className="file-label">{fileNames[f]}</h3>}
                    <pre>
                      <code>{f === 'sql' ? item.solutionSql : f === 'js' ? item.solutionJs : f === 'css' ? item.solutionCss : item.solution}</code>
                    </pre>
                  </div>
                ))}
                <button type="button" className="btn small ghost" onClick={loadSolution}>
                  {t.loadIntoEditor}
                </button>
              </>
            ) : canSeeSolution ? (
              <button
                type="button"
                className="btn small ghost"
                onClick={() =>
                  (!isChallenge || completion || confirm(t.confirmSolution)) &&
                  setSolutionShown(true)
                }
              >
                {t.showSolution}
              </button>
            ) : (
              <p className="muted">
                {t.solutionUnlocks(ATTEMPTS_FOR_SOLUTION, attempts)}
              </p>
            )}
          </div>

          <nav className="pager" aria-label={t.lessonNav}>
            {prev ? <Link to={`/learn/${prev.item.id}`}>← {prev.item.title}</Link> : <span />}
            {next && <Link to={`/learn/${next.item.id}`}>{next.item.title} →</Link>}
          </nav>
        </div>
      </section>

      <section className="pane editor-pane" aria-label={t.codeEditor}>
        <div className="pane-bar">
          {files.length > 1 ? (
            <div className="file-tabs" role="tablist" aria-label={t.files}>
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
              {t.reset}
            </button>
            {runMode && (
              <button type="button" className="btn small run" onClick={() => runCode()} title={t.runTitle}>
                ▶ {t.run}
              </button>
            )}
          </span>
        </div>
        <CodeEditor key={file} language={file} value={values[file]} onChange={setters[file]} onRun={runMode ? runCode : undefined} />
      </section>

      <section className="pane preview-pane" aria-label={sqlMode ? t.sqlResults : jsMode && !jsPage ? t.output : t.preview}>
        {sqlMode ? (
          <SqlPreview run={sqlRun} onRun={runCode} />
        ) : jsMode ? (
          <>
            {jsPage && (
              <div className="pane-bar">
                <span>{t.preview}</span>
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
                <div className="file-tabs" role="tablist" aria-label={t.preview}>
                  <button type="button" role="tab" aria-selected={view === 'result'} onClick={() => setView('result')}>
                    {t.yourResult}
                  </button>
                  <button type="button" role="tab" aria-selected={view === 'target'} onClick={() => setView('target')}>
                    {t.target}
                  </button>
                </div>
              ) : (
                <span>{t.preview}</span>
              )}
            </div>
            {view === 'target' && showTarget ? (
              <Preview code={item.solution} css={item.solutionCss} title={t.targetDesign} />
            ) : (
              <Preview code={code} css={cssMode ? css : undefined} />
            )}
          </>
        )}
      </section>
    </main>
  );
}
