import type { Module } from '../types';
import { all, check, codeMatches, codeNotMatches, definesFunction, logged, loggedInOrder, noVar, returns, variableEquals } from '../../engine/jsChecks';

export const functions: Module = {
  id: 'js-functions',
  title: 'Functions',
  description: 'Package code into reusable functions that take parameters, return results and keep their variables to themselves.',
  lessons: [
    {
      id: 'js-functions-declarations',
      title: 'Declaring functions',
      explanation: `A **function** is a named block of code you can run (*call*) as many times as you like.
Write the code once, use it everywhere:

\`\`\`js
function sayHi(name) {
  console.log('Hi, ' + name + '!');
}

sayHi('Ada');     // Hi, Ada!
sayHi('Grace');   // Hi, Grace!
\`\`\`

- \`function\` + a name + **parameters** in parentheses + the body in \`{ }\`.
- Declaring a function doesn't run it. **Calling** it, with \`name(...)\`, does.
- The values you pass when calling (\`'Ada'\`) are the **arguments**; inside, the parameter \`name\` holds them.
- Function names are verbs in camelCase: \`showMenu\`, \`addToCart\`.`,
      starterCode: '',
      starterJs: `// The same line, copied three times. Turn it into a function!
console.log('Hello, Ada!');
console.log('Hello, Grace!');
console.log('Hello, Linus!');
`,
      tasks: [
        { text: 'Declare a function greet(name) with the function keyword', check: all(definesFunction('greet'), codeMatches(/\bfunction\s+greet\s*\(\s*\w+\s*\)/, 'Declare it as function greet(name) { ... }.')) },
        {
          text: 'greet(name) logs Hello, <name>!',
          check: check((h) => {
            const greet = h.get('greet');
            if (typeof greet !== 'function') return 'Define a function called greet.';
            const before = h.logs.length;
            greet('Zoe');
            return h.logs.slice(before).some((l) => l.text === 'Hello, Zoe!') ? true : "greet('Zoe') should log Hello, Zoe!";
          }),
        },
        { text: 'Call greet three times, for Ada, Grace and Linus', check: all(loggedInOrder(['Hello, Ada!', 'Hello, Grace!', 'Hello, Linus!']), codeMatches(/(\bgreet\s*\([\s\S]*){4}/, 'Call greet three times instead of logging directly.')) },
        { text: 'Only one console.log is left, inside greet', check: codeNotMatches(/console\.log[\s\S]*console\.log/, 'Keep a single console.log, inside the function.') },
      ],
      hints: [
        'function greet(name) { console.log(`Hello, ${name}!`); }',
        "Then call it: greet('Ada'); greet('Grace'); greet('Linus');",
      ],
      solution: '',
      solutionJs: `function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('Ada');
greet('Grace');
greet('Linus');
`,
    },
    {
      id: 'js-functions-return',
      title: 'Returning values',
      explanation: `\`console.log\` only *shows* a value. To give a value **back** to the code that called the function, use **\`return\`**:

\`\`\`js
function double(n) {
  return n * 2;
}

const result = double(5) + 1;   // double(5) is replaced by 10
console.log(result);            // 11
\`\`\`

- \`return\` ends the function immediately: lines after it don't run.
- A function without \`return\` (or with a bare \`return;\`) gives back \`undefined\`.
- Prefer functions that **return** results over functions that print them: a returned value can be logged,
  stored, compared or passed to another function.`,
      starterCode: '',
      starterJs: `function square(n) {
  console.log(n * n);
}

function area(width, height) {
  width * height;
}

const total = square(3) + area(2, 5);
console.log(total);
`,
      tasks: [
        { text: 'square(n) returns n squared', check: all(returns('square', [3], 9), returns('square', [-4], 16)) },
        { text: 'area(width, height) returns width times height', check: all(returns('area', [2, 5], 10), returns('area', [3, 7], 21)) },
        { text: 'total is 19', check: variableEquals('total', 19, 'total should be 19 (9 + 10). Do both functions return their result?') },
        { text: 'The console shows 19 (and nothing else)', check: all(logged('19'), check((h) => (h.logs.length === 1 ? true : 'Only log total: square should return its result, not print it.'))) },
      ],
      hints: [
        'Replace console.log(n * n) with return n * n;',
        'Computing width * height is not enough: you have to return it.',
      ],
      solution: '',
      solutionJs: `function square(n) {
  return n * n;
}

function area(width, height) {
  return width * height;
}

const total = square(3) + area(2, 5);
console.log(total);
`,
    },
    {
      id: 'js-functions-params',
      title: 'Parameters and defaults',
      explanation: `A function can take several parameters, separated by commas. JavaScript doesn't check how many arguments
you pass: a missing argument is simply \`undefined\`, extra ones are ignored.

Give a parameter a **default value** with \`=\`. It's used when the argument is missing (\`undefined\`):

\`\`\`js
function welcome(name, greeting = 'Hello') {
  return \`\${greeting}, \${name}!\`;
}

console.log(welcome('Ada'));          // Hello, Ada!
console.log(welcome('Ada', 'Ciao'));  // Ciao, Ada!
\`\`\`

Arguments are matched by **position**, so parameters with defaults usually go last.
Note that passing \`null\` does *not* trigger the default — only \`undefined\` does.`,
      starterCode: '',
      starterJs: `function formatPrice(amount, currency, decimals) {
  return currency + amount.toFixed(decimals);
}

console.log(formatPrice(5));
console.log(formatPrice(5, '$'));
console.log(formatPrice(3.14159, '£', 3));
`,
      tasks: [
        { text: "currency defaults to '€'", check: returns('formatPrice', [5], '€5.00') },
        { text: 'decimals defaults to 2', check: all(returns('formatPrice', [5, '$'], '$5.00'), returns('formatPrice', [1.5, '€'], '€1.50')) },
        { text: 'Passing all three arguments still works', check: returns('formatPrice', [3.14159, '£', 3], '£3.142') },
        { text: 'Use default parameter values (=) in the parameter list', check: codeMatches(/function\s+formatPrice\s*\([^)]*currency\s*=[^)]*decimals\s*=/, "Write the defaults in the parentheses: (amount, currency = '€', decimals = 2).") },
        { text: 'The console shows €5.00, $5.00 and £3.142', check: loggedInOrder(['€5.00', '$5.00', '£3.142']) },
      ],
      hints: [
        "function formatPrice(amount, currency = '€', decimals = 2) { ... }",
        "Without a default, currency is undefined, and undefined + '5.00' gives 'undefined5.00'.",
      ],
      solution: '',
      solutionJs: `function formatPrice(amount, currency = '€', decimals = 2) {
  return currency + amount.toFixed(decimals);
}

console.log(formatPrice(5));
console.log(formatPrice(5, '$'));
console.log(formatPrice(3.14159, '£', 3));
`,
    },
    {
      id: 'js-functions-arrows',
      title: 'Arrow functions',
      explanation: `**Arrow functions** are a shorter way to write functions, usually stored in a \`const\`:

\`\`\`js
// function declaration
function add(a, b) {
  return a + b;
}

// the same as an arrow function
const addArrow = (a, b) => {
  return a + b;
};

// body is a single expression? Drop the braces and return: it's returned automatically
const addShort = (a, b) => a + b;

// exactly one parameter? The parentheses are optional
const half = n => n / 2;

console.log(addShort(2, 3), half(10));   // 5 5
\`\`\`

Careful: with braces, you still need \`return\`. \`(a, b) => { a + b }\` returns \`undefined\`!

Arrow functions shine for short helpers and callbacks (you'll pass them to other functions soon).
Unlike declarations, they can't be called before the line that defines them.`,
      starterCode: '',
      starterJs: `function double(n) {
  return n * 2;
}

function isEven(n) {
  return n % 2 === 0;
}

function fullName(first, last) {
  return first + ' ' + last;
}

console.log(double(21), isEven(7), fullName('Ada', 'Lovelace'));
`,
      tasks: [
        { text: 'double is an arrow function in the short form (no braces, no return)', check: all(codeMatches(/const\s+double\s*=\s*(\([^)]*\)|\w+)\s*=>\s*[^{\s]/, 'Write it as const double = (n) => n * 2;'), returns('double', [21], 42)) },
        { text: 'isEven is an arrow function', check: all(codeMatches(/const\s+isEven\s*=\s*(\([^)]*\)|\w+)\s*=>/, 'Write it as const isEven = (n) => ...'), returns('isEven', [4], true), returns('isEven', [7], false)) },
        { text: 'fullName is an arrow function', check: all(codeMatches(/const\s+fullName\s*=\s*\([^)]*\)\s*=>/, 'Write it as const fullName = (first, last) => ...'), returns('fullName', ['Ada', 'Lovelace'], 'Ada Lovelace')) },
        { text: 'No function keyword left', check: codeNotMatches(/\bfunction\b/, 'Convert every function to an arrow function.') },
        { text: 'The console shows 42 false Ada Lovelace', check: logged('42 false Ada Lovelace') },
      ],
      hints: [
        'const double = (n) => n * 2;',
        'Define the arrow functions before the console.log line that uses them.',
      ],
      solution: '',
      solutionJs: `const double = (n) => n * 2;

const isEven = (n) => n % 2 === 0;

const fullName = (first, last) => first + ' ' + last;

console.log(double(21), isEven(7), fullName('Ada', 'Lovelace'));
`,
    },
    {
      id: 'js-functions-scope',
      title: 'Scope',
      explanation: `**Scope** decides where a variable can be used.

- A variable declared **outside** any function or block is **global**: usable everywhere.
- A variable declared **inside a function** is **local**: it exists only inside that function.
- \`let\` and \`const\` are **block-scoped**: declared inside \`{ }\` (an \`if\`, a loop…), they vanish at the \`}\`.

\`\`\`js
let score = 0;              // global

function addPoint() {
  score = score + 1;        // no let: changes the global score
  const message = 'Point!'; // local
  return message;
}

addPoint();
console.log(score);         // 1
// console.log(message);    // ReferenceError: message is not defined

if (score > 0) {
  const bonus = 5;          // only exists inside this block
}
\`\`\`

**Shadowing**: declaring a variable with the *same name* inside a function or block creates a **new**,
separate variable that hides the outer one. Changing it leaves the outer variable untouched — a common source of bugs.
To use a value after a block, declare it **before** the block and assign it inside.`,
      starterCode: '',
      starterJs: `let visits = 0;

function addVisit() {
  let visits = 1;   // should add one to the global visits
  return visits;
}

addVisit();
addVisit();
addVisit();
console.log(visits);   // should be 3

const price = 80;
if (price > 50) {
  const discount = 10;
}
const finalPrice = price - discount;   // should be 70
console.log(finalPrice);
`,
      tasks: [
        { text: 'After three calls, the global visits is 3', check: variableEquals('visits', 3, 'visits should be 3. Inside addVisit, update the global variable instead of declaring a new one with let.') },
        { text: 'addVisit() returns the new number of visits', check: returns('addVisit', [], 4, 'Called once more, addVisit() should return 4: increase visits, then return it.') },
        { text: 'finalPrice is 70: declare discount before the if block', check: all(variableEquals('finalPrice', 70), codeMatches(/\blet\s+discount\b/, 'Declare discount with let before the if (e.g. let discount = 0;), then assign it inside.')) },
        { text: 'The console shows 3 and 70', check: loggedInOrder(['3', '70']) },
        { text: "Don't use var", check: noVar() },
      ],
      hints: [
        'In addVisit, write visits = visits + 1; (no let), then return visits;',
        'let discount = 0; before the if, and discount = 10; inside it.',
      ],
      solution: '',
      solutionJs: `let visits = 0;

function addVisit() {
  visits = visits + 1;
  return visits;
}

addVisit();
addVisit();
addVisit();
console.log(visits);   // should be 3

const price = 80;
let discount = 0;
if (price > 50) {
  discount = 10;
}
const finalPrice = price - discount;   // should be 70
console.log(finalPrice);
`,
    },
  ],
  challenge: {
    id: 'js-functions-challenge',
    title: 'The broken toolbox',
    difficulty: 2,
    blind: true,
    summary: 'Six small helper functions, six sneaky bugs. Find and fix them all.',
    explanation: `A teammate wrote a toolbox of helper functions. They all *look* fine, but none of them works.
Here's what each one should do:

- \`average(a, b, c)\` returns the average of three numbers: \`average(2, 4, 9)\` is \`5\`.
- \`isPassing(score)\` returns \`true\` when the score is 60 or more, and \`false\` otherwise (never \`undefined\`).
- \`greet(name, greeting)\` returns \`'Hello, Ada!'\` for \`greet('Ada')\`, and \`'Hi, Ada!'\` for \`greet('Ada', 'Hi')\`.
- \`sumTo(n)\` returns 1 + 2 + … + n: \`sumTo(4)\` is \`10\`.
- \`shippingCost(total)\` returns \`0\` for orders of 50 or more, and \`4.99\` below that.
- \`toCelsius(f)\` converts Fahrenheit to Celsius: \`toCelsius(212)\` is \`100\`.

Fix the bugs without renaming the functions. The requirements are hidden: each one reveals itself once it passes.
Use the console to try the functions out.`,
    starterCode: '',
    starterJs: `function average(a, b, c) {
  return a + b + c / 3;
}

function isPassing(score) {
  if (score >= 60) {
    return true;
  }
}

function greet(name = 'Hello', greeting) {
  return \`\${greeting}, \${name}!\`;
}

function sumTo(n) {
  let total = 0;
  for (let i = 1; i < n; i++) {
    total += i;
  }
  return total;
}

function shippingCost(total) {
  if (total >= 50) {
    let cost = 0;
  } else {
    let cost = 4.99;
  }
  return cost;
}

const toCelsius = (f) => {
  (f - 32) * 5 / 9;
};

console.log(average(2, 4, 9));
`,
    tasks: [
      { text: 'average returns the average of its three arguments', check: all(returns('average', [2, 4, 9], 5), returns('average', [3, 3, 3], 3)) },
      { text: 'isPassing returns true for 60 or more, false below', check: all(returns('isPassing', [60], true), returns('isPassing', [95], true), returns('isPassing', [59], false)) },
      { text: "greet's greeting defaults to 'Hello'", check: all(returns('greet', ['Ada'], 'Hello, Ada!'), returns('greet', ['Ada', 'Hi'], 'Hi, Ada!')) },
      { text: 'sumTo adds every number from 1 to n, n included', check: all(returns('sumTo', [4], 10), returns('sumTo', [1], 1), returns('sumTo', [100], 5050)) },
      { text: 'shippingCost returns 0 from 50 up, 4.99 below', check: all(returns('shippingCost', [50], 0), returns('shippingCost', [120], 0), returns('shippingCost', [20], 4.99)) },
      { text: 'toCelsius converts Fahrenheit to Celsius', check: all(returns('toCelsius', [212], 100), returns('toCelsius', [50], 10)) },
      { text: 'No var', check: noVar('Fix the scope bug with let, not var.') },
    ],
    hints: [
      'Operator precedence: / happens before +. Use parentheses.',
      'A function that reaches its end without return gives undefined. Arrow functions with braces need return too.',
      'A let declared inside an if block disappears at the closing brace. Declare it before the if.',
    ],
    solution: '',
    solutionJs: `function average(a, b, c) {
  return (a + b + c) / 3;
}

function isPassing(score) {
  return score >= 60;
}

function greet(name, greeting = 'Hello') {
  return \`\${greeting}, \${name}!\`;
}

function sumTo(n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
}

function shippingCost(total) {
  let cost;
  if (total >= 50) {
    cost = 0;
  } else {
    cost = 4.99;
  }
  return cost;
}

const toCelsius = (f) => (f - 32) * 5 / 9;

console.log(average(2, 4, 9));
`,
  },
};
