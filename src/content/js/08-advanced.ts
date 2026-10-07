import type { Module } from '../types';
import {
  all, check, clickThen, codeMatches, codeNotMatches, definesFunction, domCount, domText, hasClass, logged, noVar, returns,
  submitThen, typeThen, usesMethod,
} from '../../engine/jsChecks';

const debouncePage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Recipe search</title>
</head>
<body>
  <h1>Recipe search</h1>
  <label for="search">Search recipes</label>
  <input id="search" type="search" placeholder="Type to search…" autocomplete="off">
  <p id="status">Start typing to search.</p>
  <p>Searches sent to the server: <span id="count">0</span></p>
  <script src="script.js"></script>
</body>
</html>
`;

const delegationPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Shopping list</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Shopping list</h1>
  <form id="add-form">
    <label for="item">New item</label>
    <input id="item" type="text" autocomplete="off">
    <button type="submit">Add</button>
  </form>
  <ul id="list">
    <li><span>Milk</span> <button type="button" class="remove" aria-label="Remove">✕</button></li>
    <li><span>Eggs</span> <button type="button" class="remove" aria-label="Remove">✕</button></li>
    <li><span>Apples</span> <button type="button" class="remove" aria-label="Remove">✕</button></li>
  </ul>
  <script src="script.js"></script>
</body>
</html>
`;

const delegationCss = `body {
  font-family: system-ui, sans-serif;
  max-width: 28rem;
  margin: 2rem auto;
  padding: 0 1rem;
}

#list {
  padding: 0;
  list-style: none;
}

#list li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #ddd;
  cursor: pointer;
}

#list li.done span {
  text-decoration: line-through;
  color: #888;
}
`;

const todoPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>To-do</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main class="app">
    <h1>To-do</h1>

    <form id="todo-form">
      <input id="todo-input" type="text" placeholder="What needs doing?" autocomplete="off" aria-label="New task">
      <button type="submit">Add</button>
    </form>

    <div class="filters" role="group" aria-label="Show">
      <button type="button" class="filter active" data-filter="all">All</button>
      <button type="button" class="filter" data-filter="active">Active</button>
      <button type="button" class="filter" data-filter="completed">Completed</button>
    </div>

    <ul id="todo-list"></ul>

    <p id="todo-count">0 items left</p>
  </main>
  <script src="script.js"></script>
</body>
</html>
`;

const todoCss = `:root {
  --bg: #f4f1ea;
  --card: #ffffff;
  --text: #1f2933;
  --muted: #7b8794;
  --accent: #2f6f5e;
  --border: #e4e0d6;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

.app {
  max-width: 30rem;
  margin: 3rem auto;
  padding: 1.5rem;
  background: var(--card);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.08);
}

h1 {
  margin: 0 0 1rem;
  color: var(--accent);
}

#todo-form {
  display: flex;
  gap: 0.5rem;
}

#todo-input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font: inherit;
}

button {
  font: inherit;
  cursor: pointer;
}

#todo-form button {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  background: var(--accent);
  color: #fff;
}

.filters {
  display: flex;
  gap: 0.25rem;
  margin: 1rem 0 0.5rem;
}

.filter {
  padding: 0.25rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 999px;
  background: none;
  color: var(--muted);
}

.filter.active {
  border-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}

#todo-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.todo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.25rem;
  border-bottom: 1px solid var(--border);
}

.todo-text {
  flex: 1;
  overflow-wrap: anywhere;
}

.todo.done .todo-text {
  text-decoration: line-through;
  color: var(--muted);
}

.toggle {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--accent);
}

.delete {
  border: none;
  background: none;
  color: var(--muted);
}

.delete:hover,
.delete:focus-visible {
  color: #c0392b;
}

#todo-count {
  margin: 1rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}
`;

export const advanced: Module = {
  id: 'js-advanced',
  title: 'Advanced JavaScript',
  description: 'Closures, higher-order functions, debouncing, event delegation and Map/Set — then build a complete to-do app.',
  lessons: [
    {
      id: 'js-advanced-closures',
      title: 'Closures',
      explanation: `A function **remembers the variables around it** where it was created, even after the outer function has
returned. That's a **closure**.

