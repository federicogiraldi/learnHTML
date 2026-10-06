/**
 * Puts a stylesheet (and optional extra head markup) into an HTML document the way a browser would
 * load it: `<link rel="stylesheet" href="style.css">` is replaced by the CSS; otherwise the CSS goes at the
 * start of <head>. Insertion always happens after the doctype so the page never falls into quirks mode.
 */
export function combine(html: string, css: string | undefined, extraHead = ''): string {
  const style = css === undefined ? '' : `<style data-learnweb>\n${css}\n</style>`;
  const linkRe = /<link\b[^>]*\bhref\s*=\s*["']?(?:\.\/)?style\.css["']?[^>]*>/i;
  let out = html;
  let head = extraHead;
  if (style && linkRe.test(out)) out = out.replace(linkRe, () => style);
  else head += style;
  if (!head) return out;

  const headTag = /<head\b[^>]*>/i.exec(out);
  if (headTag) return out.slice(0, headTag.index + headTag[0].length) + head + out.slice(headTag.index + headTag[0].length);
  const doctype = /^\s*<!doctype[^>]*>/i.exec(out);
  if (doctype) return doctype[0] + head + out.slice(doctype[0].length);
  return head + out;
}

export const RENDER_WIDTH = 800;
export const RENDER_HEIGHT = 600;

let frame: HTMLIFrameElement | null = null;

/**
 * Renders HTML + CSS synchronously into a hidden, script-less, same-origin iframe and returns its live
 * document, so checks can read computed styles and layout. The frame is reused between runs.
 */
export function renderPage(html: string, css: string): Document {
  if (!frame || !frame.isConnected) {
    frame = document.createElement('iframe');
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.setAttribute('aria-hidden', 'true');
    frame.tabIndex = -1;
    Object.assign(frame.style, {
      position: 'fixed',
      left: '-10000px',
      top: '0',
      width: `${RENDER_WIDTH}px`,
      height: `${RENDER_HEIGHT}px`,
      border: '0',
      visibility: 'hidden',
      pointerEvents: 'none',
    });
    document.body.appendChild(frame);
  }
  frame.style.width = `${RENDER_WIDTH}px`;
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(combine(html, css));
  doc.close();
  return doc;
}

/** Runs `fn` with the rendered page's viewport temporarily resized to `width` pixels. */
export function atViewportWidth<T>(doc: Document, width: number, fn: () => T): T {
  const el = doc.defaultView?.frameElement as HTMLElement | null;
  if (!el) return fn();
  const prev = el.style.width;
  el.style.width = `${width}px`;
  try {
    return fn();
  } finally {
    el.style.width = prev;
  }
}
