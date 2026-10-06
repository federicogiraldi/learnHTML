import { useState } from 'react';
import { CodeEditor } from '../components/CodeEditor';
import { Preview } from '../components/Preview';
import { progress } from '../store/progress';
import { validate } from '../engine/validator';

const ID = '__playground';
const START = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Playground</title>
  </head>
  <body>
    <h1>Free practice</h1>
    <p>Write anything you like here. It is saved automatically.</p>
  </body>
</html>
`;

export function Playground() {
  const [code, setCode] = useState(() => progress.get().code[ID] ?? START);
  const issues = validate(code);
  const change = (v: string) => {
    setCode(v);
    progress.saveCode(ID, v);
  };
  return (
    <main className="playground">
      <div className="pane editor-pane">
        <div className="pane-bar">
          <span>index.html</span>
          <button type="button" className="btn small ghost" onClick={() => change(START)}>
            Reset
          </button>
        </div>
        <CodeEditor value={code} onChange={change} />
        <div className={`issues ${issues.length ? 'has-issues' : ''}`} role="status">
          {issues.length === 0
            ? '✓ No structural errors'
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
        <Preview code={code} />
      </div>
    </main>
  );
}
