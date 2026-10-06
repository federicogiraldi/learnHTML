import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const plugins = [remarkGfm];

/** Lesson prose. Fenced ```html blocks get a "Try it" button that loads them into the editor. */
export function Markdown({ source, onTryIt }: { source: string; onTryIt?: (code: string) => void }) {
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
                {onTryIt && className.includes('language-html') && (
                  <button type="button" className="btn small ghost try-it" onClick={() => onTryIt(code)}>
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
