import { describe, expect, it } from 'vitest';
import { hasSyntaxError, instrumentLoops, LOOP_GUARD, stripCommentsAndStrings } from './js/instrument';
import { all, clickThen, domText, logged, returns, check } from './jsChecks';

const G = LOOP_GUARD;

describe('instrumentLoops', () => {
  it('guards every kind of loop without moving lines', () => {
    const code = `for (let i = 0; i < 3; i++) {\n  x++;\n}\nwhile (a) b();\ndo y(); while (z);\nfor (const k of o) {}\nouter: for (;;) break outer;`;
    const out = instrumentLoops(code);
    expect(out).toBe(
      `for (let i = 0; i < 3; i++) {${G}(1);\n  x++;\n}\nwhile (a) {${G}(4);b();}\ndo {${G}(5);y();} while (z);\nfor (const k of o) {${G}(6);}\nouter: for (;;) {${G}(7);break outer;}`,
    );
    expect(out.split('\n')).toHaveLength(code.split('\n').length);
  });

  it('guards nested loops', () => {
    const out = instrumentLoops(`for (const a of b) for (const c of d) e();`);
    expect(out).toBe(`for (const a of b) {${G}(1);for (const c of d) {${G}(1);e();}}`);
  });

  it('leaves code with syntax errors alone', () => {
    expect(instrumentLoops('while (true) {')).toBe('while (true) {');
  });

  it('ignores loops inside strings and comments', () => {
    const code = `// while (true) {}\nconst s = "for (;;) {}";`;
    expect(instrumentLoops(code)).toBe(code);
  });
});

describe('hasSyntaxError', () => {
  it('spots unfinished code', () => {
    expect(hasSyntaxError('const a = ;')).toBe(true);
    expect(hasSyntaxError('function f() {')).toBe(true);
    expect(hasSyntaxError('const a = [1, 2].map((n) => n * 2);\nclass A { #x = 1; get x() { return this.#x; } }')).toBe(false);
  });
});

describe('stripCommentsAndStrings', () => {
  it('blanks comments and string contents but keeps template expressions and lines', () => {
    const code = "const a = 'var x'; // .map(\n/* var y */ const b = `${list.map((n) => n)} var`;";
    const out = stripCommentsAndStrings(code);
    expect(out).not.toMatch(/var/);
    expect(out).toMatch(/list\.map\(/);
    expect(out.split('\n')).toHaveLength(2);
    expect(out.length).toBe(code.length);
  });
});

describe('JS checks', () => {
  it('serialize to expressions over the helpers', () => {
    expect(logged(/hi/i).js).toBe('h.logged(/hi/i)');
    expect(returns('add', [1, 2], { sum: 3 }, 'msg').js).toBe('h.returns("add", [1, 2], {"sum": 3}, "msg")');
    expect(all(logged('a'), domText('#x', /b/)).js).toBe('h.all((h) => (h.logged("a")), (h) => (h.domText("#x", /b/)))');
    expect(clickThen('#b', logged('c')).js).toBe('h.clickThen("#b", (h) => (h.logged("c")), 1)');
  });

  it('turns custom checks into self-contained source', () => {
    const c = check((h) => (h.has('x') ? true : 'no x'));
    expect(c.js).toMatch(/^\(.*\)\(h\)$/s);
    const fn = new Function('h', `return (${c.js});`);
    expect(fn({ has: () => true })).toBe(true);
    expect(fn({ has: () => false })).toBe('no x');
  });
});
