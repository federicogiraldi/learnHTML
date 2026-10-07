import type { Module } from '../types';
import {
  all,
  check,
  clickThen,
  codeMatches,
  codeNotMatches,
  domCount,
  domText,
  hasClass,
  logged,
  loggedInOrder,
  notLogged,
  returns,
} from '../../engine/jsChecks';

const API = 'https://api.learnweb.dev';

const ada = { id: 1, name: 'Ada Lovelace', email: 'ada@learnweb.dev', city: 'London' };
const todos = [
  { id: 1, title: 'Learn fetch', done: true },
  { id: 2, title: 'Handle errors', done: false },
  { id: 3, title: 'Render a list', done: false },
];

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

const todosHtml = pageHtml(
  'Todos',
  `  <main>
    <h1>My todos</h1>
    <button id="reload">Reload</button>
    <p id="status"></p>
    <ul id="list"></ul>
  </main>`,
);

const todosCss = `body {
  font-family: system-ui, sans-serif;
  margin: 2rem;
}

#status {
  color: #666;
}

.done {
  text-decoration: line-through;
  color: #999;
}
`;

const directoryHtml = pageHtml(
  'User directory',
  `  <main>
    <h1>User directory</h1>
    <nav class="teams">
      <button data-team="design">Design</button>
      <button data-team="engineering">Engineering</button>
      <button data-team="marketing">Marketing</button>
      <button data-team="sales">Sales</button>
    </nav>
    <p id="status"></p>
    <ul id="users"></ul>
  </main>`,
);

const directoryCss = `body {
  font-family: system-ui, sans-serif;
  margin: 2rem;
  max-width: 32rem;
}

.teams {
  display: flex;
  gap: 0.5rem;
}

#status {
  color: #555;
}

#status.error {
  color: #b00020;
  font-weight: bold;
}

#users {
  list-style: none;
  padding: 0;
}

#users li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #ddd;
}
`;

