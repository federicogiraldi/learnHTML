import type { Module } from '../types';
import { all, check, codeMatches, declaredWith, logged, loggedInOrder, noVar, variableEquals } from '../../engine/jsChecks';

export const basics: Module = {
  id: 'js-basics',
  title: 'JavaScript Basics',
  description: 'Print to the console, store values in variables, and work with numbers and text.',
  lessons: [
    {
      id: 'js-basics-console',
      title: 'Hello, console',
      explanation: `JavaScript is the language that makes web pages *do* things. Before touching the page, we'll use the
**console**: a panel where your code can print messages. It's where developers look first when something goes wrong.

\`\`\`js
console.log('Hello, world!');
console.log(42);
console.log('Two plus two is', 2 + 2);
\`\`\`

- \`console.log(...)\` prints whatever you give it. Separate several values with commas.
- Text goes in quotes: \`'single'\` or \`"double"\` — both work. Numbers don't need quotes.
- Each statement ends with a semicolon \`;\`.

Press **Run** (or Ctrl+Enter) to run your code; the output shows up in the **Console** panel.`,
      starterCode: '',
      starterJs: `// Print your first message below.
`,
      tasks: [
        { text: "Log the text Hello, world!", check: logged('Hello, world!', 'Log exactly: Hello, world!') },
        { text: 'Log the number 2026', check: logged('2026') },
        { text: 'Log the result of 7 * 6 (let JavaScript do the maths)', check: all(logged('42'), codeMatches(/7\s*\*\s*6/, 'Write the calculation 7 * 6 in your code.')) },
      ],
      hints: [
        "Text needs quotes: console.log('Hello, world!');",
        'For the maths, put the expression inside the parentheses: console.log(7 * 6);',
      ],
      solution: '',
      solutionJs: `console.log('Hello, world!');
console.log(2026);
console.log(7 * 6);
`,
    },
    {
      id: 'js-basics-variables',
      title: 'Variables: let and const',
      explanation: `A **variable** is a name for a value, so you can use it later.

\`\`\`js
const name = 'Ada';   // const: this name always refers to the same value
let score = 0;        // let: the value can change later

score = score + 10;   // reassign: no let/const the second time
console.log(name, score);   // Ada 10
\`\`\`

- Use **\`const\`** by default. Switch to **\`let\`** only when you need to reassign the variable.
- Reassigning a \`const\` is an error: \`TypeError: Assignment to constant variable.\`
- You may see the old keyword **\`var\`** in tutorials. It has confusing scoping rules — don't use it.
- Names are case-sensitive and usually written in *camelCase*: \`firstName\`, \`totalPrice\`.`,
      starterCode: '',
      starterJs: `var city = 'Rome';
var lives = 3;

console.log(city, lives);
`,
      tasks: [
        { text: 'Declare city with const (its value never changes)', check: declaredWith('city', 'const') },
        { text: 'Declare lives with let', check: declaredWith('lives', 'let') },
        { text: 'After the declarations, reduce lives by one, so it ends up as 2', check: all(variableEquals('lives', 2), codeMatches(/lives\s*(=|-=|--)/, 'Change lives with an assignment, not by editing the 3.')) },
        { text: 'Log city and lives after the change', check: logged('Rome 2', 'Log both values after changing lives: console.log(city, lives);') },
        { text: "Don't use var anywhere", check: noVar() },
      ],
      hints: [
        'Replace each var with const or let.',
        'lives = lives - 1; (or lives--) changes the value. It must come before the console.log.',
      ],
      solution: '',
      solutionJs: `const city = 'Rome';
let lives = 3;

lives = lives - 1;

console.log(city, lives);
`,
    },
    {
      id: 'js-basics-types',
      title: 'Types of values',
      explanation: `Every value has a **type**. The basic ones:

| Type | Examples |
|---|---|
| string | \`'hello'\`, \`"42"\` (in quotes: it's text!) |
| number | \`42\`, \`3.14\`, \`-7\` |
| boolean | \`true\`, \`false\` |
| undefined | a variable with no value yet |
| null | "intentionally empty" |

\`typeof\` tells you the type of a value:

\`\`\`js
console.log(typeof 'hi');     // string
console.log(typeof 42);       // number
console.log(typeof '42');     // string — quotes make it text
console.log(typeof true);     // boolean
\`\`\`

Converting is common when reading text from a form: \`Number('42')\` gives the number 42,
\`String(42)\` the text \`'42'\`.`,
      starterCode: '',
      starterJs: `const title = 'The Hobbit';
const pages = '310';
const available = 'yes';

console.log(typeof pages);
`,
      tasks: [
        { text: 'Make pages a number (310), not a string', check: variableEquals('pages', 310) },
        { text: 'Make available the boolean true', check: variableEquals('available', true) },
        { text: 'Keep title as the string The Hobbit', check: variableEquals('title', 'The Hobbit') },
        { text: 'The console shows that pages is a number', check: logged('number', 'Log typeof pages — it should print number.') },
      ],
      hints: ['Remove the quotes around 310.', "true and false are keywords: no quotes, otherwise they're strings."],
      solution: '',
      solutionJs: `const title = 'The Hobbit';
const pages = 310;
const available = true;

console.log(typeof pages);
`,
    },
    {
      id: 'js-basics-operators',
      title: 'Operators',
      explanation: `JavaScript does maths with the usual operators, plus a few handy ones:

\`\`\`js
console.log(10 + 3);   // 13
console.log(10 - 3);   // 7
console.log(10 * 3);   // 30
console.log(10 / 4);   // 2.5
console.log(10 % 3);   // 1  — the remainder of the division
console.log(2 ** 3);   // 8  — power

let count = 5;
count += 2;   // same as count = count + 2  → 7
count++;      // add one → 8
\`\`\`

Careful: \`+\` also **joins strings**. \`'5' + 3\` is \`'53'\`, not 8! Convert text with \`Number()\` first.

Brackets work as in maths: \`(2 + 3) * 4\` is 20.`,
      starterCode: '',
      starterJs: `const price = 4.5;
const quantity = 3;
const typed = '2';   // what a user typed in a form: text!

const total = 0;
const extra = typed + 1;
`,
      tasks: [
        { text: 'total is price times quantity (13.5)', check: all(variableEquals('total', 13.5), codeMatches(/price\s*\*\s*quantity|quantity\s*\*\s*price/, 'Compute total from price and quantity.')) },
        { text: 'extra is the number 3: convert typed with Number() before adding', check: all(variableEquals('extra', 3), codeMatches(/Number\(\s*typed\s*\)/, 'Use Number(typed).')) },
        { text: 'Declare remainder as 17 % 5 and log it (2)', check: all(variableEquals('remainder', 2), codeMatches(/17\s*%\s*5/, 'Use the % operator.'), logged('2')) },
      ],
      hints: ["typed + 1 joins the text '2' and 1 into '21'. Number(typed) + 1 is 3.", 'const remainder = 17 % 5;'],
      solution: '',
      solutionJs: `const price = 4.5;
const quantity = 3;
const typed = '2';   // what a user typed in a form: text!

const total = price * quantity;
const extra = Number(typed) + 1;

const remainder = 17 % 5;
console.log(remainder);
`,
    },
    {
      id: 'js-basics-templates',
      title: 'Template strings',
      explanation: `Building text out of variables with \`+\` gets messy fast:

\`\`\`js
const name = 'Ada';
const age = 36;
console.log('My name is ' + name + ' and I am ' + age + '.');
\`\`\`

**Template strings** use backticks (\`\` \` \`\`) and \`\${...}\` to drop values right into the text:

\`\`\`js
const name = 'Ada';
const age = 36;
console.log(\`My name is \${name} and I am \${age}.\`);
console.log(\`Next year I'll be \${age + 1}.\`);   // any expression works inside \${}
\`\`\`

Template strings can also span several lines. For prices, \`toFixed(2)\` shows two decimals:
\`(4.5).toFixed(2)\` is \`'4.50'\`.`,
      starterCode: '',
      starterJs: `const product = 'Coffee';
const price = 2.5;
const cups = 3;

const line = product + ' x' + cups + ' = ' + price * cups;
console.log(line);
`,
      tasks: [
        { text: 'Rewrite line as a template string', check: codeMatches(/line\s*=\s*`[^`]*\$\{/, 'Assign a template string (backticks with ${...}) to line.') },
        { text: 'line reads Coffee x3 = €7.50 (two decimals, with the € sign)', check: variableEquals('line', 'Coffee x3 = €7.50') },
        { text: 'Log line', check: logged('Coffee x3 = €7.50') },
      ],
      hints: ['const line = `${product} x${cups} = ...`;', 'The amount is (price * cups).toFixed(2), inside ${}.'],
      solution: '',
      solutionJs: `const product = 'Coffee';
const price = 2.5;
const cups = 3;

const line = \`\${product} x\${cups} = €\${(price * cups).toFixed(2)}\`;
console.log(line);
`,
    },
  ],
  challenge: {
    id: 'js-basics-challenge',
    title: 'Receipt printer',
    difficulty: 1,
    summary: 'Compute a café bill and print a tidy receipt to the console.',
    explanation: `A café needs a tiny receipt printer. The order is already in variables. Compute the bill and print it.

Print exactly these four lines, in this order (prices always with two decimals and a € sign):

\`\`\`
Espresso x2: €3.60
Croissant x3: €4.50
Subtotal: €8.10
Total with 10% tip: €8.91
\`\`\`

Use \`const\` for values that don't change, template strings for the lines, and let JavaScript do the maths:
your code must still work if a price changes.`,
    starterCode: '',
    starterJs: `const espressoPrice = 1.8;
const espressos = 2;
const croissantPrice = 1.5;
const croissants = 3;
const tipPercent = 10;

// Compute the subtotal and total, then print the receipt.
`,
    tasks: [
      { text: 'The four receipt lines are printed in order', check: loggedInOrder(['Espresso x2: €3.60', 'Croissant x3: €4.50', 'Subtotal: €8.10', 'Total with 10% tip: €8.91']) },
      { text: 'A variable subtotal holds the subtotal as a number', check: check((h) => (Math.abs(Number(h.get('subtotal')) - 8.1) < 1e-9 && typeof h.get('subtotal') === 'number' ? true : 'Store the subtotal (a number, 8.1) in a variable called subtotal.')) },
      { text: 'The amounts are calculated from the variables, not typed in', check: codeMatches(/espressoPrice\s*\*\s*espressos|espressos\s*\*\s*espressoPrice/, 'Compute the espresso line from espressoPrice and espressos.') },
      { text: 'Lines are built with template strings', check: codeMatches(/`[^`]*\$\{[^`]*`/, 'Use template strings (backticks and ${...}).') },
      { text: 'No var', check: noVar() },
    ],
    hints: [
      'const subtotal = espressoPrice * espressos + croissantPrice * croissants;',
      'The total is subtotal * (1 + tipPercent / 100). Format any amount with .toFixed(2).',
    ],
    solution: '',
    solutionJs: `const espressoPrice = 1.8;
const espressos = 2;
const croissantPrice = 1.5;
const croissants = 3;
const tipPercent = 10;

const espressoCost = espressoPrice * espressos;
const croissantCost = croissantPrice * croissants;
const subtotal = espressoCost + croissantCost;
const total = subtotal * (1 + tipPercent / 100);

console.log(\`Espresso x\${espressos}: €\${espressoCost.toFixed(2)}\`);
console.log(\`Croissant x\${croissants}: €\${croissantCost.toFixed(2)}\`);
console.log(\`Subtotal: €\${subtotal.toFixed(2)}\`);
console.log(\`Total with \${tipPercent}% tip: €\${total.toFixed(2)}\`);
`,
  },
};
