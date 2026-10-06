import type { Check } from '../types';
import type { Module } from '../types';
import { all } from '../../engine/checks';
import {
  atWidth, columns, computed, cssMatches, cssNotMatches, declares, hasMediaQuery, inOneRow, noImportant, px, styleRules,
  usesProperty, usesSelector,
} from '../../engine/cssChecks';

const rectOf = (doc: Document, sel: string) => doc.querySelector(sel)!.getBoundingClientRect();

/** Inside some `@media (prefers-color-scheme: dark)` block, a rule redefines a custom property. */
const darkModeRedefinesVars =
  (message = 'Inside @media (prefers-color-scheme: dark), redefine your custom properties (e.g. on :root).'): Check =>
  (doc) => {
    const win = doc.defaultView as typeof window;
    for (const sheet of doc.styleSheets) {
      for (const r of sheet.cssRules) {
        if (!(r instanceof win.CSSMediaRule) || !/prefers-color-scheme:\s*dark/.test(r.conditionText)) continue;
        for (const inner of r.cssRules) {
          if (inner instanceof win.CSSStyleRule && [...inner.style].some((p) => p.startsWith('--'))) return true;
        }
      }
    }
    return message;
  };

/** At least `n` custom properties are defined on :root. */
const rootVars =
  (n: number): Check =>
  (doc) => {
    const names = new Set(
      styleRules(doc)
        .filter((r) => r.selectorText === ':root')
        .flatMap((r) => [...r.style].filter((p) => p.startsWith('--'))),
    );
    return names.size >= n ? true : `Define at least ${n} custom properties on :root (found ${names.size}).`;
  };

