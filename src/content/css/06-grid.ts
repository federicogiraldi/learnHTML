import type { Module } from '../types';
import { all } from '../../engine/checks';
import { atWidth, columns, computed, cssMatches, declares, px } from '../../engine/cssChecks';

const rectOf = (doc: Document, sel: string) => doc.querySelector(sel)!.getBoundingClientRect();
const close = (a: number, b: number) => Math.abs(a - b) < 1.5;

const CARDS = `<div class="grid">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</div>
`;
const ITEM_CSS = `.item {
  background: #c7d2fe;
  padding: 20px;
  text-align: center;
  font-weight: bold;
}
`;

export const grid: Module = {
  id: 'css-grid',
  title: 'CSS Grid',
  description: 'Two-dimensional layouts: rows and columns at the same time.',
  lessons: [
    {
      id: 'css-grid-basics',
      title: 'Columns, rows and fr',
      explanation: `Flexbox lays out items in **one** direction. **Grid** handles rows *and* columns together.

\`\`\`css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 1fr;  /* three columns */
  gap: 16px;
}
\`\`\`

- \`fr\` is a **fraction** of the free space: \`1fr 2fr\` makes the second column twice as wide as the first.
- \`repeat(4, 1fr)\` = \`1fr 1fr 1fr 1fr\`.
- Items fill the cells in order, creating new rows automatically.
- \`grid-template-rows\` sizes the rows the same way (often not needed).`,
      starterCode: CARDS,
      starterCss: ITEM_CSS,
      tasks: [
        { text: 'Make .grid a grid with 3 equal columns using repeat()', check: all(cssMatches(/repeat\(\s*3\s*,\s*1fr\s*\)/, 'Use grid-template-columns: repeat(3, 1fr).'), columns('.grid', 3)) },
        { text: 'Add a 16px gap', check: all(computed('.grid', 'column-gap', '16px'), computed('.grid', 'row-gap', '16px')) },
        { text: 'The 6 items form 2 rows', check: (doc) => {
          const tops = new Set([...doc.querySelectorAll('.item')].map((i) => Math.round(i.getBoundingClientRect().top)));
          return tops.size === 2 ? true : `Expected 2 rows, found ${tops.size}.`;
        } },
      ],
      hints: ['.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }'],
      solution: CARDS,
      solutionCss: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

${ITEM_CSS}`,
    },
    {
      id: 'css-grid-span',
      title: 'Spanning cells',
      explanation: `An item can cover several columns or rows:

\`\`\`css
.feature {
  grid-column: span 2;     /* 2 columns wide */
  grid-row: span 2;        /* 2 rows tall */
}
.banner {
  grid-column: 1 / -1;     /* from the first line to the last: full width */
}
\`\`\`

Grid **lines** are numbered from 1 at the left edge; \`-1\` is the right edge. \`grid-column: 2 / 4\` starts at
line 2 and ends at line 4 (so it covers columns 2 and 3).`,
      starterCode: `<div class="grid">
  <div class="item banner">Banner</div>
  <div class="item feature">Feature</div>
  <div class="item">A</div>
  <div class="item">B</div>
  <div class="item">C</div>
  <div class="item">D</div>
</div>
`,
      starterCss: `.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 80px;
  gap: 10px;
}

${ITEM_CSS}`,
      tasks: [
        { text: 'Make .banner span the full width with grid-column: 1 / -1', check: all(declares('.banner', 'grid-column', /1\s*\/\s*-1/), (doc) => (close(rectOf(doc, '.banner').width, rectOf(doc, '.grid').width) ? true : 'The banner should be as wide as the grid.')) },
        { text: 'Make .feature 2 columns wide and 2 rows tall', check: (doc) => {
          const f = rectOf(doc, '.feature');
          const a = [...doc.querySelectorAll('.item:not(.banner):not(.feature)')][0].getBoundingClientRect();
          return close(f.width, a.width * 2 + 10) && close(f.height, 170) ? true : 'Use grid-column: span 2 and grid-row: span 2 on .feature.';
        } },
      ],
      hints: ['Each row is 80px with a 10px gap, so two rows are 170px tall.'],
      solution: `<div class="grid">
  <div class="item banner">Banner</div>
  <div class="item feature">Feature</div>
  <div class="item">A</div>
  <div class="item">B</div>
  <div class="item">C</div>
  <div class="item">D</div>
</div>
`,
      solutionCss: `.grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 80px;
  gap: 10px;
}

${ITEM_CSS}
.banner {
  grid-column: 1 / -1;
}

.feature {
  grid-column: span 2;
  grid-row: span 2;
}
`,
    },
    {
      id: 'css-grid-areas',
      title: 'Named areas',
      explanation: `\`grid-template-areas\` lets you *draw* the layout with names, then place items by name:

\`\`\`css
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
.page > header { grid-area: header; }
.page > aside  { grid-area: sidebar; }
.page > main   { grid-area: main; }
.page > footer { grid-area: footer; }
\`\`\`

Each string is a row, each word a column. Repeating a name makes the area span those cells.
Rearranging the layout later (e.g. for mobile) only means rewriting the strings.`,
      starterCode: `<div class="page">
  <header>Header</header>
  <aside>Sidebar</aside>
  <main>Main content</main>
  <footer>Footer</footer>
</div>
`,
      starterCss: `.page > * {
  padding: 16px;
  background: #e2e8f0;
}

.page {
  gap: 8px;
}
`,
      tasks: [
        { text: 'Make .page a grid with columns 180px and 1fr', check: all(computed('.page', 'display', 'grid'), computed('.page', 'grid-template-columns', /^180px /)) },
        { text: 'Draw the areas: header on top, sidebar + main, footer at the bottom', check: cssMatches(/grid-template-areas\s*:\s*["']header header["']\s*["']sidebar main["']\s*["']footer footer["']/, 'Use grid-template-areas: "header header" "sidebar main" "footer footer";') },
        { text: 'Place each element in its area', check: (doc) => {
          const [h, a, m, f] = ['header', 'aside', 'main', 'footer'].map((s) => rectOf(doc, `.page > ${s}`));
          const ok = close(h.left, a.left) && close(h.right, m.right) && close(a.top, m.top) && a.left < m.left && f.top > m.bottom && close(f.width, h.width);
          return ok ? true : 'Give header, aside, main and footer their grid-area.';
        } },
      ],
      hints: ['.page > aside { grid-area: sidebar; } — and the same for the others.'],
      solution: `<div class="page">
  <header>Header</header>
  <aside>Sidebar</aside>
  <main>Main content</main>
  <footer>Footer</footer>
</div>
`,
      solutionCss: `.page > * {
  padding: 16px;
  background: #e2e8f0;
}

.page {
  gap: 8px;
  display: grid;
  grid-template-columns: 180px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}

.page > header { grid-area: header; }
.page > aside { grid-area: sidebar; }
.page > main { grid-area: main; }
.page > footer { grid-area: footer; }
`,
    },
    {
      id: 'css-grid-autofit',
      title: 'Responsive grids without media queries',
      explanation: `One line creates a grid that adapts to any screen:

\`\`\`css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
\`\`\`

Read it as: "fit as many columns as possible, each **at least 150px** and sharing the extra space
(\`1fr\`)". On a phone you get one column, on a laptop five — with zero media queries.`,
      starterCode: CARDS,
      starterCss: `.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

${ITEM_CSS}`,
      tasks: [
        { text: 'Use repeat(auto-fit, minmax(150px, 1fr))', check: cssMatches(/repeat\(\s*auto-fi(t|ll)\s*,\s*minmax\(\s*150px\s*,\s*1fr\s*\)\s*\)/, 'Use repeat(auto-fit, minmax(150px, 1fr)).') },
        { text: 'At 800px wide there are 4 columns', check: columns('.grid', 4) },
        { text: 'At 360px wide there are 2 columns', check: atWidth(360, columns('.grid', 2)) },
        { text: 'At 250px wide there is 1 column', check: atWidth(250, columns('.grid', 1)) },
      ],
      hints: ['Only grid-template-columns needs to change.'],
      solution: CARDS,
      solutionCss: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

${ITEM_CSS}`,
    },
  ],
  challenge: {
    id: 'css-grid-challenge',
    title: 'Challenge: Magazine front page',
    summary: 'A newspaper-style layout with a lead story, sidebar and photo grid.',
    difficulty: 3,
    showTarget: true,
    explanation: `Lay out this magazine front page like the **Target** tab, using Grid:

- \`.front\`: a grid with **4 equal columns** and a \`20px\` gap.
- \`.masthead\`: spans all 4 columns.
- \`.lead\` (the main story): 3 columns wide and 2 rows tall.
- \`.side\`: the remaining column next to the lead, also 2 rows tall.
- The four \`.photo\` stories: one per column on the row below.
- \`.photo img\`: fill their cell width, \`aspect-ratio: 4 / 3\` with \`object-fit: cover\`.`,
    starterCode: `<div class="front">
  <h1 class="masthead">The Daily Pixel</h1>
  <article class="lead">
    <h2>CSS Grid turns ten</h2>
    <p>Ten years after shipping in every major browser, Grid has quietly replaced a decade of layout hacks.</p>
  </article>
  <aside class="side">
    <h3>Also today</h3>
    <p>Container queries arrive everywhere. Subgrid is finally here.</p>
  </aside>
  <article class="photo"><img src="https://picsum.photos/id/1011/400/300" alt="A canoe on a lake" width="400" height="300"><h3>Lakes</h3></article>
  <article class="photo"><img src="https://picsum.photos/id/1018/400/300" alt="Mountains" width="400" height="300"><h3>Mountains</h3></article>
  <article class="photo"><img src="https://picsum.photos/id/1015/400/300" alt="A river valley" width="400" height="300"><h3>Rivers</h3></article>
  <article class="photo"><img src="https://picsum.photos/id/1039/400/300" alt="A waterfall" width="400" height="300"><h3>Waterfalls</h3></article>
</div>
`,
    starterCss: `body {
  font-family: Georgia, serif;
  margin: 20px;
}

.masthead {
  text-align: center;
  border-bottom: 3px double #111;
  margin: 0;
}

.lead {
  background: #fef3c7;
  padding: 20px;
}

.side {
  background: #f1f5f9;
  padding: 16px;
}
`,
    tasks: [
      { text: '.front: 4 equal columns with a 20px gap', check: all(computed('.front', 'display', 'grid'), computed('.front', 'column-gap', '20px'), computed('.front', 'grid-template-columns', (v) => {
        const cols = v.split(' ').map(px);
        return cols.length === 4 && cols.every((c) => close(c, cols[0]));
      }, '.front needs 4 equal columns: repeat(4, 1fr).')) },
      { text: 'The masthead spans all 4 columns', check: (doc) => (close(rectOf(doc, '.masthead').width, rectOf(doc, '.front').width) ? true : 'The masthead should be as wide as the grid.') },
      { text: 'The lead story is 3 columns wide and 2 rows tall', check: (doc) => {
        const lead = rectOf(doc, '.lead');
        const front = rectOf(doc, '.front');
        const col = (front.width - 60) / 4;
        const side = rectOf(doc, '.side');
        return close(lead.width, col * 3 + 40) && close(lead.height, side.height) && side.height > 0 ? true : 'Make .lead span 3 columns and 2 rows.';
      } },
      { text: 'The side column sits to the right of the lead, 2 rows tall', check: (doc) => {
        const lead = rectOf(doc, '.lead');
        const side = rectOf(doc, '.side');
        return close(side.top, lead.top) && side.left > lead.right && close(side.bottom, lead.bottom) ? true : 'Place .side next to .lead, spanning the same 2 rows.';
      } },
      { text: 'The four photo stories share one row below', check: (doc) => {
        const photos = [...doc.querySelectorAll('.photo')].map((p) => p.getBoundingClientRect());
        const lead = rectOf(doc, '.lead');
        return photos.every((p) => close(p.top, photos[0].top) && p.top > lead.bottom) ? true : 'The photos should form one row under the lead.';
      } },
      { text: 'Photos fill the cell, 4:3, with object-fit: cover', check: all(computed('.photo img', 'object-fit', 'cover'), computed('.photo img', 'aspect-ratio', /4\s*\/\s*3/), (doc) => (close(rectOf(doc, '.photo img').width, rectOf(doc, '.photo').width) ? true : 'Make the images width: 100%.')) },
    ],
    hints: ['.lead { grid-column: span 3; grid-row: span 2; } — then .side { grid-row: span 2; }', 'For images: width: 100%; height: auto; aspect-ratio: 4 / 3; object-fit: cover;'],
    solution: `<div class="front">
  <h1 class="masthead">The Daily Pixel</h1>
  <article class="lead">
    <h2>CSS Grid turns ten</h2>
    <p>Ten years after shipping in every major browser, Grid has quietly replaced a decade of layout hacks.</p>
  </article>
  <aside class="side">
    <h3>Also today</h3>
    <p>Container queries arrive everywhere. Subgrid is finally here.</p>
  </aside>
  <article class="photo"><img src="https://picsum.photos/id/1011/400/300" alt="A canoe on a lake" width="400" height="300"><h3>Lakes</h3></article>
  <article class="photo"><img src="https://picsum.photos/id/1018/400/300" alt="Mountains" width="400" height="300"><h3>Mountains</h3></article>
  <article class="photo"><img src="https://picsum.photos/id/1015/400/300" alt="A river valley" width="400" height="300"><h3>Rivers</h3></article>
  <article class="photo"><img src="https://picsum.photos/id/1039/400/300" alt="A waterfall" width="400" height="300"><h3>Waterfalls</h3></article>
</div>
`,
    solutionCss: `body {
  font-family: Georgia, serif;
  margin: 20px;
}

.front {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.masthead {
  grid-column: 1 / -1;
  text-align: center;
  border-bottom: 3px double #111;
  margin: 0;
}

.lead {
  grid-column: span 3;
  grid-row: span 2;
  background: #fef3c7;
  padding: 20px;
}

.side {
  grid-row: span 2;
  background: #f1f5f9;
  padding: 16px;
}

.photo img {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
`,
  },
};
