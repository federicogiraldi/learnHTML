import { useEffect } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom';
import { Home } from './pages/Home';
import { Workspace } from './pages/Workspace';
import { Playground } from './pages/Playground';
import { StorageBanner, UpdateBanner } from './components/Banners';
import { progress, useProgress } from './store/progress';
import { useDocumentLang, useLang, useStrings } from './i18n';

function ThemeToggle() {
  const { theme } = useProgress();
  const t = useStrings();
  const current = theme ?? 'dark';
  useEffect(() => {
    document.documentElement.dataset.theme = current;
  }, [current]);
  return (
    <button
      type="button"
      className="btn ghost icon"
      onClick={() => progress.setTheme(current === 'dark' ? 'light' : 'dark')}
      aria-label={t.switchTheme(current === 'dark' ? 'light' : 'dark')}
    >
      {current === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

/** Switches interface and lessons between English and Italian; code and progress stay as they are. */
function LangToggle() {
  const lang = useLang();
  const t = useStrings();
  useDocumentLang();
  const next = lang === 'en' ? 'it' : 'en';
  return (
    <button type="button" className="btn ghost lang-toggle" onClick={() => progress.setLang(next)} aria-label={t.switchLang} title={t.switchLang}>
      <span aria-hidden="true">{next.toUpperCase()}</span>
    </button>
  );
}

const isHome = () => location.hash === '' || location.hash === '#/';

function LessonRoute() {
  const { id = '' } = useParams();
  return <Workspace key={id} id={id} />;
}

function NotFound() {
  const t = useStrings();
  return (
    <main className="page">
      <h1>{t.pageNotFound}</h1>
      <Link to="/">{t.backToCourse}</Link>
    </main>
  );
}

export function App() {
  const t = useStrings();
  return (
    <HashRouter>
      <header className="topbar">
        <Link to="/" className="logo">
          <span aria-hidden="true">&lt;/&gt;</span> <span className="logo-text">LearnWeb</span>
        </Link>
        <nav aria-label={t.mainNav}>
          <NavLink to="/course/html" className={({ isActive }) => (isActive || isHome() ? 'active' : '')}>
            HTML
          </NavLink>
          <NavLink to="/course/css">CSS</NavLink>
          <NavLink to="/course/js">JS</NavLink>
          <NavLink to="/playground">Playground</NavLink>
        </nav>
        <div className="topbar-actions">
          <LangToggle />
          <ThemeToggle />
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:courseId" element={<Home />} />
        <Route path="/learn/:id" element={<LessonRoute />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <div className="banners">
        <StorageBanner />
        <UpdateBanner />
      </div>
    </HashRouter>
  );
}
