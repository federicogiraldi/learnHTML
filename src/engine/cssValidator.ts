import type { Issue } from './validator';

/**
 * Reports the CSS mistakes browsers silently skip: unbalanced braces, unclosed comments, missing colons or
 * semicolons, unknown properties, invalid values and invalid selectors.
 * Property/value/selector checks use `CSS.supports`, so they only run in a real browser.
 */
export function validateCss(css: string): Issue[] {
  const issues: Issue[] = [];
  const lineOf = (i: number) => css.slice(0, i).split('\n').length;
  const supports = typeof CSS !== 'undefined' && typeof CSS.supports === 'function';

  // Blank out comments and strings (keeping offsets) so braces inside them are ignored.
  let src = '';
  for (let i = 0; i < css.length; ) {
    if (css.startsWith('/*', i)) {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) {
        issues.push({ line: lineOf(i), message: 'Comment opened with /* is never closed with */.' });
        src += css.slice(i).replace(/[^\n]/g, ' ');
        break;
      }
      src += css.slice(i, end + 2).replace(/[^\n]/g, ' ');
      i = end + 2;
    } else if (css[i] === '"' || css[i] === "'") {
      const q = css[i];
      let j = i + 1;
      while (j < css.length && css[j] !== q && css[j] !== '\n') j += css[j] === '\\' ? 2 : 1;
      src += q + 'x'.repeat(Math.max(0, j - i - 1)) + (css[j] === q ? q : '');
      i = css[j] === q ? j + 1 : j;
    } else {
      src += css[i++];
    }
  }

  // contexts: 'rules' = expects selectors/at-rules, 'decls' = declaration block (may also nest rules)
  type Ctx = { kind: 'rules' | 'decls' | 'keyframes'; open: number };
  const stack: Ctx[] = [{ kind: 'rules', open: -1 }];
  let start = 0;

  const declaration = (masked: string, at: number) => {
    // `masked` hides strings and comments; offsets match, so read the real text back for the value.
    const text = css.slice(at, at + masked.length).replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
    const trimmed = text.trim();
    if (!trimmed) return;
    const line = lineOf(at + text.indexOf(trimmed));
    const colon = trimmed.indexOf(':');
    if (colon === -1) {
      issues.push({ line, message: `"${trimmed}" is missing a colon. Write it as property: value;` });
      return;
    }
    const prop = trimmed.slice(0, colon).trim();
    let value = trimmed.slice(colon + 1).trim();
    const nextDecl = /\n\s*-?[a-z-]+\s*:/i.exec(value);
    if (nextDecl && !prop.startsWith('--')) {
      issues.push({ line, message: `Missing ";" after "${prop}: ${value.slice(0, nextDecl.index).trim()}".` });
      return;
    }
    if (!value) {
      issues.push({ line, message: `"${prop}" has no value.` });
      return;
    }
    if (prop.startsWith('--') || !supports) return;
    if (!/^-?[a-z][a-z-]*$/i.test(prop)) {
      issues.push({ line, message: `"${prop}" is not a valid property name.` });
      return;
    }
    value = value.replace(/!\s*important\s*$/i, '').trim();
    if (!CSS.supports(prop, 'inherit')) {
      issues.push({ line, message: `Unknown property "${prop}". Check the spelling.` });
    } else if (!CSS.supports(prop, value)) {
      issues.push({ line, message: `"${value}" is not a valid value for ${prop}.` });
    }
  };

  const selector = (text: string, at: number, ctx: Ctx) => {
    const sel = text.trim();
    const line = lineOf(at + text.indexOf(sel));
    if (!sel) {
      issues.push({ line, message: 'A rule is missing its selector before "{".' });
      return;
    }
    if (!supports || sel.startsWith('@') || ctx.kind === 'keyframes' || sel.includes('&')) return;
    const bad = splitSelectorList(sel).find((part) => !part || !CSS.supports(`selector(${part})`));
    if (bad !== undefined) issues.push({ line, message: `"${bad || sel}" is not a valid selector.` });
  };

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const ctx = stack[stack.length - 1];
    if (c === '{') {
      const prelude = src.slice(start, i);
      const name = prelude.trim();
      if (!name.startsWith('@')) selector(prelude, start, ctx);
      const kind: Ctx['kind'] = /^@(-\w+-)?keyframes\b/i.test(name)
        ? 'keyframes'
        : /^@(media|supports|container|layer|scope|document)\b/i.test(name)
          ? 'rules'
          : 'decls';
      stack.push({ kind, open: i });
      start = i + 1;
    } else if (c === '}') {
      if (stack.length === 1) {
        issues.push({ line: lineOf(i), message: 'This "}" has no matching "{".' });
      } else {
        if (ctx.kind === 'decls') declaration(src.slice(start, i), start);
        else if (src.slice(start, i).trim()) issues.push({ line: lineOf(start), message: `Unexpected "${src.slice(start, i).trim()}". Is a "{" missing?` });
        stack.pop();
      }
      start = i + 1;
    } else if (c === ';') {
      const text = src.slice(start, i);
      if (ctx.kind === 'decls') declaration(text, start);
      else if (text.trim() && !text.trim().startsWith('@')) {
        issues.push({ line: lineOf(start + text.indexOf(text.trim())), message: `"${text.trim()}" must be inside a rule like selector { ... }.` });
      }
      start = i + 1;
    }
  }
  const rest = src.slice(start).trim();
  if (rest && stack.length === 1) issues.push({ line: lineOf(start + src.slice(start).indexOf(rest)), message: `"${rest}" is not a complete rule.` });
  for (const open of stack.slice(1)) issues.push({ line: lineOf(open.open), message: 'This "{" is never closed with "}".' });
  return issues.sort((a, b) => a.line - b.line);
}

/** Splits "a, b:is(c, d)" into ["a", "b:is(c, d)"]. */
function splitSelectorList(list: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of list) {
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  parts.push(cur.trim());
  return parts;
}
