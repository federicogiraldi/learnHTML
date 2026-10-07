import { useEffect, useRef, useState } from 'react';
import { Sandbox, missingScriptMessage, type ConsoleEntry, type SandboxFiles } from '../engine/js/sandbox';
import type { FetchMock } from '../content/types';
import { useStrings, useTranslateMessage } from '../i18n';

/** localStorage of each lesson's preview, kept for the session so "reload" (Run) sees saved data. */
const storages = new Map<string, Record<string, string>>();

interface Entry extends ConsoleEntry {
  id: number;
}

let entryId = 0;

/**
 * Runs JavaScript in a visible sandbox: the page (for page lessons) above a console. A new run starts whenever
 * `runKey` changes, with the `files` of that moment.
 */
export function JsPreview({
  files,
  runKey,
  page,
  storageId,
  storage,
  mocks,
  onRun,
}: {
  files: SandboxFiles;
  runKey: number;
  page: boolean;
  /** Keeps localStorage between runs of the same lesson. */
  storageId: string;
  /** What localStorage holds on the first run. */
  storage?: Record<string, string>;
  mocks?: Record<string, FetchMock>;
  /** Shows a Run button in the console bar on small screens, where the editor is in another tab. */
  onRun?: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const sandbox = useRef<Sandbox | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stopped, setStopped] = useState<string | null>(null);
  const [stored, setStored] = useState(() => storages.get(storageId) ?? storage ?? {});
  const tr = useTranslateMessage();
  const filesRef = useRef(files);
  const optsRef = useRef({ mocks, storageId, storage });
  useEffect(() => {
    filesRef.current = files;
    optsRef.current = { mocks, storageId, storage };
  });

  useEffect(() => {
    const s = new Sandbox(host.current!, { visible: true, title: 'Preview' });
    sandbox.current = s;
    return () => {
      s.dispose();
      sandbox.current = null;
    };
  }, []);

  useEffect(() => {
    const s = sandbox.current;
    if (!s) return;
    const { mocks, storageId, storage } = optsRef.current;
    const add = (e: ConsoleEntry) => setEntries((list) => [...list.slice(-499), { ...e, id: ++entryId }]);
    setEntries([]);
    setStopped(null);
    s.run(
      filesRef.current,
      { mode: 'preview', mocks, storage: storages.get(storageId) ?? storage ?? {} },
      {
        onLog: add,
        onClear: () => setEntries([]),
        onStorage: (data) => {
          storages.set(storageId, data);
          setStored(data);
        },
        onMissingScript: () => filesRef.current.js.trim() && add({ level: 'warn', text: missingScriptMessage }),
        onStopped: (message) => {
          add({ level: 'error', text: message });
          setStopped(message);
        },
      },
    );
  }, [runKey]);

  const clearStorage = () => {
    storages.set(storageId, {});
    setStored({});
  };

  return (
    <div className={`js-preview ${page ? 'with-page' : 'console-only'}`}>
      <div ref={host} className="js-page" hidden={!page}>
        {stopped && page && (
          <p className="stopped" role="alert">
            ⏹ {tr(stopped)}
          </p>
        )}
      </div>
      <Console
        entries={entries}
        onClear={() => setEntries([])}
        storageKeys={Object.keys(stored).length}
        onClearStorage={clearStorage}
        onRun={onRun}
      />
    </div>
  );
}

function Console({
  entries,
  onClear,
  storageKeys,
  onClearStorage,
  onRun,
}: {
  entries: Entry[];
  onClear: () => void;
  storageKeys: number;
  onClearStorage: () => void;
  onRun?: () => void;
}) {
  const list = useRef<HTMLOListElement>(null);
  const t = useStrings();
  const tr = useTranslateMessage();
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);
  const errors = entries.filter((e) => e.level === 'error').length;
  return (
    <section className="console" aria-label={t.console}>
      <div className="console-bar">
        <span>
          {t.console}
          {errors > 0 && (
            <span className="console-count">
              {t.errors(errors)}
            </span>
          )}
        </span>
        <span className="console-actions">
          {storageKeys > 0 && (
            <button type="button" className="btn small ghost" onClick={onClearStorage} title={t.clearStorageTitle}>
              {t.clearStorage(storageKeys)}
            </button>
          )}
          <button type="button" className="btn small ghost" onClick={onClear}>
            {t.clear}
          </button>
          {onRun && (
            <button type="button" className="btn small run narrow-only" onClick={onRun}>
              ▶ {t.run}
            </button>
          )}
        </span>
      </div>
      <ol ref={list} className="console-lines" role="log" aria-live="polite">
        {entries.length === 0 ? (
          <li className="console-empty">{t.consoleEmpty}</li>
        ) : (
          entries.map((e) => (
            <li key={e.id} className={`console-line ${e.level}`}>
              <span className="console-icon" aria-hidden="true">
                {e.level === 'error' ? '✖' : e.level === 'warn' ? '⚠' : '›'}
              </span>
              <span className="console-text">{e.level === 'log' ? e.text : tr(e.text)}</span>
              {e.line !== undefined && <span className="console-where">script.js:{e.line}</span>}
            </li>
          ))
        )}
      </ol>
    </section>
  );
}
