import { useCallback, useEffect, useRef, useState } from 'react';
import { CodeEditor, fileNames, type EditorLanguage } from '../components/CodeEditor';
import { JsPreview } from '../components/JsPreview';
import { progress } from '../store/progress';
import { validate } from '../engine/validator';
import { validateCss } from '../engine/cssValidator';
import { hasSyntaxError } from '../engine/js/instrument';

const ID = '__playground';
const CSS_ID = '__playground:css';
const JS_ID = '__playground:js';
const START = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Playground</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <h1>Free practice</h1>
    <p>Write anything you like here. It is saved automatically.</p>
    <button id="hello">Say hello</button>
    <script src="script.js"></script>
  </body>
</html>
`;
const START_CSS = `body {
  font-family: system-ui, sans-serif;
  margin: 2rem;
}

h1 {
  color: #e44d26;
}
`;
const START_JS = `const button = document.querySelector('#hello');

button.addEventListener('click', () => {
  console.log('Hello from script.js!');
});
`;
const STARTERS: Record<EditorLanguage, string> = { html: START, css: START_CSS, js: START_JS };
const KEYS: Record<EditorLanguage, string> = { html: ID, css: CSS_ID, js: JS_ID };
/** HTML and CSS edits show up quickly; JavaScript waits for a longer pause (or Run) and for code that parses. */
const DELAY: Record<EditorLanguage, number> = { html: 300, css: 300, js: 1500 };

export function Playground() {
  const saved = progress.get().code;
  const [files, setFiles] = useState<Record<EditorLanguage, string>>(() => ({
    html: saved[ID] ?? START,
    css: saved[CSS_ID] ?? START_CSS,
    // Older playgrounds have no script.js yet: start them empty so nothing unexpected runs.
    js: saved[JS_ID] ?? (saved[ID] === undefined ? START_JS : ''),
  }));
  const [file, setFile] = useState<EditorLanguage>('html');
  const [ran, setRan] = useState(() => ({ n: 0, files }));
  const latest = useRef(files);
  const run = useCallback(() => setRan((r) => ({ n: r.n + 1, files: latest.current })), []);

  useEffect(() => {
    latest.current = files;
    const t = setTimeout(() => {
      if (file === 'js' && hasSyntaxError(files.js)) return;
      setRan((r) => (r.files === files ? r : { n: r.n + 1, files }));
    }, DELAY[file]);
    return () => clearTimeout(t);
  }, [files, file]);

  const value = files[file];
  const issues = file === 'html' ? validate(value) : file === 'css' ? validateCss(value) : [];

  const change = (v: string) => {
    setFiles((f) => ({ ...f, [file]: v }));
    progress.saveCode(KEYS[file], v);
  };
  const reset = () => {
    if (!confirm(`Reset ${fileNames[file]}?`)) return;
    change(STARTERS[file]);
  };

  return (
    <main className="playground">
      <div className="pane editor-pane">
        <div className="pane-bar">
          <div className="file-tabs" role="tablist" aria-label="Files">
            {(['html', 'css', 'js'] as EditorLanguage[]).map((f) => (
              <button key={f} type="button" role="tab" aria-selected={file === f} onClick={() => setFile(f)}>
                {fileNames[f]}
              </button>
            ))}
          </div>
          <span className="pane-actions">
            <button type="button" className="btn small ghost" onClick={reset}>
              Reset
            </button>
            <button type="button" className="btn small run" onClick={run} title="Run (Ctrl+Enter)">
              ▶ Run
            </button>
          </span>
        </div>
        <CodeEditor key={file} language={file} value={value} onChange={change} onRun={run} />
        {file !== 'js' && (
          <div className={`issues ${issues.length ? 'has-issues' : ''}`} role="status">
            {issues.length === 0
              ? `✓ No ${file === 'html' ? 'structural' : 'CSS'} errors`
              : issues.slice(0, 4).map((i, k) => (
                  <div key={k}>
                    ⚠ Line {i.line}: {i.message}
                  </div>
                ))}
          </div>
        )}
      </div>
      <div className="pane preview-pane">
        <div className="pane-bar">
          <span>Preview</span>
        </div>
        <JsPreview files={{ html: ran.files.html, css: ran.files.css, js: ran.files.js }} runKey={ran.n} page storageId={ID} />
      </div>
    </main>
  );
}
