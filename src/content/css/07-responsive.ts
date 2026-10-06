import type { Module } from '../types';
import { all, hasAttr } from '../../engine/checks';
import { atWidth, columns, computed, cssMatches, declares, hasMediaQuery, inOneRow, px, stacked } from '../../engine/cssChecks';

const rectOf = (doc: Document, sel: string) => doc.querySelector(sel)!.getBoundingClientRect();

const CARDS = `<div class="cards">
  <article class="card">One</article>
  <article class="card">Two</article>
  <article class="card">Three</article>
</div>
`;
const CARD_CSS = `.card {
  background: #dbeafe;
  padding: 24px;
  border-radius: 8px;
}
`;

export const responsive: Module = {
  id: 'css-responsive',
  title: 'Responsive Design',
  description: 'One page that works on phones, tablets and wide screens.',
  lessons: [
    {
      id: 'css-fluid-units',
      title: 'Fluid units and clamp()',
      explanation: `Responsive design starts with sizes that **adapt**:

| Unit | Relative to |
|---|---|
| \`%\` | the parent's size |
| \`vw\` / \`vh\` | 1% of the viewport width / height |
| \`min()\`, \`max()\` | the smaller / larger of several values |
| \`clamp(min, ideal, max)\` | the ideal value, but never below min or above max |

\`\`\`css
h1 {
  font-size: clamp(1.75rem, 5vw, 3.5rem);  /* grows with the screen, within limits */
}
.container {
  width: min(90%, 1000px);                 /* 90% on small screens, max 1000px */
  margin-inline: auto;
}
\`\`\`

Use \`vw\` only inside \`clamp()\` for text: pure \`vw\` font sizes don't respond to the user's zoom.`,
      starterCode: `<div class="container">
  <h1>Fluid typography</h1>
  <p>Resize the preview — the heading grows and shrinks smoothly.</p>
</div>
`,
      starterCss: `.container {
  width: 700px;
  margin: 0 auto;
  background: #f1f5f9;
}

h1 {
  font-size: 48px;
}
`,
      tasks: [
        { text: 'Size the heading with clamp(1.5rem, 6vw, 3rem)', check: cssMatches(/font-size\s*:\s*clamp\(\s*1\.5rem\s*,\s*6vw\s*,\s*3rem\s*\)/, 'Use font-size: clamp(1.5rem, 6vw, 3rem);') },
        { text: 'At 800px the heading reaches its 48px maximum', check: computed('h1', 'font-size', '48px') },
        { text: 'At 300px it stops at its 24px minimum', check: atWidth(300, computed('h1', 'font-size', '24px')) },
        { text: 'At 600px it is 6vw = 36px', check: atWidth(600, computed('h1', 'font-size', '36px')) },
        { text: 'Make the container width: min(90%, 700px) so it never overflows', check: all(declares('.container', 'width', /min\(\s*90%\s*,\s*700px\s*\)/), atWidth(400, (doc) => (rectOf(doc, '.container').width < 400 ? true : 'At 400px the container should be narrower than the screen.'))) },
      ],
      hints: ['clamp() takes three values: the minimum, the preferred value and the maximum.'],
      solution: `<div class="container">
  <h1>Fluid typography</h1>
  <p>Resize the preview — the heading grows and shrinks smoothly.</p>
</div>
`,
      solutionCss: `.container {
  width: min(90%, 700px);
  margin: 0 auto;
  background: #f1f5f9;
}

h1 {
  font-size: clamp(1.5rem, 6vw, 3rem);
}
`,
    },
    {
      id: 'css-media-queries',
      title: 'Media queries',
      explanation: `A **media query** applies rules only when a condition is true, typically the viewport width:

\`\`\`css
.cards {
  display: grid;
  gap: 16px;
}

@media (min-width: 600px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
\`\`\`

The width where the layout changes is a **breakpoint**. Pick breakpoints where *your content* starts to look
wrong, not for specific devices. Remember the viewport meta tag in your HTML, or phones ignore all this:
\`<meta name="viewport" content="width=device-width, initial-scale=1">\`.`,
      starterCode: CARDS,
      starterCss: `.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

${CARD_CSS}`,
      tasks: [
        { text: 'Use a @media query with min-width: 600px', check: hasMediaQuery(/min-width:\s*600px/, 'Add @media (min-width: 600px) { ... }.') },
        { text: 'On narrow screens (400px) the cards are stacked in one column', check: atWidth(400, columns('.cards', 1)) },
        { text: 'From 600px up there are 3 columns', check: all(atWidth(620, columns('.cards', 3)), columns('.cards', 3)) },
      ],
      hints: ['Move grid-template-columns inside the media query. Without it, a grid has one column.'],
      solution: CARDS,
      solutionCss: `.cards {
  display: grid;
  gap: 16px;
}

@media (min-width: 600px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

${CARD_CSS}`,
    },
    {
      id: 'css-mobile-first',
      title: 'Mobile first',
      explanation: `**Mobile first** means: write the base styles for the smallest screen, then *add* complexity with
\`min-width\` queries as space grows. It leads to simpler CSS than starting from desktop and undoing things.

\`\`\`css
/* base: phones */
.layout { display: grid; gap: 16px; }

/* tablets */
@media (min-width: 640px) {
  .layout { grid-template-columns: 1fr 1fr; }
}

/* desktops */
@media (min-width: 1000px) {
  .layout { grid-template-columns: 220px 1fr 1fr; }
}
\`\`\`

This starter was written desktop-first with \`max-width\` queries. Rewrite it mobile-first.`,
      starterCode: `<nav class="menu">
  <a href="#">Home</a>
  <a href="#">Shop</a>
  <a href="#">About</a>
</nav>
${CARDS}`,
      starterCss: `.menu {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 700px) {
  .menu {
    flex-direction: column;
  }
  .cards {
    grid-template-columns: 1fr;
  }
}

${CARD_CSS}`,
      tasks: [
        { text: 'No max-width media queries: use only min-width', check: all(hasMediaQuery(/min-width/, 'Use @media (min-width: ...).'), cssMatches(/^(?![\s\S]*@media[^{]*max-width)/, 'Remove the max-width media query.')) },
        { text: 'Phone (400px): stacked menu and one column of cards', check: atWidth(400, all(stacked('.menu a'), columns('.cards', 1))) },
        { text: 'Tablet (700px): menu in a row, 2 columns of cards', check: atWidth(700, all(inOneRow('.menu a'), columns('.cards', 2))) },
        { text: 'Wide (1000px): 3 columns of cards', check: atWidth(1000, columns('.cards', 3)) },
      ],
      hints: ['Base: .menu flex-direction column, .cards one column. Then @media (min-width: 640px) for the row menu and 2 columns, and @media (min-width: 900px) for 3 columns.'],
      solution: `<nav class="menu">
  <a href="#">Home</a>
  <a href="#">Shop</a>
  <a href="#">About</a>
</nav>
${CARDS}`,
      solutionCss: `.menu {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.cards {
  display: grid;
  gap: 16px;
}

@media (min-width: 640px) {
  .menu {
    flex-direction: row;
  }
  .cards {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 900px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

${CARD_CSS}`,
    },
    {
      id: 'css-responsive-media',
      title: 'Responsive images',
      explanation: `Images have an intrinsic size and will happily overflow a small screen. The classic fix:

\`\`\`css
img {
  max-width: 100%;   /* never wider than the container */
  height: auto;      /* keep the proportions */
  display: block;    /* removes the small gap under inline images */
}
\`\`\`

To crop an image to a fixed shape without distorting it, combine \`aspect-ratio\` and \`object-fit\`:

\`\`\`css
.thumb {
  width: 100%;
  aspect-ratio: 1;       /* square */
  object-fit: cover;     /* fill the box, crop the excess */
}
\`\`\``,
      starterCode: `<div class="post">
  <img class="hero" src="https://picsum.photos/id/1036/1200/600" alt="Snowy mountains at dusk" width="1200" height="600">
  <img class="thumb" src="https://picsum.photos/id/1043/600/400" alt="A forest path" width="600" height="400">
</div>
`,
      starterCss: `.post {
  width: 300px;
}
`,
      tasks: [
        { text: 'Images never overflow: max-width: 100% and height: auto', check: all(computed('.hero', 'max-width', '100%'), (doc) => (rectOf(doc, '.hero').width <= 300.5 ? true : 'The hero image overflows .post.')) },
        { text: 'The hero keeps its 2:1 proportions', check: (doc) => {
          const r = rectOf(doc, '.hero');
          return Math.abs(r.width / r.height - 2) < 0.05 ? true : 'Add height: auto so the image is not stretched.';
        } },
        { text: 'Make .thumb a square crop: aspect-ratio 1 and object-fit: cover', check: all(computed('.thumb', 'object-fit', 'cover'), (doc) => {
          const r = rectOf(doc, '.thumb');
          return Math.abs(r.width - r.height) < 1 ? true : '.thumb should be square.';
        }) },
      ],
      hints: ['For the square: .thumb { width: 100%; height: auto; aspect-ratio: 1; object-fit: cover; }'],
      solution: `<div class="post">
  <img class="hero" src="https://picsum.photos/id/1036/1200/600" alt="Snowy mountains at dusk" width="1200" height="600">
  <img class="thumb" src="https://picsum.photos/id/1043/600/400" alt="A forest path" width="600" height="400">
</div>
`,
      solutionCss: `.post {
  width: 300px;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

.thumb {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}
`,
    },
    {
      id: 'css-container-queries',
      title: 'Container queries',
      explanation: `Media queries look at the **viewport**. But a card might be in a wide main column on one page and a narrow
sidebar on another. **Container queries** let a component respond to the size of its *container*:

\`\`\`css
.slot {
  container-type: inline-size;   /* this element can be queried */
}

@container (min-width: 400px) {
  .profile {
    display: flex;               /* side by side when there is room */
    gap: 16px;
  }
}
\`\`\`

The same \`.profile\` markup now adapts wherever you put it.`,
      starterCode: `<main class="slot wide">
  <div class="profile"><img src="https://picsum.photos/id/64/120/120" alt="Portrait of Ada" width="120" height="120"><p>Ada writes about CSS.</p></div>
</main>
<aside class="slot narrow">
  <div class="profile"><img src="https://picsum.photos/id/65/120/120" alt="Portrait of Bo" width="120" height="120"><p>Bo designs icons.</p></div>
</aside>
`,
      starterCss: `.wide {
  width: 560px;
}

.narrow {
  width: 240px;
  margin-top: 20px;
}

.profile {
  background: #fef9c3;
  padding: 12px;
}
`,
      tasks: [
        { text: 'Make .slot a query container (container-type: inline-size)', check: computed('.slot', 'container-type', 'inline-size') },
        { text: 'Use @container (min-width: 400px) to lay .profile out with flex', check: cssMatches(/@container\s*\(\s*min-width\s*:\s*400px\s*\)/, 'Add @container (min-width: 400px) { ... }.') },
        { text: 'In the wide slot, image and text sit side by side', check: inOneRow('.wide .profile > *') },
        { text: 'In the narrow slot, they stay stacked', check: stacked('.narrow .profile > *') },
      ],
      hints: ['Inside the @container block: .profile { display: flex; gap: 16px; align-items: center; }', 'Images are inline by default: in the narrow slot add img { display: block; } so the text goes below.'],
      solution: `<main class="slot wide">
  <div class="profile"><img src="https://picsum.photos/id/64/120/120" alt="Portrait of Ada" width="120" height="120"><p>Ada writes about CSS.</p></div>
</main>
<aside class="slot narrow">
  <div class="profile"><img src="https://picsum.photos/id/65/120/120" alt="Portrait of Bo" width="120" height="120"><p>Bo designs icons.</p></div>
</aside>
`,
      solutionCss: `.slot {
  container-type: inline-size;
}

.wide {
  width: 560px;
}

.narrow {
  width: 240px;
  margin-top: 20px;
}

.profile {
  background: #fef9c3;
  padding: 12px;
}

.profile img {
  display: block;
}

@container (min-width: 400px) {
  .profile {
    display: flex;
    gap: 16px;
    align-items: center;
  }
}
`,
    },
  ],
  challenge: {
    id: 'css-responsive-challenge',
    title: 'Challenge: Responsive landing page',
    summary: 'One page, three layouts: phone, tablet and desktop.',
    difficulty: 3,
    showTarget: true,
    explanation: `Make this landing page work at three sizes, **mobile first** (only \`min-width\` queries). Compare with the
**Target** tab and resize the preview.

| Width | Header | Features | Hero title |
|---|---|---|---|
| 375px (phone) | logo above the nav, both centred | 1 column | 2rem |
| 768px (tablet) | logo left, nav right, one row | 2 columns | between 2rem and 3.5rem |
| 1100px (desktop) | same as tablet | 4 columns | 3.5rem |

Also: the page content is at most \`1100px\` wide and centred, the hero image never overflows, and the
viewport meta tag is in the HTML.`,
    starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Orbit — plan your week</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="wrap">
    <header class="top">
      <a class="logo" href="#">Orbit</a>
      <nav class="nav"><a href="#">Features</a><a href="#">Pricing</a><a href="#">Log in</a></nav>
    </header>
    <section class="hero">
      <h1>Plan your week in five minutes</h1>
      <img src="https://picsum.photos/id/180/1200/600" alt="A laptop and a notebook on a desk" width="1200" height="600">
    </section>
    <section class="features">
      <article><h2>Calendar</h2><p>All your events in one place.</p></article>
      <article><h2>Tasks</h2><p>Lists that sort themselves.</p></article>
      <article><h2>Focus</h2><p>Block time for deep work.</p></article>
      <article><h2>Sync</h2><p>Phone, tablet and laptop.</p></article>
    </section>
  </div>
</body>
</html>
`,
    starterCss: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.features article {
  background: #ede9fe;
  padding: 16px;
  border-radius: 8px;
}
`,
    tasks: [
      { text: 'The viewport meta tag is in the HTML', check: hasAttr('meta[name="viewport"]', 'content', /width=device-width/, 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.') },
      { text: 'Mobile first: only min-width media queries', check: all(hasMediaQuery(/min-width/), cssMatches(/^(?![\s\S]*@media[^{]*max-width)/, 'Use only min-width queries.')) },
      { text: 'Content at most 1100px wide and centred', check: atWidth(1300, (doc) => {
        const w = rectOf(doc, '.wrap');
        const s = doc.defaultView!.getComputedStyle(doc.querySelector('.wrap')!);
        const content = w.width - px(s.paddingLeft) - px(s.paddingRight) - px(s.borderLeftWidth) - px(s.borderRightWidth);
        return Math.round(content) <= 1100 && Math.abs(w.left - (1300 - w.right)) < 2 ? true : '.wrap should be max 1100px and centred.';
      }) },
      { text: 'The hero image never overflows', check: atWidth(375, (doc) => (rectOf(doc, '.hero img').right <= 375.5 ? true : 'The hero image overflows on phones.')) },
      { text: 'Phone (375px): logo above the nav, both centred; 1 feature column; h1 2rem', check: atWidth(375, all(stacked('.logo, .nav', 'At 375px the logo should sit above the nav.'), (doc) => {
        const t = rectOf(doc, '.top');
        const n = rectOf(doc, '.nav');
        return Math.abs(n.left - t.left - (t.right - n.right)) < 2 ? true : 'Centre the nav on phones.';
      }, columns('.features', 1), computed('h1', 'font-size', '32px'))) },
      { text: 'Tablet (768px): logo left and nav right in one row; 2 feature columns', check: atWidth(768, all(inOneRow('.logo, .nav', 'At 768px logo and nav share one row.'), (doc) => (Math.abs(rectOf(doc, '.nav').right - rectOf(doc, '.top').right) < 25 ? true : 'Push the nav to the right.'), columns('.features', 2), computed('h1', 'font-size', (v) => px(v) > 32 && px(v) <= 56, 'Use clamp() for the h1 size.'))) },
      { text: 'Desktop (1100px): 4 feature columns, h1 3.5rem', check: atWidth(1100, all(columns('.features', 4), computed('h1', 'font-size', '56px'))) },
    ],
    hints: [
      'h1 { font-size: clamp(2rem, 6vw, 3.5rem); } covers all three sizes.',
      'Header on phones: flex-direction: column; align-items: center. From 700px: flex-direction: row; justify-content: space-between.',
      '.wrap { max-width: 1100px; margin: 0 auto; padding: 0 16px; }',
    ],
    solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Orbit — plan your week</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="wrap">
    <header class="top">
      <a class="logo" href="#">Orbit</a>
      <nav class="nav"><a href="#">Features</a><a href="#">Pricing</a><a href="#">Log in</a></nav>
    </header>
    <section class="hero">
      <h1>Plan your week in five minutes</h1>
      <img src="https://picsum.photos/id/180/1200/600" alt="A laptop and a notebook on a desk" width="1200" height="600">
    </section>
    <section class="features">
      <article><h2>Calendar</h2><p>All your events in one place.</p></article>
      <article><h2>Tasks</h2><p>Lists that sort themselves.</p></article>
      <article><h2>Focus</h2><p>Block time for deep work.</p></article>
      <article><h2>Sync</h2><p>Phone, tablet and laptop.</p></article>
    </section>
  </div>
</body>
</html>
`,
    solutionCss: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.wrap {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}

.top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 0;
}

.nav {
  display: flex;
  gap: 16px;
}

h1 {
  font-size: clamp(2rem, 6vw, 3.5rem);
}

.hero img {
  max-width: 100%;
  height: auto;
  display: block;
}

.features {
  display: grid;
  gap: 16px;
  margin: 24px 0;
}

.features article {
  background: #ede9fe;
  padding: 16px;
  border-radius: 8px;
}

@media (min-width: 700px) {
  .top {
    flex-direction: row;
    justify-content: space-between;
  }
  .features {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1000px) {
  .features {
    grid-template-columns: repeat(4, 1fr);
  }
}
`,
  },
};