export const advanced: Module = {
  id: 'css-advanced',
  title: 'Advanced CSS',
  description: 'Custom properties, positioning, transitions, animations, nesting and dark mode.',
  lessons: [
    {
      id: 'css-variables',
      title: 'Custom properties (CSS variables)',
      explanation: `**Custom properties** store values you reuse. They start with \`--\` and are read with \`var()\`:

\`\`\`css
:root {
  --brand: #e44d26;
  --radius: 8px;
}
.btn {
  background: var(--brand);
  border-radius: var(--radius);
}
\`\`\`

- Define global ones on \`:root\` (the \`<html>\` element).
- They **inherit** and can be overridden on any element: a \`.theme-ocean\` class can redefine \`--brand\` and
  everything inside it changes colour.
- \`var(--size, 16px)\` provides a fallback if the variable is not defined.

Change one value, and the whole design follows. That's what makes themes and dark modes easy.`,
      starterCode: `<button class="btn">Default</button>
<section class="theme-ocean">
  <button class="btn">Ocean</button>
</section>
`,
      starterCss: `.btn {
  background: #e44d26;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 18px;
}
`,
      tasks: [
        { text: 'Define --brand: #e44d26 and --radius: 8px on :root', check: all(declares(':root', '--brand', '#e44d26'), declares(':root', '--radius', '8px')) },
        { text: 'Use var(--brand) and var(--radius) in .btn', check: all(declares('.btn', 'background', /var\(--brand\)/, 'Use background: var(--brand) in .btn.'), declares('.btn', 'border-radius', /var\(--radius\)/, 'Use border-radius: var(--radius) in .btn.')) },
        { text: 'Inside .theme-ocean, redefine --brand as #0284c7', check: all(declares('.theme-ocean', '--brand', '#0284c7'), computed('.theme-ocean .btn', 'background-color', '#0284c7'), computed('body > .btn', 'background-color', '#e44d26')) },
      ],
      hints: ['.theme-ocean { --brand: #0284c7; } — no need to touch .btn again.'],
      solution: `<button class="btn">Default</button>
<section class="theme-ocean">
  <button class="btn">Ocean</button>
</section>
`,
      solutionCss: `:root {
  --brand: #e44d26;
  --radius: 8px;
}

.btn {
  background: var(--brand);
  color: white;
  border: none;
  border-radius: var(--radius);
  padding: 10px 18px;
}

.theme-ocean {
  --brand: #0284c7;
}
`,
    },
    {
      id: 'css-position',
      title: 'Positioning',
      explanation: `\`position\` takes an element out of the normal flow:

| Value | Positioned relative to | Typical use |
|---|---|---|
| \`static\` | — (normal flow, default) | |
| \`relative\` | its normal spot; also becomes the **anchor** for absolute children | containers |
| \`absolute\` | the nearest positioned ancestor | badges, overlays |
| \`fixed\` | the viewport | chat buttons |
| \`sticky\` | scrolls normally, then sticks at \`top\` | headers, table headers |

\`\`\`css
.card { position: relative; }
.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
header {
  position: sticky;
  top: 0;
  z-index: 10;   /* stack above the content that scrolls under it */
}
\`\`\``,
      starterCode: `<header class="bar">My shop</header>
<div class="card">
  <span class="badge">-30%</span>
  <img src="https://picsum.photos/id/21/300/200" alt="A pair of shoes" width="300" height="200">
  <h2>Shoes</h2>
</div>
`,
      starterCss: `.bar {
  background: #111;
  color: white;
  padding: 12px;
}

.card {
  width: 300px;
  margin-top: 20px;
  border: 1px solid #ddd;
}

.badge {
  background: crimson;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
}
`,
      tasks: [
        { text: 'Make .card the positioning anchor (position: relative)', check: computed('.card', 'position', 'relative') },
        { text: 'Place .badge in the top-right corner, 8px from each edge', check: all(computed('.badge', 'position', 'absolute'), (doc) => {
          const c = rectOf(doc, '.card');
          const b = rectOf(doc, '.badge');
          return Math.abs(b.top - c.top - 9) < 1.5 && Math.abs(c.right - b.right - 9) < 1.5 ? true : 'Use top: 8px; right: 8px; (the card has a 1px border).';
        }) },
        { text: 'Make the header sticky at the top, above everything (z-index 10)', check: all(computed('.bar', 'position', 'sticky'), computed('.bar', 'top', '0px'), computed('.bar', 'z-index', '10')) },
      ],
      hints: ['An absolute element is positioned from the padding edge of its anchor, inside the border.'],
      solution: `<header class="bar">My shop</header>
<div class="card">
  <span class="badge">-30%</span>
  <img src="https://picsum.photos/id/21/300/200" alt="A pair of shoes" width="300" height="200">
  <h2>Shoes</h2>
</div>
`,
      solutionCss: `.bar {
  background: #111;
  color: white;
  padding: 12px;
  position: sticky;
  top: 0;
  z-index: 10;
}

.card {
  width: 300px;
  margin-top: 20px;
  border: 1px solid #ddd;
  position: relative;
}

.badge {
  background: crimson;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  position: absolute;
  top: 8px;
  right: 8px;
}
`,
    },
    {
      id: 'css-transitions',
      title: 'Transforms and transitions',
      explanation: `\`transform\` moves, scales or rotates an element **without affecting the layout** around it:
\`translateY(-4px)\`, \`scale(1.05)\`, \`rotate(45deg)\`.

\`transition\` animates the change between two states (e.g. normal → \`:hover\`):

\`\`\`css
.card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgb(0 0 0 / 20%);
}
\`\`\`

Put the \`transition\` on the **normal** state, so it animates both in and out. Animate \`transform\` and
\`opacity\` when you can: they are the cheapest properties for the browser to animate smoothly.`,
      starterCode: `<a class="card" href="#">
  <h2>Hover me</h2>
  <p>I lift up smoothly.</p>
</a>
<button class="icon" aria-label="Add">+</button>
`,
      starterCss: `.card {
  display: block;
  width: 240px;
  padding: 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 6px rgb(0 0 0 / 10%);
  color: inherit;
  text-decoration: none;
}

.icon {
  font-size: 1.5rem;
  margin-top: 20px;
}
`,
      tasks: [
        { text: 'On .card:hover, lift it with transform: translateY(-4px)', check: declares(/\.card:hover/, 'transform', /translateY\(\s*-4px\s*\)/, 'Write .card:hover { transform: translateY(-4px); }') },
        { text: 'Animate the change with a transition on .card (200ms)', check: all(declares('.card', 'transition-duration', /^(0\.2s|200ms)\b/, 'Set transition: transform 200ms ease; on .card (not on :hover).'), declares('.card', 'transition-property', /transform|all/)) },
        { text: 'Rotate the + icon 45° on hover, with a transition', check: all(declares(/\.icon:hover/, 'transform', /rotate\(\s*45deg\s*\)/), declares('.icon', 'transition-duration', (/[1-9]/), 'Add a transition to .icon.')) },
      ],
      hints: ['transition: transform 200ms ease; goes on .card itself.'],
      solution: `<a class="card" href="#">
  <h2>Hover me</h2>
  <p>I lift up smoothly.</p>
</a>
<button class="icon" aria-label="Add">+</button>
`,
      solutionCss: `.card {
  display: block;
  width: 240px;
  padding: 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 6px rgb(0 0 0 / 10%);
  color: inherit;
  text-decoration: none;
  transition: transform 200ms ease, box-shadow 200ms ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgb(0 0 0 / 20%);
}

.icon {
  font-size: 1.5rem;
  margin-top: 20px;
  transition: transform 150ms ease;
}

.icon:hover {
  transform: rotate(45deg);
}
`,
    },
    {
      id: 'css-animations',
      title: 'Keyframe animations',
      explanation: `Transitions go from A to B when something changes. **Animations** run on their own, through as many
steps as you like, defined with \`@keyframes\`:

\`\`\`css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.1); }
}

.dot {
  animation: pulse 1.5s ease-in-out infinite;
}
\`\`\`

\`animation\` = name, duration, timing function, iteration count (and more: delay, direction…).

Some people get dizzy or sick from motion. Respect their system setting:

\`\`\`css
@media (prefers-reduced-motion: reduce) {
  .dot { animation: none; }
}
\`\`\``,
      starterCode: `<div class="loader" role="status" aria-label="Loading"></div>
<p class="new">New!</p>
`,
      starterCss: `.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top-color: #6366f1;
  border-radius: 50%;
}

.new {
  display: inline-block;
  background: gold;
  padding: 4px 10px;
  border-radius: 99px;
}
`,
      tasks: [
        { text: 'Define @keyframes spin from rotate(0) to rotate(360deg)', check: cssMatches(/@keyframes\s+spin\s*\{[\s\S]*rotate\(\s*360deg\s*\)/, 'Write @keyframes spin { to { transform: rotate(360deg); } }') },
        { text: 'Make .loader spin: 1s, linear, infinite', check: all(declares('.loader', 'animation-name', 'spin'), declares('.loader', 'animation-duration', '1s'), declares('.loader', 'animation-timing-function', 'linear'), declares('.loader', 'animation-iteration-count', 'infinite')) },
        { text: 'Make .new pulse with a @keyframes pulse animation', check: all(cssMatches(/@keyframes\s+pulse/, 'Define @keyframes pulse.'), declares('.new', 'animation-name', 'pulse')) },
        { text: 'Turn animations off with prefers-reduced-motion: reduce', check: hasMediaQuery(/prefers-reduced-motion:\s*reduce/, 'Add @media (prefers-reduced-motion: reduce) { ... }.') },
      ],
      hints: ['animation: spin 1s linear infinite;'],
      solution: `<div class="loader" role="status" aria-label="Loading"></div>
<p class="new">New!</p>
`,
      solutionCss: `.loader {
  width: 40px;
  height: 40px;
  border: 4px solid #ddd;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.new {
  display: inline-block;
  background: gold;
  padding: 4px 10px;
  border-radius: 99px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@media (prefers-reduced-motion: reduce) {
  .loader, .new {
    animation: none;
  }
}
`,
    },
    {
      id: 'css-nesting',
      title: 'Nesting and cascade layers',
      explanation: `**Native nesting** lets you write related rules inside their parent, like in Sass:

\`\`\`css
.card {
  padding: 16px;

  & h2 { margin-top: 0; }          /* .card h2 */
  &:hover { background: #f8fafc; } /* .card:hover */
  &.featured { border-color: gold; } /* .card.featured */
}
\`\`\`

\`&\` stands for the parent selector. Don't nest too deep: 2–3 levels is plenty.

**Cascade layers** (\`@layer\`) control which group of rules wins, regardless of specificity:

\`\`\`css
@layer reset, base, components;   /* later layers win */

@layer base {
  a { color: blue; }
}
@layer components {
  .btn { color: white; }
}
\`\`\``,
      starterCode: `<article class="post">
  <h2>Nesting is here</h2>
  <p>No preprocessor needed.</p>
  <a href="#">Read more</a>
</article>
<article class="post featured">
  <h2>Featured post</h2>
  <p>This one has a gold border.</p>
  <a href="#">Read more</a>
</article>
`,
      starterCss: `.post {
  border: 2px solid #e5e7eb;
  padding: 16px;
  margin-bottom: 12px;
}

.post h2 {
  margin-top: 0;
  color: #1e3a8a;
}

.post a {
  font-weight: bold;
}

.post.featured {
  border-color: gold;
}
`,
      tasks: [
        { text: 'Nest the h2, a and .featured rules inside .post using &', check: all(cssMatches(/\.post\s*\{[\s\S]*&\s*h2[\s\S]*&\s*a\b[\s\S]*\}/, 'Nest "& h2" and "& a" inside .post { ... }.'), cssMatches(/&\.featured/, 'Nest "&.featured" inside .post.'), cssNotMatches(/^\s*\.post\s+h2/m, 'Remove the old top-level ".post h2" rule.')) },
        { text: 'The result is the same: blue headings, bold links, gold featured border', check: all(computed('.post h2', 'color', '#1e3a8a'), computed('.post a', 'font-weight', '700'), computed('.featured', 'border-top-color', 'gold'), computed('.post h2', 'margin-top', '0px')) },
        { text: 'Declare the layers "@layer base, components;" and put .post inside @layer components', check: all(cssMatches(/@layer\s+base\s*,\s*components\s*;/, 'Declare @layer base, components;'), cssMatches(/@layer\s+components\s*\{[\s\S]*\.post/, 'Wrap the .post rule in @layer components { ... }.')) },
      ],
      hints: ['.post { ... & h2 { ... } & a { ... } &.featured { ... } }'],
      solution: `<article class="post">
  <h2>Nesting is here</h2>
  <p>No preprocessor needed.</p>
  <a href="#">Read more</a>
</article>
<article class="post featured">
  <h2>Featured post</h2>
  <p>This one has a gold border.</p>
  <a href="#">Read more</a>
</article>
`,
      solutionCss: `@layer base, components;

@layer components {
  .post {
    border: 2px solid #e5e7eb;
    padding: 16px;
    margin-bottom: 12px;

    & h2 {
      margin-top: 0;
      color: #1e3a8a;
    }

    & a {
      font-weight: bold;
    }

    &.featured {
      border-color: gold;
    }
  }
}
`,
    },
    {
      id: 'css-dark-mode',
      title: 'Dark mode',
      explanation: `With custom properties, dark mode is just a second set of values:

\`\`\`css
:root {
  color-scheme: light dark;   /* native controls and scrollbars follow too */
  --bg: #ffffff;
  --text: #1f2937;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111827;
    --text: #f3f4f6;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}
\`\`\`

\`prefers-color-scheme\` follows the user's operating system setting. Check contrast in **both** themes, and
avoid pure black \`#000\` backgrounds: a very dark grey is easier on the eyes.`,
      starterCode: `<main>
  <h1>Night owl</h1>
  <p>This page should follow your system theme.</p>
  <a href="#">A link</a>
</main>
`,
      starterCss: `body {
  background: #ffffff;
  color: #1f2937;
}

a {
  color: #2563eb;
}
`,
      tasks: [
        { text: 'Move the colours into --bg, --text and --link on :root', check: all(declares(':root', '--bg'), declares(':root', '--text'), declares(':root', '--link')) },
        { text: 'Use them with var() in body and a', check: all(declares('body', 'background', /var\(--bg\)/, 'Use background: var(--bg);'), declares('body', 'color', /var\(--text\)/), declares('a', 'color', /var\(--link\)/)) },
        { text: 'Add color-scheme: light dark on :root', check: computed(':root', 'color-scheme', 'light dark') },
        { text: 'Redefine the variables in @media (prefers-color-scheme: dark)', check: darkModeRedefinesVars() },
      ],
      hints: ['Only the :root values change inside the media query; body and a stay the same.'],
      solution: `<main>
  <h1>Night owl</h1>
  <p>This page should follow your system theme.</p>
  <a href="#">A link</a>
</main>
`,
      solutionCss: `:root {
  color-scheme: light dark;
  --bg: #ffffff;
  --text: #1f2937;
  --link: #2563eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111827;
    --text: #f3f4f6;
    --link: #93c5fd;
  }
}

body {
  background: var(--bg);
  color: var(--text);
}

a {
  color: var(--link);
}
`,
    },
  ],
  challenge: {
    id: 'css-capstone',
    title: 'Capstone: Style your portfolio',
    summary: 'Everything together: a complete, responsive, themed and accessible design.',
    difficulty: 3,
    explanation: `The final project. This is the portfolio page from the HTML capstone — now give it a complete design of
**your own**. The checks verify the techniques, not the colours: be creative.

Requirements:
- A design system: at least **4 custom properties** on \`:root\`, used through \`var()\`.
- \`box-sizing: border-box\` everywhere and readable text (line-height at least 1.5).
- Content centred in a column of at most \`1000px\`.
- A **sticky** header with the navigation links in a row.
- A projects grid: 1 column on phones (375px), at least 2 columns at 900px.
- Images never overflow.
- Links and buttons have a \`:hover\` state with a \`transition\`, and a visible \`:focus-visible\` outline.
- A **dark mode** that redefines your variables, and animations/transitions disabled for
  \`prefers-reduced-motion\`.
- Valid CSS, no \`!important\`.`,
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ada Rossi | Web developer</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <a class="logo" href="#">Ada Rossi</a>
    <nav aria-label="Sections">
      <ul class="nav">
        <li><a href="#about">About</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main class="container">
    <section id="about">
      <h1>I build fast, accessible websites.</h1>
      <p>Front-end developer based in Florence, Italy.</p>
    </section>
    <section id="projects">
      <h2>Projects</h2>
      <div class="projects">
        <article class="project">
          <img src="https://picsum.photos/id/292/800/500" alt="Fresh bread on a wooden table" width="800" height="500">
          <h3>Bakery website</h3>
          <p>A site for a local bakery.</p>
        </article>
        <article class="project">
          <img src="https://picsum.photos/id/1018/800/500" alt="Mountains under a cloudy sky" width="800" height="500">
          <h3>Hiking app</h3>
          <p>Trail maps that work offline.</p>
        </article>
        <article class="project">
          <img src="https://picsum.photos/id/180/800/500" alt="A laptop on a desk" width="800" height="500">
          <h3>Study planner</h3>
          <p>Plan your week in five minutes.</p>
        </article>
      </div>
    </section>
    <section id="contact">
      <h2>Contact</h2>
      <form action="/contact" method="post">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
        <button type="submit">Send</button>
      </form>
    </section>
  </main>
</body>
</html>
`,
    starterCss: '',
    tasks: [
      { text: 'At least 4 custom properties on :root, used with var()', check: all(rootVars(4), (_doc, _raw, css = '') => ((css.match(/var\(--/g) ?? []).length >= 4 ? true : 'Use your variables with var() in at least 4 places.')) },
      { text: 'border-box everywhere; line-height at least 1.5', check: all(computed('.project', 'box-sizing', 'border-box', 'Add the universal box-sizing: border-box rule.'), computed('p', 'line-height', (v) => v === 'normal' ? false : px(v) / 16 >= 1.5 - 0.01, 'Set line-height: 1.5 or more on body.')) },
      { text: 'Content column at most 1000px and centred', check: atWidth(1300, (doc) => {
        const c = rectOf(doc, '.container');
        return c.width <= 1000.5 && Math.abs(c.left - (1300 - c.right)) < 2 ? true : '.container should be at most 1000px wide and centred.';
      }) },
      { text: 'Sticky header; nav links in a row', check: all(computed('.site-header', 'position', 'sticky'), computed('.site-header', 'top', '0px'), inOneRow('.nav li')) },
      { text: 'Projects: 1 column at 375px, at least 2 at 900px', check: all(atWidth(375, columns('.projects', 1)), atWidth(900, (doc) => (doc.querySelectorAll('.projects > *').length && new Set([...doc.querySelectorAll('.projects > *')].map((p) => Math.round(p.getBoundingClientRect().left))).size >= 2 ? true : 'At 900px show at least 2 columns.'))) },
      { text: 'Images never overflow their card', check: atWidth(375, (doc) => ([...doc.querySelectorAll('.project img')].every((i) => i.getBoundingClientRect().right <= i.closest('.project')!.getBoundingClientRect().right + 0.5) ? true : 'Images overflow their card: max-width: 100%; height: auto;')) },
      { text: 'Hover states with transitions on links or buttons', check: all(usesSelector(/(a|button|\.[\w-]+):hover/, 'Add :hover styles to links or buttons.'), usesProperty('transition-duration', /[1-9]/, 'Add a transition to your links or buttons.')) },
      { text: 'A visible :focus-visible outline', check: usesSelector(/:focus-visible/, 'Style :focus-visible with an outline.') },
      { text: 'Dark mode redefines the variables', check: darkModeRedefinesVars() },
      { text: 'Respects prefers-reduced-motion', check: hasMediaQuery(/prefers-reduced-motion/, 'Add @media (prefers-reduced-motion: reduce) to turn off motion.') },
      { text: 'No !important', check: noImportant() },
    ],
    hints: [
      'Start with :root variables and the border-box rule, then style the page top to bottom.',
      '.projects { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; } covers both widths.',
      'The modules on variables, positioning, transitions and dark mode each cover one requirement.',
    ],
    solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ada Rossi | Web developer</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="site-header">
    <a class="logo" href="#">Ada Rossi</a>
    <nav aria-label="Sections">
      <ul class="nav">
        <li><a href="#about">About</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main class="container">
    <section id="about">
      <h1>I build fast, accessible websites.</h1>
      <p>Front-end developer based in Florence, Italy.</p>
    </section>
    <section id="projects">
      <h2>Projects</h2>
      <div class="projects">
        <article class="project">
          <img src="https://picsum.photos/id/292/800/500" alt="Fresh bread on a wooden table" width="800" height="500">
          <h3>Bakery website</h3>
          <p>A site for a local bakery.</p>
        </article>
        <article class="project">
          <img src="https://picsum.photos/id/1018/800/500" alt="Mountains under a cloudy sky" width="800" height="500">
          <h3>Hiking app</h3>
          <p>Trail maps that work offline.</p>
        </article>
        <article class="project">
          <img src="https://picsum.photos/id/180/800/500" alt="A laptop on a desk" width="800" height="500">
          <h3>Study planner</h3>
          <p>Plan your week in five minutes.</p>
        </article>
      </div>
    </section>
    <section id="contact">
      <h2>Contact</h2>
      <form action="/contact" method="post">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
        <button type="submit">Send</button>
      </form>
    </section>
  </main>
</body>
</html>
`,
    solutionCss: `*, *::before, *::after {
  box-sizing: border-box;
}

:root {
  color-scheme: light dark;
  --bg: #fafaf9;
  --surface: #ffffff;
  --text: #1c1917;
  --muted: #57534e;
  --accent: #c2410c;
  --radius: 12px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0c0a09;
    --surface: #1c1917;
    --text: #f5f5f4;
    --muted: #a8a29e;
    --accent: #fb923c;
  }
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

a {
  color: var(--accent);
  transition: color 150ms ease;
}

a:hover {
  color: var(--text);
}

a:focus-visible,
button:focus-visible,
input:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.site-header {
  position: sticky;
  top: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--muted);
}

.logo {
  font-weight: 800;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 20px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

h1 {
  font-size: clamp(2rem, 5vw, 3rem);
}

.projects {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}

.project {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 16px;
}

.project img {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: calc(var(--radius) / 2);
}

form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

button {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius);
  padding: 10px 20px;
  transition: transform 150ms ease;
}

button:hover {
  transform: translateY(-2px);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition: none;
    animation: none;
  }
}
`,
  },
};
