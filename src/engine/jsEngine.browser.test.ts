import { afterEach, describe, expect, it } from 'vitest';
import { Sandbox, runInSandbox, type ConsoleEntry, type SandboxFiles } from './js/sandbox';
import { runJsTests } from './runTests';
import { all, clickThen, domText, logged, noVar, returns, submitThen, typeThen, usesMethod, variableEquals, check } from './jsChecks';
import type { Lesson } from '../content/types';

const sandboxes: Sandbox[] = [];
afterEach(() => sandboxes.splice(0).forEach((s) => s.dispose()));

/** Runs code in a preview sandbox and collects the console until `ms` after the first run. */
function preview(files: Partial<SandboxFiles>, { ms = 150, mocks = {} } = {}) {
  return new Promise<{ logs: ConsoleEntry[]; stopped?: string; frames: number }>((resolve) => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const sandbox = new Sandbox(host, { visible: true });
    sandboxes.push(sandbox);
    const logs: ConsoleEntry[] = [];
    const finish = (stopped?: string) => resolve({ logs, stopped, frames: host.querySelectorAll('iframe').length });
    sandbox.run(
      { html: '', js: '', ...files },
      { mode: 'preview', mocks },
      {
        onLog: (e) => logs.push(e),
        onRan: () => setTimeout(() => finish(), ms),
        onStopped: (m) => finish(m),
      },
    );
  });
}

const texts = (logs: ConsoleEntry[]) => logs.map((l) => l.text);

describe('console', () => {
  it('captures log, warn and error with readable objects and arrays', async () => {
    const { logs } = await preview({
      js: `console.log('hi', 42, true, null, undefined);
console.log({ name: 'Ada', langs: ['en', 'fr'], nested: { deep: { x: 1 } } });
console.log([1, 'two', [3]], []);
console.warn('careful');
console.error(new TypeError('bad'));
console.log(function greet() {}, new Map([['a', 1]]), new Set([1, 2]));
const o = { a: 1 }; o.self = o; console.log(o);
console.log(document.body);`,
    });
    expect(texts(logs)).toEqual([
      'hi 42 true null undefined',
      "{ name: 'Ada', langs: ['en', 'fr'], nested: { deep: { x: 1 } } }",
      "[1, 'two', [3]] []",
      'careful',
      'TypeError: bad',
      "[Function: greet] Map(1) { 'a' => 1 } Set(2) { 1, 2 }",
      '{ a: 1, self: [Circular] }',
      '<body>',
    ]);
    expect(logs.map((l) => l.level)).toEqual(['log', 'log', 'log', 'warn', 'error', 'log', 'log', 'log']);
  });

  it('keeps logging from timers and event handlers after the first run', async () => {
    const { logs } = await preview({ js: `setTimeout(() => console.log('later'), 20);` }, { ms: 200 });
    expect(texts(logs)).toEqual(['later']);
  });
});

describe('errors', () => {
  it('reports runtime errors with the line in script.js', async () => {
    const { logs } = await preview({ js: `const a = 1;\nconsole.log('before');\nnotDefined();\nconsole.log('after');` });
    expect(texts(logs)[0]).toBe('before');
    expect(logs[1]).toMatchObject({ level: 'error', line: 3, text: 'ReferenceError: notDefined is not defined' });
    expect(texts(logs)).not.toContain('after');
  });

  it('reports syntax errors with their line, and nothing runs', async () => {
    const { logs } = await preview({ js: `console.log('one');\nconst x = ;\n` });
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({ level: 'error', line: 2 });
    expect(logs[0].text).toMatch(/^SyntaxError: /);
  });

  it('gives the line of errors thrown later, inside functions and async code', async () => {
    const { logs } = await preview(
      {
        js: `function boom() {\n  throw new Error('inside');\n}\nsetTimeout(boom, 5);\nasync function later() {\n  await null;\n  null.x;\n}\nlater();`,
      },
      { ms: 150 },
    );
    const errors = logs.filter((l) => l.level === 'error');
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ text: 'Error: inside', line: 2 }),
        expect.objectContaining({ text: expect.stringMatching(/^TypeError: Cannot read properties of null/), line: 7 }),
      ]),
    );
  });

  it('reports thrown non-errors readably', async () => {
    const { logs } = await preview({ js: `throw 'oops';` });
    expect(logs[0]).toMatchObject({ level: 'error', text: "Uncaught 'oops'", line: 1 });
  });
});

