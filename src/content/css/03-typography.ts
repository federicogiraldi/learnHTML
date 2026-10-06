import type { Module } from '../types';
import { all, rawMatches } from '../../engine/checks';
import { allComputed, boxSize, centeredIn, computed, cssMatches, declares, px } from '../../engine/cssChecks';

const ARTICLE = `<article>
  <h1>The joy of slow coffee</h1>
  <p class="meta">By Marta · 5 min read</p>
  <p>Pour-over coffee takes a few minutes longer than a capsule, but those minutes are the point. You watch the bloom, smell the aroma and slow down before the day speeds up.</p>
  <p>All you need is a kettle, a filter and freshly ground beans. Start with 15 grams of coffee for 250 ml of water, and adjust to taste.</p>
</article>
`;

export const typography: Module = {
  id: 'css-type',
  title: 'Typography',
  description: 'Fonts, sizes, units and spacing that make text a pleasure to read.',
  lessons: [
    {
      id: 'css-fonts',
      title: 'Fonts',
      explanation: `\`font-family\` takes a **list** of fonts. The browser uses the first one installed, so always end with
a *generic family*: \`serif\`, \`sans-serif\`, \`monospace\`, \`system-ui\`…

\`\`\`css
body {
  font-family: "Helvetica Neue", Arial, sans-serif;
}
code {
  font-family: ui-monospace, Menlo, Consolas, monospace;
}
\`\`\`

Font names with spaces go in quotes. Other font properties:

- \`font-weight\`: \`normal\` (400), \`bold\` (700), or any number 100–900 if the font has it.
- \`font-style\`: \`normal\` or \`italic\`.
- \`font\`: a shorthand, e.g. \`font: italic 700 18px/1.5 Georgia, serif;\` (style, weight, size/line-height, family).

Font-related properties are **inherited**: set them on \`body\` and the whole page follows.`,
      starterCode: ARTICLE,
      starterCss: '',
      tasks: [
        { text: 'Set the page font to Georgia, falling back to serif (on body)', check: all(declares('body', 'font-family', /georgia.*,\s*serif\s*$/i, 'On body: font-family: Georgia, serif;'), computed('p', 'font-family', /georgia/i)) },
        { text: 'Give the <h1> a sans-serif stack ending in sans-serif', check: computed('h1', 'font-family', /sans-serif\s*$/) },
        { text: 'Make .meta italic', check: computed('.meta', 'font-style', 'italic') },
        { text: 'Make the <h1> weight 900', check: computed('h1', 'font-weight', '900') },
      ],
      hints: ['h1 { font-family: "Helvetica Neue", Arial, sans-serif; font-weight: 900; }'],
      solution: ARTICLE,
      solutionCss: `body {
  font-family: Georgia, serif;
}

h1 {
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-weight: 900;
}

.meta {
  font-style: italic;
}
`,
    },
    {
      id: 'css-units',
      title: 'Sizes and units',
      explanation: `CSS has **absolute** and **relative** units:

| Unit | Relative to | Use it for |
|---|---|---|
| \`px\` | nothing (a CSS pixel) | borders, small fixed details |
| \`rem\` | the **root** (\`<html>\`) font size, 16px by default | font sizes, spacing |
| \`em\` | the **current element's** font size | spacing that should scale with its text |
| \`%\` | the parent | widths |

Prefer \`rem\` for font sizes: if a user increases the browser's default font size, your whole page scales
with it. With \`px\` it doesn't.

\`\`\`css
h1 { font-size: 2.5rem; }     /* 40px by default */
.btn { padding: 0.5em 1em; }  /* grows with the button's own text */
\`\`\``,
      starterCode: ARTICLE,
      starterCss: `h1 {
  font-size: 40px;
}
`,
      tasks: [
        { text: 'Change the <h1> size to 2.5rem (same 40px, but scalable)', check: all(declares('h1', 'font-size', '2.5rem'), computed('h1', 'font-size', '40px')) },
        { text: 'Make paragraphs 1.125rem (18px)', check: computed('article > p:not(.meta)', 'font-size', '18px') },
        { text: 'Make .meta 0.875rem (14px)', check: computed('.meta', 'font-size', '14px') },
        { text: 'Don\'t use px for font sizes', check: (_doc, _raw, css = '') => (/font-size\s*:\s*[\d.]+px/i.test(css) ? 'Use rem instead of px for font-size.' : true) },
      ],
      hints: ['1rem = 16px, so 18px = 1.125rem and 14px = 0.875rem.'],
      solution: ARTICLE,
      solutionCss: `h1 {
  font-size: 2.5rem;
}

p {
  font-size: 1.125rem;
}

.meta {
  font-size: 0.875rem;
}
`,
    },
    {
      id: 'css-text',
      title: 'Readable text',
      explanation: `A few properties make the biggest difference to readability:

- \`line-height\` — space between lines. Body text reads best around **1.5**. Use a unitless number so it
  scales with the font size.
- \`max-width\` — lines that are too long are tiring. Aim for **45–75 characters**: \`max-width: 65ch\`
  (\`ch\` = the width of the "0" character).
- \`text-align\` — \`left\` (default), \`center\`, \`right\`, \`justify\` (avoid on the web: it creates uneven gaps).
- \`letter-spacing\`, \`text-transform: uppercase\` — great for small labels.
- \`text-decoration\` — underline/none, e.g. for links.

\`\`\`css
article {
  max-width: 65ch;
  margin: 0 auto;   /* centre the column */
  line-height: 1.6;
}
\`\`\``,
      starterCode: ARTICLE,
      starterCss: `body {
  font-family: Georgia, serif;
}
`,
      tasks: [
        { text: 'Set line-height 1.6 on the article', check: computed('article p:not(.meta)', 'line-height', (v) => Math.abs(px(v) / 16 - 1.6) < 0.01, 'Set line-height: 1.6 on article.') },
        { text: 'Limit the article to max-width: 60ch', check: declares('article', 'max-width', '60ch') },
        { text: 'Centre the article column with margin: 0 auto', check: centeredIn('article', 'body', 'x') },
        { text: 'Turn .meta into an uppercase label with 0.1em letter-spacing', check: all(computed('.meta', 'text-transform', 'uppercase'), computed('.meta', 'letter-spacing', (v) => px(v) > 0, 'Add letter-spacing: 0.1em.')) },
        { text: 'Centre the <h1> text', check: computed('h1', 'text-align', 'center') },
      ],
      hints: ['margin: 0 auto centres a block that has a width or max-width.'],
      solution: ARTICLE,
      solutionCss: `body {
  font-family: Georgia, serif;
}

article {
  max-width: 60ch;
  margin: 0 auto;
  line-height: 1.6;
}

h1 {
  text-align: center;
}

.meta {
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
`,
    },
    {
      id: 'css-webfonts',
      title: 'Web fonts',
      explanation: `To use a font that isn't installed on the user's device, load it as a **web font**. The simplest way
is Google Fonts: link its stylesheet in your HTML, then use the family name.

\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap">
\`\`\`

\`\`\`css
body {
  font-family: "Lora", Georgia, serif;
}
\`\`\`

Or host the file yourself with \`@font-face\`:

\`\`\`css
@font-face {
  font-family: "Lora";
  src: url("fonts/lora.woff2") format("woff2");
  font-display: swap;   /* show fallback text while the font loads */
}
\`\`\`

Keep the fallbacks in the stack: if the font fails to load, the page still looks good. Load only the weights
you use — every extra file slows the page down.`,
      starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fonts</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>The joy of slow coffee</h1>
  <p>Pour-over coffee takes a few minutes longer, but those minutes are the point.</p>
</body>
</html>
`,
      starterCss: `body {
  font-family: Georgia, serif;
}
`,
      tasks: [
        { text: 'Load "Lora" from Google Fonts with a <link> in <head>', check: rawMatches(/<head[\s\S]*<link[^>]*href=["']https:\/\/fonts\.googleapis\.com\/css2\?family=Lora[\s\S]*<\/head>/i, 'Add the Google Fonts <link> for Lora inside <head>.') },
        { text: 'Load only the weights 400 and 700, with display=swap', check: rawMatches(/family=Lora:wght@400;700[^"']*display=swap/i, 'Use the URL ...family=Lora:wght@400;700&display=swap') },
        { text: 'Use "Lora" on body, keeping Georgia, serif as fallbacks', check: computed('body', 'font-family', /^"?Lora"?,\s*Georgia,\s*serif$/i) },
        { text: 'Make the <h1> use the bold (700) weight you loaded', check: all(computed('h1', 'font-weight', '700'), cssMatches(/lora/i, 'Use Lora in your CSS.')) },
      ],
      hints: ['Copy the <link> from the explanation into the <head> of index.html.'],
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Fonts</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>The joy of slow coffee</h1>
  <p>Pour-over coffee takes a few minutes longer, but those minutes are the point.</p>
</body>
</html>
`,
      solutionCss: `body {
  font-family: "Lora", Georgia, serif;
}

h1 {
  font-weight: 700;
}
`,
    },
  ],
  challenge: {
    id: 'css-type-challenge',
    title: 'Challenge: A beautifully readable article',
    summary: 'Turn a wall of text into an article people enjoy reading.',
    difficulty: 2,
    showTarget: true,
    explanation: `Make this article comfortable to read — compare with the **Target** tab. Requirements:

- Body text: \`system-ui, sans-serif\` stack, \`1.125rem\`, line-height \`1.7\`, colour \`#1f2937\`.
- The article column: at most \`65ch\` wide and centred.
- Headings: \`Georgia, serif\`; the \`<h1>\` is \`2.5rem\` and line-height \`1.2\`.
- \`.lead\` (the intro): \`1.25rem\`, colour \`#4b5563\`.
- Links: colour \`#b45309\`, underlined only on hover.
- No \`px\` font sizes.`,
    starterCode: `<article>
  <h1>Why we should all write more by hand</h1>
  <p class="lead">Keyboards are fast. Pens are slow. That is exactly why pens are good for thinking.</p>
  <h2>Slowness helps memory</h2>
  <p>Studies suggest that students who take notes by hand remember concepts better than those who type, because writing forces them to summarise instead of transcribing. <a href="#">Read the study</a>.</p>
  <h2>Paper has no notifications</h2>
  <p>A notebook never interrupts you. There are no tabs, no messages and no updates: just you and the next sentence.</p>
</article>
`,
    starterCss: '',
    tasks: [
      { text: 'Body text: system-ui stack, 1.125rem, line-height 1.7, colour #1f2937', check: all(computed('article p:not(.lead)', 'font-family', /^system-ui,\s*sans-serif$/), computed('article p:not(.lead)', 'font-size', '18px'), computed('article p:not(.lead)', 'line-height', (v) => Math.abs(px(v) / 18 - 1.7) < 0.01, 'Set line-height: 1.7.'), computed('article p:not(.lead)', 'color', '#1f2937')) },
      { text: 'Article at most 65ch wide and centred', check: all(declares('article', 'max-width', '65ch'), centeredIn('article', 'body', 'x'), boxSize('article', 'width', (w) => w < 760, 'The article should be narrower than the page.')) },
      { text: 'Headings in Georgia, serif', check: allComputed('h1, h2', 'font-family', /^Georgia,\s*serif$/) },
      { text: 'h1: 2.5rem with line-height 1.2', check: all(computed('h1', 'font-size', '40px'), computed('h1', 'line-height', '48px')) },
      { text: '.lead: 1.25rem, colour #4b5563', check: all(computed('.lead', 'font-size', '20px'), computed('.lead', 'color', '#4b5563')) },
      { text: 'Links: #b45309, underlined only on hover', check: all(computed('a', 'color', '#b45309'), computed('a', 'text-decoration-line', 'none'), declares(/a:hover/, 'text-decoration', /underline/, 'Add a:hover { text-decoration: underline; }')) },
      { text: 'No px font sizes', check: (_doc, _raw, css = '') => (/font-size\s*:\s*[\d.]+px/i.test(css) ? 'Use rem, not px, for font sizes.' : true) },
    ],
    hints: ['Set the body styles on article (or body) once: they are inherited by every paragraph.', 'line-height 1.2 on a 40px heading computes to 48px.'],
    solution: `<article>
  <h1>Why we should all write more by hand</h1>
  <p class="lead">Keyboards are fast. Pens are slow. That is exactly why pens are good for thinking.</p>
  <h2>Slowness helps memory</h2>
  <p>Studies suggest that students who take notes by hand remember concepts better than those who type, because writing forces them to summarise instead of transcribing. <a href="#">Read the study</a>.</p>
  <h2>Paper has no notifications</h2>
  <p>A notebook never interrupts you. There are no tabs, no messages and no updates: just you and the next sentence.</p>
</article>
`,
    solutionCss: `body {
  font-family: system-ui, sans-serif;
  font-size: 1.125rem;
  line-height: 1.7;
  color: #1f2937;
}

article {
  max-width: 65ch;
  margin: 0 auto;
}

h1, h2 {
  font-family: Georgia, serif;
}

h1 {
  font-size: 2.5rem;
  line-height: 1.2;
}

.lead {
  font-size: 1.25rem;
  color: #4b5563;
}

a {
  color: #b45309;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`,
  },
};