\`\`\`js
function createGreeter(greeting) {
  return (name) => \`\${greeting}, \${name}!\`;   // uses greeting from the outer function
}

const hello = createGreeter('Hello');
const ciao = createGreeter('Ciao');
console.log(hello('Ada'));   // Hello, Ada!
console.log(ciao('Ada'));    // Ciao, Ada!
\`\`\`

Each call of \`createGreeter\` creates a **new** \`greeting\` variable, so \`hello\` and \`ciao\` don't interfere.

Closures give you **private state**: a variable that only the returned functions can reach.

\`\`\`js
function createWallet() {
  let balance = 0;   // nobody outside can touch this directly
  return {
    deposit: (amount) => (balance += amount),
    balance: () => balance,
  };
}

const wallet = createWallet();
wallet.deposit(5);
console.log(wallet.balance());   // 5
console.log(wallet.amount);      // undefined: the variable is hidden
\`\`\`

Compare with a global variable: any code anywhere could change it, and there can only ever be one.`,
      starterCode: '',
      starterJs: `// A global counter: any code can change count, and there can only be one.
let count = 0;
function increment() {
  count++;
  return count;
}

// Write createCounter(start) below.
`,
      tasks: [
        { text: 'Define a function createCounter(start) (start defaults to 0)', check: definesFunction('createCounter') },
        {
          text: 'It returns an object with increment(), decrement() and value(); increment and decrement return the new value',
          check: check((h) => {
            const createCounter = h.get('createCounter') as (start?: number) => Record<string, () => number>;
            if (typeof createCounter !== 'function') return 'Define createCounter first.';
            const c = createCounter();
            if (!c || ['increment', 'decrement', 'value'].some((k) => typeof c[k] !== 'function')) {
              return 'createCounter() should return { increment, decrement, value }, all functions.';
            }
            const a = c.increment();
            const b = c.increment();
            const d = c.decrement();
            if (a !== 1 || b !== 2 || d !== 1) return `Starting from 0, increment, increment, decrement should return 1, 2, 1 (got ${a}, ${b}, ${d}).`;
            if (c.value() !== 1) return `value() should be 1 after those calls (got ${h.inspect(c.value())}).`;
            const s = createCounter(10);
            s.decrement();
            return s.value() === 9 || `createCounter(10) then decrement() should give 9 (got ${h.inspect(s.value())}).`;
          }),
        },
        {
          text: 'Each counter has its own count, kept private in a closure',
          check: check((h) => {
            const createCounter = h.get('createCounter') as (start?: number) => Record<string, () => number>;
            if (typeof createCounter !== 'function') return 'Define createCounter first.';
            const a = createCounter();
            const b = createCounter();
            a.increment();
            a.increment();
            b.increment();
            if (a.value() !== 2 || b.value() !== 1) return `Two counters should be independent: got ${h.inspect(a.value())} and ${h.inspect(b.value())} instead of 2 and 1. Keep the count inside createCounter.`;
            const exposed = Object.keys(a).filter((k) => typeof a[k] !== 'function');
            return exposed.length === 0 || `Don't put the count on the object (found: ${exposed.join(', ')}): keep it in a variable inside createCounter.`;
          }),
        },
        { text: 'Create a counter called clicks, increment it 3 times and log clicks.value()', check: all(logged('3'), codeMatches(/clicks\s*=\s*createCounter\(/, 'Create clicks with createCounter().')) },
      ],
      hints: [
        'Inside createCounter, declare let count = start; and return an object of arrow functions that use count.',
        'increment: () => ++count returns the new value (count++ would return the old one).',
      ],
      solution: '',
      solutionJs: `function createCounter(start = 0) {
  let count = start;
  return {
    increment: () => ++count,
    decrement: () => --count,
    value: () => count,
  };
}

const clicks = createCounter();
clicks.increment();
clicks.increment();
clicks.increment();
console.log(clicks.value());
`,
    },
    {
      id: 'js-advanced-higher-order',
      title: 'Higher-order functions',
      explanation: `In JavaScript functions are values: you can pass them to other functions and return them. A function that
takes or returns a function is a **higher-order function**. You already use some: \`map\`, \`filter\`,
\`addEventListener\`.

Writing your own shows there's no magic:

\`\`\`js
function repeat(times, fn) {
  for (let i = 0; i < times; i++) fn(i);   // call the function we were given
}
repeat(3, (i) => console.log('Round', i));
\`\`\`

A function can also **build and return** a new function:

\`\`\`js
function multiplier(factor) {
  return (x) => x * factor;
}
const triple = multiplier(3);
console.log(triple(5));   // 15
\`\`\`

**Composing** chains small functions into a bigger one: the output of each becomes the input of the next.
\`reduce\` is perfect for that:

\`\`\`js
const steps = [(x) => x + 1, (x) => x * 2];
console.log(steps.reduce((value, fn) => fn(value), 5));   // (5 + 1) * 2 = 12
\`\`\`

The **rest parameter** \`...fns\` collects any number of arguments into an array: \`function pipe(...fns)\`.`,
      starterCode: '',
      starterJs: `// 1. myMap(array, fn): like array.map(fn), but written with a loop.

// 2. twice(fn): returns a function that applies fn two times.

// 3. pipe(...fns): returns a function that runs its input through every fn, left to right.

`,
      tasks: [
        {
          text: 'myMap(array, fn) returns a new array with fn(item, index) for each item — without using .map()',
          check: all(
            check((h) => {
              const myMap = h.get('myMap') as (a: number[], fn: (x: number, i: number) => number) => unknown;
              if (typeof myMap !== 'function') return 'Define a function myMap(array, fn).';
              const input = [1, 2, 3];
              const out = myMap(input, (x, i) => x * 10 + i);
              if (out === input) return 'Return a new array, not the original one.';
              if (!h.equal(input, [1, 2, 3])) return "Don't change the original array.";
              return h.equal(out, [10, 21, 32]) || `myMap([1, 2, 3], (x, i) => x * 10 + i) should return [10, 21, 32], got ${h.inspect(out)}.`;
            }),
            codeNotMatches(/\.map\(/, 'Write the loop yourself: no .map() in this lesson.'),
          ),
        },
        {
          text: 'twice(fn) returns a new function: twice((x) => x + 3)(10) is 16',
          check: check((h) => {
            const twice = h.get('twice') as (fn: (x: number) => number) => unknown;
            if (typeof twice !== 'function') return 'Define a function twice(fn).';
            const add3 = twice((x) => x + 3);
            if (typeof add3 !== 'function') return 'twice(fn) should return a function.';
            const got = (add3 as (x: number) => number)(10);
            return got === 16 || `twice((x) => x + 3)(10) should be 16, got ${h.inspect(got)}.`;
          }),
        },
        {
          text: 'pipe(...fns) returns a function that applies the functions left to right: pipe((x) => x + 1, (x) => x * 2)(5) is 12',
          check: check((h) => {
            const pipe = h.get('pipe') as (...fns: ((x: number) => number)[]) => unknown;
            if (typeof pipe !== 'function') return 'Define a function pipe(...fns).';
            const f = pipe((x) => x + 1, (x) => x * 2);
            if (typeof f !== 'function') return 'pipe(...) should return a function.';
            const got = (f as (x: number) => number)(5);
            if (got !== 12) return `pipe((x) => x + 1, (x) => x * 2)(5) should be 12, got ${h.inspect(got)}. Left to right!`;
            const g = pipe((x) => x * 2, (x) => x - 1, (x) => x * 10);
            const got3 = (g as (x: number) => number)(4);
            return got3 === 70 || `pipe should work with any number of functions: pipe((x) => x * 2, (x) => x - 1, (x) => x * 10)(4) should be 70, got ${h.inspect(got3)}.`;
          }),
        },
        {
          text: "Build shout = pipe(trim, uppercase, add '!') and log shout('  hello  ') → HELLO!",
          check: all(logged('HELLO!'), codeMatches(/shout\s*=\s*pipe\(/, 'Build shout with pipe(...).')),
        },
      ],
      hints: [
        'myMap: const result = []; loop with for (let i = 0; i < array.length; i++) and push fn(array[i], i).',
        'twice: return (x) => fn(fn(x));',
        'pipe: return (x) => fns.reduce((value, fn) => fn(value), x);',
      ],
      solution: '',
      solutionJs: `function myMap(array, fn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(fn(array[i], i));
  }
  return result;
}

function twice(fn) {
  return (x) => fn(fn(x));
}

function pipe(...fns) {
  return (x) => fns.reduce((value, fn) => fn(value), x);
}

const shout = pipe(
  (s) => s.trim(),
  (s) => s.toUpperCase(),
  (s) => \`\${s}!\`,
);
console.log(shout('  hello  '));
`,
    },
    {
      id: 'js-advanced-debounce',
      title: 'Debounce',
      explanation: `Some events fire **a lot**: \`input\` on every keystroke, \`scroll\` and \`resize\` dozens of times a
second. If each one triggers expensive work — like a request to a server — the page gets slow and the server busy.

**Debouncing** waits until the events *stop* for a moment, then runs the work **once**, with the latest values.
It's built from things you know: a closure that remembers a timer, \`setTimeout\` and \`clearTimeout\`.

\`\`\`js
function debounce(fn, ms) {
  let timer;                        // private, thanks to the closure
  return (...args) => {
    clearTimeout(timer);            // cancel the previous plan…
    timer = setTimeout(() => fn(...args), ms);   // …and make a new one
  };
}

const save = debounce((text) => console.log('Saving', text), 500);
save('H');
save('He');
save('Hello');   // only this one runs, 500ms after the last call
\`\`\`

\`debounce\` is a higher-order function: it takes a function and returns a new, "calmer" version of it.
\`...args\` passes along whatever arguments the caller gave.

The search box on the right sends a "request" on every keystroke. Debounce it.`,
      starterCode: debouncePage,
      starterJs: `let searches = 0;

// Pretend this asks a server: it's expensive, so it shouldn't run on every keystroke.
function runSearch(query) {
  searches++;
  document.querySelector('#count').textContent = searches;
  document.querySelector('#status').textContent = \`Results for "\${query}"\`;
}

// Write debounce(fn, ms) here.

const input = document.querySelector('#search');
input.addEventListener('input', () => runSearch(input.value));
`,
      tasks: [
        { text: 'Define a function debounce(fn, ms)', check: definesFunction('debounce') },
        {
          text: 'Calling the debounced function many times in a row runs fn only once, after ms',
          check: check(async (h) => {
            const debounce = h.get('debounce') as (fn: () => void, ms: number) => () => void;
            if (typeof debounce !== 'function') return 'Define debounce first.';
            let calls = 0;
            const callCount = () => calls;
            const d = debounce(() => calls++, 100);
            if (typeof d !== 'function') return 'debounce(fn, ms) should return a function.';
            d();
            d();
            d();
            if (callCount() !== 0) return "Don't call fn right away: wait ms after the last call.";
            await h.wait(300);
            return callCount() === 1 || `Expected fn to run once after the calls stop, it ran ${callCount()} times.`;
          }),
        },
        {
          text: 'The debounced function passes the latest arguments to fn',
          check: check(async (h) => {
            const debounce = h.get('debounce') as (fn: (...a: unknown[]) => void, ms: number) => (...a: unknown[]) => void;
            if (typeof debounce !== 'function') return 'Define debounce first.';
            let got: unknown[] = [];
            const d = debounce((...args) => (got = args), 50);
            d('a', 1);
            d('b', 2);
            await h.wait(200);
            return h.equal(got, ['b', 2]) || `fn should receive the arguments of the last call ('b', 2), got ${h.inspect(got)}. Use ...args.`;
          }),
        },
        {
          text: 'Typing "pizza" quickly sends a single search, 300ms after the last keystroke',
          check: check(async (h) => {
            const input = h.document.querySelector('#search') as HTMLInputElement | null;
            if (!input) return 'The #search input is missing.';
            const before = Number(h.get('searches'));
            for (const value of ['p', 'pi', 'piz', 'pizz', 'pizza']) {
              input.value = value;
              input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            if (Number(h.get('searches')) !== before) return 'The search ran on every keystroke: call a debounced version of runSearch in the input listener.';
            await h.wait(150);
            if (Number(h.get('searches')) !== before) return 'The search ran too early: use a 300ms delay.';
            await h.settle();
            const sent = Number(h.get('searches')) - before;
            if (sent !== 1) return `Expected exactly 1 search after typing, got ${sent}.`;
            const status = h.document.querySelector('#status')?.textContent ?? '';
            return status.includes('"pizza"') || `The search should use the final text "pizza" (status: "${status}").`;
          }),
        },
      ],
      hints: [
        'Inside debounce: let timer; then return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };',
        'Create the debounced version once, outside the listener: const debouncedSearch = debounce(runSearch, 300);',
        "Then the listener calls it: input.addEventListener('input', () => debouncedSearch(input.value));",
      ],
      solution: debouncePage,
      solutionJs: `let searches = 0;

// Pretend this asks a server: it's expensive, so it shouldn't run on every keystroke.
function runSearch(query) {
  searches++;
  document.querySelector('#count').textContent = searches;
  document.querySelector('#status').textContent = \`Results for "\${query}"\`;
}

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const input = document.querySelector('#search');
const debouncedSearch = debounce(runSearch, 300);
input.addEventListener('input', () => debouncedSearch(input.value));
`,
    },
    {
      id: 'js-advanced-delegation',
      title: 'Event delegation',
      explanation: `Adding a listener to every item of a list has two problems: it's wasteful, and **items added later have no
listener** at all.

Events **bubble**: a click on a button also fires on its \`<li>\`, then on the \`<ul>\`, up to the document.
So you can put **one** listener on the list and work out what was clicked from \`event.target\`:

\`\`\`js
const menu = document.querySelector('#menu');

menu.addEventListener('click', (event) => {
  const item = event.target.closest('li');   // the <li> that contains the click, or null
  if (!item) return;                         // clicked the list itself, between items

  if (event.target.closest('.delete')) {
    item.remove();
  } else {
    console.log('You picked', item.textContent);
  }
});
\`\`\`

- \`event.target\` is the **innermost** element clicked — maybe a \`<span>\` or an icon inside your button.
- \`element.closest(selector)\` walks up from the element (starting with itself) and returns the first match,
  or \`null\`. That's why it beats checking \`event.target.tagName\`.

This is **event delegation**: one listener, on a parent that always exists, handles every child — even future ones.

On the right, the remove buttons only work for the items that were on the page at the start. Fix it.`,
      starterCode: delegationPage,
      starterCss: delegationCss,
      starterJs: `const list = document.querySelector('#list');
const form = document.querySelector('#add-form');
const input = document.querySelector('#item');

function createItem(text) {
  const li = document.createElement('li');
  const label = document.createElement('span');
  label.textContent = text;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'remove';
  button.setAttribute('aria-label', 'Remove');
  button.textContent = '✕';
  li.append(label, ' ', button);
  return li;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  list.append(createItem(text));
  input.value = '';
});

// One listener per button: new items don't get one!
document.querySelectorAll('.remove').forEach((button) => {
  button.addEventListener('click', () => button.parentElement.remove());
});
`,
      tasks: [
        { text: 'Clicking an item’s ✕ button removes it', check: clickThen('#list li:first-child .remove', all(domCount('#list li', 2), check((h) => !h.document.querySelector('#list')?.textContent?.includes('Milk') || 'Milk should be gone.'))) },
        {
          text: 'The ✕ button also works on items added later',
          check: typeThen('#item', 'Bread', submitThen('#add-form', all(
            domCount('#list li', 3, 'Adding "Bread" should make 3 items.'),
            clickThen('#list li:last-child .remove', all(
              domCount('#list li', 2, 'Clicking ✕ on the new item should remove it.'),
              check((h) => !h.document.querySelector('#list')?.textContent?.includes('Bread') || 'Bread should be gone after clicking its ✕.'),
            )),
          ))),
        },
        { text: 'Clicking an item itself (not its button) toggles the class done on the <li>', check: clickThen('#list li:first-child span', all(hasClass('#list li:first-child', 'done'), clickThen('#list li:first-child', hasClass('#list li:first-child', 'done', false, 'A second click should remove done again.')))) },
        {
          text: 'Use a single listener on #list with event.target.closest() instead of one listener per button',
          check: all(usesMethod(/\.closest\(/, 'Find the clicked item with event.target.closest().'), codeNotMatches(/querySelectorAll\(/, 'Remove the querySelectorAll(...).forEach loop: one listener on #list is enough.')),
        },
      ],
      hints: [
        "list.addEventListener('click', (event) => { const item = event.target.closest('li'); … });",
        "Inside it: if (event.target.closest('.remove')) item.remove(); otherwise item.classList.toggle('done');",
        "Don't forget to return early when item is null.",
      ],
      solution: delegationPage,
      solutionCss: delegationCss,
      solutionJs: `const list = document.querySelector('#list');
const form = document.querySelector('#add-form');
const input = document.querySelector('#item');

function createItem(text) {
  const li = document.createElement('li');
  const label = document.createElement('span');
  label.textContent = text;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'remove';
  button.setAttribute('aria-label', 'Remove');
  button.textContent = '✕';
  li.append(label, ' ', button);
  return li;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  list.append(createItem(text));
  input.value = '';
});

// One listener handles every item, including the ones added later.
list.addEventListener('click', (event) => {
  const item = event.target.closest('li');
  if (!item) return;

  if (event.target.closest('.remove')) {
    item.remove();
  } else {
    item.classList.toggle('done');
  }
});
`,
    },
    {
      id: 'js-advanced-map-set',
      title: 'Map and Set',
      explanation: `Arrays and plain objects cover most needs, but two built-in structures make some jobs much simpler.

A **Set** holds **unique** values: adding a value twice keeps one copy.

\`\`\`js
const tags = new Set(['js', 'css', 'js']);
tags.add('html');
console.log(tags.size);         // 3
console.log(tags.has('css'));   // true
console.log([...tags]);         // ['js', 'css', 'html'] — spread it back into an array
\`\`\`

A **Map** stores **key → value** pairs, like an object, but keys can be anything (numbers, objects…),
it remembers insertion order and has a handy API:

\`\`\`js
const stock = new Map();
stock.set('apples', 4);
stock.set('pears', 0);
stock.set('apples', stock.get('apples') + 1);

console.log(stock.get('apples'));   // 5
console.log(stock.get('kiwis'));    // undefined: no such key
console.log(stock.size);            // 2
for (const [fruit, n] of stock) console.log(fruit, n);
\`\`\`

A classic use is **counting**: \`counts.set(key, (counts.get(key) ?? 0) + 1)\` — \`??\` gives 0 the first time a key
shows up.`,
      starterCode: '',
      starterJs: `const sentence = 'The cat and the hat and the bat';

// Removes duplicates, keeping the first copy of each value. Rewrite it with a Set.
function unique(array) {
  const result = [];
  for (const item of array) {
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

// Write hasDuplicates(array) and countWords(text) below.
`,
      tasks: [
        { text: 'Rewrite unique(array) with a Set: unique([3, 1, 3, 2, 1]) returns [3, 1, 2]', check: all(returns('unique', [[3, 1, 3, 2, 1]], [3, 1, 2]), usesMethod(/new Set\(/, 'Build it with new Set(array).'), codeNotMatches(/\.includes\(/, 'No need for includes(): the Set removes duplicates for you.')) },
        { text: 'hasDuplicates(array) returns true if any value appears twice (compare a Set’s size with the length)', check: all(returns('hasDuplicates', [[1, 2, 1]], true), returns('hasDuplicates', [[1, 2, 3]], false), returns('hasDuplicates', [[]], false)) },
        {
          text: 'countWords(text) returns a Map from each lowercase word to how many times it appears',
          check: check((h) => {
            const countWords = h.get('countWords') as (text: string) => unknown;
            if (typeof countWords !== 'function') return 'Define a function countWords(text).';
            const m = countWords('The cat saw the  hat');
            if (!(m instanceof Map)) return `countWords should return a Map (got ${h.inspect(m)}).`;
            const want: [string, number][] = [['the', 2], ['cat', 1], ['saw', 1], ['hat', 1]];
            const ok = m.size === want.length && want.every(([w, n]) => m.get(w) === n);
            return ok || `countWords('The cat saw the  hat') should be Map(4) { 'the' => 2, 'cat' => 1, 'saw' => 1, 'hat' => 1 }, got ${h.inspect(m)}. Lowercase the text and split on spaces.`;
          }),
        },
        { text: "Count the words of sentence and log how many times 'the' appears (with .get())", check: all(logged('3'), codeMatches(/\.get\(/, "Read the count with .get('the').")) },
      ],
      hints: [
        'unique: return [...new Set(array)];',
        'hasDuplicates: return new Set(array).size !== array.length;',
        "countWords: const counts = new Map(); for (const word of text.toLowerCase().split(/\\s+/)) { if (word) counts.set(word, (counts.get(word) ?? 0) + 1); } return counts;",
      ],
      solution: '',
      solutionJs: `const sentence = 'The cat and the hat and the bat';

function unique(array) {
  return [...new Set(array)];
}

function hasDuplicates(array) {
  return new Set(array).size !== array.length;
}

function countWords(text) {
  const counts = new Map();
  for (const word of text.toLowerCase().split(/\\s+/)) {
    if (word) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return counts;
}

const counts = countWords(sentence);
console.log(counts.get('the'));
`,
    },
  ],
  challenge: {
    id: 'js-advanced-challenge',
    title: 'Capstone: To-do app',
    difficulty: 3,
    summary: 'Everything together: a complete to-do app with filters, a counter and saved data.',
    explanation: `The final project: a complete **to-do app**. The HTML and CSS are ready — write \`script.js\`.

**The page** (don't rename these, the checks rely on them):

| Element | What it is |
|---|---|
| \`#todo-form\` with \`#todo-input\` | the form to add a task |
| \`#todo-list\` | the \`<ul>\` you render the tasks into |
| \`.filters\` with \`button[data-filter]\` | the filters: \`data-filter\` is \`all\`, \`active\` or \`completed\` |
| \`#todo-count\` | the counter of tasks left |

Render each task like this (the CSS already styles it):

\`\`\`html
<li class="todo done" data-id="2">
  <input type="checkbox" class="toggle" checked>
  <span class="todo-text">Read a book</span>
  <button type="button" class="delete" aria-label="Delete">✕</button>
</li>
\`\`\`

**The data.** Keep the tasks in an array, saved in localStorage under the key **\`todos\`** as JSON:
\`[{ "id": 1, "text": "Buy milk", "done": false }, …]\` — \`id\` is a unique number, \`text\` a string,
\`done\` a boolean. Two tasks are already saved: load them when the page starts.

Requirements:
- **Add** a task by submitting the form: no page reload, ignore empty or whitespace-only text, trim it, clear the input.
- Clicking a task's checkbox **toggles** it: the \`<li>\` gets the class \`done\` when completed.
- Clicking ✕ **deletes** the task.
- **Filter** buttons show All / only Active (not done) / only Completed tasks — render just the matching ones — and
  the current filter's button has the class \`active\` (and only that one).
- \`#todo-count\` reads \`1 item left\` or \`N items left\`, counting the tasks not done.
- Every change is **saved** to localStorage, and saved tasks are **loaded** on start.

Tips: keep one source of truth (the array) and a \`render()\` function that rebuilds the list from it. Use **event
delegation**: one listener on \`#todo-list\` handles toggle and delete for every task, even new ones. Put user text on
the page with \`textContent\`, never \`innerHTML\`.`,
    starterCode: todoPage,
    starterCss: todoCss,
    starterJs: `// Key used to save the tasks in localStorage.
const STORAGE_KEY = 'todos';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const count = document.querySelector('#todo-count');

// 1. Load the saved tasks (JSON.parse) — or start with an empty array.

// 2. save(): write the tasks to localStorage (JSON.stringify).

// 3. render(): rebuild #todo-list from the tasks that match the current filter,
//    update #todo-count and mark the active filter button.

// 4. Add tasks on submit (preventDefault!).

// 5. One click listener on #todo-list: toggle (.toggle) and delete (.delete).

// 6. Filter buttons.
`,
    storage: {
      todos: JSON.stringify([
        { id: 1, text: 'Buy milk', done: false },
        { id: 2, text: 'Read a book', done: true },
      ]),
    },
    tasks: [
      {
        text: 'Saved tasks are loaded and rendered on start (with done ones marked)',
        check: all(
          domCount('#todo-list .todo', 2, 'Render the 2 saved tasks as <li class="todo"> in #todo-list.'),
          domText('#todo-list .todo:nth-child(1) .todo-text', 'Buy milk', 'The first task should show "Buy milk" in a .todo-text span.'),
          domText('#todo-list .todo:nth-child(2) .todo-text', 'Read a book'),
          hasClass('#todo-list .todo:nth-child(1)', 'done', false, '"Buy milk" isn\'t done: it shouldn\'t have the class done.'),
          hasClass('#todo-list .todo:nth-child(2)', 'done', true, '"Read a book" is done: give its <li> the class done.'),
        ),
      },
      { text: 'The counter shows 1 item left', check: domText('#todo-count', '1 item left', '#todo-count should read "1 item left" (one task isn\'t done).') },
      {
        text: 'Submitting the form adds the task, clears the input and updates the counter',
        check: typeThen('#todo-input', '  Walk the dog  ', submitThen('#todo-form', all(
          domCount('#todo-list .todo', 3, 'After adding a task there should be 3 tasks.'),
          domText('#todo-list .todo:last-child .todo-text', 'Walk the dog', 'The new task should be last, with its text trimmed.'),
          check((h) => (h.document.querySelector('#todo-input') as HTMLInputElement).value === '' || 'Clear the input after adding.'),
          domText('#todo-count', '2 items left'),
        ))),
      },
      {
        text: 'Empty or whitespace-only input is ignored',
        check: typeThen('#todo-input', '   ', submitThen('#todo-form', domCount('#todo-list .todo', 3, 'Submitting only spaces should not add a task.'))),
      },
      {
        text: 'Clicking a checkbox toggles the task: class done and the counter update',
        check: clickThen('#todo-list .todo:first-child .toggle', all(
          hasClass('#todo-list .todo:first-child', 'done', true, 'After clicking its checkbox, "Buy milk" should have the class done.'),
          domText('#todo-count', '1 item left'),
        )),
      },
      {
        text: 'Clicking ✕ deletes the task',
        check: clickThen('#todo-list .todo:nth-child(2) .delete', all(
          domCount('#todo-list .todo', 2, 'Clicking ✕ on "Read a book" should leave 2 tasks.'),
          check((h) => ![...h.document.querySelectorAll('#todo-list .todo')].some((li) => li.textContent?.includes('Read a book')) || '"Read a book" should be gone.'),
        )),
      },
      {
        text: 'The Active filter shows only tasks not done and is marked active',
        check: clickThen('[data-filter="active"]', all(
          domCount('#todo-list .todo', 1, 'With the Active filter only "Walk the dog" should be rendered.'),
          domText('#todo-list .todo-text', 'Walk the dog'),
          hasClass('[data-filter="active"]', 'active', true, 'Give the Active button the class active.'),
          hasClass('[data-filter="all"]', 'active', false, 'Remove the class active from the All button.'),
        )),
      },
      {
        text: 'The Completed and All filters work too',
        check: clickThen('[data-filter="completed"]', all(
          domCount('#todo-list .todo', 1, 'With the Completed filter only "Buy milk" should be rendered.'),
          domText('#todo-list .todo-text', 'Buy milk'),
          hasClass('[data-filter="completed"]', 'active'),
          hasClass('[data-filter="active"]', 'active', false, 'Only the current filter button should have the class active.'),
          clickThen('[data-filter="all"]', all(domCount('#todo-list .todo', 2, 'All should show both tasks again.'), hasClass('[data-filter="all"]', 'active'))),
        )),
      },
      {
        text: 'Every change is saved to localStorage "todos" as a JSON array of { id, text, done }',
        check: check((h) => {
          const raw = h.storage.getItem('todos');
          if (raw === null) return 'Save the tasks under the key "todos".';
          let saved: unknown;
          try {
            saved = JSON.parse(raw);
          } catch {
            return 'localStorage "todos" isn\'t valid JSON: save it with JSON.stringify().';
          }
          if (!Array.isArray(saved)) return 'Save the array of tasks under "todos".';
          const got = saved.map((t: { text?: unknown; done?: unknown }) => ({ text: t.text, done: t.done }));
          const want = [{ text: 'Buy milk', done: true }, { text: 'Walk the dog', done: false }];
          if (!h.equal(got, want)) return `After the steps above "todos" should hold Buy milk (done) and Walk the dog (not done), but it holds ${h.inspect(got)}. Save after every add, toggle and delete.`;
          const ids = saved.map((t: { id?: unknown }) => t.id);
          return (ids.every((id) => id !== undefined && id !== null) && new Set(ids).size === ids.length) || 'Give every task a unique id.';
        }),
      },
      { text: 'No var', check: noVar() },
    ],
    hints: [
      "Load: let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; — getItem returns null when nothing is saved, and JSON.parse(null) is null.",
      "render(): list.innerHTML = ''; then for each matching task create the <li> with createElement, set li.dataset.id = todo.id and li.classList.toggle('done', todo.done).",
      "In the list listener: const li = event.target.closest('.todo'); const id = Number(li.dataset.id); then check event.target.closest('.toggle') or '.delete', update the array, save() and render().",
    ],
    solution: todoPage,
    solutionCss: todoCss,
    solutionJs: `const STORAGE_KEY = 'todos';

const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const count = document.querySelector('#todo-count');
const filters = document.querySelector('.filters');

let todos = load();
let filter = 'all';

// ---------- data ----------
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return []; // corrupted data: start fresh
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

/** Replace the tasks, then save and re-render: the only way the data changes. */
function update(newTodos) {
  todos = newTodos;
  save();
  render();
}

const nextId = () => Math.max(0, ...todos.map((todo) => todo.id)) + 1;

const matchesFilter = (todo) => {
  if (filter === 'active') return !todo.done;
  if (filter === 'completed') return todo.done;
  return true;
};

// ---------- view ----------
function createItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo';
  li.classList.toggle('done', todo.done);
  li.dataset.id = todo.id;

  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.className = 'toggle';
  toggle.checked = todo.done;
  toggle.setAttribute('aria-label', \`Done: \${todo.text}\`);

  const text = document.createElement('span');
  text.className = 'todo-text';
  text.textContent = todo.text;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'delete';
  remove.setAttribute('aria-label', \`Delete: \${todo.text}\`);
  remove.textContent = '✕';

  li.append(toggle, text, remove);
  return li;
}

function render() {
  list.replaceChildren(...todos.filter(matchesFilter).map(createItem));

  const left = todos.filter((todo) => !todo.done).length;
  count.textContent = \`\${left} \${left === 1 ? 'item' : 'items'} left\`;

  for (const button of filters.querySelectorAll('[data-filter]')) {
    const current = button.dataset.filter === filter;
    button.classList.toggle('active', current);
    button.setAttribute('aria-pressed', current);
  }
}

// ---------- events ----------
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  update([...todos, { id: nextId(), text, done: false }]);
  input.value = '';
});

// Event delegation: one listener for every task, including the ones added later.
list.addEventListener('click', (event) => {
  const li = event.target.closest('.todo');
  if (!li) return;
  const id = Number(li.dataset.id);

  if (event.target.closest('.toggle')) {
    update(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  } else if (event.target.closest('.delete')) {
    update(todos.filter((todo) => todo.id !== id));
  }
});

filters.addEventListener('click', (event) => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  filter = button.dataset.filter;
  render();
});

render();
`,
  },
};
