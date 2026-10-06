import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { editorTheme } from './editorTheme';

export type EditorLanguage = 'html' | 'css';

// Auto-closing of tags and brackets is off on purpose: writing them yourself is part of learning,
// and auto-inserted closers end up doubled when learners type their own.
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
      basicSetup={{ tabSize: 2, closeBrackets: false }}
      aria-label={language === 'css' ? 'CSS editor' : 'HTML editor'}
    />
  );
}