export const asyncJs: Module = {
  id: 'js-async',
  title: 'Async JavaScript',
  description: 'Timers, promises, async/await and fetch: work with things that take time, and handle what goes wrong.',
  lessons: [
    {
      id: 'js-async-timers',
      title: 'Timers and the event loop',
      explanation: `Some things take time: a timer, a click, an answer from a server. JavaScript doesn't stop and wait for
them. You hand over a function to run **later**, and the rest of your code carries on.

\`\`\`js
console.log('Start');

setTimeout(() => {
  console.log('Two seconds later');
}, 2000);   // the delay, in milliseconds

console.log('End');
// Start, End … and then "Two seconds later"
\`\`\`

How does that work? JavaScript runs one thing at a time. The **event loop** works like this:

1. Your script runs from top to bottom, all of it.
2. Only then are waiting callbacks (finished timers, clicks…) run, one by one.

So even \`setTimeout(fn, 0)\` runs **after** all the normal code — "0 ms" means "as soon as possible", not "right now".

\`setTimeout\` returns an id: \`clearTimeout(id)\` cancels the timer. \`setInterval(fn, ms)\` repeats every \`ms\`
until you call \`clearInterval(id)\`.`,
      starterCode: '',
      starterJs: `console.log('Ordering coffee...');

// Make this message appear after 2 seconds.
console.log('Coffee is ready!');

console.log('Reading the news while waiting');
`,
      tasks: [
        {
          text: 'Log Coffee is ready! from a setTimeout with a delay of 2000 ms',
          check: all(
            logged('Coffee is ready!'),
            codeMatches(/setTimeout\s*\(/, 'Wrap the coffee message in setTimeout(() => { ... }, 2000).'),
            codeMatches(/\b2000\b/, 'Use a delay of 2000 milliseconds (2 seconds).'),
          ),
        },
        {
          text: 'The news line is logged before the coffee is ready',
          check: loggedInOrder(
            ['Ordering coffee...', 'Reading the news while waiting', 'Coffee is ready!'],
            'Expected: Ordering coffee..., then Reading the news while waiting, then Coffee is ready!',
          ),
        },
        {
          text: 'At the very top of the script, add a setTimeout with a delay of 0 that logs Timer with 0 ms — and see when it shows up',
          check: all(
            check((h) => {
              const timer = h.source.indexOf('Timer with 0 ms');
              const first = h.source.indexOf('Ordering coffee');
              return (timer >= 0 && timer < first) || 'Put the zero-delay setTimeout at the top, before the first console.log.';
            }),
            codeMatches(/,\s*0\s*\)/, 'Give it a delay of 0: setTimeout(() => { ... }, 0).'),
            loggedInOrder(
              ['Reading the news while waiting', 'Timer with 0 ms', 'Coffee is ready!'],
              'Timer with 0 ms should be logged (after all the normal code, before the coffee).',
            ),
          ),
        },
      ],
      hints: [
        "setTimeout(() => { console.log('Coffee is ready!'); }, 2000);",
        'The 0 ms timer still waits for the whole script to finish: it shows up after "Reading the news", even though it comes first in the code.',
      ],
      solution: '',
      solutionJs: `setTimeout(() => {
  console.log('Timer with 0 ms');
}, 0);

console.log('Ordering coffee...');

setTimeout(() => {
  console.log('Coffee is ready!');
}, 2000);

console.log('Reading the news while waiting');
`,
    },
    {
      id: 'js-async-promises',
      title: 'Promises',
      explanation: `Callbacks get messy when one slow step depends on another. Modern APIs return a **promise** instead: an
object standing for a value that will arrive later. A promise is *pending*, then either **fulfilled** (it has a value)
or **rejected** (it has an error).

\`\`\`js
somethingSlow()
  .then((value) => console.log('Got', value))     // runs when it is fulfilled
  .catch((err) => console.log('Oops:', err.message)); // runs when it is rejected
\`\`\`

You can create your own with \`new Promise\`. You get two functions: call \`resolve(value)\` on success,
\`reject(error)\` on failure.

\`\`\`js
function flipCoin() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.5) resolve('heads');
      else reject(new Error('It fell under the sofa'));
    }, 1000);
  });
}

flipCoin()
  .then((side) => console.log('It landed on', side))
  .catch((err) => console.log('No result:', err.message));
\`\`\`

\`.then()\` returns a new promise, so you can chain steps: \`a().then(b).then(c)\`. A rejection nobody catches
becomes an "unhandled rejection" error — always add a \`.catch()\`.`,
      starterCode: '',
      starterJs: `// Return a promise that resolves after ms milliseconds.
function wait(ms) {
}

function findPlayer(name) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (name === 'Ada') resolve({ name: 'Ada', score: 42 });
      else reject(new Error(\`No player called \${name}\`));
    }, 500);
  });
}

findPlayer('Ada').then((player) => console.log(player.name, 'has', player.score, 'points'));

findPlayer('Bob').then((player) => console.log(player.name, 'has', player.score, 'points'));
`,
      tasks: [
        {
          text: 'wait(ms) returns a promise that resolves after ms milliseconds',
          check: check(async (h) => {
            const wait = h.get<(ms: number) => unknown>('wait');
            if (typeof wait !== 'function') return 'Keep the function wait(ms).';
            const p = wait(400);
            if (!(p instanceof Promise)) return 'wait(ms) should return a new Promise(...).';
            let done = false;
            p.then(() => {
              done = true;
            });
            await h.wait(50);
            if (done) return 'wait(400) resolved right away: call resolve from a setTimeout with a delay of ms.';
            await h.wait(700);
            return done || 'wait(400) never resolved: call resolve inside setTimeout.';
          }),
        },
        {
          text: 'Use wait(1000).then(...) to log One second later',
          check: all(
            logged('One second later'),
            codeMatches(/wait\(\s*1000\s*\)\s*\.then\(/, 'Call wait(1000) and log the message in .then().'),
          ),
        },
        {
          text: "Handle Bob's rejection: add a .catch() that logs the error's message",
          check: all(
            logged('No player called Bob', 'Log err.message in the .catch(): it reads No player called Bob.'),
            codeMatches(/\.catch\(/, 'Add .catch((err) => ...) after the .then().'),
          ),
        },
        { text: "Ada's score is still logged", check: logged('Ada has 42 points') },
      ],
      hints: [
        'return new Promise((resolve) => setTimeout(resolve, ms));',
        "wait(1000).then(() => console.log('One second later'));",
        "findPlayer('Bob').then(...).catch((err) => console.log(err.message));",
      ],
      solution: '',
      solutionJs: `// Return a promise that resolves after ms milliseconds.
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findPlayer(name) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (name === 'Ada') resolve({ name: 'Ada', score: 42 });
      else reject(new Error(\`No player called \${name}\`));
    }, 500);
  });
}

wait(1000).then(() => console.log('One second later'));

findPlayer('Ada').then((player) => console.log(player.name, 'has', player.score, 'points'));

findPlayer('Bob')
  .then((player) => console.log(player.name, 'has', player.score, 'points'))
  .catch((err) => console.log(err.message));
`,
    },
    {
      id: 'js-async-await',
      title: 'async and await',
      explanation: `\`.then()\` chains work, but nested steps quickly drift to the right. **\`async\`/\`await\`** lets you write
promise code that reads top to bottom, like normal code:

\`\`\`js
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function countdown() {
  console.log(3);
  await wait(1000);   // pause this function until the promise is fulfilled
  console.log(2);
  await wait(1000);
  console.log(1);
  return 'Lift-off!';
}

countdown().then((msg) => console.log(msg));
console.log('This runs before 2!');
\`\`\`

- \`await promise\` pauses **only the async function** until the promise settles, then gives you its value.
  The rest of the page keeps running.
- \`await\` only works inside a function marked \`async\` (or at the top of a JavaScript module).
- An \`async\` function **always returns a promise**: \`return 79\` means "a promise fulfilled with 79".
- If the awaited promise rejects, \`await\` throws the error — you'll catch it with \`try\`/\`catch\` soon.`,
      starterCode: '',
      starterJs: `function getScore(name) {
  const scores = { Ada: 42, Grace: 37 };
  return new Promise((resolve) => setTimeout(() => resolve(scores[name]), 300));
}

// Rewrite this with async/await, without .then()
function showScores() {
  return getScore('Ada').then((ada) => {
    console.log('Ada:', ada);
    return getScore('Grace').then((grace) => {
      console.log('Grace:', grace);
      return ada + grace;
    });
  });
}

showScores();
`,
      tasks: [
        {
          text: 'showScores is an async function that uses await',
          check: all(
            check((h) => {
              const fn = h.get<{ constructor: { name: string } } | undefined>('showScores');
              return fn?.constructor.name === 'AsyncFunction' || 'Declare it as async function showScores() { ... }.';
            }),
            codeMatches(/\bawait\b/, 'Use await to get each score.'),
          ),
        },
        { text: 'No .then() left in your code', check: codeNotMatches(/\.then\(/, 'Replace every .then() with await.') },
        {
          text: 'After both scores, log Total: 79',
          check: loggedInOrder(['Ada: 42', 'Grace: 37', 'Total: 79'], 'Log Ada: 42, then Grace: 37, then Total: 79.'),
        },
        { text: 'showScores() still resolves to the total (79)', check: returns('showScores', [], 79) },
      ],
      hints: [
        "async function showScores() { const ada = await getScore('Ada'); ... }",
        "console.log('Total:', ada + grace); then return ada + grace;",
      ],
      solution: '',
      solutionJs: `function getScore(name) {
  const scores = { Ada: 42, Grace: 37 };
  return new Promise((resolve) => setTimeout(() => resolve(scores[name]), 300));
}

async function showScores() {
  const ada = await getScore('Ada');
  console.log('Ada:', ada);
  const grace = await getScore('Grace');
  console.log('Grace:', grace);
  console.log('Total:', ada + grace);
  return ada + grace;
}

showScores();
`,
    },
    {
      id: 'js-async-fetch',
      title: 'fetch: data from a server',
      explanation: `\`fetch(url)\` asks a server for data. It returns a promise of a **Response**; reading the body is a second
step, also asynchronous:

\`\`\`js
async function loadUser(id) {
  const res = await fetch(\`https://api.learnweb.dev/users/\${id}\`);
  console.log(res.ok, res.status);   // true 200
  const user = await res.json();     // parse the body as JSON → a normal object
  return user;
}

loadUser(1).then((user) => console.log(user.name));
\`\`\`

- \`res.status\` is the HTTP status code (200 = OK, 404 = not found, 500 = server error) and \`res.ok\` is
  \`true\` for any 2xx status.
- \`res.json()\` returns a promise too: don't forget its \`await\`. (\`res.text()\` gives plain text.)
- Most APIs send **JSON**, which looks like JavaScript objects and arrays: \`{"id": 1, "name": "Ada Lovelace"}\`.

The sandbox has no internet: this lesson provides **fake data** for \`https://api.learnweb.dev/users/1\` and
\`https://api.learnweb.dev/todos\` (a list of todos, each with \`id\`, \`title\` and \`done\`). Try logging them!`,
      starterCode: '',
      starterJs: `async function loadUser(id) {
  const res = fetch(\`https://api.learnweb.dev/users/\${id}\`);
  const user = res.json();
  return user;
}

async function main() {
  const user = await loadUser(1);
  console.log(user.name);
}

main();
`,
      fetchMocks: {
        [`${API}/users/1`]: { body: ada },
        [`${API}/todos`]: { body: todos },
      },
      tasks: [
        {
          text: 'Fix loadUser so that loadUser(1) resolves to the user object',
          check: returns('loadUser', [1], ada, 'loadUser(1) should resolve to the user: await fetch(), then await res.json().'),
        },
        { text: 'In main, log Ada Lovelace lives in London (use the user’s name and city)', check: logged('Ada Lovelace lives in London') },
        {
          text: 'Write an async function countOpenTodos() that fetches the todos and returns how many are not done (2)',
          check: all(
            returns('countOpenTodos', [], 2),
            codeMatches(/\bawait\s+fetch\(/, 'Fetch the todos with await fetch(...).'),
          ),
        },
      ],
      hints: [
        'Both fetch() and res.json() return promises: put await in front of each.',
        'console.log(`${user.name} lives in ${user.city}`);',
        'const todos = await res.json(); return todos.filter((t) => !t.done).length;',
      ],
      solution: '',
      solutionJs: `async function loadUser(id) {
  const res = await fetch(\`https://api.learnweb.dev/users/\${id}\`);
  const user = await res.json();
  return user;
}

async function countOpenTodos() {
  const res = await fetch('https://api.learnweb.dev/todos');
  const todos = await res.json();
  return todos.filter((todo) => !todo.done).length;
}

async function main() {
  const user = await loadUser(1);
  console.log(\`\${user.name} lives in \${user.city}\`);
  console.log('Open todos:', await countOpenTodos());
}

main();
`,
    },
    {
      id: 'js-async-errors',
      title: 'When things go wrong',
      explanation: `Requests fail all the time, and there are **two different ways** it happens:

1. **The request never gets an answer** (offline, server down): the promise from \`fetch\` *rejects*, and
   \`await\` throws a \`TypeError: Failed to fetch\`.
2. **The server answers with an error status** (404, 500…): \`fetch\` does **not** reject! You get a normal
   response with \`res.ok === false\`. It's up to you to check it.

Handle both with \`try\`/\`catch\`, and throw your own error when the status is bad:

\`\`\`js
async function loadUser(id) {
  const res = await fetch(\`https://api.learnweb.dev/users/\${id}\`);
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}\`);   // turn a bad status into a real error
  }
  return res.json();
}

async function showUser(id) {
  try {
    const user = await loadUser(id);
    console.log(user.name);
  } catch (err) {
    console.log('Could not load the user:', err.message);
  } finally {
    console.log('Finished');   // runs either way: hide a spinner, re-enable a button…
  }
}
\`\`\`

\`throw\` stops the function and jumps to the nearest \`catch\`, even across \`await\`s and function calls.
This lesson's fake API has user 1, answers user 99 with a 404, and the server holding user 7 is down.`,
      starterCode: '',
      starterJs: `async function loadUser(id) {
  const res = await fetch(\`https://api.learnweb.dev/users/\${id}\`);
  // If the response isn't ok, throw an error here
  return res.json();
}

async function showUser(id) {
  console.log(\`Loading user \${id}…\`);
  const user = await loadUser(id);
  console.log(\`Hello, \${user.name}!\`);
}

showUser(1);
showUser(99);
showUser(7);
`,
      fetchMocks: {
        [`${API}/users/1`]: { body: ada },
        [`${API}/users/99`]: { status: 404, body: { error: 'User not found' } },
        [`${API}/users/7`]: { networkError: true },
      },
      tasks: [
        {
          text: "loadUser throws new Error('HTTP 404') when user 99 isn't found (check res.ok)",
          check: check(async (h) => {
            const loadUser = h.get<(id: number) => Promise<unknown>>('loadUser');
            if (typeof loadUser !== 'function') return 'Keep the function loadUser(id).';
            try {
              await loadUser(99);
            } catch (err) {
              return (err instanceof Error && err.message === 'HTTP 404') || `loadUser(99) threw ${h.inspect(err)}; throw new Error(\`HTTP \${res.status}\`) instead.`;
            }
            return 'loadUser(99) should throw an error: its response has status 404, so res.ok is false.';
          }),
        },
        {
          text: 'showUser catches errors and logs Could not load user <id>: <message>',
          check: all(
            logged('Could not load user 99: HTTP 404'),
            logged('Could not load user 7: Failed to fetch', 'The network error for user 7 should be caught too: Could not load user 7: Failed to fetch'),
            codeMatches(/\btry\s*\{/, 'Wrap the await in try { ... } catch (err) { ... }.'),
          ),
        },
        { text: 'Hello, Ada Lovelace! still works for user 1', check: logged('Hello, Ada Lovelace!') },
        { text: 'Never greet an undefined user', check: notLogged(/undefined/, 'Something logged "undefined": a failed request should not reach the greeting.') },
        {
          text: 'Add a finally block that logs Done loading user <id> for every user',
          check: all(
            codeMatches(/\bfinally\s*\{/, 'Add finally { ... } after the catch.'),
            logged('Done loading user 1'),
            logged('Done loading user 99'),
            logged('Done loading user 7'),
          ),
        },
      ],
      hints: [
        'In loadUser: if (!res.ok) throw new Error(`HTTP ${res.status}`);',
        'In showUser: try { ...await and greeting... } catch (err) { console.log(`Could not load user ${id}: ${err.message}`); }',
        'finally { console.log(`Done loading user ${id}`); }',
      ],
      solution: '',
      solutionJs: `async function loadUser(id) {
  const res = await fetch(\`https://api.learnweb.dev/users/\${id}\`);
  if (!res.ok) {
    throw new Error(\`HTTP \${res.status}\`);
  }
  return res.json();
}

async function showUser(id) {
  console.log(\`Loading user \${id}…\`);
  try {
    const user = await loadUser(id);
    console.log(\`Hello, \${user.name}!\`);
  } catch (err) {
    console.log(\`Could not load user \${id}: \${err.message}\`);
  } finally {
    console.log(\`Done loading user \${id}\`);
  }
}

showUser(1);
showUser(99);
showUser(7);
`,
    },
    {
      id: 'js-async-render',
      title: 'Loading data into the page',
      explanation: `Time to put it together: fetch data and show it on the page. A good loading flow has three steps:

1. **Before** the request: tell the user something is happening ("Loading…") and clear old results.
2. **After** it: build one element per item.
3. **Finally**: replace the loading message with a result (or an error).

\`\`\`js
async function loadTodos() {
  status.textContent = 'Loading…';
  list.innerHTML = '';                  // clear old items, or a reload doubles them

  const res = await fetch('https://api.learnweb.dev/todos');
  const todos = await res.json();

  for (const todo of todos) {
    const li = document.createElement('li');
    li.textContent = todo.title;        // textContent: safe even if the data contains HTML
    list.append(li);
  }
  status.textContent = \`\${todos.length} todos loaded\`;
}
\`\`\`

The fake server for this lesson answers \`https://api.learnweb.dev/todos\` after one second, so you can see
"Loading…" in the preview. Each todo has \`id\`, \`title\` and \`done\`.`,
      starterCode: todosHtml,
      starterCss: todosCss,
      starterJs: `const statusEl = document.querySelector('#status');
const list = document.querySelector('#list');

async function loadTodos() {
  // 1. Show "Loading…" in #status and empty the list

  const res = await fetch('https://api.learnweb.dev/todos');
  const todos = await res.json();
  console.log(todos);

  // 2. Add one <li> per todo (with the class "done" if todo.done is true)

  // 3. Show "3 todos loaded" (use the real number) in #status
}

loadTodos();
document.querySelector('#reload').addEventListener('click', loadTodos);
`,
      fetchMocks: { [`${API}/todos`]: { body: todos, delay: 1000 } },
      tasks: [
        {
          text: 'The list shows one <li> per todo, with its title',
          check: all(domCount('#list li', 3), domText('#list li', 'Learn fetch'), domText('#list li', 'Render a list')),
        },
        { text: 'Finished todos get the class done', check: all(hasClass('#list li:first-child', 'done'), hasClass('#list li:last-child', 'done', false)) },
        { text: '#status says 3 todos loaded once the data is there', check: domText('#status', '3 todos loaded') },
        {
          text: 'Clicking Reload shows Loading… right away, then the list again — without duplicates',
          check: check(async (h) => {
            const button = h.document.querySelector<HTMLElement>('#reload');
            const status = h.document.querySelector('#status');
            if (!button || !status) return 'Keep the #reload button and the #status paragraph.';
            button.click();
            if (!/^Loading/.test((status.textContent ?? '').trim())) return 'Right after the click, #status should say Loading…';
            await h.settle();
            const n = h.document.querySelectorAll('#list li').length;
            if (n !== 3) return `After a reload the list should have 3 items, not ${n}: empty it before adding new ones.`;
            return (status.textContent ?? '').trim() === '3 todos loaded' || 'After a reload, #status should say 3 todos loaded again.';
          }),
        },
      ],
      hints: [
        "statusEl.textContent = 'Loading…'; list.innerHTML = '';",
        "for (const todo of todos) { const li = document.createElement('li'); li.textContent = todo.title; ... list.append(li); }",
        "li.classList.toggle('done', todo.done); and at the end: statusEl.textContent = `${todos.length} todos loaded`;",
      ],
      solution: todosHtml,
      solutionCss: todosCss,
      solutionJs: `const statusEl = document.querySelector('#status');
const list = document.querySelector('#list');

async function loadTodos() {
  statusEl.textContent = 'Loading…';
  list.innerHTML = '';

  const res = await fetch('https://api.learnweb.dev/todos');
  const todos = await res.json();

  for (const todo of todos) {
    const li = document.createElement('li');
    li.textContent = todo.title;
    li.classList.toggle('done', todo.done);
    list.append(li);
  }

  statusEl.textContent = \`\${todos.length} todos loaded\`;
}

loadTodos();
document.querySelector('#reload').addEventListener('click', loadTodos);
`,
    },
  ],
  challenge: {
    id: 'js-async-challenge',
    title: 'User directory',
    difficulty: 3,
    summary: 'Fetch teams from a (fake) API, show loading and error states, and render the members.',
    explanation: `Build a small company directory. The page (index.html) is ready; write script.js.

The fake API lives at \`https://api.learnweb.dev/teams/<team>/users\`, where \`<team>\` is the button's
\`data-team\` value. Each user looks like \`{ "id": 1, "name": "Susan Kare", "role": "Icon designer" }\`.
Not every team's endpoint works: **marketing** answers with a 500 error, and the **sales** server is down.

What the page must do:

- When the page opens, load the **design** team. Clicking a team button loads that team instead.
- While a request is running, \`#status\` says \`Loading…\` and the list is empty.
- On success, \`#users\` holds one \`<li>\` per user: the name in a \`<strong>\`, then the role, e.g.
  \`<li><strong>Susan Kare</strong> — Icon designer</li>\`. \`#status\` shows the count, e.g. \`3 users\`.
- On failure (bad status **or** network error), the list stays empty, \`#status\` says
  \`Could not load <team>: <reason>\` (e.g. \`Could not load marketing: HTTP 500\`) and gets the class \`error\`.
  Remove that class again on the next successful load.
- No uncaught errors or unhandled rejections, whatever button is clicked.

Tip: write a \`loadTeam(team)\` async function with \`try\`/\`catch\`, and a separate \`renderUsers(users)\`.`,
    starterCode: directoryHtml,
    starterCss: directoryCss,
    starterJs: `const API = 'https://api.learnweb.dev';
const statusEl = document.querySelector('#status');
const list = document.querySelector('#users');

function renderUsers(users) {
  // One <li> per user: <strong>name</strong> — role
}

async function loadTeam(team) {
  // Show Loading…, fetch \`\${API}/teams/\${team}/users\`, check res.ok,
  // then render the users and the count — or show the error.
}

// Load the design team now, and the right team when a button is clicked.
`,
    fetchMocks: {
      [`${API}/teams/design/users`]: {
        delay: 800,
        body: [
          { id: 1, name: 'Susan Kare', role: 'Icon designer' },
          { id: 2, name: 'Dieter Rams', role: 'Product designer' },
          { id: 3, name: 'Paula Scher', role: 'Graphic designer' },
        ],
      },
      [`${API}/teams/engineering/users`]: {
        delay: 800,
        body: [
          { id: 4, name: 'Grace Hopper', role: 'Compiler engineer' },
          { id: 5, name: 'Margaret Hamilton', role: 'Flight software lead' },
          { id: 6, name: 'Linus Torvalds', role: 'Kernel developer' },
          { id: 7, name: 'Tim Berners-Lee', role: 'Web architect' },
        ],
      },
      [`${API}/teams/marketing/users`]: { delay: 800, status: 500, body: { error: 'Internal server error' } },
      [`${API}/teams/sales/users`]: { delay: 800, networkError: true },
    },
    tasks: [
      {
        text: 'The design team is listed when the page opens',
        check: all(domCount('#users li', 3), domText('#users li', /Susan Kare/), domText('#users li', /Paula Scher/)),
      },
      {
        text: 'Each user shows the name in a <strong>, followed by the role',
        check: all(domText('#users li strong', 'Susan Kare'), domText('#users li', /Susan Kare.*Icon designer/)),
      },
      { text: '#status shows the number of users: 3 users', check: domText('#status', '3 users') },
      {
        text: 'Clicking a team shows Loading… (with an empty list) while it loads, then that team',
        check: check(async (h) => {
          const button = h.document.querySelector<HTMLElement>('[data-team="engineering"]');
          const status = h.document.querySelector('#status');
          if (!button || !status) return 'Keep the team buttons and #status.';
          button.click();
          if (!/^Loading/.test((status.textContent ?? '').trim())) return 'Right after a click, #status should say Loading…';
          if (h.document.querySelectorAll('#users li').length !== 0) return 'Empty the list while the new team is loading.';
          await h.settle();
          const names = [...h.document.querySelectorAll('#users li strong')].map((el) => el.textContent);
          if (names.length !== 4 || !names.includes('Grace Hopper')) return 'After clicking Engineering, list its 4 users (and only them).';
          return (status.textContent ?? '').trim() === '4 users' || '#status should say 4 users for engineering.';
        }),
      },
      {
        text: 'A server error (marketing) shows Could not load marketing: HTTP 500 with the class error',
        check: clickThen(
          '[data-team="marketing"]',
          all(domText('#status', 'Could not load marketing: HTTP 500'), hasClass('#status', 'error'), domCount('#users li', 0)),
        ),
      },
      {
        text: 'A network failure (sales) shows Could not load sales: … instead of crashing',
        check: clickThen('[data-team="sales"]', all(domText('#status', /^Could not load sales: /), hasClass('#status', 'error'), domCount('#users li', 0))),
      },
      {
        text: 'Loading a team again after an error works and removes the error class',
        check: clickThen('[data-team="design"]', all(domCount('#users li', 3), domText('#status', '3 users'), hasClass('#status', 'error', false))),
      },
    ],
    hints: [
      "Start loadTeam with statusEl.textContent = 'Loading…'; list.innerHTML = ''; statusEl.classList.remove('error');",
      'Inside try: const res = await fetch(...); if (!res.ok) throw new Error(`HTTP ${res.status}`); const users = await res.json();',
      "document.querySelectorAll('[data-team]').forEach((btn) => btn.addEventListener('click', () => loadTeam(btn.dataset.team)));",
    ],
    solution: directoryHtml,
    solutionCss: directoryCss,
    solutionJs: `const API = 'https://api.learnweb.dev';
const statusEl = document.querySelector('#status');
const list = document.querySelector('#users');

function renderUsers(users) {
  for (const user of users) {
    const li = document.createElement('li');
    const name = document.createElement('strong');
    name.textContent = user.name;
    li.append(name, \` — \${user.role}\`);
    list.append(li);
  }
}

async function loadTeam(team) {
  statusEl.textContent = 'Loading…';
  statusEl.classList.remove('error');
  list.innerHTML = '';
  try {
    const res = await fetch(\`\${API}/teams/\${team}/users\`);
    if (!res.ok) {
      throw new Error(\`HTTP \${res.status}\`);
    }
    const users = await res.json();
    renderUsers(users);
    statusEl.textContent = \`\${users.length} users\`;
  } catch (err) {
    statusEl.textContent = \`Could not load \${team}: \${err.message}\`;
    statusEl.classList.add('error');
  }
}

loadTeam('design');

document.querySelectorAll('[data-team]').forEach((button) => {
  button.addEventListener('click', () => loadTeam(button.dataset.team));
});
`,
  },
};