describe('time limit', () => {
  it('stops an infinite loop, removes the frame and says why', async () => {
    const started = performance.now();
    const { stopped, frames } = await preview({ js: `let i = 0;\nwhile (true) {\n  i++;\n}` });
    expect(stopped).toMatch(/loop on line 2 ran for more than 2 seconds/);
    expect(frames).toBe(0);
    expect(performance.now() - started).toBeLessThan(5000);
  });

  it('stops loops without braces and in functions called by checks', async () => {
    const r = await runInSandbox({ html: '', js: `function spin() { for (;;) ; }` }, { checks: ['h.returns("spin", [], 1)'] });
    expect(r.results[0]).toMatch(/loop on line 1/);
  });

  it('runs normally again after a stopped run', async () => {
    await preview({ js: `do {} while (true);` });
    const { logs, stopped } = await preview({ js: `for (let i = 0; i < 3; i++) console.log(i);` });
    expect(stopped).toBeUndefined();
    expect(texts(logs)).toEqual(['0', '1', '2']);
  });

  it('long but finite loops are fine', async () => {
    const { logs } = await preview({ js: `let s = 0;\nfor (let i = 0; i < 1e6; i++) { s += i; }\nconsole.log(s);` });
    expect(texts(logs)).toEqual(['499999500000']);
  });
});

describe('isolation', () => {
  it("can't reach the app's page, storage or origin", async () => {
    localStorage.setItem('learnhtml:v1', 'app data');
    const { logs } = await preview({
      js: `try { parent.document.title; console.log('parent: leaked'); } catch (e) { console.log('parent: blocked'); }
try { top.location.href; console.log('top: leaked'); } catch (e) { console.log('top: blocked'); }
console.log('origin: ' + window.origin);
console.log('storage: ' + localStorage.getItem('learnhtml:v1'));
localStorage.setItem('learnhtml:v1', 'overwritten');
try { document.cookie; console.log('cookie: readable'); } catch (e) { console.log('cookie: blocked'); }`,
    });
    expect(texts(logs)).toEqual(['parent: blocked', 'top: blocked', 'origin: null', 'storage: null', 'cookie: blocked']);
    expect(localStorage.getItem('learnhtml:v1')).toBe('app data');
    localStorage.removeItem('learnhtml:v1');
  });

  it('localStorage works inside the sandbox, in memory', async () => {
    const { logs } = await preview({
      js: `localStorage.setItem('n', 1);\nconsole.log(localStorage.getItem('n'), localStorage.length, localStorage.getItem('none'));`,
    });
    expect(texts(logs)).toEqual(['1 1 null']);
  });
});

describe('fake fetch', () => {
  const mocks = {
    'https://api.example.com/users/1': { body: { id: 1, name: 'Ada' }, delay: 10 },
    'https://api.example.com/broken': { status: 500, body: { error: 'boom' }, delay: 10 },
  };

  it('answers with the lesson’s data', async () => {
    const { logs } = await preview(
      {
        js: `async function load() {
  const res = await fetch('https://api.example.com/users/1?x=1');
  const user = await res.json();
  console.log(res.ok, res.status, user.name);
  const bad = await fetch('https://api.example.com/broken');
  console.log(bad.ok, bad.status);
}
load();`,
      },
      { ms: 200, mocks },
    );
    expect(texts(logs)).toEqual(['true 200 Ada', 'false 500']);
  });

  it('rejects unknown URLs without touching the network', async () => {
    const { logs } = await preview(
      {
        js: `fetch('https://example.org/data').catch((e) => console.log(e.name, e.message));
const x = new XMLHttpRequest();
x.open('GET', 'https://example.org/');
x.onerror = () => console.log('xhr blocked');
x.send();`,
      },
      { ms: 300, mocks },
    );
    expect(texts(logs)).toContain('xhr blocked');
    expect(texts(logs).find((t) => t.startsWith('TypeError'))).toMatch(/no network.*api\.example\.com\/users\/1/);
  });
});

