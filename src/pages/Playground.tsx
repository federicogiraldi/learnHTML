import { useState } from 'react';
import { CodeEditor, type EditorLanguage } from '../components/CodeEditor';
import { Preview } from '../components/Preview';
import { progress } from '../store/progress';
import { validate } from '../engine/validator';
import { validateCss } from '../engine/cssValidator';

const ID = '__playground';
const CSS_ID = '__playground:css';
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

export function Playground() {
  const [code, setCode] = useState(() => progress.get().code[ID] ?? START);
  const [css, setCss] = useState(() => progress.get().code[CSS_ID] ?? START_CSS);
  const [file, setFile] = useState<EditorLanguage>('html');
  const issues = file === 'html' ? validate(code) : validateCss(css);

  const change = (v: string) => {
    if (file === 'html') {
      setCode(v);
      progress.saveCode(ID, v);
    } else {
      setCss(v);
      progress.saveCode(CSS_ID, v);
    }
  };
  const reset = () => {
    if (!confirm(`Reset ${file === 'html' ? 'index.html' : 'style.css'}?`)) return;
    change(file === 'html' ? START : START_CSS);
  };

  return (
    <main className="playground">
      <div className="pane editor-pane">
        <div className="pane-bar">
          <div className="file-tabs" role="tablist" aria-label="Files">
            {(['html', 'css'] as EditorLanguage[]).map((f) => (
              <button key={f} type="button" role="tab" aria-selected={file === f} onClick={() => setFile(f)}>
                {f === 'css' ? 'style.css' : 'index.html'}
              </button>
            ))}
          </div>
          <button type="button" className="btn small ghost" onClick={reset}>
            Reset
          </button>
        </div>
        <CodeEditor key={file} language={file} value={file === 'html' ? code : css} onChange={change} />
        <div className={`issues ${issues.length ? 'has-issues' : ''}`} role="status">
          {issues.length === 0
            ? `✓ No ${file === 'html' ? 'structural' : 'CSS'} errors`
            : issues.slice(0, 4).map((i, k) => (
                <div key={k}>
                  ⚠ Line {i.line}: {i.message}
                </div>
              ))}
        </div>
      </div>
      <div className="pane preview-pane">
        <div className="pane-bar">
          <span>Preview</span>
        </div>
        <Preview code={code} css={css} />
      </div>
    </main>
  );
}
