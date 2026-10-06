import type { Module } from '../types';
import { all } from '../../engine/checks';
import { allComputed, boxSize, centeredIn, computed, declares, inOneRow, px } from '../../engine/cssChecks';

export const boxModel: Module = {
  id: 'css-box',
  title: 'The Box Model',
  description: 'Every element is a box: content, padding, border and margin.',
  lessons: [
    {
      id: 'css-box-basics',
      title: 'Padding, border, margin',
      explanation: `Every element is a rectangular **box** made of four layers, from the inside out:

1. **content** — the text or image;
2. **padding** — space *inside* the border, takes the background colour;
3. **border** — the line around the padding;
4. **margin** — space *outside* the border, always transparent, separates the box from its neighbours.

\`\`\`css
.box {
  padding: 16px;              /* all four sides */
  border: 2px solid #333;     /* width, style, colour */
  margin: 24px 0;             /* top/bottom 24px, left/right 0 */
}
\`\`\`

Shorthands go clockwise from the top: \`padding: 10px 20px 30px 40px\` = top, right, bottom, left.
Two values mean vertical | horizontal. You can also set one side: \`margin-top\`, \`padding-left\`…

Tip: vertical margins between blocks **collapse** — two 20px margins touching become 20px, not 40px.`,
      starterCode: `<div class="box">I am a box.</div>
<div class="box">So am I.</div>
`,
      starterCss: `.box {
  background-color: lightyellow;
}
`,
      tasks: [
        { text: 'Give .box 20px of padding on every side', check: all(computed('.box', 'padding-top', '20px'), computed('.box', 'padding-left', '20px'), computed('.box', 'padding-right', '20px'), computed('.box', 'padding-bottom', '20px')) },
        { text: 'Give .box a 3px solid orange border', check: all(computed('.box', 'border-top-width', '3px'), computed('.box', 'border-top-style', 'solid'), computed('.box', 'border-top-color', 'orange')) },
        { text: 'Separate the boxes with 30px top/bottom margin and 0 left/right', check: all(computed('.box', 'margin-top', '30px'), computed('.box', 'margin-bottom', '30px'), computed('.box', 'margin-left', '0px')) },
        { text: 'Notice: the gap between the boxes is 30px, not 60px (margin collapsing)', check: (doc) => {
          const [a, b] = [...doc.querySelectorAll('.box')].map((e) => e.getBoundingClientRect());
          return a && b && Math.round(b.top - a.bottom) === 30 ? true : 'The two boxes should be 30px apart.';
        } },
      ],
      hints: ['margin: 30px 0; sets top and bottom to 30px, left and right to 0.'],
      solution: `<div class="box">I am a box.</div>
<div class="box">So am I.</div>
`,
      solutionCss: `.box {
  background-color: lightyellow;
  padding: 20px;
  border: 3px solid orange;
  margin: 30px 0;
}
`,
    },
    {
      id: 'css-box-sizing',
      title: 'box-sizing',
      explanation: `By default \`width\` sets the width of the **content** only. Padding and border are added on top:

\`\`\`css
.card { width: 300px; padding: 20px; border: 5px solid; }
/* actual width: 300 + 20*2 + 5*2 = 350px  😬 */
\`\`\`

\`box-sizing: border-box\` makes \`width\` include padding and border, which is how most people think:

\`\`\`css
*, *::before, *::after {
  box-sizing: border-box;
}
\`\`\`

This rule is at the top of almost every modern stylesheet. With it, a 300px card is 300px. Period.`,
      starterCode: `<div class="card">Card A</div>
<div class="card wide">Card B</div>
`,
      starterCss: `.card {
  width: 300px;
  padding: 20px;
  border: 5px solid steelblue;
  margin-bottom: 10px;
}

.wide {
  width: 100%;
}
`,
      tasks: [
        { text: 'Add the universal box-sizing: border-box rule (*, *::before, *::after)', check: declares(/^\*\s*,\s*\*?::before\s*,\s*\*?::after$/, 'box-sizing', 'border-box', 'Write *, *::before, *::after { box-sizing: border-box; }') },
        { text: 'Card A is now exactly 300px wide, borders included', check: boxSize('.card:not(.wide)', 'width', (w) => Math.round(w) === 300, 'Card A should measure exactly 300px.') },
        { text: 'Card B no longer overflows its parent', check: (doc) => {
          const b = doc.querySelector('.wide')!.getBoundingClientRect();
          return b.right <= doc.body.getBoundingClientRect().right + 0.5 ? true : 'Card B is wider than the page.';
        } },
      ],
      hints: ['Selectors separated by commas share the rule: *, *::before, *::after { ... }'],
      solution: `<div class="card">Card A</div>
<div class="card wide">Card B</div>
`,
      solutionCss: `*, *::before, *::after {
  box-sizing: border-box;
}

.card {
  width: 300px;
  padding: 20px;
  border: 5px solid steelblue;
  margin-bottom: 10px;
}

.wide {
  width: 100%;
}
`,
    },
    {
      id: 'css-display',
      title: 'display: block, inline, inline-block, none',
      explanation: `The \`display\` property decides how a box flows in the page:

| Value | Behaviour | Default for |
|---|---|---|
| \`block\` | starts on a new line, takes the full width; width/height/margins work | \`div\`, \`p\`, \`h1\`, \`li\`, \`section\` |
| \`inline\` | flows inside text; **ignores** width/height and vertical margins | \`a\`, \`span\`, \`strong\` |
| \`inline-block\` | flows inline but accepts width, height and padding like a block | \`button\`, \`img\`* |
| \`none\` | removed from the page completely (also hidden from screen readers) | — |

\`\`\`css
nav a {
  display: inline-block;
  padding: 8px 16px;   /* now the clickable area really grows */
}
\`\`\`

Later modules add the two most powerful values: \`display: flex\` and \`display: grid\`.`,
      starterCode: `<ul class="tags">
  <li>html</li>
  <li>css</li>
  <li>design</li>
</ul>
<p>Read <a class="btn" href="#">the docs</a> first.</p>
<div class="ad">Buy now!!!</div>
`,
      starterCss: `.tags {
  list-style: none;
  padding: 0;
}

.tags li {
  background: #e0e7ff;
  padding: 4px 10px;
  margin-right: 6px;
}
`,
      tasks: [
        { text: 'Put the tags on one line with display: inline-block', check: all(allComputed('.tags li', 'display', 'inline-block'), inOneRow('.tags li')) },
        { text: 'Make the .btn link an inline-block with 8px 16px padding', check: all(computed('.btn', 'display', 'inline-block'), computed('.btn', 'padding-top', '8px'), computed('.btn', 'padding-left', '16px')) },
        { text: 'Hide the .ad completely', check: computed('.ad', 'display', 'none') },
      ],
      hints: ['display: none removes the element from the layout entirely.'],
      solution: `<ul class="tags">
  <li>html</li>
  <li>css</li>
  <li>design</li>
</ul>
<p>Read <a class="btn" href="#">the docs</a> first.</p>
<div class="ad">Buy now!!!</div>
`,
      solutionCss: `.tags {
  list-style: none;
  padding: 0;
}

.tags li {
  display: inline-block;
  background: #e0e7ff;
  padding: 4px 10px;
  margin-right: 6px;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
}

.ad {
  display: none;
}
`,
    },
    {
      id: 'css-width-overflow',
      title: 'Width, centring and overflow',
      explanation: `- \`width\` / \`height\` set a fixed size; \`max-width\` lets a box shrink on small screens but never grow
  past a limit. **Prefer \`max-width\`** for page containers.
- \`margin: 0 auto\` centres a block horizontally (the browser shares the leftover space equally).
- \`min-height\` sets a minimum height but lets content grow.
- When content doesn't fit, \`overflow\` decides what happens: \`visible\` (spills out, default),
  \`hidden\` (cut off), \`auto\` (scrollbar only when needed).

\`\`\`css
.container {
  max-width: 600px;
  margin: 0 auto;
}
.log {
  height: 120px;
  overflow: auto;
}
\`\`\``,
      starterCode: `<div class="container">
  <h1>Server log</h1>
  <pre class="log">10:00 started
10:01 connected to database
10:02 request /home
10:03 request /about
10:04 request /shop
10:05 request /cart
10:06 request /checkout
10:07 payment ok
10:08 email sent</pre>
</div>
`,
      starterCss: `.log {
  background: #111;
  color: #9f9;
  padding: 10px;
}
`,
      tasks: [
        { text: 'Limit .container to max-width: 500px', check: all(declares('.container', 'max-width', '500px'), boxSize('.container', 'width', (w) => Math.round(w) === 500, '.container should be 500px wide in this 800px preview.')) },
        { text: 'Centre .container horizontally', check: centeredIn('.container', 'body', 'x') },
        { text: 'Give the .log a height of 120px', check: computed('.log', 'height', (v) => Math.round(px(v)) === 120 || Math.round(px(v)) === 100, 'Set height: 120px on .log.') },
        { text: 'Make the log scroll when it is too long (overflow: auto)', check: computed('.log', 'overflow-y', 'auto') },
      ],
      hints: ['Without box-sizing: border-box the computed height is the content height. Either value is accepted.'],
      solution: `<div class="container">
  <h1>Server log</h1>
  <pre class="log">10:00 started
10:01 connected to database
10:02 request /home
10:03 request /about
10:04 request /shop
10:05 request /cart
10:06 request /checkout
10:07 payment ok
10:08 email sent</pre>
</div>
`,
      solutionCss: `.container {
  max-width: 500px;
  margin: 0 auto;
}

.log {
  background: #111;
  color: #9f9;
  padding: 10px;
  height: 120px;
  overflow: auto;
}
`,
    },
    {
      id: 'css-decoration',
      title: 'Rounded corners and shadows',
      explanation: `Small details give boxes depth:

\`\`\`css
.card {
  border-radius: 12px;                          /* rounded corners */
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);      /* x y blur colour */
}
.avatar {
  border-radius: 50%;                           /* a perfect circle on a square box */
}
\`\`\`

- \`box-shadow: x-offset y-offset blur spread colour\`. Keep shadows soft and subtle: low opacity, some blur.
- \`outline\` is like a border that doesn't take space — browsers use it for keyboard **focus**. Never remove
  it without a visible replacement (\`:focus-visible\`).`,
      starterCode: `<div class="card">
  <img class="avatar" src="https://picsum.photos/id/64/100/100" alt="Portrait of Luca" width="100" height="100">
  <h2>Luca</h2>
  <button>Follow</button>
</div>
`,
      starterCss: `.card {
  width: 220px;
  padding: 20px;
  background: white;
  text-align: center;
}
`,
      tasks: [
        { text: 'Round the card corners with 16px', check: computed('.card', 'border-top-left-radius', '16px') },
        { text: 'Give the card a soft box-shadow', check: computed('.card', 'box-shadow', (v) => v !== 'none', 'Add a box-shadow to .card.') },
        { text: 'Make the avatar a circle (border-radius: 50%)', check: computed('.avatar', 'border-top-left-radius', '50%') },
        { text: 'Show a 3px solid outline on the button when focused with the keyboard', check: declares(/button:focus-visible/, 'outline', /^(?=.*\b3px\b)(?=.*\bsolid\b)/, 'Write button:focus-visible { outline: 3px solid ...; }') },
      ],
      hints: ['box-shadow: 0 4px 12px rgb(0 0 0 / 15%);'],
      solution: `<div class="card">
  <img class="avatar" src="https://picsum.photos/id/64/100/100" alt="Portrait of Luca" width="100" height="100">
  <h2>Luca</h2>
  <button>Follow</button>
</div>
`,
      solutionCss: `.card {
  width: 220px;
  padding: 20px;
  background: white;
  text-align: center;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.avatar {
  border-radius: 50%;
}

button:focus-visible {
  outline: 3px solid royalblue;
}
`,
    },
  ],
  challenge: {
    id: 'css-box-challenge',
    title: 'Challenge: Recreate the product card',
    summary: 'Match the target pixel by pixel: sizes, spacing, borders and shadows.',
    difficulty: 2,
    showTarget: true,
    explanation: `Recreate the product card in the **Target** tab. Specs:

- Everything uses \`box-sizing: border-box\`.
- \`.product\`: exactly \`280px\` wide, white background, \`24px\` padding, \`12px\` radius, a \`1px solid #e5e7eb\`
  border and a soft shadow. Centred on the page with \`40px\` margin above.
- Page background \`#f3f4f6\`.
- \`.product img\`: full width of the card (\`width: 100%\`), \`height: auto\`, \`8px\` radius, displayed as a block.
- \`.price\`: \`1.5rem\`, bold, colour \`#16a34a\`, \`8px\` top and bottom margin.
- \`.buy\`: a block button, full width, \`12px\` padding, no border, \`8px\` radius, background \`#111827\`,
  white text.`,
    starterCode: `<div class="product">
  <img src="https://picsum.photos/id/30/400/300" alt="A white coffee mug on a table" width="400" height="300">
  <h2>Handmade mug</h2>
  <p class="price">€24</p>
  <button class="buy">Add to cart</button>
</div>
`,
    starterCss: '',
    tasks: [
      { text: 'border-box everywhere and the card is exactly 280px wide', check: all(computed('.buy', 'box-sizing', 'border-box', 'Use the universal border-box rule.'), boxSize('.product', 'width', (w) => Math.round(w) === 280, '.product must measure exactly 280px.')) },
      { text: 'Card: white, 24px padding, 12px radius, 1px #e5e7eb border, shadow', check: all(computed('.product', 'background-color', 'white'), computed('.product', 'padding-top', '24px'), computed('.product', 'border-top-left-radius', '12px'), computed('.product', 'border-top-width', '1px'), computed('.product', 'border-top-color', '#e5e7eb'), computed('.product', 'box-shadow', (v) => v !== 'none', 'Add a box-shadow.')) },
      { text: 'Card centred, 40px from the top; page background #f3f4f6', check: all(centeredIn('.product', 'body', 'x'), computed('.product', 'margin-top', '40px'), computed('body', 'background-color', '#f3f4f6')) },
      { text: 'Image: block, full card width, 8px radius', check: all(computed('.product img', 'display', 'block'), boxSize('.product img', 'width', (w) => Math.round(w) === 230, 'The image should fill the card (280 - 2×24 - 2×1 = 230px).'), computed('.product img', 'border-top-left-radius', '8px')) },
      { text: 'Price: 1.5rem, bold, #16a34a, 8px vertical margin', check: all(computed('.price', 'font-size', '24px'), computed('.price', 'font-weight', '700'), computed('.price', 'color', '#16a34a'), computed('.price', 'margin-top', '8px'), computed('.price', 'margin-bottom', '8px')) },
      { text: 'Button: full-width block, 12px padding, no border, 8px radius, #111827 with white text', check: all(computed('.buy', 'display', 'block'), boxSize('.buy', 'width', (w) => Math.round(w) === 230, 'The button should be as wide as the card content.'), computed('.buy', 'padding-top', '12px'), computed('.buy', 'border-top-style', 'none'), computed('.buy', 'border-top-left-radius', '8px'), computed('.buy', 'background-color', '#111827'), computed('.buy', 'color', 'white')) },
    ],
    hints: ['A block <button> doesn\'t stretch automatically: give it width: 100%.', 'height: auto keeps the image proportions when you change its width.'],
    solution: `<div class="product">
  <img src="https://picsum.photos/id/30/400/300" alt="A white coffee mug on a table" width="400" height="300">
  <h2>Handmade mug</h2>
  <p class="price">€24</p>
  <button class="buy">Add to cart</button>
</div>
`,
    solutionCss: `*, *::before, *::after {
  box-sizing: border-box;
}

body {
  background-color: #f3f4f6;
}

.product {
  width: 280px;
  margin: 40px auto 0;
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
}

.product img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.price {
  font-size: 1.5rem;
  font-weight: bold;
  color: #16a34a;
  margin: 8px 0;
}

.buy {
  display: block;
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #111827;
  color: white;
}
`,
  },
};
