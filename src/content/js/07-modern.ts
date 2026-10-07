import type { Module } from '../types';
import {
  all,
  check,
  clickThen,
  codeMatches,
  definesClass,
  definesFunction,
  domCount,
  domText,
  hasClass,
  inlineStyle,
  logged,
  loggedInOrder,
  returns,
  storageEquals,
  submitThen,
  typeThen,
  usesMethod,
  variableEquals,
} from '../../engine/jsChecks';

const pageHtml = (title: string, body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
${body}
  <script src="script.js"></script>
</body>
</html>
`;

const prefsHtml = pageHtml(
  'Reading preferences',
  `  <main>
    <h1>Reading preferences</h1>
    <p>Pick a theme and a text size. Run the page again: your choices are remembered.</p>
    <button id="theme">Toggle theme</button>
    <button id="bigger">A+</button>
  </main>`,
);

const prefsCss = `body {
  font-family: Georgia, serif;
  margin: 2rem;
  background: #fff;
  color: #222;
}

body.dark {
  background: #1e1e24;
  color: #eee;
}
`;

const notesHtml = pageHtml(
  'Notes',
  `  <main>
    <h1>Notes <span id="count"></span></h1>
    <form id="note-form">
      <input id="note-text" placeholder="Write a note…" autocomplete="off">
      <button>Add</button>
    </form>
    <p id="error" role="alert"></p>
    <ul id="notes"></ul>
    <button id="clear">Delete all</button>
  </main>`,
);

const notesCss = `body {
  font-family: system-ui, sans-serif;
  margin: 2rem;
  max-width: 28rem;
}

#error {
  color: #b00020;
}

#notes li {
  cursor: pointer;
  padding: 0.25rem 0;
}

#notes li.done {
  text-decoration: line-through;
  color: #888;
}
`;

const notesJs = (fixed: boolean) => `class NoteStore {
  constructor(key) {
    this.key = key;
    this.notes = this.load();
  }

  load() {
    const raw = localStorage.getItem(${fixed ? 'this.key' : "'note'"});
    return raw ? JSON.parse(raw) : [];
  }

  save() {
    localStorage.setItem(this.key, ${fixed ? 'JSON.stringify(this.notes)' : 'this.notes'});
  }

  add(text) {
    if (${fixed ? "text.trim() === ''" : 'text.length === 0'}) {
      throw new Error('A note cannot be empty');
    }
    this.notes.push({ text: text.trim(), done: false });
    this.save();
  }

  toggle(index) {
    this.notes[index].done = !this.notes[index].done;
    this.save();
  }

  clear() {
    this.notes = [];${fixed ? '\n    this.save();' : ''}
  }

  get count() {
    return this.notes.length;
  }
}

const store = new NoteStore('notes');
const list = document.querySelector('#notes');
const errorEl = document.querySelector('#error');

