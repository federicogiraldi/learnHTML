import type { Module } from '../types';
import { all, noElement, rawMatches } from '../../engine/checks';
import { allComputed, computed, cssMatches, declares } from '../../engine/cssChecks';

const PAGE = `<h1>Coffee Corner</h1>
<p>The best espresso in town.</p>
<p>Open every day from 7 to 19.</p>
`;

export const basics: Module = {
  id: 'css-basics',
  title: 'CSS Basics',
  description: 'Rules, selectors and colours: how CSS gives HTML its look.',
  lessons: [
    {
      id: 'css-first-rule',
      title: 'Your first rule',
      explanation: `HTML says what content **is**; CSS (Cascading Style Sheets) says how it **looks**.

A stylesheet is a list of **rules**. Each rule has a **selector** (which elements) and a block of
**declarations** (what to change), each written as \`property: value;\`:

\`\`\`css
h1 {
  color: tomato;
  font-size: 48px;
}
\`\`\`

- \`h1\` is the selector: this rule applies to every \`<h1>\`.
- \`color\` and \`font-size\` are properties; \`tomato\` and \`48px\` are their values.
- Every declaration ends with a semicolon \`;\`. Forgetting it is the most common CSS bug — and the browser
  doesn't complain, it just ignores the broken declaration. This app will warn you.

In CSS lessons the editor has two files: **style.css** (your CSS) and **index.html** (the page it styles).`,
      starterCode: PAGE,
      starterCss: `/* Write your CSS below */
`,
      tasks: [
        { text: 'Make the <h1> text color tomato', check: computed('h1', 'color', 'tomato') },
        { text: 'Make the <h1> font-size 48px', check: computed('h1', 'font-size', '48px') },
        { text: 'Make every paragraph color gray', check: allComputed('p', 'color', 'gray') },
        { text: 'Give the whole page (body) the background-color linen', check: computed('body', 'background-color', 'linen') },
      ],
      hints: ['Write one rule per selector: h1 { ... }, p { ... }, body { ... }.', 'Each declaration is property: value; — don\'t forget the colon and the semicolon.'],
      solution: PAGE,
      solutionCss: `h1 {
  color: tomato;
  font-size: 48px;
}

p {
  color: gray;
}

body {
  background-color: linen;
}
`,
    },
    {
      id: 'css-where',
      title: 'Where CSS lives',
      explanation: `There are three ways to add CSS to a page:

1. **External stylesheet** (the best): a separate \`.css\` file, linked in the \`<head>\`. One file can style
   a whole website, and the browser caches it.

\`\`\`html
<link rel="stylesheet" href="style.css">
\`\`\`

2. **\`<style>\` element** in the \`<head>\`: fine for a single page or for quick experiments.
3. **Inline \`style\` attribute** on an element: \`<p style="color: red">\`. Avoid it — it mixes content
   and design, can't be reused and is hard to override.

In this app, the editor's *style.css* is always loaded into the preview. In real projects it is loaded **only**
if the HTML links it — so let's do it properly.`,
      starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Coffee Corner</title>
</head>
<body>
  <h1>Coffee Corner</h1>
  <p class="note" style="color: green; font-weight: bold;">Fresh pastries every morning!</p>
</body>
</html>
`,
      starterCss: `h1 {
  color: saddlebrown;
}
`,
      tasks: [
        { text: 'Link the stylesheet in <head> with <link rel="stylesheet" href="style.css">', check: (_doc, raw) => {
          // The preview swaps the <link> for the real CSS, so look at the source.
          const head = /<head[^>]*>([\s\S]*?)<\/head>/i.exec(raw)?.[1] ?? '';
          const link = /<link\b[^>]*>/gi;
          const ok = [...head.matchAll(link)].some((m) => /rel=["']?stylesheet/i.test(m[0]) && /href=["']?(\.\/)?style\.css/i.test(m[0]));
          return ok ? true : 'Add <link rel="stylesheet" href="style.css"> inside <head>.';
        } },
        { text: 'Remove the inline style attribute from the paragraph', check: noElement('[style]', 'Remove the style="..." attribute.') },
        { text: 'Move those styles to style.css in a .note rule (green, bold)', check: all(declares('.note', 'color', 'green'), computed('.note', 'font-weight', '700')) },
      ],
      hints: ['A class selector starts with a dot: .note { ... }', 'Bold is font-weight: bold; — the browser computes it as 700.'],
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Coffee Corner</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Coffee Corner</h1>
  <p class="note">Fresh pastries every morning!</p>
</body>
</html>
`,
      solutionCss: `h1 {
  color: saddlebrown;
}

.note {
  color: green;
  font-weight: bold;
}
`,
    },
    {
      id: 'css-selectors-basic',
      title: 'Type, class and id selectors',
      explanation: `Selectors decide which elements a rule styles:

| Selector | Matches | Example |
|---|---|---|
| \`p\` | every \`<p>\` (type selector) | \`p { }\` |
| \`.price\` | every element with \`class="price"\` | \`.price { }\` |
| \`#menu\` | the one element with \`id="menu"\` | \`#menu { }\` |
| \`h1, h2\` | a **group**: all \`<h1>\` and all \`<h2>\` | \`h1, h2 { }\` |
| \`*\` | every element | \`* { }\` |

An element can have several classes: \`class="price sale"\` matches both \`.price\` and \`.sale\`. You can
also chain them: \`.price.sale\` matches only elements that have **both** classes.

Prefer classes for styling. Ids are unique and very "strong" (you'll see why in the cascade lesson).`,
      starterCode: `<h1 id="title">Menu</h1>
<h2>Drinks</h2>
<ul>
  <li>Espresso <span class="price">€1.20</span></li>
  <li>Cappuccino <span class="price">€1.60</span></li>
  <li>Hot chocolate <span class="price sale">€1.80</span></li>
</ul>
<h2>Food</h2>
<p class="special">Today's special: lasagne.</p>
`,
      starterCss: '',
      tasks: [
        { text: 'Make #title color darkred using the id selector', check: all(declares('#title', 'color'), computed('#title', 'color', 'darkred')) },
        { text: 'Make the <h2>s and .special teal with one grouped rule: "h2, .special"', check: all(declares(/^h2\s*,\s*\.special$|^\.special\s*,\s*h2$/, 'color', undefined, 'Write one rule whose selector is "h2, .special".'), allComputed('h2', 'color', 'teal'), computed('.special', 'color', 'teal')) },
        { text: 'Make every .price bold', check: allComputed('.price', 'font-weight', '700') },
        { text: 'Make only the price that is also on .sale color crimson (chain .price.sale)', check: all(declares('.price.sale', 'color'), computed('.sale', 'color', 'crimson'), computed('li:first-child .price', 'color', (v) => v !== 'rgb(220, 20, 60)', 'Only the sale price should be crimson.')) },
      ],
      hints: ['Grouping: h2, .special { color: teal; }', 'Chaining has no space: .price.sale { }'],
      solution: `<h1 id="title">Menu</h1>
<h2>Drinks</h2>
<ul>
  <li>Espresso <span class="price">€1.20</span></li>
  <li>Cappuccino <span class="price">€1.60</span></li>
  <li>Hot chocolate <span class="price sale">€1.80</span></li>
</ul>
<h2>Food</h2>
<p class="special">Today's special: lasagne.</p>
`,
      solutionCss: `#title {
  color: darkred;
}

h2, .special {
  color: teal;
}

.price {
  font-weight: bold;
}

.price.sale {
  color: crimson;
}
`,
    },
    {
      id: 'css-colors',
      title: 'Colours',
      explanation: `CSS understands colours in several formats:

| Format | Example | Notes |
|---|---|---|
| Named | \`tomato\`, \`navy\` | ~140 names, handy for experiments |
| Hex | \`#e44d26\`, \`#fff\` | red, green, blue in hexadecimal |
| \`rgb()\` | \`rgb(228 77 38)\` | 0–255 per channel |
| \`hsl()\` | \`hsl(14 78% 52%)\` | hue (0–360°), saturation, lightness — easiest to tweak by hand |
| With alpha | \`rgb(0 0 0 / 50%)\`, \`#0008\` | transparency |

\`color\` sets the text colour, \`background-color\` the background.

\`\`\`css
.banner {
  background-color: hsl(210 80% 30%);
  color: #ffffff;
}
\`\`\`

Always keep enough **contrast** between text and background: light grey on white is hard to read for
everyone, and impossible for many people.`,
      starterCode: `<div class="banner">
  <h1>Summer sale</h1>
  <p>Everything 20% off.</p>
</div>
<p class="overlay">Semi-transparent box</p>
`,
      starterCss: `.banner {
  padding: 16px;
}
`,
      tasks: [
        { text: 'Give .banner a background using hsl()', check: all(cssMatches(/hsla?\(/i, 'Use the hsl() notation.'), computed('.banner', 'background-color', (v) => v !== 'rgba(0, 0, 0, 0)', 'Give .banner a background-color.')) },
        { text: 'Make the .banner text white using a hex colour', check: all(cssMatches(/#(fff|ffffff)\b/i, 'Write white as #fff or #ffffff.'), computed('.banner h1', 'color', 'white')) },
        { text: 'Give .overlay the background rgb(0 0 0 / 50%) (half-transparent black)', check: computed('.overlay', 'background-color', 'rgba(0, 0, 0, 0.5)') },
        { text: 'Make the .overlay text yellow with rgb()', check: all(cssMatches(/rgba?\(\s*255[ ,]+255[ ,]+0\s*\)/i, 'Write yellow as rgb(255 255 0).'), computed('.overlay', 'color', 'yellow')) },
      ],
      hints: ['Text colour is inherited: setting color on .banner colours the h1 and p inside it.'],
      solution: `<div class="banner">
  <h1>Summer sale</h1>
  <p>Everything 20% off.</p>
</div>
<p class="overlay">Semi-transparent box</p>
`,
      solutionCss: `.banner {
  padding: 16px;
  background-color: hsl(210 80% 30%);
  color: #fff;
}

.overlay {
  background-color: rgb(0 0 0 / 50%);
  color: rgb(255 255 0);
}
`,
    },
  ],
  challenge: {
    id: 'css-basics-challenge',
    title: 'Challenge: Style the business card',
    summary: 'Recreate a colour scheme exactly, using the target preview.',
    difficulty: 1,
    showTarget: true,
    explanation: `Style this business card so it looks like the **Target** tab of the preview. Requirements:

- Page background: \`#1e293b\`
- \`.card\` background: \`#f8fafc\`, with \`20px\` padding
- The name (\`h1\`): colour \`#0f766e\`, size \`32px\`
- The job title (\`.role\`): colour \`#64748b\`, bold
- The email link: colour \`#ea580c\`
- Use **classes** for the card and the role — no inline styles, no ids.`,
    starterCode: `<div class="card">
  <h1>Giulia Bianchi</h1>
  <p class="role">Front-end developer</p>
  <p><a href="mailto:giulia@example.com">giulia@example.com</a></p>
</div>
`,
    starterCss: '',
    tasks: [
      { text: 'Page background #1e293b', check: computed('body', 'background-color', '#1e293b') },
      { text: 'Card background #f8fafc and 20px padding', check: all(computed('.card', 'background-color', '#f8fafc'), computed('.card', 'padding-top', '20px'), computed('.card', 'padding-left', '20px')) },
      { text: 'Name colour #0f766e and size 32px', check: all(computed('h1', 'color', '#0f766e'), computed('h1', 'font-size', '32px')) },
      { text: 'Role colour #64748b and bold', check: all(computed('.role', 'color', '#64748b'), computed('.role', 'font-weight', '700')) },
      { text: 'Email link colour #ea580c', check: computed('a', 'color', '#ea580c') },
      { text: 'Styled with classes: no inline styles, no id selectors', check: all(noElement('[style]', 'Remove inline styles.'), (_doc, _raw, css = '') => (/#[a-z_-][\w-]*\s*[{,]/i.test(css.replace(/#[0-9a-f]{3,8}\b\s*;/gi, '')) ? 'Use classes instead of id selectors.' : true), rawMatches(/class=/, 'Keep the classes in the HTML.')) },
    ],
    hints: ['Padding is a box property: padding: 20px;', 'The link has its own default colour, so it needs its own rule: a { ... }'],
    solution: `<div class="card">
  <h1>Giulia Bianchi</h1>
  <p class="role">Front-end developer</p>
  <p><a href="mailto:giulia@example.com">giulia@example.com</a></p>
</div>
`,
    solutionCss: `body {
  background-color: #1e293b;
}

.card {
  background-color: #f8fafc;
  padding: 20px;
}

h1 {
  color: #0f766e;
  font-size: 32px;
}

.role {
  color: #64748b;
  font-weight: bold;
}

a {
  color: #ea580c;
}
`,
  },
};
