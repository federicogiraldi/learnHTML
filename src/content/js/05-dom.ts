import type { Module } from '../types';
import {
  all,
  attr,
  check,
  clickThen,
  codeMatches,
  domCount,
  domText,
  hasClass,
  inlineStyle,
  logged,
  noVar,
  submitThen,
  typeThen,
  usesMethod,
} from '../../engine/jsChecks';

/** A complete index.html that loads script.js (and style.css when `css` is true). */
const page = (title: string, body: string, css = false) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>${css ? '\n  <link rel="stylesheet" href="style.css">' : ''}
</head>
<body>
${body.trim()}

  <script src="script.js"></script>
</body>
</html>
`;

const selectHtml = page(
  'Shopping list',
  `  <h1 id="title">Shopping list</h1>
  <p class="intro">Things to buy this week.</p>
  <ul>
    <li class="item">Milk</li>
    <li class="item">Bread</li>
    <li class="item">Eggs</li>
  </ul>`,
);

const profileHtml = page(
  'Profile card',
  `  <article class="card">
    <img id="photo" src="https://picsum.photos/id/30/120/120" alt="Placeholder">
    <h2 id="name">Loading…</h2>
    <p id="bio"></p>
    <a id="link" href="#">Website</a>
  </article>`,
);

const classesHtml = page(
  'Tasks',
  `  <h1>Today</h1>
  <p id="saved" class="badge hidden">All changes saved</p>
  <ul>
    <li id="t1" class="task done">Water the plants</li>
    <li id="t2" class="task">Answer emails</li>
    <li id="t3" class="task">Go for a run</li>
  </ul>`,
  true,
);

const classesCss = `body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.dark {
  background: #1e1e2e;
  color: #e6e6f0;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  background: #d1fae5;
  color: #065f46;
}

.hidden {
  display: none;
}

.done {
  text-decoration: line-through;
  opacity: 0.6;
}
`;

const createHtml = page(
  'Guest list',
  `  <h1>Party guests</h1>
  <p class="ad">Buy party hats now! 50% off!</p>
  <ul id="guests"></ul>`,
);

const clickHtml = page(
  'Likes',
  `  <h1>Sunset photo</h1>
  <p><span id="count">0</span> likes</p>
  <button id="like">❤ Like</button>
  <button id="theme">Toggle dark mode</button>`,
  true,
);

const clickCss = `body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

body.dark {
  background: #1e1e2e;
  color: #e6e6f0;
}

button {
  font: inherit;
  padding: 6px 12px;
}
`;

const formHtml = page(
  'Join the club',
  `  <form id="signup">
    <label for="name">Name</label>
    <input id="name" name="name" autocomplete="off">
    <button type="submit">Join</button>
  </form>
  <p id="preview">Hello, stranger!</p>
  <p id="message"></p>
  <h2>Members</h2>
  <ul id="members"></ul>`,
);

const counterHtml = page(
  'Counter',
  `  <h1>Visitors inside</h1>
  <div class="counter">
    <button id="minus" aria-label="Decrease">−</button>
    <output id="value">0</output>
    <button id="plus" aria-label="Increase">+</button>
  </div>
  <label for="step">Step</label>
  <input id="step" type="number" min="1" value="1">
  <button id="reset">Reset</button>
  <p id="note"></p>`,
  true,
);

const counterCss = `body {
  font-family: system-ui, sans-serif;
  padding: 16px;
}

.counter {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.counter button {
  width: 48px;
  height: 48px;
  font-size: 24px;
}

#value {
  font-size: 40px;
  min-width: 2ch;
  text-align: center;
}

#value.max {
  color: #c62828;
}

#step {
  width: 4em;
}

button:disabled {
  opacity: 0.4;
}
`;

export const dom: Module = {
  id: 'js-dom',
  title: 'The DOM',
  description: 'Find elements on the page, change their text, attributes and classes, create new ones and react to clicks, typing and forms.',
  lessons: [
    {
      id: 'js-dom-select',
      title: 'Selecting elements',
      explanation: `When the browser reads your HTML it builds the **DOM** (Document Object Model): a tree of objects, one per