describe('runJsTests', () => {
  const lesson = (over: Partial<Lesson>): Lesson => ({
    id: 't',
    title: 't',
    explanation: '',
    starterCode: '',
    starterJs: '',
    solution: '',
    hints: [],
    tasks: [],
    ...over,
  });

  it('runs checks on values, functions, the console and the source', async () => {
    const l = lesson({
      tasks: [
        { text: 'name', check: variableEquals('name', 'Ada') },
        { text: 'double', check: returns('double', [4], 8) },
        { text: 'log', check: logged(/Hello, Ada/) },
        { text: 'no var', check: noVar() },
        { text: 'map', check: usesMethod(/\.map\(/) },
        { text: 'custom', check: check((h) => (h.get<number[]>('nums').length === 3 ? true : 'three numbers')) },
      ],
    });
    const good = await runJsTests(l, {
      js: `const name = 'Ada';\nconst double = (n) => n * 2;\nconst nums = [1, 2, 3].map(double);\nconsole.log(\`Hello, \${name}\`);`,
    });
    expect(good.results.filter((r) => !r.passed)).toEqual([]);

    const bad = await runJsTests(l, { js: `var name = 'Bob'; // .map(\nfunction double(n) { return n + 2; }` });
    expect(bad.results.map((r) => r.passed)).toEqual([false, false, false, false, false, false, true]);
    expect(bad.results[1].message).toBe('double(4) should return 8, but returned 6.');
    expect(bad.results[0].message).toBe("name should be 'Ada' (it is 'Bob').");
  });

  it('fails every task on a syntax error, and says where', async () => {
    const l = lesson({ tasks: [{ text: 'a', check: variableEquals('a', 1) }] });
    const r = await runJsTests(l, { js: `let a = 1;\nif (a {\n}` });
    expect(r.results[0].message).toMatch(/Fix the syntax error first \(line 2\)/);
    expect(r.results[1]).toMatchObject({ passed: false, implicit: true, message: expect.stringMatching(/^Line 2: SyntaxError/) });
  });

  it('clicks, types and submits on page lessons', async () => {
    const l = lesson({
      starterCode: `<!DOCTYPE html>
<html lang="en">
<head><title>t</title></head>
<body>
  <p id="count">0</p>
  <button id="add">Add</button>
  <form id="f"><input id="name"><button>Go</button></form>
  <p id="out"></p>
  <script src="script.js"></script>
</body>
</html>`,
      tasks: [
        { text: 'click', check: clickThen('#add', domText('#count', '2'), 2) },
        { text: 'type', check: typeThen('#name', 'Ada', domText('#out', 'Hi Ada')) },
        { text: 'submit', check: submitThen('#f', domText('#out', 'Sent Ada')) },
        { text: 'all', check: all(domText('#count', '2'), domText('#out', /Ada/)) },
      ],
    });
    const html = l.starterCode;
    const good = await runJsTests(l, {
      html,
      js: `let n = 0;
document.querySelector('#add').addEventListener('click', () => {
  n++;
  document.querySelector('#count').textContent = n;
});
const input = document.querySelector('#name');
input.addEventListener('input', () => { document.querySelector('#out').textContent = 'Hi ' + input.value; });
document.querySelector('#f').addEventListener('submit', (e) => {
  e.preventDefault();
  document.querySelector('#out').textContent = 'Sent ' + input.value;
});`,
    });
    expect(good.results.filter((r) => !r.passed)).toEqual([]);

    const noPrevent = await runJsTests(l, {
      html,
      js: `document.querySelector('#f').addEventListener('submit', () => { document.querySelector('#out').textContent = 'Sent'; });`,
    });
    expect(noPrevent.results[2].message).toMatch(/preventDefault/);
  });

  it('says when index.html does not load script.js', async () => {
    const l = lesson({ starterCode: '<p>x</p>', tasks: [{ text: 'x', check: logged('hi') }] });
    const r = await runJsTests(l, { html: '<!DOCTYPE html><html lang="en"><head><title>t</title></head><body><p>x</p></body></html>', js: `console.log('hi')` });
    expect(r.results[0].passed).toBe(false);
    expect(r.results[1].message).toMatch(/doesn’t load script\.js/);
  });

  it('a cancelled run removes its sandbox right away', async () => {
    const l = lesson({ tasks: [{ text: 'x', check: logged('done') }] });
    const run = new AbortController();
    const pending = runJsTests(l, { js: `setTimeout(() => console.log('done'), 100000);` }, run.signal);
    expect(document.querySelectorAll('iframe[sandbox]').length).toBeGreaterThan(0);
    run.abort();
    const r = await pending;
    expect(r.allPassed).toBe(false);
    expect(document.querySelectorAll('iframe[sandbox]')).toHaveLength(0);
  });

  it('times out an infinite loop with a clear message', async () => {
    const l = lesson({ tasks: [{ text: 'x', check: logged('done') }] });
    const r = await runJsTests(l, { js: `while (true) {}\nconsole.log('done');` });
    expect(r.results[0].message).toMatch(/loop on line 1 ran for more than 2 seconds/);
    expect(r.allPassed).toBe(false);
  });

  it('runs timers and fake fetches quickly in tests', async () => {
    const l = lesson({
      fetchMocks: { '/api/todos': { body: [{ title: 'a' }], delay: 1000 } },
      tasks: [{ text: 'x', check: logged('a after 3000') }],
    });
    const started = performance.now();
    const r = await runJsTests(l, {
      js: `const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function main() {
  await wait(3000);
  const todos = await (await fetch('/api/todos')).json();
  console.log(todos[0].title + ' after 3000');
}
main();`,
    });
    expect(r.results.filter((x) => !x.passed)).toEqual([]);
    expect(performance.now() - started).toBeLessThan(1500);
  });
});
