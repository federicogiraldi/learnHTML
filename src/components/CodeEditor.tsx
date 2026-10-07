import { useEffect, useMemo, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { Prec, type Extension } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { editorTheme } from './editorTheme';

export type EditorLanguage = 'html' | 'css' | 'js';

// Auto-closing of tags and brackets is off on purpose: writing them yourself is part of learning,
// and auto-inserted closers end up doubled when learners type their own.
const extensions: Record<EditorLanguage, Extension[]> = {
  html: [html({ autoCloseTags: false }), EditorView.lineWrapping],
  css: [css(), EditorView.lineWrapping],
  js: [javascript(), EditorView.lineWrapping],
};

const labels: Record<EditorLanguage, string> = { html: 'HTML editor', css: 'CSS editor', js: 'JavaScript editor' };

export const fileNames: Record<EditorLanguage, string> = { html: 'index.html', css: 'style.css', js: 'script.js' };

export function CodeEditor({
  value,
  onChange,
  language = 'html',
  onRun,
}: {
  value: string;
  onChange: (v: string) => void;
  language?: EditorLanguage;
  /** Called on Ctrl+Enter / Cmd+Enter. */
  onRun?: () => void;
}) {
  const runRef = useRef(onRun);
  useEffect(() => {
    runRef.current = onRun;
  }, [onRun]);
  const hasRun = !!onRun;
  const exts = useMemo(
    () =>
      hasRun
        ? [
            ...extensions[language],
            Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => (runRef.current?.(), true) }])),
          ]
        : extensions[language],
    [language, hasRun],
  );
  return (
    <CodeMirror
      className="editor"
      value={value}
      onChange={onChange}
      extensions={exts}
      theme={editorTheme}
      height="100%"
      basicSetup={{ tabSize: 2, closeBrackets: false }}
      aria-label={labels[language]}
    />
  );
}
