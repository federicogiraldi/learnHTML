import type { Module } from '../types';
import { all } from '../../engine/checks';
import { allComputed, computed, cssMatches, declares, noImportant, usesSelector } from '../../engine/cssChecks';

const not = (color: string) => (v: string) => v !== color;
const RED = 'rgb(255, 0, 0)';

export const selectors: Module = {
  id: 'css-selectors',
  title: 'Selectors & the Cascade',
  description: 'Target exactly the right elements, and understand which rule wins.',
  lessons: [
    {
      id: 'css-combinators',
      title: 'Combinators',
      explanation: `**Combinators** select elements by their position relative to others:

| Selector | Matches |
|---|---|
| \`nav a\` | any \`<a>\` **inside** a \`<nav>\`, at any depth (descendant, a space) |
| \`ul > li\` | \`<li>\` that are **direct children** of a \`<ul>\` |
| \`h2 + p\` | the \`<p>\` **immediately after** an \`<h2>\` (adjacent sibling) |
| \`h2 ~ p\` | **every** \`<p>\` after an \`<h2>\`, with the same parent (general sibling) |

\`\`\`css
article h2 + p {
  font-size: 1.2em; /* the intro paragraph of each section */
}
\`\`\``,
      starterCode: `<nav>
  <a href="#">Home</a>
  <a href="#">Blog</a>
</nav>
<a href="#">Outside link</a>
<ul class="menu">
  <li>Pasta
    <ul>
      <li>Carbonara</li>
    </ul>
  </li>
  <li>Pizza</li>
</ul>
<h2>Intro</h2>
<p class="first">First paragraph.</p>
<p class="second">Second paragraph.</p>
`,
      starterCss: '',
      tasks: [
        { text: 'Make only the links inside <nav> color green (descendant)', check: all(allComputed('nav a', 'color', 'green'), computed('body > a', 'color', not('rgb(0, 128, 0)'), 'The link outside <nav> should not be green.')) },
        { text: 'Make only the direct <li> children of .menu bold (child combinator)', check: all(usesSelector(/\.menu\s*>\s*li/, 'Use the child combinator: .menu > li'), computed('.menu > li', 'font-weight', '700'), computed('.menu li li', 'font-weight', '400', 'Use > so the nested Carbonara item is not bold.')) },
        { text: 'Make the paragraph right after the <h2> italic (adjacent sibling)', check: all(usesSelector(/h2\s*\+\s*p/, 'Use h2 + p.'), computed('.first', 'font-style', 'italic'), computed('.second', 'font-style', 'normal')) },
      ],
      hints: ['Watch out: nested lists inherit font-weight from their parent <li>. You may need to reset it: .menu li li { font-weight: normal; }'],
      solution: `<nav>
  <a href="#">Home</a>
  <a href="#">Blog</a>
</nav>
<a href="#">Outside link</a>
<ul class="menu">
  <li>Pasta
    <ul>
      <li>Carbonara</li>
    </ul>
  </li>
  <li>Pizza</li>
</ul>
<h2>Intro</h2>
<p class="first">First paragraph.</p>
<p class="second">Second paragraph.</p>
`,
      solutionCss: `nav a {
  color: green;
}

.menu > li {
  font-weight: bold;
}

.menu li li {
  font-weight: normal;
}

h2 + p {
  font-style: italic;
}
`,
    },
    {
      id: 'css-pseudo-classes',
      title: 'Attributes and pseudo-classes',
      explanation: `**Attribute selectors** match elements by their attributes:

- \`a[target]\` — has the attribute; \`input[type="email"]\` — exact value.
- \`a[href^="https"]\` starts with, \`a[href$=".pdf"]\` ends with, \`[class*="btn"]\` contains.

**Pseudo-classes** (one colon) match elements in a certain **state** or **position**:

| Pseudo-class | Matches |
|---|---|
| \`:hover\`, \`:focus-visible\` | mouse over it / focused with the keyboard |
| \`:first-child\`, \`:last-child\` | first / last among its siblings |
| \`:nth-child(odd)\`, \`:nth-child(3n)\` | by position |
| \`:not(.x)\` | everything except \`.x\` |
| \`:checked\`, \`:disabled\` | form states |

\`\`\`css
tr:nth-child(even) { background: #f3f3f3; }   /* zebra stripes */
a:hover { text-decoration: none; }
\`\`\``,
      starterCode: `<ul class="files">
  <li><a href="report.pdf">Report</a></li>
  <li><a href="https://example.com">Website</a></li>
  <li><a href="notes.txt">Notes</a></li>
  <li><a href="slides.pdf">Slides</a></li>
</ul>
<button>Save</button>
`,
      starterCss: '',
      tasks: [
        { text: 'Make links ending in .pdf color crimson', check: all(usesSelector(/\[href\$=["']?\.pdf["']?\]/, 'Use a[href$=".pdf"].'), allComputed('a[href$=".pdf"]', 'color', 'crimson')) },
        { text: 'Give the odd list items a background of #eee with :nth-child', check: all(usesSelector(/:nth-child\(\s*(odd|2n\s*\+\s*1)\s*\)/, 'Use li:nth-child(odd).'), computed('.files li:nth-child(1)', 'background-color', '#eee'), computed('.files li:nth-child(2)', 'background-color', 'rgba(0, 0, 0, 0)', 'Only odd items get the background.')) },
        { text: 'Remove the underline from the last item\'s link with :last-child', check: all(usesSelector(/:last-child/, 'Use :last-child.'), computed('li:last-child a', 'text-decoration-line', 'none')) },
        { text: 'Make the button turn background gold on :hover', check: declares(/button:hover/, 'background-color', /\S/, 'Write a button:hover rule that sets background-color.') },
      ],
      hints: ['The last link sits inside the last li: li:last-child a { ... }'],
      solution: `<ul class="files">
  <li><a href="report.pdf">Report</a></li>
  <li><a href="https://example.com">Website</a></li>
  <li><a href="notes.txt">Notes</a></li>
  <li><a href="slides.pdf">Slides</a></li>
</ul>
<button>Save</button>
`,
      solutionCss: `a[href$=".pdf"] {
  color: crimson;
}

.files li:nth-child(odd) {
  background-color: #eee;
}

li:last-child a {
  text-decoration: none;
}

button:hover {
  background-color: gold;
}
`,
    },
    {
      id: 'css-pseudo-elements',
      title: 'Pseudo-elements',
      explanation: `**Pseudo-elements** (two colons) style a *part* of an element, or add decorative content:

- \`::before\` / \`::after\` — insert content before/after the element's content. They need a \`content\`
  property (use \`content: ""\` for purely decorative boxes).
- \`::first-letter\`, \`::first-line\` — the first letter or line of a block.
- \`::placeholder\` — the placeholder text of an input. \`::selection\` — selected text.

\`\`\`css
.tip::before {
  content: "💡 ";
}
.quote::after {
  content: " — Anonymous";
  color: gray;
}
\`\`\`

Content added with CSS is decoration: don't put essential information there, since some assistive
technologies skip it.`,
      starterCode: `<p class="tip">Save your work often.</p>
<p class="story">Once upon a time, in a land far away, a developer wrote some CSS.</p>
<p class="required">Email</p>
`,
      starterCss: '',
      tasks: [
        { text: 'Add "💡 " before .tip with ::before', check: computed('.tip', 'content', /💡/, 'Set content: "💡 " on .tip::before.', '::before') },
        { text: 'Make the first letter of .story 2em and bold with ::first-letter', check: all(computed('.story', 'font-size', '32px', 'Set font-size: 2em on .story::first-letter.', '::first-letter'), computed('.story', 'font-weight', '700', undefined, '::first-letter')) },
        { text: 'Add a red " *" after .required with ::after', check: all(computed('.required', 'content', /\*/, 'Set content: " *" on .required::after.', '::after'), computed('.required', 'color', 'red', 'Make the ::after star red.', '::after')) },
      ],
      hints: ['::first-letter: .story::first-letter { font-size: 2em; font-weight: bold; }'],
      solution: `<p class="tip">Save your work often.</p>
<p class="story">Once upon a time, in a land far away, a developer wrote some CSS.</p>
<p class="required">Email</p>
`,
      solutionCss: `.tip::before {
  content: "💡 ";
}

.story::first-letter {
  font-size: 2em;
  font-weight: bold;
}

.required::after {
  content: " *";
  color: red;
}
`,
    },
    {
      id: 'css-cascade',
      title: 'The cascade and specificity',
      explanation: `When several rules set the same property on an element, the **cascade** decides which one wins:

1. **Specificity** — a more specific selector wins. Think of it as a score (ids, classes, types):
   - \`p\` → (0, 0, 1)
   - \`.intro\`, \`[type]\`, \`:hover\` → (0, 1, 0)
   - \`#main\` → (1, 0, 0)
   - \`#main .intro p\` → (1, 1, 1)
2. **Order** — with equal specificity, the rule that comes **last** wins.
3. **Inheritance** — some properties (colour, fonts, line-height…) pass from parent to children when nothing
   else sets them; others (padding, border, background…) don't.

\`!important\` overrides everything — and then can only be beaten by another \`!important\`. It turns
your stylesheet into an arms race: avoid it, and fix specificity instead.

\`\`\`css
p { color: black; }          /* (0,0,1) */
.note { color: blue; }       /* (0,1,0) wins over p */
.box .note { color: red; }   /* (0,2,0) wins over .note */
\`\`\``,
      starterCode: `<div class="box">
  <p class="note">Which colour am I?</p>
  <p class="warning">I should be orange.</p>
</div>
<p class="final">I should be purple.</p>
`,
      starterCss: `.box .note {
  color: red;
}

.note {
  color: blue;
}

.warning {
  color: orange;
}

.box p {
  color: green;
}

.final {
  color: purple;
}

.final {
  color: black;
}
`,
      tasks: [
        { text: 'Make .note blue by making its rule more specific (don\'t delete the red rule)', check: all(declares('.box .note', 'color', 'red', 'Keep the ".box .note" rule.'), computed('.note', 'color', 'blue')) },
        { text: 'Make .warning orange — .box p is beating it. Why? Fix it without !important', check: computed('.warning', 'color', 'orange') },
        { text: 'Make .final purple — two rules have the same specificity, so order decides', check: computed('.final', 'color', 'purple') },
        { text: 'No !important anywhere', check: noImportant() },
      ],
      hints: [
        '.box p is (0,1,1), .warning is (0,1,0). Make the warning selector stronger: .box .warning',
        'You can raise .note\'s specificity with the same trick: .box .note.note or .box p.note — and it must come after the red rule if they tie.',
      ],
      solution: `<div class="box">
  <p class="note">Which colour am I?</p>
  <p class="warning">I should be orange.</p>
</div>
<p class="final">I should be purple.</p>
`,
      solutionCss: `.box .note {
  color: red;
}

.box p.note {
  color: blue;
}

.box p {
  color: green;
}

.box .warning {
  color: orange;
}

.final {
  color: black;
}

.final {
  color: purple;
}
`,
    },
    {
      id: 'css-has-is',
      title: ':is(), :where() and :has()',
      explanation: `Modern CSS has three powerful functional pseudo-classes:

- \`:is(h1, h2, h3) a\` — a shorter way to write \`h1 a, h2 a, h3 a\`. Takes the specificity of its strongest argument.
- \`:where(...)\` — same as \`:is()\` but with **zero** specificity: great for defaults that are easy to override.
- \`:has(...)\` — the "parent selector": matches an element that **contains** something.

\`\`\`css
/* cards that contain an image get a border */
.card:has(img) { border: 2px solid gold; }

/* a form field whose input is invalid */
.field:has(input:invalid) label { color: crimson; }
\`\`\``,
      starterCode: `<article class="card"><h2>Plain card</h2></article>
<article class="card"><img src="https://picsum.photos/id/1025/120/80" alt="A pug" width="120" height="80"><h2>Photo card</h2></article>
<h1>Title <a href="#">#</a></h1>
<h2>Subtitle <a href="#">#</a></h2>
<label><input type="checkbox" checked> Subscribe</label>
`,
      starterCss: '',
      tasks: [
        { text: 'Give only cards that contain an <img> a 3px solid gold border, with :has()', check: all(usesSelector(/\.card:has\(\s*img\s*\)/, 'Use .card:has(img).'), computed('.card:has(img)', 'border-top-width', '3px'), computed('.card:has(img)', 'border-top-color', 'gold'), computed('.card:not(:has(img))', 'border-top-style', 'none', 'The plain card should have no border.')) },
        { text: 'Make links inside h1 and h2 gray using one :is() selector', check: all(usesSelector(/:is\(\s*h1\s*,\s*h2\s*\)\s*a/, 'Use :is(h1, h2) a.'), allComputed('h1 a, h2 a', 'color', 'gray')) },
        { text: 'Make a label bold when its checkbox is checked (label:has(:checked))', check: all(usesSelector(/label:has\(/, 'Use label:has(...).'), computed('label', 'font-weight', '700')) },
      ],
      hints: ['label:has(input:checked) { font-weight: bold; }'],
      solution: `<article class="card"><h2>Plain card</h2></article>
<article class="card"><img src="https://picsum.photos/id/1025/120/80" alt="A pug" width="120" height="80"><h2>Photo card</h2></article>
<h1>Title <a href="#">#</a></h1>
<h2>Subtitle <a href="#">#</a></h2>
<label><input type="checkbox" checked> Subscribe</label>
`,
      solutionCss: `.card:has(img) {
  border: 3px solid gold;
}

:is(h1, h2) a {
  color: gray;
}

label:has(input:checked) {
  font-weight: bold;
}
`,
    },
  ],
  challenge: {
    id: 'css-selectors-challenge',
    title: 'Challenge: Specificity wars',
    summary: 'A stylesheet full of conflicts and !important. Make it behave.',
    difficulty: 2,
    blind: true,
    explanation: `A previous developer fought the cascade with \`!important\` and lost. The page should look like this:

- The **sale** price is red; normal prices stay black.
- Links in the **nav** are white; other links stay blue.
- The **active** nav link is yellow.
- The first table row (the header row) is bold, the other rows are not.
- The \`.notice\` text is dark green.

Fix the CSS (you may also fix typos), **without** \`!important\` and **without** touching the HTML.
The requirements are hidden: each one reveals itself once it passes.`,
    starterCode: `<nav id="top">
  <a href="#">Home</a>
  <a href="#" class="active">Shop</a>
</nav>
<p><a href="#">Read our blog</a></p>
<table>
  <tr><td>Item</td><td>Price</td></tr>
  <tr><td>Mug</td><td class="price">€12</td></tr>
  <tr><td>Bowl</td><td class="price sale">€8</td></tr>
</table>
<div class="box"><p class="notice">Free shipping this week.</p></div>
`,
    starterCss: `#top a {
  color: white;
}

.active {
  color: yellow !important;
}

a {
  color: blue !important;
}

nav {
  background: #222;
  padding: 8px;
}

.price .sale {
  color: red;
}

tr:first-child {
  font-weight: bold;
}

td {
  font-weight: bold;
}

.box p {
  color: darkgreen;
}

.box .notice {
  color: black;
}
`,
    tasks: [
      { text: 'The sale price is red', check: computed('.sale', 'color', 'red') },
      { text: 'Normal prices are not red', check: computed('.price:not(.sale)', 'color', not(RED), 'Only the sale price should be red.') },
      { text: 'Nav links are white', check: computed('nav a:not(.active)', 'color', 'white') },
      { text: 'The active nav link is yellow', check: computed('.active', 'color', 'yellow') },
      { text: 'Other links stay blue', check: computed('p a', 'color', 'blue') },
      { text: 'Only the first table row is bold', check: all(computed('tr:first-child td', 'font-weight', '700'), computed('tr:last-child td', 'font-weight', '400', 'Only the first row should be bold.')) },
      { text: 'The notice is dark green', check: computed('.notice', 'color', 'darkgreen') },
      { text: 'No !important left', check: noImportant() },
      { text: 'The HTML is unchanged', check: (_doc, raw) => (raw.includes('class="price sale"') && raw.includes('class="active"') && raw.includes('class="notice"') ? true : 'Don\'t change the HTML.') },
      { text: 'Still uses the CSS file for styling', check: cssMatches(/nav/, 'Keep the nav styles.') },
    ],
    hints: [
      '".price .sale" (with a space) means "a .sale inside a .price". The element has both classes: chain them.',
      'td { font-weight: bold } styles every cell directly, so it beats inheritance from the row.',
      '#top a is (1,0,1). An .active rule needs at least the same strength: #top .active.',
    ],
    solution: `<nav id="top">
  <a href="#">Home</a>
  <a href="#" class="active">Shop</a>
</nav>
<p><a href="#">Read our blog</a></p>
<table>
  <tr><td>Item</td><td>Price</td></tr>
  <tr><td>Mug</td><td class="price">€12</td></tr>
  <tr><td>Bowl</td><td class="price sale">€8</td></tr>
</table>
<div class="box"><p class="notice">Free shipping this week.</p></div>
`,
    solutionCss: `a {
  color: blue;
}

#top a {
  color: white;
}

#top .active {
  color: yellow;
}

nav {
  background: #222;
  padding: 8px;
}

.price.sale {
  color: red;
}

tr:first-child {
  font-weight: bold;
}

.box .notice {
  color: darkgreen;
}
`,
  },
};