element, that JavaScript can read and change. The whole page is the \`document\` object.

To work with an element you first **select** it:

\`\`\`html
<h1 id="title">Recipes</h1>
<p class="tip">Preheat the oven.</p>
<p class="tip">Use fresh basil.</p>
<script>
  const title = document.getElementById('title');        // by id (no #)
  const firstTip = document.querySelector('.tip');       // the FIRST match of any CSS selector
  const tips = document.querySelectorAll('.tip');        // ALL matches, as a NodeList

  console.log(title.textContent);      // Recipes
  console.log(tips.length);            // 2
  tips.forEach((tip) => console.log(tip.textContent));
</script>
\`\`\`

- \`querySelector\` takes the same selectors as CSS: \`'#id'\`, \`'.class'\`, \`'ul li'\`, \`'button[type=submit]'\`…
- If nothing matches, \`querySelector\` returns \`null\` (and using it throws *Cannot read properties of null*).
- A NodeList has \`.length\`, indexes and \`forEach\`; turn it into a real array with \`[...list]\` to use \`map\` or \`filter\`.

Your script.js is loaded at the end of \`<body>\`, so the elements already exist when it runs.`,
      starterCode: selectHtml,
      starterJs: `// Select the <h1> by its id
const title = document.querySelector('title');
console.log(title);
`,
      tasks: [
        {
          text: 'title is the <h1> element, selected with getElementById',
          check: all(
            check((h) => (h.get('title') === h.document.getElementById('title') ? true : 'title should be the <h1 id="title"> element.')),
            usesMethod(/getElementById\(/),
          ),
        },
        {
          text: 'intro is the .intro paragraph, selected with querySelector',
          check: all(check((h) => (h.has('intro') && h.get('intro') === h.document.querySelector('.intro') ? true : 'Declare intro as the .intro paragraph.')), usesMethod(/querySelector\(/)),
        },
        {
          text: 'items holds all three .item elements (querySelectorAll)',
          check: check((h) => {
            const items = h.get('items') as NodeList | undefined;
            return (items instanceof NodeList && items.length === 3) || 'Declare items with document.querySelectorAll(\'.item\').';
          }),
        },
        { text: 'Log how many items there are', check: all(logged('3'), codeMatches(/items\.length/, 'Log items.length.')) },
        { text: "Log the first item's text (Milk)", check: all(logged('Milk'), codeMatches(/textContent/, 'Read the text with .textContent.')) },
      ],
      hints: [
        "document.querySelector('title') finds the <title> tag in <head>! Use document.getElementById('title') (no #).",
        "const items = document.querySelectorAll('.item');",
        'items[0].textContent is the text of the first item.',
      ],
      solution: selectHtml,
      solutionJs: `// Select the <h1> by its id
const title = document.getElementById('title');
console.log(title);

const intro = document.querySelector('.intro');
const items = document.querySelectorAll('.item');

console.log(items.length);
console.log(items[0].textContent);
`,
    },
    {
      id: 'js-dom-text-attrs',
      title: 'Changing text and attributes',
      explanation: `Once you have an element, you can change it and the page updates immediately.

\`\`\`html
<h2 id="name">…</h2>
<img id="photo" src="https://picsum.photos/id/64/100/100" alt="">
<a id="site" href="#">Website</a>
<script>
  document.querySelector('#name').textContent = 'Grace Hopper';   // replace the text

  const photo = document.querySelector('#photo');
  photo.setAttribute('alt', 'Portrait of Grace');                  // any attribute
  photo.src = 'https://picsum.photos/id/65/100/100';               // common ones are properties too

  document.querySelector('#site').href = 'https://example.com';
  document.querySelector('#name').style.color = 'teal';           // inline style, camelCase names
</script>
\`\`\`

- \`textContent\` reads or replaces an element's text. You may also see \`innerHTML\`, which parses HTML: never put
  user input into it — someone could inject their own tags and scripts.
- \`getAttribute(name)\` / \`setAttribute(name, value)\` work for any attribute; \`removeAttribute(name)\` removes one.
- \`element.style.backgroundColor = 'red'\` sets **inline** styles (CSS names in camelCase). It's fine for one-off
  values, but for anything bigger, toggling classes (next lesson) keeps the styling in your CSS.`,
      starterCode: profileHtml,
      starterJs: `const profile = {
  name: 'Ada Lovelace',
  bio: 'Wrote the first computer program, in 1843.',
  photo: 'https://picsum.photos/id/64/120/120',
  site: 'https://en.wikipedia.org/wiki/Ada_Lovelace',
};

document.querySelector('#name').textContent = profile.name;

// Fill in the bio, the photo and the link from profile.
`,
      tasks: [
        { text: "#name shows the profile's name", check: domText('#name', 'Ada Lovelace') },
        { text: '#bio shows the bio', check: all(domText('#bio', 'Wrote the first computer program, in 1843.'), codeMatches(/profile\.bio/, 'Use profile.bio rather than copying the text.')) },
        { text: "#photo's src is profile.photo", check: attr('#photo', 'src', 'https://picsum.photos/id/64/120/120') },
        { text: "#photo's alt is Portrait of Ada Lovelace (set with setAttribute)", check: all(attr('#photo', 'alt', 'Portrait of Ada Lovelace'), usesMethod(/\.setAttribute\(/)) },
        { text: '#link points to profile.site, and #name gets the inline style color: purple', check: all(attr('#link', 'href', 'https://en.wikipedia.org/wiki/Ada_Lovelace'), inlineStyle('#name', 'color', 'purple')) },
      ],
      hints: [
        "document.querySelector('#bio').textContent = profile.bio;",
        "const photo = document.querySelector('#photo'); photo.src = profile.photo; photo.setAttribute('alt', `Portrait of ${profile.name}`);",
        "document.querySelector('#name').style.color = 'purple';",
      ],
      solution: profileHtml,
      solutionJs: `const profile = {
  name: 'Ada Lovelace',
  bio: 'Wrote the first computer program, in 1843.',
  photo: 'https://picsum.photos/id/64/120/120',
  site: 'https://en.wikipedia.org/wiki/Ada_Lovelace',
};

const nameEl = document.querySelector('#name');
nameEl.textContent = profile.name;
nameEl.style.color = 'purple';

document.querySelector('#bio').textContent = profile.bio;

const photo = document.querySelector('#photo');
photo.src = profile.photo;
photo.setAttribute('alt', \`Portrait of \${profile.name}\`);

document.querySelector('#link').href = profile.site;
`,
    },
    {
      id: 'js-dom-classes',
      title: 'Classes with classList',
      explanation: `The cleanest way to change how something looks is to keep the styles in CSS and just **add or remove a class**
from JavaScript. Every element has a \`classList\`:

\`\`\`js
const box = document.querySelector('.box');

box.classList.add('active');          // add a class
box.classList.remove('hidden');       // remove one
box.classList.toggle('open');         // add it if missing, remove it if present
box.classList.toggle('big', width > 600);   // with a condition: add if true, remove if false
console.log(box.classList.contains('active'));   // true
\`\`\`

To change several elements, select them all and loop:

\`\`\`js
document.querySelectorAll('.card').forEach((card) => card.classList.add('shadow'));
\`\`\`

Avoid writing to \`className\` directly: it replaces *all* the classes at once.`,
      starterCode: classesHtml,
      starterCss: classesCss,
      starterJs: `const saved = document.querySelector('#saved');

// Turn on dark mode
document.body.className = 'dark';
`,
      tasks: [
        { text: 'Add the class dark to <body> with classList', check: all(hasClass('body', 'dark'), usesMethod(/classList\.add\(/)) },
        { text: 'Show the #saved badge by removing its hidden class (it keeps the badge class)', check: all(hasClass('#saved', 'hidden', false), hasClass('#saved', 'badge'), usesMethod(/classList\.remove\(/)) },
        {
          text: 'Toggle done on every .task: the first becomes undone, the other two done',
          check: all(hasClass('#t1', 'done', false), hasClass('#t2', 'done'), hasClass('#t3', 'done'), usesMethod(/classList\.toggle\(/), usesMethod(/querySelectorAll\(/)),
        },
        { text: 'Log whether #saved has the class badge (true), using contains', check: all(logged('true'), usesMethod(/classList\.contains\(/)) },
      ],
      hints: [
        "document.body.classList.add('dark'); — className = '...' would wipe any other classes.",
        "document.querySelectorAll('.task').forEach((task) => task.classList.toggle('done'));",
        "console.log(saved.classList.contains('badge'));",
      ],
      solution: classesHtml,
      solutionCss: classesCss,
      solutionJs: `const saved = document.querySelector('#saved');

// Turn on dark mode
document.body.classList.add('dark');

saved.classList.remove('hidden');

document.querySelectorAll('.task').forEach((task) => task.classList.toggle('done'));

console.log(saved.classList.contains('badge'));
`,
    },
    {
      id: 'js-dom-create',
      title: 'Creating and removing elements',
      explanation: `JavaScript can build new elements and put them on the page — that's how lists of data get displayed.

\`\`\`html
<ul id="list"></ul>
<script>
  const list = document.querySelector('#list');
  const fruits = ['Apple', 'Pear'];

  for (const fruit of fruits) {
    const li = document.createElement('li');   // 1. create (not on the page yet)
    li.textContent = fruit;                    // 2. fill it in
    li.classList.add('fruit');
    list.append(li);                           // 3. insert it: at the end of #list
  }
</script>
\`\`\`

- \`parent.append(el)\` adds at the end, \`parent.prepend(el)\` at the start.
- \`el.remove()\` takes an element off the page.
- Building elements with \`createElement\` and \`textContent\` is safe even with user input, unlike \`innerHTML\`.`,
      starterCode: createHtml,
      starterJs: `const guests = ['Ada', 'Grace', 'Linus'];
const list = document.querySelector('#guests');

for (const guest of guests) {
  const li = document.createElement('li');
  li.textContent = guest;
  // li isn't on the page yet...
}
`,
      tasks: [
        { text: 'Each guest becomes an <li> inside #guests', check: all(domCount('#guests li', 3), domText('#guests li', 'Grace'), usesMethod(/createElement\(/)) },
        { text: 'The guests appear in the same order as the array', check: check((h) => [...h.document.querySelectorAll('#guests li')].map((li) => li.textContent?.trim()).join(',') === 'Ada,Grace,Linus' || 'List the guests in order: Ada, Grace, Linus (use append).') },
        { text: 'Every guest <li> has the class guest', check: domCount('#guests li.guest', 3) },
        { text: 'Remove the .ad paragraph with remove()', check: all(domCount('.ad', 0, 'The .ad paragraph is still on the page.'), usesMethod(/\.remove\(/)) },
      ],
      hints: ['Inside the loop: list.append(li);', "li.classList.add('guest');", "document.querySelector('.ad').remove();"],
      solution: createHtml,
      solutionJs: `const guests = ['Ada', 'Grace', 'Linus'];
const list = document.querySelector('#guests');

for (const guest of guests) {
  const li = document.createElement('li');
  li.textContent = guest;
  li.classList.add('guest');
  list.append(li);
}

document.querySelector('.ad').remove();
`,
    },
    {
      id: 'js-dom-click',
      title: 'Click events',
      explanation: `Pages come alive by reacting to **events**: clicks, key presses, typing… You register a function that the
browser calls each time the event happens:

\`\`\`html
<button id="hello">Say hi</button>
<p id="out"></p>
<script>
  let clicks = 0;
  const button = document.querySelector('#hello');

  button.addEventListener('click', (event) => {
    clicks++;
    document.querySelector('#out').textContent = \`Clicked \${clicks} times\`;
    console.log(event.target);   // the element that was clicked
  });
</script>
\`\`\`

- The function runs **later**, on every click — not when \`addEventListener\` is called.
- Pass the function itself: \`addEventListener('click', handleClick)\`, **not** \`handleClick()\` (that would call it once,
  right away, and pass its result).
- Keep state (like a counter) in a variable **outside** the handler, so it survives between clicks.
- You may see \`onclick="..."\` attributes in old HTML: \`addEventListener\` keeps JavaScript out of the markup and
  allows several listeners.`,
      starterCode: clickHtml,
      starterCss: clickCss,
      starterJs: `const likeButton = document.querySelector('#like');
const countEl = document.querySelector('#count');

likeButton.addEventListener('click', () => {
  let likes = 0;
  likes++;
  countEl.textContent = likes;
});

// #theme should toggle the class dark on <body>
`,
      tasks: [
        { text: 'Clicking Like once shows 1', check: clickThen('#like', domText('#count', '1')) },
        { text: 'Two more clicks show 3 (the count keeps going up)', check: clickThen('#like', domText('#count', '3', 'After 3 clicks, #count should show 3. Is likes reset on every click?'), 2) },
        { text: 'Clicking #theme adds the class dark to <body>', check: clickThen('#theme', hasClass('body', 'dark')) },
        { text: 'Clicking #theme again removes it', check: all(clickThen('#theme', hasClass('body', 'dark', false)), usesMethod(/addEventListener\(/)) },
      ],
      hints: [
        'let likes = 0; must be outside the handler, otherwise it starts again from 0 on every click.',
        "document.querySelector('#theme').addEventListener('click', () => { document.body.classList.toggle('dark'); });",
      ],
      solution: clickHtml,
      solutionCss: clickCss,
      solutionJs: `const likeButton = document.querySelector('#like');
const countEl = document.querySelector('#count');

let likes = 0;
likeButton.addEventListener('click', () => {
  likes++;
  countEl.textContent = likes;
});

// #theme should toggle the class dark on <body>
document.querySelector('#theme').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});
`,
    },
    {
      id: 'js-dom-forms',
      title: 'Typing and forms',
      explanation: `Two events matter most for forms:

- **\`input\`** fires on an \`<input>\` or \`<textarea>\` after every keystroke: perfect for live previews.
- **\`submit\`** fires on the \`<form>\` when the user presses Enter or clicks a submit button.

\`\`\`html
<form id="search">
  <input id="q">
  <button>Search</button>
</form>
<p id="live"></p>
<script>
  const q = document.querySelector('#q');

  q.addEventListener('input', () => {
    document.querySelector('#live').textContent = \`You typed: \${q.value}\`;
  });

  document.querySelector('#search').addEventListener('submit', (event) => {
    event.preventDefault();          // stop the browser from reloading the page
    console.log('Searching for', q.value.trim());
    q.value = '';                    // clear the field
  });
</script>
\`\`\`

- An input's current text is its \`.value\` (always a **string**: use \`Number()\` for numbers).
- A form's default behaviour is to send the data and **load a new page**. In a JavaScript app, call
  \`event.preventDefault()\` first thing in the submit handler.
- Listen for \`submit\` on the form rather than \`click\` on the button: it also catches the Enter key.
- \`.trim()\` removes spaces at both ends, so \`'   '\` counts as empty.`,
      starterCode: formHtml,
      starterJs: `const form = document.querySelector('#signup');
const input = document.querySelector('#name');
const preview = document.querySelector('#preview');
const message = document.querySelector('#message');
const members = document.querySelector('#members');

input.addEventListener('input', () => {
  // Show "Hello, <name>!" — or "Hello, stranger!" when the input is empty
});

form.addEventListener('submit', () => {
  message.textContent = 'Thanks!';
});
`,
      tasks: [
        { text: 'Typing Ada shows Hello, Ada! in #preview as you type', check: typeThen('#name', 'Ada', domText('#preview', 'Hello, Ada!')) },
        { text: 'Clearing the input shows Hello, stranger! again', check: typeThen('#name', '', domText('#preview', 'Hello, stranger!')) },
        {
          text: 'Submitting an empty name doesn’t reload the page, shows Please enter a name. and adds nobody',
          check: submitThen('#signup', all(domText('#message', 'Please enter a name.'), domCount('#members li', 0))),
        },
        {
          text: 'Submitting Grace adds her to #members and shows Welcome, Grace!',
          check: typeThen('#name', 'Grace', submitThen('#signup', all(domCount('#members li', 1), domText('#members li', 'Grace'), domText('#message', 'Welcome, Grace!')))),
        },
        {
          text: 'After joining, the input is cleared',
          check: check((h) => ((h.document.querySelector('#name') as HTMLInputElement).value === '' ? true : "Clear the input after a successful sign-up: input.value = '';")),
        },
      ],
      hints: [
        "In the input handler: preview.textContent = input.value ? `Hello, ${input.value}!` : 'Hello, stranger!';",
        'The submit handler receives the event: form.addEventListener(\'submit\', (event) => { event.preventDefault(); ... });',
        'For a new member: create an <li>, set its textContent, members.append(li), then input.value = \'\'.',
      ],
      solution: formHtml,
      solutionJs: `const form = document.querySelector('#signup');
const input = document.querySelector('#name');
const preview = document.querySelector('#preview');
const message = document.querySelector('#message');
const members = document.querySelector('#members');

input.addEventListener('input', () => {
  const typed = input.value.trim();
  preview.textContent = typed ? \`Hello, \${typed}!\` : 'Hello, stranger!';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const newName = input.value.trim();
  if (!newName) {
    message.textContent = 'Please enter a name.';
    return;
  }
  const li = document.createElement('li');
  li.textContent = newName;
  members.append(li);
  message.textContent = \`Welcome, \${newName}!\`;
  input.value = '';
});
`,
    },
  ],
  challenge: {
    id: 'js-dom-challenge',
    title: 'Room counter',
    difficulty: 2,
    summary: 'Build a visitor counter with +, −, reset, an adjustable step and hard limits.',
    explanation: `A small museum room may hold at most **10 visitors**. Build the door attendant's counter. The page and its styles
are ready; write script.js so that:

1. **+** adds the step to the count and **−** subtracts it. The step is the number in the \`#step\` input
   (read it when the button is clicked; it's 1 at first).
2. The count never goes below **0** or above **10**: clamp it (\`Math.min\` / \`Math.max\` help).
3. **−** is disabled when the count is 0 and **+** is disabled when it is 10 — from the start, too.
4. At 10, \`#value\` gets the class \`max\` and \`#note\` says **Maximum reached**. Below 10, no \`max\` class and an empty note.
5. **Reset** puts the count back to 0.

Tip: write one \`render()\` function that updates the whole page from the \`count\` variable, call it once at the
start and after every change. A button is disabled with \`button.disabled = true\`.`,
    starterCode: counterHtml,
    starterCss: counterCss,
    starterJs: `const valueEl = document.querySelector('#value');
const minusButton = document.querySelector('#minus');
const plusButton = document.querySelector('#plus');

let count = 0;

function render() {
  valueEl.textContent = count;
}

plusButton.addEventListener('click', () => {
  count = count + 1;
  render();
});
`,
    tasks: [
      {
        text: 'At the start the count is 0 and − is disabled',
        check: all(
          domText('#value', '0'),
          check((h) => ((h.document.querySelector('#minus') as HTMLButtonElement).disabled ? true : '− should be disabled while the count is 0.')),
        ),
      },
      { text: '+ adds one', check: clickThen('#plus', domText('#value', '1')) },
      {
        text: '− subtracts one, and is disabled again at 0',
        check: clickThen(
          '#minus',
          all(
            domText('#value', '0'),
            check((h) => ((h.document.querySelector('#minus') as HTMLButtonElement).disabled ? true : '− should be disabled again when the count is back to 0.')),
          ),
        ),
      },
      { text: 'The count never goes below 0', check: clickThen('#minus', domText('#value', '0', 'The count went below 0.')) },
      { text: 'With the step set to 4, two clicks on + give 8', check: typeThen('#step', '4', clickThen('#plus', domText('#value', '8', 'Read the step from #step (Number(stepInput.value)) when + is clicked.'), 2)) },
      {
        text: 'The count stops at 10: #value gets the class max, + is disabled and #note says Maximum reached',
        check: clickThen(
          '#plus',
          all(
            domText('#value', '10', 'One more click (8 + 4) should stop at 10, not go over.'),
            hasClass('#value', 'max'),
            domText('#note', 'Maximum reached'),
            check((h) => ((h.document.querySelector('#plus') as HTMLButtonElement).disabled ? true : '+ should be disabled at 10.')),
          ),
        ),
      },
      {
        text: 'Reset goes back to 0, removes max, empties the note and enables + again',
        check: clickThen(
          '#reset',
          all(
            domText('#value', '0'),
            hasClass('#value', 'max', false),
            domText('#note', '', '#note should be empty below 10.'),
            check((h) => (!(h.document.querySelector('#plus') as HTMLButtonElement).disabled ? true : '+ should be enabled again after a reset.')),
          ),
        ),
      },
      { text: 'Uses addEventListener and no var', check: all(usesMethod(/addEventListener\(/), noVar()) },
    ],
    hints: [
      'In the click handlers: const step = Number(stepInput.value); count = Math.min(10, count + step);',
      "In render(): minusButton.disabled = count === 0; plusButton.disabled = count === 10; valueEl.classList.toggle('max', count === 10);",
      "Call render() once at the end of the script so the page starts in the right state.",
    ],
    solution: counterHtml,
    solutionCss: counterCss,
    solutionJs: `const valueEl = document.querySelector('#value');
const minusButton = document.querySelector('#minus');
const plusButton = document.querySelector('#plus');
const stepInput = document.querySelector('#step');
const note = document.querySelector('#note');

const MAX = 10;
let count = 0;

function render() {
  valueEl.textContent = count;
  minusButton.disabled = count === 0;
  plusButton.disabled = count === MAX;
  valueEl.classList.toggle('max', count === MAX);
  note.textContent = count === MAX ? 'Maximum reached' : '';
}

function step() {
  return Number(stepInput.value) || 1;
}

plusButton.addEventListener('click', () => {
  count = Math.min(MAX, count + step());
  render();
});

minusButton.addEventListener('click', () => {
  count = Math.max(0, count - step());
  render();
});

document.querySelector('#reset').addEventListener('click', () => {
  count = 0;
  render();
});

render();
`,
  },
};
