import { useRef, useState } from 'react';
import { Link, Navigate, NavLink, useParams } from 'react-router-dom';
import { courseItems, courses, getCourse, isModuleComplete, isModuleUnlocked } from '../content';
import { ProgressBar } from '../components/ProgressBar';
import { downloadProgress } from '../store/backup';
import { needsBackup, progress, useProgress } from '../store/progress';
import { requestPersistentStorage, usePersistStatus } from '../store/persistence';
import { isIos, promptInstall, useCanInstall, useInstalled } from '../pwa/install';

const stars = (n = 0) => '★'.repeat(n) + '☆'.repeat(3 - n);

export function Home() {
  const { courseId = 'html' } = useParams();
  const course = getCourse(courseId);
  const state = useProgress();
  if (!course) return <Navigate to="/" replace />;

  const items = courseItems(course);
  const modules = course.modules;
  const done = items.filter((c) => state.completed[c.item.id]).length;
  const resume = items.find((c) => !state.completed[c.item.id] && isModuleUnlocked(course, c.module, state));

  return (
    <main className="page">
      <section className="hero">
        <div className="course-switch" role="tablist" aria-label="Courses">
          {courses.map((c) => {
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
        <h1>Learn {course.title} by writing it.</h1>
        <p>
          {modules.length} modules. {course.tagline} Every lesson explains one idea, then hands you an editor and a
          checklist. Every module ends with a challenge.
        </p>
        <div className="hero-progress">
          <ProgressBar value={done} max={items.length} label={`${course.title} course progress`} />
          <span>
            {done} / {items.length} completed
          </span>
        </div>
        {resume && (
          <Link className="btn primary" to={`/learn/${resume.item.id}`}>
            {done === 0 ? 'Start the first lesson' : `Continue: ${resume.item.title}`} →
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
              <ProgressBar value={n} max={mItems.length} label={`${m.title} progress`} />
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
                      <span className="stars" aria-label={`${state.completed[m.challenge.id]?.stars ?? 0} of 3 stars`}>
                        {stars(state.completed[m.challenge.id]?.stars)}
                      </span>
                    </Link>
                    <span className="challenge-summary">{m.challenge.summary}</span>
                  </li>
                </ul>
              ) : (
                <div className="locked-note">
                  <p>🔒 Finish the lessons of “{modules[idx - 1].title}” to unlock.</p>
                  <button type="button" className="btn small ghost" onClick={() => progress.unlock(m.id)}>
                    I know this already — unlock
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
  return (
    <aside className="backup-reminder" aria-label="Backup reminder">
      <p>
        {lastExportAt
          ? `Your last backup is from ${new Date(lastExportAt).toLocaleDateString()}.`
          : 'You haven’t backed up your progress yet.'}{' '}
        Progress lives only in this browser: export it now and then, so clearing site data can’t erase it.
      </p>
      <div className="row">
        <button type="button" className="btn small primary" onClick={downloadProgress}>
          Export progress
        </button>
        <button type="button" className="btn small ghost" onClick={() => progress.snoozeBackupReminder()}>
          Not now
        </button>
      </div>
    </aside>
  );
}

function StorageStatus() {
  const status = usePersistStatus();
  if (status === 'checking') return null;
  if (status === 'persisted') {
    return (
      <p className="storage-status ok">
        <span aria-hidden="true">🛡️</span> Your progress is protected: the browser won’t delete it to free up space.
      </p>
    );
  }
  return (
    <div className="storage-status">
      <p>
        <span aria-hidden="true">⚠️</span> The browser might delete your progress if it runs low on space.
        Installing the app or exporting a backup keeps it safe.
      </p>
      {status === 'best-effort' && (
        <button type="button" className="btn small ghost" onClick={() => requestPersistentStorage()}>
          Ask again to protect it
        </button>
      )}
    </div>
  );
}

function InstallApp() {
  const canInstall = useCanInstall();
  const installed = useInstalled();
  if (installed) return null;
  if (canInstall) {
    return (
      <div className="install">
        <h3>Install the app</h3>
        <p>Open LearnWeb from your home screen or dock, and keep learning offline.</p>
        <button type="button" className="btn primary" onClick={() => promptInstall()}>
          Install the app
        </button>
      </div>
    );
  }
  if (isIos()) {
    return (
      <div className="install">
        <h3>Install the app</h3>
        <p>
          In Safari, tap <strong>Share</strong>, then{' '}
          <strong>Add to Home Screen</strong>. The installed app works offline and keeps your progress safer.
        </p>
      </div>
    );
  }
  return null;
}

function Settings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const upload = async (file: File) => {
    try {
      progress.import(await file.text());
      setMsg('Progress imported.');
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  return (
    <section className="settings" id="settings">
      <h2>Your progress</h2>
      <p>Progress is saved in this browser. Export it to back it up or move it to another device.</p>
      <StorageStatus />
      <div className="row">
        <button type="button" className="btn ghost" onClick={downloadProgress}>
          Export progress
        </button>
        <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
          Import progress
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <button
          type="button"
          className="btn ghost danger"
          onClick={() => confirm('Erase all progress and saved code?') && progress.reset()}
        >
          Reset
        </button>
      </div>
      {msg && <p role="status">{msg}</p>}
      <InstallApp />
    </section>
  );
}
