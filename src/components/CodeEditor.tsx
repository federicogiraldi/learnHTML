import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { editorTheme } from './editorTheme';

export type EditorLanguage = 'html' | 'css';

// Auto-closing is off on purpose: writing closing tags yourself is part of learning HTML.
const extensions: Record<EditorLanguage, Extension[]> = {
  html: [html({ autoCloseTags: false }), EditorView.lineWrapping],
  css: [css(), EditorView.lineWrapping],
};

export function CodeEditor({
  value,
  onChange,
  language = 'html',
}: {
  value: string;
  onChange: (v: string) => void;
  language?: EditorLanguage;
}) {
  return (
    <CodeMirror
      className="editor"
      value={value}
      onChange={onChange}
      extensions={extensions[language]}
      theme={editorTheme}
      height="100%"
      basicSetup={{ tabSize: 2 }}
      aria-label={language === 'css' ? 'CSS editor' : 'HTML editor'}
    />
  );
}
