import type { Module } from '../types';
import { all } from '../../engine/checks';
import { atWidth, boxSize, centeredIn, computed, declares, inOneRow, px, stacked } from '../../engine/cssChecks';

const rectOf = (doc: Document, sel: string) => doc.querySelector(sel)!.getBoundingClientRect();

export const flexbox: Module = {
  id: 'css-flex',
  title: 'Flexbox',
  description: 'Lay out items in a row or a column, align them and share the space.',
  lessons: [
    {
      id: 'css-flex-basics',
      title: 'display: flex',
      explanation: `\`display: flex\` turns an element into a **flex container**: its direct children (the *flex items*)
line up along a **main axis** — a row by default.

\`\`\`css
.toolbar {
  display: flex;
  gap: 12px;          /* space between items, never at the edges */
}
\`\`\`

Only **direct children** become flex items — grandchildren are laid out normally. \`gap\` is the cleanest
way to space items: no more margins on every item except the last.`,
      starterCode: `<div class="toolbar">
  <button>Bold</button>
  <button>Italic</button>
  <button>Link</button>
</div>
<ul class="stats">
  <li><strong>12</strong> posts</li>
  <li><strong>340</strong> followers</li>
  <li><strong>87</strong> following</li>
</ul>
`,
      starterCss: `.toolbar button {
  display: block;
}

.stats {
  list-style: none;
  padding: 0;
}
`,
      tasks: [
        { text: 'Make .toolbar a flex container so the buttons sit in a row', check: all(computed('.toolbar', 'display', 'flex'), inOneRow('.toolbar button')) },
        { text: 'Space the buttons with gap: 8px', check: computed('.toolbar', 'column-gap', '8px') },
        { text: 'Put the .stats items in a row with a 24px gap', check: all(inOneRow('.stats li'), computed('.stats', 'column-gap', '24px')) },
      ],
      hints: ['display: flex goes on the parent (the container), not on the children.'],
      solution: `<div class="toolbar">
  <button>Bold</button>
  <button>Italic</button>
  <button>Link</button>
</div>
<ul class="stats">
  <li><strong>12</strong> posts</li>
  <li><strong>340</strong> followers</li>
  <li><strong>87</strong> following</li>
</ul>
`,
      solutionCss: `.toolbar {
  display: flex;
  gap: 8px;
}

.toolbar button {
  display: block;
}

.stats {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 24px;
}
`,
    },
    {
      id: 'css-flex-align',
      title: 'justify-content and align-items',
      explanation: `Two properties on the container align the items:

- \`justify-content\` — along the **main axis** (horizontal in a row):
  \`flex-start\`, \`center\`, \`flex-end\`, \`space-between\`, \`space-around\`, \`space-evenly\`.
- \`align-items\` — along the **cross axis** (vertical in a row):
  \`stretch\` (default), \`flex-start\`, \`center\`, \`flex-end\`, \`baseline\`.

\`\`\`css
.header {
  display: flex;
  justify-content: space-between;  /* logo left, menu right */
  align-items: center;             /* vertically centred */
}
\`\`\`

This is the classic site header — and the end of decades of centring hacks.`,
      starterCode: `<header class="header">
  <div class="logo">☕ Brew</div>
  <nav class="menu">
    <a href="#">Menu</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
</header>
`,
      starterCss: `.header {
  height: 80px;
  padding: 0 20px;
  background: #3e2723;
  color: white;
}

.logo {
  font-size: 1.5rem;
}

.menu a {
  color: white;
  margin-left: 16px;
}
`,
      tasks: [
        { text: 'Make the header a flex container', check: computed('.header', 'display', 'flex') },
        { text: 'Push the logo to the left and the menu to the right (space-between)', check: all(computed('.header', 'justify-content', 'space-between'), (doc) => {
          const h = rectOf(doc, '.header');
          const m = rectOf(doc, '.menu');
          return Math.abs(h.right - 20 - m.right) < 2 ? true : 'The menu should touch the right padding of the header.';
        }) },
        { text: 'Centre both vertically (align-items)', check: all(centeredIn('.logo', '.header', 'y'), centeredIn('.menu', '.header', 'y')) },
      ],
      hints: ['Both properties go on .header.'],
      solution: `<header class="header">
  <div class="logo">☕ Brew</div>
  <nav class="menu">
    <a href="#">Menu</a>
    <a href="#">About</a>
    <a href="#">Contact</a>
  </nav>
</header>
`,
      solutionCss: `.header {
  height: 80px;
  padding: 0 20px;
  background: #3e2723;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.5rem;
}

.menu a {
  color: white;
  margin-left: 16px;
}
`,
    },
    {
      id: 'css-flex-direction',
      title: 'Direction and wrapping',
      explanation: `- \`flex-direction: column\` makes the main axis **vertical**: items stack, and now \`justify-content\` works
  vertically while \`align-items\` works horizontally.
- \`flex-wrap: wrap\` lets items move to a new line when they don't fit, instead of squashing.

\`\`\`css
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
\`\`\``,
      starterCode: `<aside class="sidebar">
  <a href="#">Dashboard</a>
  <a href="#">Projects</a>
  <a href="#">Settings</a>
</aside>
<div class="tags">
  <span>accessibility</span><span>animation</span><span>flexbox</span><span>grid</span>
  <span>typography</span><span>responsive</span><span>colour</span><span>performance</span>
  <span>selectors</span><span>cascade</span><span>variables</span><span>layout</span>
</div>
`,
      starterCss: `.sidebar {
  display: flex;
  width: 200px;
}

.tags {
  display: flex;
  gap: 8px;
  width: 420px;
  margin-top: 20px;
}

.tags span {
  padding: 4px 12px;
  background: #e0f2fe;
  border-radius: 99px;
  flex-shrink: 0;
}
`,
      tasks: [
        { text: 'Stack the sidebar links vertically (flex-direction: column)', check: all(computed('.sidebar', 'flex-direction', 'column'), stacked('.sidebar a')) },
        { text: 'Add a 12px gap between the sidebar links', check: computed('.sidebar', 'row-gap', '12px') },
        { text: 'Let the tags wrap onto several lines instead of overflowing', check: all(computed('.tags', 'flex-wrap', 'wrap'), (doc) => {
          const box = rectOf(doc, '.tags');
          const overflow = [...doc.querySelectorAll('.tags span')].some((s) => s.getBoundingClientRect().right > box.right + 1);
          return overflow ? 'Some tags still overflow the box.' : true;
        }) },
      ],
      hints: ['In a column, gap adds vertical space (row-gap).'],
      solution: `<aside class="sidebar">
  <a href="#">Dashboard</a>
  <a href="#">Projects</a>
  <a href="#">Settings</a>
</aside>
<div class="tags">
  <span>accessibility</span><span>animation</span><span>flexbox</span><span>grid</span>
  <span>typography</span><span>responsive</span><span>colour</span><span>performance</span>
  <span>selectors</span><span>cascade</span><span>variables</span><span>layout</span>
</div>
`,
      solutionCss: `.sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 200px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  width: 420px;
  margin-top: 20px;
}

.tags span {
  padding: 4px 12px;
  background: #e0f2fe;
  border-radius: 99px;
  flex-shrink: 0;
}
`,
    },
    {
      id: 'css-flex-grow',
      title: 'Sharing space: flex grow, shrink, basis',
      explanation: `Items can **grow** into free space or **shrink** when space is short:

- \`flex-grow: 1\` — take a share of the leftover space (\`2\` takes twice as much as \`1\`).
- \`flex-shrink: 0\` — never shrink below its size.
- \`flex-basis: 200px\` — the starting size before growing/shrinking.
- \`flex: 1\` is the shorthand for "grow and share equally" (\`1 1 0\`).

\`\`\`css
.layout { display: flex; }
.sidebar { flex: 0 0 200px; }   /* fixed 200px */
.content { flex: 1; }           /* everything else */
\`\`\``,
      starterCode: `<div class="layout">
  <aside class="sidebar">Sidebar</aside>
  <main class="content">Main content</main>
</div>
<form class="search">
  <input type="search" aria-label="Search" placeholder="Search…">
  <button>Go</button>
</form>
`,
      starterCss: `.layout {
  display: flex;
  gap: 16px;
  height: 120px;
}

.sidebar { background: #fde68a; }
.content { background: #bfdbfe; }

.search {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}
`,
      tasks: [
        { text: 'Make the sidebar a fixed 200px (flex: 0 0 200px)', check: all(boxSize('.sidebar', 'width', (w) => Math.round(w) === 200, 'The sidebar should be exactly 200px.'), computed('.sidebar', 'flex-grow', '0')) },
        { text: 'Make the content take all the remaining space', check: all(computed('.content', 'flex-grow', (v) => px(v) > 0, 'Give .content flex: 1.'), (doc) => {
          const l = rectOf(doc, '.layout');
          const c = rectOf(doc, '.content');
          return Math.abs(l.right - c.right) < 1 ? true : '.content should reach the right edge.';
        }) },
        { text: 'Make the search input stretch, and keep the button its natural size', check: all(computed('.search input', 'flex-grow', (v) => px(v) > 0, 'Give the input flex: 1.'), computed('.search button', 'flex-grow', '0')) },
      ],
      hints: ['.content { flex: 1; } and .search input { flex: 1; }'],
      solution: `<div class="layout">
  <aside class="sidebar">Sidebar</aside>
  <main class="content">Main content</main>
</div>
<form class="search">
  <input type="search" aria-label="Search" placeholder="Search…">
  <button>Go</button>
</form>
`,
      solutionCss: `.layout {
  display: flex;
  gap: 16px;
  height: 120px;
}

.sidebar {
  background: #fde68a;
  flex: 0 0 200px;
}

.content {
  background: #bfdbfe;
  flex: 1;
}

.search {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.search input {
  flex: 1;
}
`,
    },
    {
      id: 'css-flex-center',
      title: 'Perfect centring',
      explanation: `The most famous CSS problem — centring something both ways — takes three lines with Flexbox:

\`\`\`css
.hero {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
\`\`\`

Another useful trick: \`margin-left: auto\` on a flex item eats all the free space on its left, pushing it
(and everything after it) to the right end.`,
      starterCode: `<section class="hero">
  <div class="message">
    <h1>Hello!</h1>
    <p>I am perfectly centred.</p>
  </div>
</section>
<nav class="bar">
  <a href="#">Home</a>
  <a href="#">Blog</a>
  <a href="#" class="login">Log in</a>
</nav>
`,
      starterCss: `.hero {
  min-height: 300px;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  color: white;
  text-align: center;
}

.bar {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #eee;
}
`,
      tasks: [
        { text: 'Centre .message horizontally and vertically inside .hero', check: centeredIn('.message', '.hero') },
        { text: 'Push the Log in link to the right end of the bar with margin-left: auto', check: all(declares('.login', 'margin-left', 'auto'), (doc) => {
          const bar = rectOf(doc, '.bar');
          const l = rectOf(doc, '.login');
          return Math.abs(bar.right - 12 - l.right) < 2 ? true : 'Log in should sit at the right end.';
        }) },
      ],
      hints: ['justify-content and align-items both "center" on .hero.'],
      solution: `<section class="hero">
  <div class="message">
    <h1>Hello!</h1>
    <p>I am perfectly centred.</p>
  </div>
</section>
<nav class="bar">
  <a href="#">Home</a>
  <a href="#">Blog</a>
  <a href="#" class="login">Log in</a>
</nav>
`,
      solutionCss: `.hero {
  min-height: 300px;
  background: linear-gradient(135deg, #6366f1, #ec4899);
  color: white;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bar {
  display: flex;
  gap: 16px;
  padding: 12px;
  background: #eee;
}

.login {
  margin-left: auto;
}
`,
    },
  ],
  challenge: {
    id: 'css-flex-challenge',
    title: 'Challenge: Navbar and footer',
    summary: 'A real site header and a footer that wraps on small screens.',
    difficulty: 2,
    showTarget: true,
    explanation: `Build the header and footer in the **Target** tab using only Flexbox (no floats, no positioning):

**Header**
- \`.site-header\`: flex, items vertically centred, \`16px 24px\` padding, background \`#0f172a\`.
- The logo on the left; the \`.nav\` links in a row with a \`20px\` gap; the \`.cta\` button at the far right.
- The nav sits right after the logo with a \`32px\` gap between logo and nav.

**Footer**
- \`.site-footer\`: the three \`.col\` blocks side by side with a \`24px\` gap, each **at least 180px** wide and
  sharing the space equally (\`flex: 1 1 180px\`).
- They **wrap** into a column when the page is narrow: at 400px wide they must be stacked.`,
    starterCode: `<header class="site-header">
  <a class="logo" href="#">Nimbus</a>
  <nav class="nav">
    <a href="#">Product</a>
    <a href="#">Pricing</a>
    <a href="#">Docs</a>
  </nav>
  <a class="cta" href="#">Sign up</a>
</header>
<main><p>Page content.</p></main>
<footer class="site-footer">
  <div class="col"><h3>Company</h3><p>About, careers, press.</p></div>
  <div class="col"><h3>Resources</h3><p>Blog, guides, status.</p></div>
  <div class="col"><h3>Legal</h3><p>Privacy, terms, cookies.</p></div>
</footer>
`,
    starterCss: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.site-header a {
  color: white;
  text-decoration: none;
}

.logo {
  font-weight: 800;
  font-size: 1.25rem;
}

.cta {
  background: #38bdf8;
  padding: 8px 16px;
  border-radius: 6px;
}

main {
  padding: 24px;
}

.site-footer {
  padding: 24px;
  background: #f1f5f9;
}
`,
    tasks: [
      { text: 'Header: flex, vertically centred, 16px 24px padding, #0f172a', check: all(computed('.site-header', 'display', 'flex'), computed('.site-header', 'align-items', 'center'), computed('.site-header', 'padding-top', '16px'), computed('.site-header', 'padding-left', '24px'), computed('.site-header', 'background-color', '#0f172a'), centeredIn('.cta', '.site-header', 'y')) },
      { text: 'Logo, nav and button in one row; nav links in a row with a 20px gap', check: all(inOneRow('.logo, .nav, .cta'), inOneRow('.nav a'), computed('.nav', 'column-gap', '20px')) },
      { text: '32px between logo and nav', check: (doc) => {
        const gap = rectOf(doc, '.nav').left - rectOf(doc, '.logo').right;
        return Math.round(gap) === 32 ? true : `The space between logo and nav should be 32px (now ${Math.round(gap)}px).`;
      } },
      { text: 'Sign up at the far right', check: (doc) => (Math.abs(rectOf(doc, '.site-header').right - 24 - rectOf(doc, '.cta').right) < 2 ? true : 'Push .cta to the right end.') },
      { text: 'Footer columns side by side, 24px gap, sharing space equally', check: all(inOneRow('.col'), computed('.site-footer', 'column-gap', '24px'), (doc) => {
        const ws = [...doc.querySelectorAll('.col')].map((c) => Math.round(c.getBoundingClientRect().width));
        return ws.every((w) => Math.abs(w - ws[0]) <= 1) ? true : 'The columns should have equal widths.';
      }) },
      { text: 'At 400px wide, the columns wrap into a stack', check: atWidth(400, stacked('.col', 'At 400px the columns should be stacked: use flex-wrap: wrap and flex: 1 1 180px.')) },
    ],
    hints: ['margin-left: auto on .cta pushes it right.', 'A gap on the header gives the 32px space between logo and nav — but then the cta also gets a gap. That\'s fine.'],
    solution: `<header class="site-header">
  <a class="logo" href="#">Nimbus</a>
  <nav class="nav">
    <a href="#">Product</a>
    <a href="#">Pricing</a>
    <a href="#">Docs</a>
  </nav>
  <a class="cta" href="#">Sign up</a>
</header>
<main><p>Page content.</p></main>
<footer class="site-footer">
  <div class="col"><h3>Company</h3><p>About, careers, press.</p></div>
  <div class="col"><h3>Resources</h3><p>Blog, guides, status.</p></div>
  <div class="col"><h3>Legal</h3><p>Privacy, terms, cookies.</p></div>
</footer>
`,
    solutionCss: `body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.site-header {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 16px 24px;
  background: #0f172a;
}

.site-header a {
  color: white;
  text-decoration: none;
}

.logo {
  font-weight: 800;
  font-size: 1.25rem;
}

.nav {
  display: flex;
  gap: 20px;
}

.cta {
  margin-left: auto;
  background: #38bdf8;
  padding: 8px 16px;
  border-radius: 6px;
}

main {
  padding: 24px;
}

.site-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 24px;
  background: #f1f5f9;
}

.col {
  flex: 1 1 180px;
}
`,
  },
};
