import ReactMarkdown from 'react-markdown';
import type { EditorLanguage } from './CodeEditor';
import remarkGfm from 'remark-gfm';
import { useStrings } from '../i18n';

const plugins = [remarkGfm];

const tryItLanguage = (className: string): EditorLanguage | null => {
  const m = /language-(html|css|js|javascript)\b/.exec(className);
  if (!m) return null;
  return m[1] === 'javascript' ? 'js' : (m[1] as EditorLanguage);
};

/** Lesson prose. Fenced ```html, ```css and ```js blocks get a "Try it" button that loads them into the editor. */
export function Markdown({ source, onTryIt }: { source: string; onTryIt?: (code: string, lang: EditorLanguage) => void }) {
  const t = useStrings();
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
            const lang = tryItLanguage(className);
            return (
              <div className="code-block">
                <pre>
                  <code>{code}</code>
                </pre>
                {onTryIt && lang && (
                  <button type="button" className="btn small ghost try-it" onClick={() => onTryIt(code, lang)}>
                    {t.tryIt}
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
