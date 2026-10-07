import { useEffect } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useParams } from 'react-router-dom';
import { Home } from './pages/Home';
import { Workspace } from './pages/Workspace';
import { Playground } from './pages/Playground';
import { StorageBanner, UpdateBanner } from './components/Banners';
import { progress, useProgress } from './store/progress';

function ThemeToggle() {
  const { theme } = useProgress();
  const current = theme ?? 'dark';
  useEffect(() => {
    document.documentElement.dataset.theme = current;
  }, [current]);
  return (
    <button
      type="button"
      className="btn ghost icon"
      onClick={() => progress.setTheme(current === 'dark' ? 'light' : 'dark')}
      aria-label={`Switch to ${current === 'dark' ? 'light' : 'dark'} theme`}
    >
      {current === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}

const isHome = () => location.hash === '' || location.hash === '#/';

function LessonRoute() {
  const { id = '' } = useParams();
  return <Workspace key={id} id={id} />;
}

export function App() {
  return (
    <HashRouter>
      <header className="topbar">
        <Link to="/" className="logo">
          <span aria-hidden="true">&lt;/&gt;</span> <span className="logo-text">LearnWeb</span>
        </Link>
        <nav aria-label="Main">
          <NavLink to="/course/html" className={({ isActive }) => (isActive || isHome() ? 'active' : '')}>
            HTML
          </NavLink>
          <NavLink to="/course/css">CSS</NavLink>
          <NavLink to="/playground">Playground</NavLink>
        </nav>
        <ThemeToggle />
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:courseId" element={<Home />} />
        <Route path="/learn/:id" element={<LessonRoute />} />
        <Route path="/playground" element={<Playground />} />
        <Route
          path="*"
          element={
            <main className="page">
              <h1>Page not found</h1>
              <Link to="/">Back to the course</Link>
            </main>
          }
        />
      </Routes>
      <div className="banners">
        <StorageBanner />
        <UpdateBanner />
      </div>
    </HashRouter>
  );
}
