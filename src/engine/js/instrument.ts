import { javascriptLanguage } from '@codemirror/lang-javascript';
import type { SyntaxNode } from '@lezer/common';

/** Name of the sandbox function every loop body calls, so a loop that never ends can be stopped. */
export const LOOP_GUARD = '__learnwebLoop';

const LOOPS = new Set(['ForStatement', 'WhileStatement', 'DoStatement']);

const parse = (code: string) => javascriptLanguage.parser.parse(code);

/** Whether the parser found a syntax error. Used to avoid running half-typed code automatically. */
export function hasSyntaxError(code: string): boolean {
  let found = false;
  parse(code).iterate({
    enter: (n) => {
      if (n.type.isError) found = true;
      return !found;
    },
  });
  return found;
}

/** The statement a loop repeats: the last child of for/while, the one after `do` in do…while. */
function loopBody(node: SyntaxNode): SyntaxNode | null {
  if (node.name === 'DoStatement') return node.firstChild?.nextSibling ?? null;
  return node.lastChild;
}

/**
 * Adds a call to the loop guard at the start of every loop body. Nothing is inserted on new lines, so the
 * line numbers of errors still match the learner's file. Code with syntax errors is left alone: it won't run.
 */
export function instrumentLoops(code: string): string {
  const tree = parse(code);
  const inserts: { at: number; text: string }[] = [];
  let broken = false;
  tree.iterate({
    enter: (ref) => {
      if (ref.type.isError) broken = true;
      if (!LOOPS.has(ref.name)) return;
      const body = loopBody(ref.node);
      if (!body) return;
      const line = code.slice(0, ref.from).split('\n').length;
      const call = `${LOOP_GUARD}(${line});`;
      if (body.name === 'Block') {
        inserts.push({ at: body.from + 1, text: call });
      } else {
        inserts.push({ at: body.from, text: `{${call}` }, { at: body.to, text: '}' });
      }
    },
  });
  if (broken) return code;
  // Apply from the end so earlier offsets stay valid; at equal offsets keep the order they were found in.
  let out = code;
  inserts
    .map((ins, k) => ({ ...ins, k }))
    .sort((a, b) => b.at - a.at || b.k - a.k)
    .forEach(({ at, text }) => {
      out = out.slice(0, at) + text + out.slice(at);
    });
  return out;
}

/**
 * The code with comments removed and string/template contents blanked out (template `${}` expressions are kept),
 * so source checks like "uses .map(" are not fooled by comments or text. Line structure is preserved.
 */
export function stripCommentsAndStrings(code: string): string {
  const parts: { from: number; to: number; keep?: [number, number][] }[] = [];
  parse(code).iterate({
    enter: (ref) => {
      const { name, from, to } = ref;
      if (name === 'LineComment' || name === 'BlockComment' || name === 'String') {
        parts.push({ from, to });
        return false;
      }
      if (name === 'TemplateString') {
        const keep: [number, number][] = [];
        for (let c = ref.node.firstChild; c; c = c.nextSibling) {
          if (c.name === 'Interpolation') keep.push([c.from, c.to]);
        }
        parts.push({ from, to, keep });
        return false;
      }
    },
  });
  const blank = (s: string) => s.replace(/[^\n]/g, ' ');
  let out = '';
  let pos = 0;
  for (const p of parts) {
    out += code.slice(pos, p.from);
    if (p.keep) {
      // Keep the backticks and each ${…} (itself stripped), blank the literal text in between.
      let q = p.from + 1;
      out += '`';
      for (const [a, b] of p.keep) {
        out += blank(code.slice(q, a)) + stripCommentsAndStrings(code.slice(a, b));
        q = b;
      }
      out += blank(code.slice(q, p.to - 1)) + code.slice(p.to - 1, p.to);
    } else {
      const text = code.slice(p.from, p.to);
      const isString = text[0] === '"' || text[0] === "'";
      out += isString ? text[0] + blank(text.slice(1, -1)) + text.slice(-1) : blank(text);
    }
    pos = p.to;
  }
  return out + code.slice(pos);
}
