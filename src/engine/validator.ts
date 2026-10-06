export interface Issue {
  line: number;
  message: string;
}

const VOID = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr',
]);
const RAW_TEXT = new Set(['script', 'style', 'textarea', 'title']);
const BLOCK = new Set([
  'address', 'article', 'aside', 'blockquote', 'details', 'dialog', 'div', 'dl', 'fieldset', 'figure',
  'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'main', 'nav', 'ol', 'p', 'pre',
  'section', 'table', 'ul',
]);
/** element -> the parents it must sit directly inside */
const REQUIRED_PARENT: Record<string, string[]> = {
  li: ['ul', 'ol', 'menu'],
  dt: ['dl', 'div'],
  dd: ['dl', 'div'],
  tr: ['table', 'thead', 'tbody', 'tfoot'],
  td: ['tr'],
  th: ['tr'],
  thead: ['table'],
  tbody: ['table'],
  tfoot: ['table'],
  caption: ['table'],
  figcaption: ['figure'],
  summary: ['details'],
  legend: ['fieldset'],
  option: ['select', 'datalist', 'optgroup'],
};
/** elements that may not contain themselves, at any depth */
const NO_NESTING = new Set(['a', 'form', 'button', 'label']);

const ATTR_RE = /([^\s"'>/=]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;

interface Open {
  name: string;
  line: number;
}

/**
 * A small, forgiving tokenizer that reports the mistakes browsers silently "repair":
 * unclosed or mismatched tags, invalid nesting and duplicate attributes.
 */
export function validate(html: string): Issue[] {
  const issues: Issue[] = [];
  const lineStarts = [0];
  for (let i = 0; i < html.length; i++) if (html[i] === '\n') lineStarts.push(i + 1);
  const lineOf = (index: number) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };

  const stack: Open[] = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt === -1) break;
    const line = lineOf(lt);

    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      if (end === -1) {
        issues.push({ line, message: 'Comment opened with <!-- is never closed with -->.' });
        break;
      }
      i = end + 3;
      continue;
    }
    if (html[lt + 1] === '!' || html[lt + 1] === '?') {
      const end = html.indexOf('>', lt);
      i = end === -1 ? html.length : end + 1;
      continue;
    }

    const closing = html[lt + 1] === '/';
    const nameMatch = /^[a-zA-Z][a-zA-Z0-9-]*/.exec(html.slice(lt + (closing ? 2 : 1)));
    if (!nameMatch) {
      i = lt + 1;
      continue;
    }
    const name = nameMatch[0].toLowerCase();
    const end = findTagEnd(html, lt);
    if (end === -1) {
      issues.push({ line, message: `The tag <${closing ? '/' : ''}${name} is missing its closing ">".` });
      break;
    }
    const inner = html.slice(lt + (closing ? 2 : 1) + name.length, end);
    i = end + 1;

    if (closing) {
      if (VOID.has(name)) {
        issues.push({ line, message: `<${name}> is a void element: it has no closing tag </${name}>.` });
        continue;
      }
      const idx = findLast(stack, name);
      if (idx === -1) {
        issues.push({ line, message: `Closing tag </${name}> has no matching opening <${name}>.` });
        continue;
      }
      for (let k = stack.length - 1; k > idx; k--) {
        const open = stack[k];
        issues.push({
          line: open.line,
          message: `<${open.name}> (line ${open.line}) must be closed before </${name}> on line ${line}.`,
        });
      }
      stack.length = idx;
      continue;
    }

    // opening tag
    const seen = new Set<string>();
    for (const m of inner.replace(/\/\s*$/, '').matchAll(ATTR_RE)) {
      const attr = m[1].toLowerCase();
      if (seen.has(attr)) issues.push({ line, message: `<${name}> has the attribute "${attr}" more than once.` });
      seen.add(attr);
    }

    const parent = stack[stack.length - 1]?.name;
    const required = REQUIRED_PARENT[name];
    if (required && parent !== 'template' && (!parent || !required.includes(parent))) {
      issues.push({
        line,
        message: `<${name}> must be placed directly inside ${required.map((r) => `<${r}>`).join(' or ')}.`,
      });
    }
    if (BLOCK.has(name) && parent === 'p') {
      issues.push({ line, message: `<${name}> cannot be placed inside a <p>. Close the paragraph first.` });
    }
    if (NO_NESTING.has(name) && findLast(stack, name) !== -1) {
      issues.push({ line, message: `<${name}> cannot be nested inside another <${name}>.` });
    }

    if (VOID.has(name)) continue;
    const foreign = name === 'svg' || name === 'math' || stack.some((o) => o.name === 'svg' || o.name === 'math');
    if (/\/\s*$/.test(inner)) {
      if (foreign) continue; // SVG and MathML allow self-closing tags

      issues.push({ line, message: `<${name} /> cannot be self-closing. Use <${name}></${name}>.` });
      continue;
    }
    if (RAW_TEXT.has(name) && !foreign) {
      const close = html.toLowerCase().indexOf(`</${name}`, i);
      if (close === -1) {
        issues.push({ line, message: `<${name}> (line ${line}) is never closed.` });
        break;
      }
      const closeEnd = html.indexOf('>', close);
      i = closeEnd === -1 ? html.length : closeEnd + 1;
      continue;
    }
    stack.push({ name, line });
  }

  for (const open of stack) {
    issues.push({ line: open.line, message: `<${open.name}> (line ${open.line}) is never closed.` });
  }
  return issues.sort((a, b) => a.line - b.line);
}

function findTagEnd(html: string, from: number): number {
  let quote: string | null = null;
  for (let k = from + 1; k < html.length; k++) {
    const c = html[k];
    if (quote) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return k;
    } else if (c === '<') {
      return -1;
    }
  }
  return -1;
}

function findLast(stack: Open[], name: string): number {
  for (let k = stack.length - 1; k >= 0; k--) if (stack[k].name === name) return k;
  return -1;
}
