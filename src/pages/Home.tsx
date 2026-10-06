import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { course, isModuleComplete, isModuleUnlocked, modules } from '../content';
import { ProgressBar } from '../components/ProgressBar';
import { progress, useProgress } from '../store/progress';

const stars = (n = 0) => '★'.repeat(n) + '☆'.repeat(3 - n);

export function Home() {
  const state = useProgress();
  const done = course.filter((c) => state.completed[c.item.id]).length;
  const resume = course.find((c) => !state.completed[c.item.id] && isModuleUnlocked(c.module, state));

  return (
    <main className="page">
      <section className="hero">
        <h1>Learn HTML by writing it.</h1>
        <p>
          {modules.length} modules from your first tag to accessible, semantic, production-ready pages. Every lesson
          explains one idea, then hands you an editor and a checklist. Every module ends with a challenge.
        </p>
        <div className="hero-progress">
          <ProgressBar value={done} max={course.length} label="Course progress" />
          <span>
            {done} / {course.length} completed
          </span>
        </div>
        {resume && (
          <Link className="btn primary" to={`/learn/${resume.item.id}`}>
            {done === 0 ? 'Start the first lesson' : `Continue: ${resume.item.title}`} →
          </Link>
        )}
      </section>

      <ol className="modules">
        {modules.map((m, idx) => {
          const unlocked = isModuleUnlocked(m, state);
          const complete = isModuleComplete(m, state);
          const items = [...m.lessons, m.challenge];
          const n = items.filter((i) => state.completed[i.id]).length;
          return (
            <li key={m.id} className={`module-card ${unlocked ? '' : 'locked'} ${complete ? 'complete' : ''}`}>
              <div className="module-head">
                <span className="module-num">{idx + 1}</span>
                <div>
                  <h2>{m.title}</h2>
                  <p>{m.description}</p>
                </div>
              </div>
              <ProgressBar value={n} max={items.length} label={`${m.title} progress`} />
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

function Settings() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const download = () => {
    const url = URL.createObjectURL(new Blob([progress.export()], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learnhtml-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file: File) => {
    try {
      progress.import(await file.text());
      setMsg('Progress imported.');
    } catch (e) {
      setMsg((e as Error).message);
    }
  };

  return (
    <section className="settings">
      <h2>Your progress</h2>
      <p>Progress is saved in this browser. Export it to move it to another device.</p>
      <div className="row">
        <button type="button" className="btn ghost" onClick={download}>
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
    </section>
  );
}
