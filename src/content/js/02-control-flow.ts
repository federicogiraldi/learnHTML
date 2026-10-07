import type { Module } from '../types';
import { all, check, codeMatches, codeNotMatches, logged, loggedInOrder, noVar, variableEquals } from '../../engine/jsChecks';

export const controlFlow: Module = {
  id: 'js-control',
  title: 'Control Flow',
  description: 'Make decisions with if, else and switch, compare values correctly, and repeat work with loops.',
  lessons: [
    {
      id: 'js-control-if',
      title: 'if, else if, else',
      explanation: `So far every line of your code ran, top to bottom. With **\`if\`** your code can make decisions:

\`\`\`js
const hour = 15;

if (hour < 12) {
  console.log('Good morning');
} else if (hour < 18) {
  console.log('Good afternoon');
} else {
  console.log('Good evening');
}
\`\`\`

- The **condition** goes in parentheses. If it's true, the block in \`{ }\` runs.
- \`else if\` adds another condition, checked only when the ones above were false.
- \`else\` catches everything that's left. Both are optional.
- Only **one** branch runs: the first whose condition is true. That's why order matters —
  \`hour < 18\` above doesn't need to say "and at least 12".`,
      starterCode: '',
      starterJs: `const temperature = 24;
let advice = '';

// Below 10: 'Take a coat'
// From 10 to 19: 'Take a sweater'
// 20 or more: 'T-shirt weather'
if (temperature < 10) {
  advice = 'Take a coat';
}

console.log(advice);
`,
      tasks: [
        { text: "Add an else if branch for temperatures below 20 that sets advice to 'Take a sweater'", check: all(codeMatches(/\belse\s+if\s*\(/, 'Add an else if (...) { ... } branch after the first if.'), codeMatches(/<\s*20|>=\s*10/, 'The else if condition should check temperature < 20.')) },
        { text: "Add an else branch that sets advice to 'T-shirt weather'", check: codeMatches(/\belse\s*\{/, 'Add a final else { ... } branch.') },
        { text: 'With temperature 24, advice is T-shirt weather', check: variableEquals('advice', 'T-shirt weather') },
        { text: 'Log advice', check: logged('T-shirt weather', 'Keep the console.log(advice) after the if/else.') },
      ],
      hints: [
        "Chain the branches: if (...) { ... } else if (temperature < 20) { ... } else { ... }",
        'Change temperature to 5 or 15 and run again to check the other branches.',
      ],
      solution: '',
      solutionJs: `const temperature = 24;
let advice = '';

// Below 10: 'Take a coat'
// From 10 to 19: 'Take a sweater'
// 20 or more: 'T-shirt weather'
if (temperature < 10) {
  advice = 'Take a coat';
} else if (temperature < 20) {
  advice = 'Take a sweater';
} else {
  advice = 'T-shirt weather';
}

console.log(advice);
`,
    },
    {
      id: 'js-control-comparisons',
      title: 'Comparisons and logic',
      explanation: `Conditions are built from **comparison** operators, which give \`true\` or \`false\`:

| Operator | Meaning |
|---|---|
| \`===\` / \`!==\` | equal / not equal (value **and** type) |
| \`<\` \`>\` \`<=\` \`>=\` | less, greater, less or equal, greater or equal |

Always use **\`===\`**. The loose \`==\` converts types before comparing, with surprising results:
\`'5' == 5\` is \`true\`, \`0 == ''\` is \`true\`. With \`===\`, \`'5' === 5\` is \`false\`: convert first,
then compare.

Combine conditions with **logical** operators:

\`\`\`js
const age = 25;
const member = false;

console.log(age >= 18 && age < 65);   // true:  && is "and" (both must be true)
console.log(member || age < 12);      // false: || is "or" (at least one true)
console.log(!member);                 // true:  ! is "not"
\`\`\`

Use parentheses to make mixed conditions clear: \`hasTicket && (isAdult || withParent)\`.`,
      starterCode: '',
      starterJs: `const age = 18;
const typedAge = '18';   // from a form: a string
const hasTicket = true;
const isBanned = true;

const sameAge = age == typedAge;
const isAdult = age > 18;
const canEnter = hasTicket || !isBanned;

console.log(sameAge, isAdult, canEnter);
`,
      tasks: [
        { text: 'sameAge compares age and typedAge with ===, converting typedAge with Number() first', check: all(codeNotMatches(/[^=!<>]==(?!=)/, 'Replace == with ===.'), codeMatches(/Number\(\s*typedAge\s*\)/, 'Convert typedAge with Number(typedAge) before comparing.'), variableEquals('sameAge', true)) },
        { text: 'isAdult is true for anyone 18 or older', check: all(codeMatches(/age\s*>=\s*18|18\s*<=\s*age/, 'Use >= so that 18 counts as adult.'), variableEquals('isAdult', true)) },
        { text: 'canEnter is true only if the visitor has a ticket and is not banned', check: all(codeMatches(/&&/, 'Both things must be true: use && (and), not ||.'), variableEquals('canEnter', false, 'This visitor is banned, so canEnter should be false.')) },
        { text: 'The console shows true true false', check: logged('true true false') },
      ],
      hints: [
        'Number(typedAge) turns the text into a number, then === compares two numbers.',
        'canEnter = hasTicket && !isBanned;',
      ],
      solution: '',
      solutionJs: `const age = 18;
const typedAge = '18';   // from a form: a string
const hasTicket = true;
const isBanned = true;

const sameAge = age === Number(typedAge);
const isAdult = age >= 18;
const canEnter = hasTicket && !isBanned;

console.log(sameAge, isAdult, canEnter);
`,
    },
    {
      id: 'js-control-truthy',
      title: 'Truthy and falsy',
      explanation: `A condition doesn't have to be a boolean. JavaScript converts any value to true or false. The
**falsy** values (they count as false) you will meet are:

\`false\`, \`0\`, \`''\` (empty string), \`null\`, \`undefined\`, \`NaN\`

Everything else is **truthy**, including \`'0'\`, \`'false'\` and \`' '\` (non-empty strings!).

\`\`\`js
const nickname = '';

if (nickname) {
  console.log('Hi, ' + nickname);
} else {
  console.log('No nickname yet');   // '' is falsy
}

const shown = nickname || 'Anonymous';   // || gives the first truthy value
console.log(shown);                      // Anonymous
\`\`\`

\`if (!value)\` is a short way to say "if it's empty, zero or missing". Careful: it treats \`0\` as missing too.
When 0 is a valid value, compare explicitly (\`count === undefined\`) or use \`??\`, which only falls back on
\`null\` and \`undefined\`.`,
      starterCode: '',
      starterJs: `const username = '';
const cartItems = 0;
const coupon = 'SAVE10';

// 1. displayName: username, or 'guest' if it's empty
const displayName = username;
console.log(\`Hello, \${displayName}\`);

// 2. If cartItems is 0, log 'Your cart is empty'

// 3. If there is a coupon, log 'Coupon applied: SAVE10'
`,
      tasks: [
        { text: "displayName falls back to 'guest' using ||", check: all(codeMatches(/username\s*\|\|/, "Use username || 'guest'."), variableEquals('displayName', 'guest')) },
        { text: 'The greeting reads Hello, guest', check: logged('Hello, guest') },
        { text: "Log 'Your cart is empty' using if (!cartItems)", check: all(codeMatches(/if\s*\(\s*!\s*cartItems\s*\)/, 'Write the condition as if (!cartItems).'), logged('Your cart is empty')) },
        { text: 'Log Coupon applied: SAVE10 using if (coupon)', check: all(codeMatches(/if\s*\(\s*coupon\s*\)/, 'Use the string itself as the condition: if (coupon).'), logged('Coupon applied: SAVE10', 'Log the coupon with a template string: `Coupon applied: ${coupon}`.')) },
      ],
      hints: [
        "const displayName = username || 'guest';",
        '!cartItems is true when cartItems is 0, because 0 is falsy.',
      ],
      solution: '',
      solutionJs: `const username = '';
const cartItems = 0;
const coupon = 'SAVE10';

// 1. displayName: username, or 'guest' if it's empty
const displayName = username || 'guest';
console.log(\`Hello, \${displayName}\`);

// 2. If cartItems is 0, log 'Your cart is empty'
if (!cartItems) {
  console.log('Your cart is empty');
}

// 3. If there is a coupon, log 'Coupon applied: SAVE10'
if (coupon) {
  console.log(\`Coupon applied: \${coupon}\`);
}
`,
    },
    {
      id: 'js-control-switch',
      title: 'switch',
      explanation: `When you compare **one value** against many possible values, \`switch\` reads better than a long
\`else if\` chain:

\`\`\`js
const light = 'yellow';

switch (light) {
  case 'green':
    console.log('Go');
    break;
  case 'yellow':
  case 'orange':          // several cases can share the same code
    console.log('Slow down');
    break;
  default:                // when no case matches
    console.log('Stop');
}
\`\`\`

- \`switch\` compares with \`===\`.
- **\`break\`** ends the switch. Without it, execution *falls through* into the next case's code,
  even if that case doesn't match! A classic bug.
- \`default\` is optional and usually goes last.`,
      starterCode: '',
      starterJs: `const day = 'sat';
let dayType;

switch (day) {
  case 'mon':
  case 'tue':
  case 'wed':
  case 'thu':
  case 'fri':
    dayType = 'weekday';
    break;
  case 'sat':
  case 'sun':
    dayType = 'weekend';
  // Anything else should give 'unknown'.
}

console.log(dayType);
`,
      tasks: [
        { text: "Add a default case that sets dayType to 'unknown'", check: codeMatches(/\bdefault\s*:/, 'Add default: at the end of the switch.') },
        { text: "For 'sat', dayType is still weekend (watch out for fall-through!)", check: all(codeMatches(/\bswitch\s*\(/, 'Keep the switch.'), variableEquals('dayType', 'weekend', "dayType should be 'weekend'. Did the weekend case fall through into default? Add break.")) },
        { text: 'Log dayType', check: logged('weekend') },
      ],
      hints: [
        "default:\n    dayType = 'unknown';",
        "The weekend case needs a break; before default, otherwise 'sat' runs the default code too.",
      ],
      solution: '',
      solutionJs: `const day = 'sat';
let dayType;

switch (day) {
  case 'mon':
  case 'tue':
  case 'wed':
  case 'thu':
  case 'fri':
    dayType = 'weekday';
    break;
  case 'sat':
  case 'sun':
    dayType = 'weekend';
    break;
  default:
    dayType = 'unknown';
}

console.log(dayType);
`,
    },
    {
      id: 'js-control-loops',
      title: 'for and while loops',
      explanation: `Loops repeat code. The **\`for\`** loop is perfect when you know how many times:

\`\`\`js
for (let i = 1; i <= 3; i++) {
  console.log('Lap', i);
}
// Lap 1, Lap 2, Lap 3
\`\`\`

The three parts: **start** (\`let i = 1\`), **condition** checked before each round (\`i <= 3\`),
and **update** after each round (\`i++\`).

A **\`while\`** loop repeats as long as its condition is true — handy when you don't know the count in advance:

\`\`\`js
let balance = 100;
let years = 0;
while (balance < 200) {
  balance = balance * 1.1;
  years++;
}
console.log(years);   // 8
\`\`\`

Make sure the condition eventually becomes false, or the loop never ends (LearnWeb stops it after a few seconds).`,
      starterCode: '',
      starterJs: `// 1. Count down: log 5, 4, 3, 2, 1, then 'Liftoff!'
for (let i = 1; i <= 5; i++) {
  console.log(i);
}

// 2. Add up every number from 1 to 100 into total, with a for loop
let total = 0;

// 3. Start amount at 1 and double it with a while loop until it is at least 1000.
//    Count the doublings in steps.
let amount = 1;
let steps = 0;
`,
      tasks: [
        { text: 'Log 5, 4, 3, 2, 1 and then Liftoff!', check: all(loggedInOrder(['5', '4', '3', '2', '1', 'Liftoff!']), codeMatches(/i--|i\s*-=\s*1/, 'Make the loop count down: start at 5 and use i--.')) },
        { text: 'total is 5050, computed with a for loop', check: all(variableEquals('total', 5050), codeMatches(/total\s*(\+=|=\s*total\s*\+)/, 'Add to total inside a loop: total += i;'), check((h) => ((h.code.match(/\bfor\s*\(/g) || []).length >= 2 ? true : 'Use a second for loop for the sum.'))) },
        { text: 'amount ends at 1024 after 10 steps, using a while loop', check: all(codeMatches(/\bwhile\s*\(/, 'Use a while loop.'), variableEquals('amount', 1024), variableEquals('steps', 10)) },
      ],
      hints: [
        'Count down: for (let i = 5; i >= 1; i--) { ... } and log Liftoff! after the loop.',
        'for (let i = 1; i <= 100; i++) { total += i; }',
        'while (amount < 1000) { amount = amount * 2; steps++; }',
      ],
      solution: '',
      solutionJs: `// 1. Count down: log 5, 4, 3, 2, 1, then 'Liftoff!'
for (let i = 5; i >= 1; i--) {
  console.log(i);
}
console.log('Liftoff!');

// 2. Add up every number from 1 to 100 into total, with a for loop
let total = 0;
for (let i = 1; i <= 100; i++) {
  total += i;
}

// 3. Start amount at 1 and double it with a while loop until it is at least 1000.
//    Count the doublings in steps.
let amount = 1;
let steps = 0;
while (amount < 1000) {
  amount = amount * 2;
  steps++;
}
`,
    },
    {
      id: 'js-control-for-of',
      title: 'for...of, break and continue',
      explanation: `An **array** is a list of values in square brackets: \`[18, 21, 31]\` (more about arrays in the next modules).
**\`for...of\`** visits each item in turn, no counter needed:

\`\`\`js
const prices = [4, 12, 7];
for (const price of prices) {
  console.log(price);
}
\`\`\`

Two keywords control any loop from the inside:

- **\`continue\`** skips the rest of this round and goes to the next item.
- **\`break\`** leaves the loop immediately.

\`\`\`js
for (const price of prices) {
  if (price > 10) continue;   // skip expensive items
  console.log('Cheap:', price);
}
\`\`\``,
      starterCode: '',
      starterJs: `// -999 means the sensor failed: ignore it.
const temps = [18, 21, -999, 31, 24, 33, 19];

// 1. Add up the valid temperatures into sum (for...of + continue)
let sum = 0;

// 2. Store the FIRST temperature of 30 or more in firstHot (stop with break)
let firstHot = null;
for (const t of temps) {
  if (t >= 30) {
    firstHot = t;
  }
}
`,
      tasks: [
        { text: 'sum is 146: loop with for...of and skip -999 with continue', check: all(codeMatches(/for\s*\(\s*(const|let)\s+\w+\s+of\b/, 'Use a for...of loop.'), codeMatches(/\bcontinue\b/, 'Skip the broken reading with continue.'), variableEquals('sum', 146)) },
        { text: 'firstHot is 31: stop the loop with break once you find it', check: all(codeMatches(/\bbreak\b/, 'Leave the loop with break as soon as you find a hot temperature.'), variableEquals('firstHot', 31, 'firstHot should be the first hot value (31), not the last one.')) },
        { text: "Don't use var", check: noVar() },
      ],
      hints: [
        'for (const t of temps) { if (t === -999) continue; sum += t; }',
        'Put break; right after firstHot = t;',
      ],
      solution: '',
      solutionJs: `// -999 means the sensor failed: ignore it.
const temps = [18, 21, -999, 31, 24, 33, 19];

// 1. Add up the valid temperatures into sum (for...of + continue)
let sum = 0;
for (const t of temps) {
  if (t === -999) continue;
  sum += t;
}

// 2. Store the FIRST temperature of 30 or more in firstHot (stop with break)
let firstHot = null;
for (const t of temps) {
  if (t >= 30) {
    firstHot = t;
    break;
  }
}
`,
    },
  ],
  challenge: {
    id: 'js-control-challenge',
    title: 'FizzBuzz with a scoreboard',
    difficulty: 2,
    summary: 'The classic FizzBuzz, plus a count of every Fizz, Buzz and FizzBuzz.',
    explanation: `The most famous programming warm-up. For every number from **1** to \`limit\` (20), print one line:

- \`FizzBuzz\` if the number is divisible by both 3 and 5,
- \`Fizz\` if it's divisible by 3,
- \`Buzz\` if it's divisible by 5,
- otherwise the number itself.

Then print one summary line counting how many of each you printed:

\`\`\`
1
2
Fizz
4
Buzz
…
19
Buzz
Fizz: 5, Buzz: 3, FizzBuzz: 1
\`\`\`

"Divisible by 3" means the remainder is zero: \`n % 3 === 0\`. Use a loop and if/else (or switch), count with the
three variables already declared, and print nothing else.`,
    starterCode: '',
    starterJs: `const limit = 20;
let fizzCount = 0;
let buzzCount = 0;
let fizzBuzzCount = 0;

// For every number from 1 to limit, print Fizz, Buzz, FizzBuzz or the number.
// Then print the summary line.
`,
    tasks: [
      {
        text: 'Lines 1 to 20 are printed in order',
        check: loggedInOrder(['1', '2', 'Fizz', '4', 'Buzz', 'Fizz', '7', '8', 'Fizz', 'Buzz', '11', 'Fizz', '13', '14', 'FizzBuzz', '16', '17', 'Fizz', '19', 'Buzz'], 'Print one line per number from 1 to 20. Check 15 first: it is divisible by 3, 5 and 15!'),
      },
      { text: 'The summary line reads Fizz: 5, Buzz: 3, FizzBuzz: 1', check: logged('Fizz: 5, Buzz: 3, FizzBuzz: 1') },
      { text: 'The counters hold the right numbers', check: all(variableEquals('fizzCount', 5), variableEquals('buzzCount', 3), variableEquals('fizzBuzzCount', 1)) },
      { text: 'Exactly 21 lines are printed', check: check((h) => (h.logs.length === 21 ? true : `Print exactly 21 lines: 20 numbers/words and the summary (now ${h.logs.length}).`)) },
      { text: 'Uses a loop, the % operator and conditionals', check: all(codeMatches(/\b(for|while)\s*\(/, 'Use a for or while loop.'), codeMatches(/%/, 'Use % to test divisibility.'), codeMatches(/\belse\s+if\b|\bswitch\s*\(/, 'Use if / else if / else (or switch) to pick the word.')) },
      { text: 'No var', check: noVar() },
    ],
    hints: [
      'for (let n = 1; n <= limit; n++) { ... }',
      'Test n % 15 === 0 (or n % 3 === 0 && n % 5 === 0) first, otherwise 15 prints Fizz.',
      'Increase the right counter in each branch, then after the loop: console.log(`Fizz: ${fizzCount}, ...`).',
    ],
    solution: '',
    solutionJs: `const limit = 20;
let fizzCount = 0;
let buzzCount = 0;
let fizzBuzzCount = 0;

for (let n = 1; n <= limit; n++) {
  if (n % 3 === 0 && n % 5 === 0) {
    console.log('FizzBuzz');
    fizzBuzzCount++;
  } else if (n % 3 === 0) {
    console.log('Fizz');
    fizzCount++;
  } else if (n % 5 === 0) {
    console.log('Buzz');
    buzzCount++;
  } else {
    console.log(n);
  }
}

console.log(\`Fizz: \${fizzCount}, Buzz: \${buzzCount}, FizzBuzz: \${fizzBuzzCount}\`);
`,
  },
};
