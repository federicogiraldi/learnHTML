import ReactMarkdown from 'react-markdown';
import type { EditorLanguage } from './CodeEditor';
import remarkGfm from 'remark-gfm';

const plugins = [remarkGfm];

/** Lesson prose. Fenced ```html and ```css blocks get a "Try it" button that loads them into the editor. */
export function Markdown({ source, onTryIt }: { source: string; onTryIt?: (code: string, lang: EditorLanguage) => void }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={plugins}
        components={{
          pre({ children }) {
            return <>{children}</>;
          },
          code({ className, children }) {
            const code = String(children).replace(/\n$/, '');
            if (!className) return <code>{children}</code>;
            return (
              <div className="code-block">
                <pre>
                  <code>{code}</code>
                </pre>
                {onTryIt && /language-(html|css)/.test(className) && (
                  <button
                    type="button"
                    className="btn small ghost try-it"
                    onClick={() => onTryIt(code, className.includes('language-css') ? 'css' : 'html')}
                  >
                    Try it ↗
                  </button>
                )}
              </div>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
