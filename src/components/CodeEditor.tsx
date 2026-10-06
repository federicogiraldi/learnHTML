import CodeMirror from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { EditorView } from '@codemirror/view';
import { useProgress } from '../store/progress';

// Auto-closing is off on purpose: writing closing tags yourself is part of learning HTML.
const extensions = [html({ autoCloseTags: false }), EditorView.lineWrapping];

export function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { theme } = useProgress();
  return (
    <CodeMirror
      className="editor"
      value={value}
      onChange={onChange}
      extensions={extensions}
      theme={theme === 'dark' ? 'dark' : 'light'}
      height="100%"
      basicSetup={{ tabSize: 2 }}
      aria-label="HTML editor"
    />
  );
}
