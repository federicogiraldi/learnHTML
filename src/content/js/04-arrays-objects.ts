import type { Module } from '../types';
import { all, check, codeMatches, logged, loggedInOrder, noVar, returns, usesMethod, variableEquals } from '../../engine/jsChecks';

export const arraysObjects: Module = {
  id: 'js-data',
  title: 'Arrays & Objects',
  description: 'Store lists and records, transform them with map, filter and reduce, and unpack them with destructuring and spread.',
  lessons: [
    {
      id: 'js-data-arrays',
      title: 'Arrays',
      explanation: `An **array** is an ordered list of values, written in square brackets:

\`\`\`js
const colors = ['red', 'green', 'blue'];

console.log(colors[0]);                  // red   — positions (indexes) start at 0
console.log(colors.length);              // 3
console.log(colors[colors.length - 1]);  // blue  — the last item
console.log(colors[5]);                  // undefined — no item there
\`\`\`

Arrays change with methods:

\`\`\`js
const colors = ['red', 'green'];
colors.push('blue');      // add at the end   → ['red', 'green', 'blue']
const last = colors.pop(); // remove the last → 'blue' (returned), array is ['red', 'green']
console.log(colors.includes('red'));  // true  — is the value in the array?
console.log(colors.indexOf('green')); // 1     — where is it? (-1 if missing)
\`\`\`

A \`const\` array can still be changed with \`push\` or \`pop\`: \`const\` only stops you from pointing the name at a
*different* array.`,
      starterCode: '',
      starterJs: `const playlist = ['Intro', 'Blue', 'Echoes', 'Oops'];

// The first song:
console.log(playlist[1]);

// Remove 'Oops' and add 'Finale' here.
`,
      tasks: [
        { text: 'Log the first song (Intro) using its index', check: all(logged('Intro', 'Log playlist[0] — indexes start at 0.'), codeMatches(/playlist\[\s*0\s*\]/, 'Read the first song with playlist[0].')) },
        {
          text: "Remove 'Oops' with pop() and add 'Finale' with push()",
          check: all(variableEquals('playlist', ['Intro', 'Blue', 'Echoes', 'Finale']), usesMethod(/\.pop\(/), usesMethod(/\.push\(/)),
        },
        { text: 'Declare songCount with the number of songs, using .length', check: all(variableEquals('songCount', 4), codeMatches(/songCount\s*=\s*playlist\.length/, 'Set songCount = playlist.length.')) },
        { text: "Declare hasBlue: whether the playlist includes 'Blue' (use includes)", check: all(variableEquals('hasBlue', true), usesMethod(/\.includes\(/)) },
        {
          text: 'Log the last song using playlist.length - 1',
          check: all(logged('Finale'), codeMatches(/playlist\[\s*playlist\.length\s*-\s*1\s*\]/, 'Read the last song with playlist[playlist.length - 1].')),
        },
      ],
      hints: [
        "playlist.pop(); removes the last item, playlist.push('Finale'); adds one at the end.",
        'Put songCount and the last-song log after the pop and push, so they see the final playlist.',
        "const hasBlue = playlist.includes('Blue');",
      ],
      solution: '',
      solutionJs: `const playlist = ['Intro', 'Blue', 'Echoes', 'Oops'];

// The first song:
console.log(playlist[0]);

playlist.pop();
playlist.push('Finale');

const songCount = playlist.length;
const hasBlue = playlist.includes('Blue');

console.log(playlist[playlist.length - 1]);
`,
    },
    {
      id: 'js-data-map-filter',
      title: 'map, filter and find',
      explanation: `Most array work is "do something with every item". Instead of writing loops, arrays have methods that take
a **function** and call it for each item:

\`\`\`js
const nums = [1, 2, 3, 4, 5];

const doubled = nums.map((n) => n * 2);         // [2, 4, 6, 8, 10]  — transform every item
const evens = nums.filter((n) => n % 2 === 0);  // [2, 4]            — keep items where the function returns true
const firstBig = nums.find((n) => n > 3);       // 4                 — the first match (undefined if none)

console.log(doubled, evens, firstBig);
\`\`\`

- \`map\` always returns a **new array of the same length**.
- \`filter\` returns a new array with **some** of the items (maybe none).
- \`find\` returns **one item**, not an array.
- None of them change the original array.

You can chain them: \`nums.filter((n) => n > 2).map((n) => n * 10)\` gives \`[30, 40, 50]\`.`,
      starterCode: '',
      starterJs: `const prices = [12, 45, 8, 99, 23, 5];

// Add €5 shipping to every price (rewrite this loop with map)
const withShipping = [];
for (const p of prices) {
  withShipping.push(p + 5);
}

const cheap = [];
const firstBig = 0;
`,
      tasks: [
        { text: 'withShipping is every price plus 5, built with map()', check: all(variableEquals('withShipping', [17, 50, 13, 104, 28, 10]), usesMethod(/\.map\(/)) },
        { text: 'cheap holds the prices under 20, using filter()', check: all(variableEquals('cheap', [12, 8, 5]), usesMethod(/\.filter\(/)) },
        { text: 'firstBig is the first price over 40, using find()', check: all(variableEquals('firstBig', 45), usesMethod(/\.find\(/)) },
        { text: 'Log cheap', check: logged('[12, 8, 5]', 'Log the cheap array: console.log(cheap);') },
        { text: 'prices itself is unchanged', check: variableEquals('prices', [12, 45, 8, 99, 23, 5]) },
      ],
      hints: [
        'const withShipping = prices.map((p) => p + 5);',
        'filter keeps an item when its function returns true: prices.filter((p) => p < 20).',
        'find returns the item itself: prices.find((p) => p > 40).',
      ],
      solution: '',
      solutionJs: `const prices = [12, 45, 8, 99, 23, 5];

// Add €5 shipping to every price
const withShipping = prices.map((p) => p + 5);

const cheap = prices.filter((p) => p < 20);
const firstBig = prices.find((p) => p > 40);

console.log(cheap);
`,
    },
    {
      id: 'js-data-reduce-sort',
      title: 'reduce and sort',
      explanation: `\`reduce\` boils an array down to **one value**. Its function gets the running result (the *accumulator*) and
the current item, and returns the new running result. The second argument is the starting value:

\`\`\`js
const nums = [5, 10, 20];
const total = nums.reduce((sum, n) => sum + n, 0);   // 0+5 → 5+10 → 15+20 → 35
console.log(total);
\`\`\`

\`sort\` puts items in order, with two traps:

\`\`\`js
const nums = [10, 9, 100, 1];
console.log([...nums].sort());                  // [1, 10, 100, 9] — compared as text!
console.log([...nums].sort((a, b) => a - b));   // [1, 9, 10, 100] — smallest first
console.log([...nums].sort((a, b) => b - a));   // [100, 10, 9, 1] — largest first
\`\`\`

1. Without a **compare function**, \`sort\` compares items as strings. For numbers, pass \`(a, b) => a - b\`:
   a negative result puts \`a\` first, a positive one puts \`b\` first.
2. \`sort\` **changes the original array**. To keep it, sort a copy: \`[...nums].sort(...)\`
   (the \`...\` copies it — more on that soon), or use \`nums.toSorted(...)\`, which returns a new array.`,
      starterCode: '',
      starterJs: `const scores = [72, 95, 8, 100, 64];

let total = 0;
for (const s of scores) {
  total += s;
}

// Highest score first
const ranked = scores.sort();
console.log(ranked);
`,
      tasks: [
        { text: 'Compute total (339) with reduce()', check: all(variableEquals('total', 339), usesMethod(/\.reduce\(/)) },
        { text: 'Declare average as total divided by the number of scores (67.8)', check: all(variableEquals('average', 67.8), codeMatches(/\.length/, 'Divide by scores.length, not a typed-in 5.')) },
        {
          text: 'ranked is the scores from highest to lowest, using a compare function',
          check: all(
            variableEquals('ranked', [100, 95, 72, 64, 8]),
            codeMatches(/(sort|toSorted)\(\s*(\(\s*\w+\s*,\s*\w+\s*\)\s*=>|function)/, 'Pass a compare function to sort, like (a, b) => b - a.'),
          ),
        },
        { text: "scores keeps its original order (don't sort it in place)", check: variableEquals('scores', [72, 95, 8, 100, 64], 'scores was changed: sort a copy ([...scores].sort(...)) or use toSorted.') },
        { text: 'Log ranked', check: logged('[100, 95, 72, 64, 8]') },
      ],
      hints: [
        'const total = scores.reduce((sum, s) => sum + s, 0);',
        'b - a sorts largest first: [...scores].sort((a, b) => b - a)',
      ],
      solution: '',
      solutionJs: `const scores = [72, 95, 8, 100, 64];

const total = scores.reduce((sum, s) => sum + s, 0);
const average = total / scores.length;

// Highest score first
const ranked = [...scores].sort((a, b) => b - a);
console.log(ranked);
`,
    },
    {
      id: 'js-data-objects',
      title: 'Objects',
      explanation: `An **object** groups related values under names (its *properties*), in curly braces:

\`\`\`js
const user = {
  name: 'Ada',
  age: 36,
  languages: ['en', 'fr'],          // values can be arrays…
  address: { city: 'London' },      // …or other objects
};

console.log(user.name);              // Ada      — dot notation
console.log(user['age']);            // 36       — bracket notation, with a string
console.log(user.address.city);      // London   — nested data
console.log(user.languages[1]);      // fr

user.email = 'ada@example.com';      // add (or change) a property
\`\`\`

Use **brackets** when the property name is in a variable: \`const key = 'age'; user[key]\` is 36
(\`user.key\` would look for a property literally called "key").

Real data is often an **array of objects**, which pairs well with \`map\` and \`filter\`:

\`\`\`js
const users = [{ name: 'Ada', age: 36 }, { name: 'Linus', age: 54 }];
console.log(users.map((u) => u.name));   // ['Ada', 'Linus']
\`\`\`

To loop over an object's own properties: \`Object.keys(obj)\` gives the names, \`Object.values(obj)\` the values
and \`Object.entries(obj)\` \`[name, value]\` pairs.`,
      starterCode: '',
      starterJs: `const book = {
  title: 'Dune',
  author: 'Frank Herbert',
  year: 1965,
  tags: ['sci-fi', 'classic'],
};

const library = [
  book,
  { title: 'Neuromancer', author: 'William Gibson', year: 1984, tags: ['cyberpunk'] },
  { title: 'Emma', author: 'Jane Austen', year: 1815, tags: ['classic', 'romance'] },
];

const field = 'year';

// Your code here
`,
      tasks: [
        { text: "Log the book's author with dot notation", check: all(logged('Frank Herbert'), codeMatches(/book\.author/, 'Use book.author.')) },
        {
          text: 'After the object, add a pages property set to 412',
          check: all(
            check((h) => ((h.get('book') as { pages?: number } | undefined)?.pages === 412 ? true : 'book.pages should be 412.')),
            codeMatches(/book\.pages\s*=/, 'Add it with an assignment: book.pages = 412;'),
          ),
        },
        { text: 'Declare value as the book property named by field, using brackets', check: all(variableEquals('value', 1965), codeMatches(/book\[\s*field\s*\]/, 'Use book[field].')) },
        { text: "Log the book's second tag (classic) from the nested array", check: all(logged('classic'), codeMatches(/book\.tags\[\s*1\s*\]/, 'Use book.tags[1].')) },
        { text: 'Declare titles: an array of every title in library, using map', check: all(variableEquals('titles', ['Dune', 'Neuromancer', 'Emma']), usesMethod(/\.map\(/)) },
      ],
      hints: [
        'book.pages = 412; works even though book is a const: you change the object, not the variable.',
        'book.field would look for a property called "field". Use book[field] instead.',
        'const titles = library.map((b) => b.title);',
      ],
      solution: '',
      solutionJs: `const book = {
  title: 'Dune',
  author: 'Frank Herbert',
  year: 1965,
  tags: ['sci-fi', 'classic'],
};

const library = [
  book,
  { title: 'Neuromancer', author: 'William Gibson', year: 1984, tags: ['cyberpunk'] },
  { title: 'Emma', author: 'Jane Austen', year: 1815, tags: ['classic', 'romance'] },
];

const field = 'year';

console.log(book.author);
book.pages = 412;
const value = book[field];
console.log(book.tags[1]);

const titles = library.map((b) => b.title);
`,
    },
    {
      id: 'js-data-destructuring',
      title: 'Destructuring',
      explanation: `**Destructuring** pulls values out of arrays and objects into variables in one line.

\`\`\`js
const user = { name: 'Ada', age: 36, address: { city: 'London' } };

const { name, age } = user;               // same as: const name = user.name; const age = user.age;
const { city: town } = user.address;     // take city, but call the variable town
const { country = 'UK' } = user;         // a default when the property is missing

const rgb = [255, 128, 0];
const [red, green] = rgb;                 // arrays go by position: red = 255, green = 128

console.log(name, age, town, country, red, green);
\`\`\`

It works in **function parameters** too, which makes "options objects" easy to read:

\`\`\`js
function greet({ name, age }) {
  return \`Hi \${name}, you are \${age}\`;
}
console.log(greet({ name: 'Ada', age: 36 }));
\`\`\``,
      starterCode: '',
      starterJs: `const user = { name: 'Ada', email: 'ada@example.com', address: { city: 'London' } };
const point = [3, 7];

// Rewrite these four lines with destructuring
const name = user.name;
const email = user.email;
const x = point[0];
const y = point[1];

function describe(person) {
  return \`\${person.name} is \${person.age}\`;
}

console.log(describe({ name: 'Linus', age: 54 }));
`,
      tasks: [
        {
          text: 'Get name and email from user with object destructuring',
          check: all(
            variableEquals('name', 'Ada'),
            variableEquals('email', 'ada@example.com'),
            codeMatches(/const\s*\{[^}]*\bname\b[^}]*\}\s*=\s*user\b/, 'Write const { name, email } = user;'),
          ),
        },
        { text: 'Get x and y from point with array destructuring', check: all(variableEquals('x', 3), variableEquals('y', 7), codeMatches(/\[\s*x\s*,\s*y\s*\]\s*=\s*point/, 'Write const [x, y] = point;')) },
        {
          text: 'Declare town (London) by destructuring city from user.address and renaming it',
          check: all(variableEquals('town', 'London'), codeMatches(/\{\s*city\s*:\s*town\s*\}/, 'Rename while destructuring: const { city: town } = user.address;')),
        },
        {
          text: 'describe destructures { name, age } right in its parameter',
          check: all(returns('describe', [{ name: 'Linus', age: 54 }], 'Linus is 54'), codeMatches(/describe\s*(=\s*)?\(\s*\{/, 'Write the parameter as { name, age }.')),
        },
      ],
      hints: [
        'Object destructuring uses the property names: const { name, email } = user;',
        'Inside describe, use name and age directly: function describe({ name, age }) { ... }',
      ],
      solution: '',
      solutionJs: `const user = { name: 'Ada', email: 'ada@example.com', address: { city: 'London' } };
const point = [3, 7];

const { name, email } = user;
const [x, y] = point;
const { city: town } = user.address;

function describe({ name, age }) {
  return \`\${name} is \${age}\`;
}

console.log(describe({ name: 'Linus', age: 54 }));
`,
    },
    {
      id: 'js-data-spread-rest',
      title: 'Spread and rest',
      explanation: `The three dots \`...\` **spread** an array or object out into its items:

\`\`\`js
const a = [1, 2];
const b = [3, 4];
const both = [...a, ...b, 5];      // [1, 2, 3, 4, 5]
const copy = [...a];               // a new array with the same items
console.log(Math.max(...both));    // 5 — like Math.max(1, 2, 3, 4, 5)

const base = { size: 'M', color: 'red' };
const shirt = { ...base, color: 'blue' };   // { size: 'M', color: 'blue' } — later properties win
console.log(both, copy, shirt);
\`\`\`

Why copy? Assigning an array or object **doesn't copy it**: \`const c = a;\` gives the *same* array a second
name, so \`c.push(9)\` changes \`a\` too.

In a function's parameters, \`...\` does the opposite: it **collects** the rest of the arguments into an array.

\`\`\`js
function average(...nums) {
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}
console.log(average(2, 4, 9));   // 5
\`\`\``,
      starterCode: '',
      starterJs: `const fruits = ['apple', 'pear'];
const veggies = ['carrot', 'leek'];
const defaults = { theme: 'light', fontSize: 14, sound: true };
const userPrefs = { theme: 'dark' };

// Rewrite with spread
const basket = fruits.concat(veggies);

// A copy we can change without touching fruits... or is it?
const fruitsCopy = fruits;
fruitsCopy.push('plum');

// defaults, overridden by userPrefs
const settings = defaults;

// Should add up any number of arguments
function sum(a, b) {
  return a + b;
}
`,
      tasks: [
        { text: 'basket joins fruits and veggies using spread', check: all(variableEquals('basket', ['apple', 'pear', 'carrot', 'leek']), codeMatches(/\.\.\.\s*fruits/, 'Build basket with [...fruits, ...veggies].')) },
        {
          text: 'fruitsCopy is a real copy: after the push, fruits is still apple and pear',
          check: all(variableEquals('fruitsCopy', ['apple', 'pear', 'plum']), variableEquals('fruits', ['apple', 'pear'], 'fruits changed too: fruitsCopy is the same array. Copy it with [...fruits].')),
        },
        {
          text: 'settings merges defaults with userPrefs (theme dark, the rest from defaults)',
          check: all(
            variableEquals('settings', { theme: 'dark', fontSize: 14, sound: true }),
            variableEquals('defaults', { theme: 'light', fontSize: 14, sound: true }, "defaults shouldn't change: spread both into a new object."),
            codeMatches(/\.\.\.\s*defaults/, 'Use { ...defaults, ...userPrefs }.'),
          ),
        },
        {
          text: 'sum takes any number of arguments with a rest parameter',
          check: all(returns('sum', [1, 2, 3, 4], 10), returns('sum', [5], 5), returns('sum', [], 0), codeMatches(/sum\s*(=\s*)?\(\s*\.\.\.\s*\w+/, 'Write the parameter as ...numbers.')),
        },
      ],
      hints: [
        'const basket = [...fruits, ...veggies];  and  const fruitsCopy = [...fruits];',
        'Order matters when merging: { ...defaults, ...userPrefs } lets userPrefs win.',
        'function sum(...numbers) { return numbers.reduce((s, n) => s + n, 0); }',
      ],
      solution: '',
      solutionJs: `const fruits = ['apple', 'pear'];
const veggies = ['carrot', 'leek'];
const defaults = { theme: 'light', fontSize: 14, sound: true };
const userPrefs = { theme: 'dark' };

const basket = [...fruits, ...veggies];

const fruitsCopy = [...fruits];
fruitsCopy.push('plum');

const settings = { ...defaults, ...userPrefs };

function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
`,
    },
  ],
  challenge: {
    id: 'js-data-challenge',
    title: 'Shop report',
    difficulty: 2,
    summary: 'Crunch an online shop’s orders into totals, a best seller and a sorted report.',
    explanation: `You run a small online shop selling computer gear. The orders are in an array of objects; turn them into a report.

1. Write a function **\`orderTotal(order)\`** that returns \`price * qty\` for one order.
2. Declare **\`revenue\`**: the total of all orders, computed with \`reduce\` (it's 461).
3. Write a function **\`totalsByCustomer(orders)\`** that returns an object with how much each customer spent,
   e.g. \`{ Ada: 248, Linus: 58, Grace: 155 }\`. It must work for any list of orders.
4. Declare **\`topProduct\`**: the name of the product that sold the most **units** (add up \`qty\` per product).
5. Print one line per customer, **biggest spender first**, with two decimals:

\`\`\`
Ada: €248.00
Grace: €155.00
Linus: €58.00
\`\`\`

Don't change the \`orders\` array. \`Object.entries(obj)\` turns an object into \`[key, value]\` pairs you can sort.`,
    starterCode: '',
    starterJs: `const orders = [
  { id: 1, customer: 'Ada', product: 'Keyboard', price: 49, qty: 1 },
  { id: 2, customer: 'Linus', product: 'Mouse', price: 19, qty: 2 },
  { id: 3, customer: 'Ada', product: 'Monitor', price: 189, qty: 1 },
  { id: 4, customer: 'Grace', product: 'Mouse', price: 19, qty: 3 },
  { id: 5, customer: 'Linus', product: 'Cable', price: 5, qty: 4 },
  { id: 6, customer: 'Grace', product: 'Keyboard', price: 49, qty: 2 },
  { id: 7, customer: 'Ada', product: 'Cable', price: 5, qty: 2 },
];

function orderTotal(order) {
  // TODO
}

// revenue, totalsByCustomer, topProduct and the report go here.
`,
    tasks: [
      { text: 'orderTotal(order) returns price × qty', check: all(returns('orderTotal', [{ price: 19, qty: 3 }], 57), returns('orderTotal', [{ price: 5, qty: 1 }], 5)) },
      { text: 'revenue is the total of all orders (461), using reduce', check: all(variableEquals('revenue', 461), usesMethod(/\.reduce\(/)) },
      {
        text: 'totalsByCustomer(orders) returns how much each customer spent',
        check: all(
          returns(
            'totalsByCustomer',
            [
              [
                { customer: 'Zoe', product: 'Mouse', price: 2, qty: 3 },
                { customer: 'Sam', product: 'Cable', price: 1, qty: 1 },
                { customer: 'Zoe', product: 'Cable', price: 5, qty: 1 },
              ],
            ],
            { Zoe: 11, Sam: 1 },
          ),
          check((h) => {
            const fn = h.get('totalsByCustomer') as (o: unknown) => unknown;
            const got = fn(h.get('orders'));
            return h.equal(got, { Ada: 248, Linus: 58, Grace: 155 }) || `totalsByCustomer(orders) returned ${h.inspect(got)}, expected { Ada: 248, Linus: 58, Grace: 155 }.`;
          }),
        ),
      },
      { text: "topProduct is the product with the most units sold ('Cable', 6 units)", check: variableEquals('topProduct', 'Cable') },
      { text: 'The report lists customers from biggest spender to smallest', check: loggedInOrder(['Ada: €248.00', 'Grace: €155.00', 'Linus: €58.00']) },
      {
        text: 'The report is sorted with sort() and a compare function, and orders is left unchanged',
        check: all(
          codeMatches(/(sort|toSorted)\(\s*(\(\s*[\w[\]\s,]+\)\s*=>|function)/, 'Sort the customers with a compare function.'),
          check((h) => {
            const orders = h.get('orders') as { id: number }[];
            return (orders.length === 7 && orders.every((o, i) => o.id === i + 1)) || 'The orders array was changed: work on copies.';
          }),
        ),
      },
      { text: 'No var', check: noVar() },
    ],
    hints: [
      'revenue: orders.reduce((sum, o) => sum + orderTotal(o), 0)',
      'totalsByCustomer: start reduce with {} and add to totals[o.customer] (it starts undefined, so use (totals[o.customer] ?? 0) + ...).',
      'For the report: Object.entries(totals) gives [["Ada", 248], ...]. Sort with (a, b) => b[1] - a[1], then log each pair.',
    ],
    solution: '',
    solutionJs: `const orders = [
  { id: 1, customer: 'Ada', product: 'Keyboard', price: 49, qty: 1 },
  { id: 2, customer: 'Linus', product: 'Mouse', price: 19, qty: 2 },
  { id: 3, customer: 'Ada', product: 'Monitor', price: 189, qty: 1 },
  { id: 4, customer: 'Grace', product: 'Mouse', price: 19, qty: 3 },
  { id: 5, customer: 'Linus', product: 'Cable', price: 5, qty: 4 },
  { id: 6, customer: 'Grace', product: 'Keyboard', price: 49, qty: 2 },
  { id: 7, customer: 'Ada', product: 'Cable', price: 5, qty: 2 },
];

function orderTotal(order) {
  return order.price * order.qty;
}

const revenue = orders.reduce((sum, o) => sum + orderTotal(o), 0);

function totalsByCustomer(list) {
  return list.reduce((totals, o) => {
    totals[o.customer] = (totals[o.customer] ?? 0) + orderTotal(o);
    return totals;
  }, {});
}

const unitsByProduct = orders.reduce((units, o) => {
  units[o.product] = (units[o.product] ?? 0) + o.qty;
  return units;
}, {});
const [topProduct] = Object.entries(unitsByProduct).sort((a, b) => b[1] - a[1])[0];

const report = Object.entries(totalsByCustomer(orders)).sort((a, b) => b[1] - a[1]);
for (const [customer, spent] of report) {
  console.log(\`\${customer}: €\${spent.toFixed(2)}\`);
}
`,
  },
};