function render() {
  list.innerHTML = '';
  store.notes.forEach((note, i) => {
    const li = document.createElement('li');
    li.textContent = note.text;
    li.classList.toggle('done', note.done);
    li.addEventListener('click', () => {
      store.toggle(i);
      render();
    });
    list.append(li);
  });
  document.querySelector('#count').textContent = \`(\${store.count${fixed ? '' : '()'}})\`;
}

document.querySelector('#note-form').addEventListener('submit', (event) => {${fixed ? '\n  event.preventDefault();' : ''}
  const input = document.querySelector('#note-text');
  try {
    store.add(input.value);
    input.value = '';
    errorEl.textContent = '';
    render();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.querySelector('#clear').addEventListener('click', () => {
  store.clear();
  render();
});

render();
`;

export const modern: Module = {
  id: 'js-modern',
  title: 'Modern JavaScript',
  description: 'Modules, classes, errors, optional chaining, JSON and localStorage: the tools of everyday modern code.',
  lessons: [
    {
      id: 'js-modern-modules',
      title: 'Modules: import and export',
      explanation: `Real projects split code into many files called **modules**. A module chooses what to share with
\`export\`, and other modules take it with \`import\`:

\`\`\`text
// cart.js
const items = [];                      // private: not exported

export function add(name, price) {     // a named export
  items.push({ name, price });
}
export function total() {
  return items.reduce((sum, item) => sum + item.price, 0);
}
export default 'EUR';                  // one default export per file (optional)

// main.js
import currency, { add, total } from './cart.js';
add('Pen', 1.5);
console.log(total(), currency);
\`\`\`

- Named exports are imported with their names in \`{ }\` (rename with \`{ add as addToCart }\`); the default
  export gets any name you like. \`import * as cart from './cart.js'\` imports everything as one object.
- In the browser, the entry file is loaded with \`<script type="module" src="main.js"></script>\`.
  Modules run in strict mode, wait for the page to be parsed, and each has its **own scope**: a variable is
  only visible elsewhere if it's exported.

**In LearnWeb your code lives in a single script.js**, so there are no files to import from here. The habit
modules teach still applies in one file: keep data private and expose a small set of functions. Before
modules existed, this was done with a function that returns an object — the *module pattern*:

\`\`\`js
function createCounter() {
  let count = 0;                                // private: only the functions below can see it
  return {
    increment() { count++; },
    value() { return count; },
  };
}

const counter = createCounter();
counter.increment();
console.log(counter.value());   // 1 — and nobody can mess with count directly
\`\`\``,
      starterCode: '',
      starterJs: `// Loose code: anything can change items by accident.
let items = [];

function addItem(name, price) {
  items.push({ name, price });
}

function totalPrice() {
  let sum = 0;
  for (const item of items) sum += item.price;
  return sum;
}

addItem('Pen', 1.5);
addItem('Notebook', 4);
console.log(totalPrice());
`,
      tasks: [
        { text: 'Write a function createCart()', check: definesFunction('createCart') },
        {
          text: 'createCart() returns an object with the methods add(name, price), total() and count()',
          check: check((h) => {
            const make = h.get<() => Record<string, (...args: unknown[]) => unknown>>('createCart');
            if (typeof make !== 'function') return 'Write a function createCart().';
            const cart = make();
            if (!cart || ['add', 'total', 'count'].some((m) => typeof cart[m] !== 'function')) return 'createCart() should return { add, total, count }.';
            cart.add('Pen', 1.5);
            cart.add('Notebook', 4);
            if (cart.total() !== 5.5) return `After adding a Pen (1.5) and a Notebook (4), total() should be 5.5, not ${h.inspect(cart.total())}.`;
            return cart.count() === 2 || `After adding two items, count() should be 2, not ${h.inspect(cart.count())}.`;
          }),
        },
        {
          text: 'Every cart has its own private items: two carts don’t share them',
          check: check((h) => {
            const make = h.get<() => Record<string, (...args: unknown[]) => unknown>>('createCart');
            if (typeof make !== 'function') return 'Write a function createCart().';
            const a = make();
            const b = make();
            a.add('Pen', 1.5);
            return b.count() === 0 || 'Adding to one cart changed another: create the items array inside createCart().';
          }),
        },
        {
          text: 'items is no longer a global variable',
          check: check((h) => !h.has('items') || 'Move items inside createCart(), so only its methods can reach it.'),
        },
        {
          text: 'Use a cart to add the Pen and the Notebook, then log Total: 5.5 and Items: 2',
          check: all(logged('Total: 5.5'), logged('Items: 2'), codeMatches(/createCart\(\s*\)/, 'Create the cart with createCart().')),
        },
      ],
      hints: [
        'function createCart() { const items = []; return { add(name, price) { ... }, total() { ... }, count() { ... } }; }',
        'count() { return items.length; }',
        "const cart = createCart(); cart.add('Pen', 1.5); ... console.log('Total:', cart.total());",
      ],
      solution: '',
      solutionJs: `function createCart() {
  const items = [];

  return {
    add(name, price) {
      items.push({ name, price });
    },
    total() {
      let sum = 0;
      for (const item of items) sum += item.price;
      return sum;
    },
    count() {
      return items.length;
    },
  };
}

const cart = createCart();
cart.add('Pen', 1.5);
cart.add('Notebook', 4);
console.log('Total:', cart.total());
console.log('Items:', cart.count());
`,
    },
    {
      id: 'js-modern-classes',
      title: 'Classes',
      explanation: `A **class** is a blueprint for objects that share the same shape and behaviour.

\`\`\`js
class Dog {
  constructor(name) {      // runs on new Dog(...): set up the object's properties
    this.name = name;
    this.tricks = [];
  }

  learn(trick) {           // a method: every Dog has it
    this.tricks.push(trick);
  }

  get description() {      // a getter: read like a property, computed when read
    return \`\${this.name} knows \${this.tricks.length} tricks\`;
  }
}

const rex = new Dog('Rex');
rex.learn('sit');
console.log(rex.description);   // Rex knows 1 tricks — no () for a getter
\`\`\`

A class can **extend** another one: it gets all its methods, and can add or change some.
Its constructor must call \`super(...)\` (the parent's constructor) before using \`this\`:

\`\`\`js
class GuideDog extends Dog {
  constructor(name, owner) {
    super(name);
    this.owner = owner;
  }

  guide() {
    console.log(\`\${this.name} guides \${this.owner}\`);
  }
}

const max = new GuideDog('Max', 'Sam');
max.learn('stop at kerbs');   // inherited from Dog
max.guide();
console.log(max instanceof Dog);   // true
\`\`\``,
      starterCode: '',
      starterJs: `class Account {
  constructor(owner) {
    this.owner = owner;
    this.balance = 0;
  }

  deposit(amount) {
    // add amount to the balance
  }
}

const acc = new Account('Ada');
acc.deposit(50);
console.log(acc.balance);
`,
      tasks: [
        {
          text: 'deposit(amount) adds to the balance, and a new withdraw(amount) method takes from it',
          check: check((h) => {
            const Account = h.get<new (owner: string) => { balance: unknown; deposit(n: number): void; withdraw?(n: number): void }>('Account');
            if (typeof Account !== 'function') return 'Keep the Account class.';
            const a = new Account('Test');
            a.deposit(50);
            const afterDeposit = a.balance;
            if (afterDeposit !== 50) return `After deposit(50) the balance should be 50, not ${h.inspect(afterDeposit)}.`;
            if (typeof a.withdraw !== 'function') return 'Add a withdraw(amount) method.';
            a.withdraw(20);
            const afterWithdraw = a.balance;
            return afterWithdraw === 30 || `After deposit(50) and withdraw(20) the balance should be 30, not ${h.inspect(afterWithdraw)}.`;
          }),
        },
        {
          text: 'A getter summary returns the owner and the balance, like Ada: €30.00',
          check: check((h) => {
            const Account = h.get<{ prototype: object; new (owner: string): { summary: unknown; deposit(n: number): void } }>('Account');
            if (typeof Account !== 'function') return 'Keep the Account class.';
            if (!Object.getOwnPropertyDescriptor(Account.prototype, 'summary')?.get) return 'Write summary as a getter: get summary() { ... }.';
            const a = new Account('Test');
            a.deposit(12.5);
            return a.summary === 'Test: €12.50' || `For owner Test with 12.5 in the account, summary should be "Test: €12.50", not ${h.inspect(a.summary)}.`;
          }),
        },
        {
          text: 'Log acc.summary after depositing 50 and withdrawing 20 (Ada: €30.00)',
          check: logged('Ada: €30.00'),
        },
        {
          text: 'class SavingsAccount extends Account, takes (owner, rate) and has addInterest() that adds balance × rate',
          check: all(
            definesClass('SavingsAccount'),
            check((h) => {
              const Savings = h.get<new (owner: string, rate: number) => { balance: number; deposit(n: number): void; addInterest?(): void }>('SavingsAccount');
              const Account = h.get<new (owner: string) => object>('Account');
              const s = new Savings('Grace', 0.1);
              if (!(s instanceof Account)) return 'SavingsAccount should extend Account.';
              s.deposit(200);
              if (typeof s.addInterest !== 'function') return 'Add an addInterest() method.';
              s.addInterest();
              return Math.abs(s.balance - 220) < 1e-9 || `With 200 at a rate of 0.1, addInterest() should bring the balance to 220, not ${h.inspect(s.balance)}.`;
            }),
          ),
        },
      ],
      hints: [
        'deposit(amount) { this.balance += amount; } — withdraw is the same with -=.',
        'get summary() { return `${this.owner}: €${this.balance.toFixed(2)}`; }',
        'class SavingsAccount extends Account { constructor(owner, rate) { super(owner); this.rate = rate; } addInterest() { ... } }',
      ],
      solution: '',
      solutionJs: `class Account {
  constructor(owner) {
    this.owner = owner;
    this.balance = 0;
  }

  deposit(amount) {
    this.balance += amount;
  }

  withdraw(amount) {
    this.balance -= amount;
  }

  get summary() {
    return \`\${this.owner}: €\${this.balance.toFixed(2)}\`;
  }
}

class SavingsAccount extends Account {
  constructor(owner, rate) {
    super(owner);
    this.rate = rate;
  }

  addInterest() {
    this.deposit(this.balance * this.rate);
  }
}

const acc = new Account('Ada');
acc.deposit(50);
acc.withdraw(20);
console.log(acc.summary);
`,
    },
    {
      id: 'js-modern-throw',
      title: 'Throwing your own errors',
      explanation: `You've caught errors from \`fetch\`. Your own code can raise them too, with **\`throw\`**: it stops the function
right there and jumps to the nearest \`catch\` up the call chain.

\`\`\`js
function divide(a, b) {
  if (b === 0) {
    throw new Error('Cannot divide by zero');
  }
  return a / b;
}

try {
  console.log(divide(10, 2));   // 5
  console.log(divide(1, 0));    // throws: the next line never runs
  console.log('unreachable');
} catch (err) {
  console.log(err.name, err.message);   // Error Cannot divide by zero
}
\`\`\`

To tell *your* expected errors (bad input) apart from real bugs, make a **custom error class** by extending
\`Error\`, then check it with \`instanceof\`:

\`\`\`js
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

try {
  riskyThing();
} catch (err) {
  if (err instanceof ValidationError) {
    console.log('Please fix:', err.message);   // expected: tell the user
  } else {
    throw err;                                  // a real bug: don't hide it
  }
}
\`\`\`

Throw \`Error\` objects, not plain strings: they carry a message, a name and a stack trace.`,
      starterCode: '',
      starterJs: `function parseAge(text) {
  const age = Number(text);
  return age;
}

const inputs = ['36', 'abc', '-5', '200'];
for (const input of inputs) {
  console.log('Age:', parseAge(input));
}
`,
      tasks: [
        {
          text: 'Define class ValidationError extends Error, with the name ValidationError',
          check: check((h) => {
            const V = h.get<new (message: string) => Error>('ValidationError');
            if (typeof V !== 'function') return 'Define class ValidationError extends Error { ... }.';
            const e = new V('Bad');
            if (!(e instanceof Error)) return 'ValidationError should extend Error.';
            if (e.message !== 'Bad') return 'Pass the message on with super(message).';
            return e.name === 'ValidationError' || "Set this.name = 'ValidationError' in the constructor.";
          }),
        },
        {
          text: 'parseAge throws a ValidationError: Age must be a number, or Age must be between 0 and 150',
          check: check((h) => {
            const parseAge = h.get<(t: string) => unknown>('parseAge');
            const V = h.get<new (message: string) => Error>('ValidationError');
            if (typeof V !== 'function') return 'Define the ValidationError class first.';
            const cases: [string, string][] = [
              ['abc', 'Age must be a number'],
              ['-5', 'Age must be between 0 and 150'],
              ['200', 'Age must be between 0 and 150'],
            ];
            for (const [input, message] of cases) {
              try {
                parseAge(input);
                return `parseAge('${input}') should throw a ValidationError.`;
              } catch (err) {
                if (!(err instanceof V)) return `parseAge('${input}') should throw new ValidationError(...), not ${h.inspect(err)}.`;
                if (err.message !== message) return `parseAge('${input}') should throw with the message "${message}" (got "${err.message}").`;
              }
            }
            return true;
          }),
        },
        { text: "Valid ages still work: parseAge('36') returns 36", check: returns('parseAge', ['36'], 36) },
        {
          text: 'The loop catches validation errors and logs Invalid: <message> for each bad input',
          check: all(
            loggedInOrder(['Age: 36', 'Invalid: Age must be a number', 'Invalid: Age must be between 0 and 150', 'Invalid: Age must be between 0 and 150']),
            codeMatches(/instanceof\s+ValidationError/, 'In the catch, check err instanceof ValidationError (and re-throw anything else).'),
          ),
        },
      ],
      hints: [
        "class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; } }",
        "if (Number.isNaN(age)) throw new ValidationError('Age must be a number'); then check age < 0 || age > 150.",
        "for (...) { try { console.log('Age:', parseAge(input)); } catch (err) { if (err instanceof ValidationError) console.log('Invalid:', err.message); else throw err; } }",
      ],
      solution: '',
      solutionJs: `class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function parseAge(text) {
  const age = Number(text);
  if (Number.isNaN(age)) {
    throw new ValidationError('Age must be a number');
  }
  if (age < 0 || age > 150) {
    throw new ValidationError('Age must be between 0 and 150');
  }
  return age;
}

const inputs = ['36', 'abc', '-5', '200'];
for (const input of inputs) {
  try {
    console.log('Age:', parseAge(input));
  } catch (err) {
    if (err instanceof ValidationError) {
      console.log('Invalid:', err.message);
    } else {
      throw err;
    }
  }
}
`,
    },
    {
      id: 'js-modern-optional',
      title: 'Optional chaining and ??',
      explanation: `Real data has gaps: a user without an address, settings that were never saved. Reading a property of
\`undefined\` crashes:

\`\`\`js
const user = { name: 'Grace' };
console.log(user.address.city);   // TypeError: Cannot read properties of undefined
\`\`\`

**Optional chaining \`?.\`** stops and gives \`undefined\` if the value on its left is \`null\` or \`undefined\`:

\`\`\`js
const user = { name: 'Grace' };
console.log(user.address?.city);      // undefined — no crash
console.log(user.greet?.());          // call a method only if it exists
console.log(user.friends?.[0]);       // works with [ ] too
\`\`\`

**Nullish coalescing \`??\`** gives a fallback when the left side is \`null\` or \`undefined\`:

\`\`\`js
const volume = 0;
console.log(volume || 50);   // 50 — || replaces every "falsy" value: 0, '', false…
console.log(volume ?? 50);   // 0  — ?? only replaces null and undefined
\`\`\`

They work well together: \`user.address?.city ?? 'Unknown'\`. Use \`??\` for defaults whenever \`0\`, \`''\` or
\`false\` are valid values.`,
      starterCode: '',
      starterJs: `const users = [
  { name: 'Ada', address: { city: 'London' }, settings: { volume: 0 } },
  { name: 'Grace', settings: {} },
  { name: 'Linus' },
];

function cityOf(user) {
  return user.address.city;
}

function volumeOf(user) {
  return user.settings.volume || 50;
}

for (const user of users) {
  console.log(user.name, cityOf(user), volumeOf(user));
}
`,
      tasks: [
        {
          text: "cityOf returns the city, or 'Unknown' when there's no address (use ?. and ??)",
          check: all(
            returns('cityOf', [{ name: 'Rome', address: { city: 'Rome' } }], 'Rome'),
            returns('cityOf', [{ name: 'Grace' }], 'Unknown'),
            codeMatches(/\?\./, 'Use optional chaining: user.address?.city.'),
          ),
        },
        {
          text: 'volumeOf returns 50 when there is no volume, but keeps a volume of 0',
          check: all(
            returns('volumeOf', [{ settings: { volume: 0 } }], 0, 'A saved volume of 0 is a real value: use ?? instead of ||.'),
            returns('volumeOf', [{ settings: {} }], 50),
            returns('volumeOf', [{ name: 'Linus' }], 50, 'volumeOf should work without settings too: user.settings?.volume.'),
            codeMatches(/\?\?/, 'Use ?? for the default.'),
          ),
        },
        {
          text: 'The loop logs every user without crashing',
          check: loggedInOrder(['Ada London 0', 'Grace Unknown 50', 'Linus Unknown 50']),
        },
      ],
      hints: ["return user.address?.city ?? 'Unknown';", 'return user.settings?.volume ?? 50;'],
      solution: '',
      solutionJs: `const users = [
  { name: 'Ada', address: { city: 'London' }, settings: { volume: 0 } },
  { name: 'Grace', settings: {} },
  { name: 'Linus' },
];

function cityOf(user) {
  return user.address?.city ?? 'Unknown';
}

function volumeOf(user) {
  return user.settings?.volume ?? 50;
}

for (const user of users) {
  console.log(user.name, cityOf(user), volumeOf(user));
}
`,
    },
    {
      id: 'js-modern-json',
      title: 'JSON',
      explanation: `**JSON** (JavaScript Object Notation) is the text format used to send and store data: APIs answer in JSON,
and \`localStorage\` can only store text. Two functions convert back and forth:

\`\`\`js
const user = { name: 'Ada', langs: ['en', 'fr'], admin: false };

const text = JSON.stringify(user);
console.log(text);          // {"name":"Ada","langs":["en","fr"],"admin":false}
console.log(typeof text);   // string

const copy = JSON.parse(text);
console.log(copy.langs[1]); // fr — a real object again

console.log(JSON.stringify(user, null, 2));   // pretty-printed, indented by 2 spaces
\`\`\`

JSON is stricter than JavaScript: keys and strings need **double quotes**, and there are no comments,
functions or \`undefined\` (\`stringify\` skips them; a \`Date\` becomes a string).

\`JSON.parse\` **throws** a \`SyntaxError\` on invalid text, so wrap it in \`try\`/\`catch\` when the text comes
from outside (a user, a server, storage).`,
      starterCode: '',
      starterJs: `const order = { id: 7, items: ['tea', 'cake'], paid: false };

const text = order; // turn the order into a JSON string
console.log(text);

const received = '{"id": 8, "items": ["coffee"], "paid": true}';
const parsed = received; // turn the text back into an object
console.log(parsed.items[0]);

// Return the parsed value of text, or null if it isn't valid JSON.
function safeParse(text) {
  return JSON.parse(text);
}
`,
      tasks: [
        {
          text: 'text is the order as a JSON string',
          check: all(variableEquals('text', '{"id":7,"items":["tea","cake"],"paid":false}'), usesMethod(/JSON\.stringify\(/)),
        },
        {
          text: 'parsed is the received order as an object, and coffee is logged',
          check: all(variableEquals('parsed', { id: 8, items: ['coffee'], paid: true }), usesMethod(/JSON\.parse\(/), logged('coffee')),
        },
        {
          text: 'safeParse returns the parsed value, or null for invalid JSON',
          check: all(
            returns('safeParse', ['[1, 2, 3]'], [1, 2, 3]),
            returns('safeParse', ['{"ok": true}'], { ok: true }),
            returns('safeParse', ['{oops'], null, "safeParse('{oops') should return null: catch the SyntaxError."),
          ),
        },
      ],
      hints: [
        'const text = JSON.stringify(order);',
        'const parsed = JSON.parse(received);',
        'try { return JSON.parse(text); } catch { return null; }',
      ],
      solution: '',
      solutionJs: `const order = { id: 7, items: ['tea', 'cake'], paid: false };

const text = JSON.stringify(order);
console.log(text);

const received = '{"id": 8, "items": ["coffee"], "paid": true}';
const parsed = JSON.parse(received);
console.log(parsed.items[0]);

// Return the parsed value of text, or null if it isn't valid JSON.
function safeParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
`,
    },
    {
      id: 'js-modern-storage',
      title: 'Remembering things: localStorage',
      explanation: `Variables vanish when the page reloads. **\`localStorage\`** keeps small pieces of data in the browser,
per website, even after it's closed:

\`\`\`js
localStorage.setItem('name', 'Ada');
console.log(localStorage.getItem('name'));    // Ada
console.log(localStorage.getItem('missing')); // null — nothing saved under that key
localStorage.removeItem('name');
\`\`\`

It only stores **strings**. Saving an object directly stores the useless text \`"[object Object]"\`, so use JSON:

\`\`\`js
const prefs = { theme: 'dark', fontSize: 18 };
localStorage.setItem('prefs', JSON.stringify(prefs));

const saved = JSON.parse(localStorage.getItem('prefs'));
console.log(saved.fontSize);   // 18
\`\`\`

When loading, plan for "nothing saved yet" (\`getItem\` returns \`null\`) and for broken data (\`JSON.parse\`
throws): fall back to defaults. Never store secrets like passwords there — any script on the page can read it.

In LearnWeb, localStorage is simulated: this lesson starts with saved preferences
\`{"theme":"dark","fontSize":20}\`. What your code saves survives **Run** (like a page reload); the
**Clear storage** button above the console empties it. Log \`localStorage.getItem('prefs')\` to see what's saved.`,
      starterCode: prefsHtml,
      starterCss: prefsCss,
      starterJs: `const defaults = { theme: 'light', fontSize: 16 };

// Return the saved preferences, or a copy of the defaults.
function loadPrefs() {
  return { ...defaults };
}

function savePrefs(prefs) {
  localStorage.setItem('prefs', prefs);
}

function applyPrefs(prefs) {
  document.body.classList.toggle('dark', prefs.theme === 'dark');
  document.body.style.fontSize = \`\${prefs.fontSize}px\`;
}

const prefs = loadPrefs();
applyPrefs(prefs);

document.querySelector('#theme').addEventListener('click', () => {
  prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
  applyPrefs(prefs);
  savePrefs(prefs);
});

document.querySelector('#bigger').addEventListener('click', () => {
  prefs.fontSize += 2;
  applyPrefs(prefs);
});
`,
      storage: { prefs: '{"theme":"dark","fontSize":20}' },
      tasks: [
        {
          text: 'On load, the saved preferences are applied (dark theme, 20px text)',
          check: all(hasClass('body', 'dark', true, 'The saved theme is dark: read "prefs" from localStorage in loadPrefs().'), inlineStyle('body', 'font-size', '20px')),
        },
        {
          text: 'loadPrefs() returns the defaults when nothing (or invalid JSON) is saved',
          check: check((h) => {
            const loadPrefs = h.get<() => unknown>('loadPrefs');
            const saved = h.storage.getItem('prefs');
            const expected = { theme: 'light', fontSize: 16 };
            try {
              h.storage.removeItem('prefs');
              let got;
              try {
                got = loadPrefs();
              } catch (err) {
                return `With nothing saved, loadPrefs() threw ${h.inspect(err)}.`;
              }
              if (!h.equal(got, expected)) return `With nothing saved, loadPrefs() should return the defaults, not ${h.inspect(got)}.`;
              h.storage.setItem('prefs', 'not json');
              try {
                got = loadPrefs();
              } catch (err) {
                return `With broken data saved, loadPrefs() threw ${h.inspect(err)}: wrap JSON.parse in try/catch.`;
              }
              return h.equal(got, expected) || `With broken data saved, loadPrefs() should return the defaults, not ${h.inspect(got)}.`;
            } finally {
              if (saved === null) h.storage.removeItem('prefs');
              else h.storage.setItem('prefs', saved);
            }
          }),
        },
        {
          text: 'Toggling the theme saves the preferences as JSON',
          check: clickThen('#theme', all(hasClass('body', 'dark', false), storageEquals('prefs', { theme: 'light', fontSize: 20 }))),
        },
        {
          text: 'A+ makes the text bigger and saves it too',
          check: clickThen('#bigger', all(inlineStyle('body', 'font-size', '22px'), storageEquals('prefs', { theme: 'light', fontSize: 22 }))),
        },
      ],
      hints: [
        "In loadPrefs: const raw = localStorage.getItem('prefs'); if (raw === null) return { ...defaults };",
        'try { return JSON.parse(raw); } catch { return { ...defaults }; }',
        "localStorage.setItem('prefs', JSON.stringify(prefs)); and call savePrefs(prefs) in the A+ handler too.",
      ],
      solution: prefsHtml,
      solutionCss: prefsCss,
      solutionJs: `const defaults = { theme: 'light', fontSize: 16 };

// Return the saved preferences, or a copy of the defaults.
function loadPrefs() {
  const raw = localStorage.getItem('prefs');
  if (raw === null) return { ...defaults };
  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

function savePrefs(prefs) {
  localStorage.setItem('prefs', JSON.stringify(prefs));
}

function applyPrefs(prefs) {
  document.body.classList.toggle('dark', prefs.theme === 'dark');
  document.body.style.fontSize = \`\${prefs.fontSize}px\`;
}

const prefs = loadPrefs();
applyPrefs(prefs);

document.querySelector('#theme').addEventListener('click', () => {
  prefs.theme = prefs.theme === 'dark' ? 'light' : 'dark';
  applyPrefs(prefs);
  savePrefs(prefs);
});

document.querySelector('#bigger').addEventListener('click', () => {
  prefs.fontSize += 2;
  applyPrefs(prefs);
  savePrefs(prefs);
});
`,
    },
  ],
  challenge: {
    id: 'js-modern-challenge',
    title: 'Bug hunt: the forgetful notes app',
    difficulty: 2,
    blind: true,
    summary: 'A notes app built with a class, JSON and localStorage — and full of bugs. Find and fix them.',
    explanation: `A colleague wrote a little notes app and went on holiday. It doesn't even start. Find and fix the bugs in
script.js — the requirements are hidden and appear as you fix them.

This is how the app should work:

- Notes are kept by a \`NoteStore\` class and saved in localStorage under the key \`notes\`, as a JSON array of
  \`{ "text": ..., "done": ... }\` objects. Two notes are already saved: *Buy milk* and *Call Grace* (done).
- On load, the saved notes are listed in \`#notes\` (one \`<li>\` each, with the class \`done\` when done), and
  \`#count\` shows how many there are, like \`(2)\`.
- Submitting the form adds the text of \`#note-text\` as a new note, without reloading the page, and saves it.
- Empty notes — including ones made only of spaces — are refused: \`#error\` shows *A note cannot be empty*.
- Clicking a note toggles it between done and not done, and saves that.
- **Delete all** empties the list and the saved notes, so they don't come back after a reload.

The HTML and CSS are fine: all the bugs are in script.js. Read the Console for errors first.`,
    starterCode: notesHtml,
    starterCss: notesCss,
    starterJs: notesJs(false),
    storage: { notes: '[{"text":"Buy milk","done":false},{"text":"Call Grace","done":true}]' },
    tasks: [
      { text: 'The app starts without errors and #count shows the number of notes', check: domText('#count', '(2)') },
      {
        text: 'The saved notes are listed on load, done ones with the class done',
        check: all(domCount('#notes li', 2), domText('#notes li:first-child', 'Buy milk'), hasClass('#notes li:last-child', 'done')),
      },
      {
        text: 'Submitting the form adds a note without reloading the page',
        check: typeThen('#note-text', 'Water plants', submitThen('#note-form', all(domCount('#notes li', 3), domText('#notes li:last-child', 'Water plants'), domText('#count', '(3)')))),
      },
      {
        text: 'Notes are saved in localStorage as JSON',
        check: storageEquals('notes', [
          { text: 'Buy milk', done: false },
          { text: 'Call Grace', done: true },
          { text: 'Water plants', done: false },
        ]),
      },
      {
        text: 'A note made only of spaces is refused with an error message',
        check: typeThen('#note-text', '   ', submitThen('#note-form', all(domText('#error', 'A note cannot be empty'), domCount('#notes li', 3)))),
      },
      {
        text: 'Clicking a note toggles it done and saves the change',
        check: clickThen(
          '#notes li:first-child',
          all(
            hasClass('#notes li:first-child', 'done'),
            check((h) => {
              try {
                const notes = JSON.parse(h.storage.getItem('notes') ?? 'null');
                return notes?.[0]?.done === true || 'The toggled note should be saved with done: true.';
              } catch {
                return 'localStorage "notes" should hold valid JSON.';
              }
            }),
          ),
        ),
      },
      {
        text: 'Delete all empties the list and the saved notes',
        check: clickThen('#clear', all(domCount('#notes li', 0), domText('#count', '(0)'), storageEquals('notes', []))),
      },
    ],
    hints: [
      'count is a getter: read it as store.count, without ().',
      'Compare the key used in load() with the one used in save(), and remember localStorage only stores strings.',
      "A submit handler needs event.preventDefault(); '   '.length is 3, but '   '.trim() is ''. And does clear() save?",
    ],
    solution: notesHtml,
    solutionCss: notesCss,
    solutionJs: notesJs(true),
  },
};
