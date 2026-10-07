import { useRef, useState } from 'react';
import { Link, Navigate, NavLink, useParams } from 'react-router-dom';
import { courseItems, coursesIn, getCourse, isModuleComplete, isModuleUnlocked } from '../content';
import { useLang, useStrings, useTranslateMessage } from '../i18n';
import { ProgressBar } from '../components/ProgressBar';
import { downloadProgress } from '../store/backup';
import { needsBackup, progress, useProgress } from '../store/progress';
import { requestPersistentStorage, usePersistStatus } from '../store/persistence';
import { isIos, promptInstall, useCanInstall, useInstalled } from '../pwa/install';

const stars = (n = 0) => '★'.repeat(n) + '☆'.repeat(3 - n);

export function Home() {
  const { courseId = 'html' } = useParams();
  const lang = useLang();
  const t = useStrings();
  const course = getCourse(courseId, lang);
  const state = useProgress();
  if (!course) return <Navigate to="/" replace />;

  const items = courseItems(course);
  const modules = course.modules;
  const done = items.filter((c) => state.completed[c.item.id]).length;
  const resume = items.find((c) => !state.completed[c.item.id] && isModuleUnlocked(course, c.module, state));

  return (
    <main className="page">
      <section className="hero">
        <div className="course-switch" role="tablist" aria-label={t.courses}>
          {coursesIn(lang).map((c) => {
            const its = courseItems(c);
            const n = its.filter((i) => state.completed[i.item.id]).length;
            return (
              <NavLink
                key={c.id}
                to={`/course/${c.id}`}
                role="tab"
                aria-selected={c.id === course.id}
                className={c.id === course.id ? 'active' : ''}
              >
                {c.title}
                <span>
                  {n}/{its.length}
                </span>
              </NavLink>
            );
          })}
        </div>
        <h1>{t.heroTitle(course.title)}</h1>
        <p>{t.heroText(modules.length, course.tagline)}</p>
        <div className="hero-progress">
          <ProgressBar value={done} max={items.length} label={t.courseProgress(course.title)} />
          <span>{t.completedOf(done, items.length)}</span>
        </div>
        {resume && (
          <Link className="btn primary" to={`/learn/${resume.item.id}`}>
            {done === 0 ? t.startFirst : t.continueWith(resume.item.title)} →
          </Link>
        )}
      </section>

      {needsBackup(state) && <BackupReminder lastExportAt={state.lastExportAt} />}

      <ol className="modules">
        {modules.map((m, idx) => {
          const unlocked = isModuleUnlocked(course, m, state);
          const complete = isModuleComplete(m, state);
          const mItems = [...m.lessons, m.challenge];
          const n = mItems.filter((i) => state.completed[i.id]).length;
          return (
            <li key={m.id} className={`module-card ${unlocked ? '' : 'locked'} ${complete ? 'complete' : ''}`}>
              <div className="module-head">
                <span className="module-num">{idx + 1}</span>
                <div>
                  <h2>{m.title}</h2>
                  <p>{m.description}</p>
                </div>
              </div>
              <ProgressBar value={n} max={mItems.length} label={t.moduleProgress(m.title)} />
              {unlocked ? (
                <ul className="lesson-list">
                  {m.lessons.map((l) => (
                    <li key={l.id}>
                      <Link to={`/learn/${l.id}`} className={state.completed[l.id] ? 'done' : ''}>
                        <span aria-hidden="true">{state.completed[l.id] ? '✓' : '○'}</span> {l.title}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link to={`/learn/${m.challenge.id}`} className={`challenge-link ${state.completed[m.challenge.id] ? 'done' : ''}`}>
                      <span aria-hidden="true">🏆</span> {m.challenge.title}
                      <span className="stars" aria-label={t.starsOf(state.completed[m.challenge.id]?.stars ?? 0)}>
                        {stars(state.completed[m.challenge.id]?.stars)}
                      </span>
                    </Link>
                    <span className="challenge-summary">{m.challenge.summary}</span>
                  </li>
                </ul>
              ) : (
                <div className="locked-note">
                  <p>{t.unlockNote(modules[idx - 1].title)}</p>
                  <button type="button" className="btn small ghost" onClick={() => progress.unlock(m.id)}>
                    {t.unlockButton}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <Settings />
    </main>
  );
}
function BackupReminder({ lastExportAt }: { lastExportAt?: number }) {
  const t = useStrings();
  const lang = useLang();
  return (
    <aside className="backup-reminder" aria-label={t.backupReminder}>
      <p>
        {lastExportAt ? t.lastBackup(new Date(lastExportAt).toLocaleDateString(lang)) : t.noBackup} {t.backupWhy}
      </p>
      <div className="row">
        <button type="button" className="btn small primary" onClick={downloadProgress}>
          {t.exportProgress}
        </button>
        <button type="button" className="btn small ghost" onClick={() => progress.snoozeBackupReminder()}>
          {t.notNow}
        </button>
      </div>
    </aside>
  );
}

function StorageStatus() {
  const status = usePersistStatus();
  const t = useStrings();
  if (status === 'checking') return null;
  if (status === 'persisted') {
    return (
      <p className="storage-status ok">
        <span aria-hidden="true">🛡️</span> {t.storageProtected}
      </p>
    );
  }
  return (
    <div className="storage-status">
      <p>
        <span aria-hidden="true">⚠️</span> {t.storageAtRisk}
      </p>
      {status === 'best-effort' && (
        <button type="button" className="btn small ghost" onClick={() => requestPersistentStorage()}>
          {t.askAgain}
        </button>
      )}
    </div>
  );
}

function InstallApp() {
  const canInstall = useCanInstall();
  const installed = useInstalled();
  const t = useStrings();
  if (installed) return null;
  if (canInstall) {
    return (
      <div className="install">
        <h3>{t.installTitle}</h3>
        <p>{t.installText}</p>
        <button type="button" className="btn primary" onClick={() => promptInstall()}>
          {t.installTitle}
        </button>
      </div>
    );
  }
  if (isIos()) {
    const [tap, share, then, add, rest] = t.installIos;
    return (
      <div className="install">
        <h3>{t.installTitle}</h3>
        <p>
          {tap}
          <strong>{share}</strong>
          {then}
          <strong>{add}</strong>
          {rest}
        </p>
      </div>
    );
  }
  return null;
}

function Settings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const t = useStrings();
  const tr = useTranslateMessage();

  const upload = async (file: File) => {
    try {
      progress.import(await file.text());
      setMsg(t.progressImported);
    } catch (e) {
      setMsg(tr((e as Error).message));
    }
  };

  return (
    <section className="settings" id="settings">
      <h2>{t.yourProgress}</h2>
      <p>{t.progressSaved}</p>
      <StorageStatus />
      <div className="row">
        <button type="button" className="btn ghost" onClick={downloadProgress}>
          {t.exportProgress}
        </button>
        <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
          {t.importProgress}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <button type="button" className="btn ghost danger" onClick={() => confirm(t.confirmReset) && progress.reset()}>
          {t.reset}
        </button>
      </div>
      {msg && <p role="status">{msg}</p>}
      <InstallApp />
    </section>
  );
}
