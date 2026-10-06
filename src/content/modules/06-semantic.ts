import type { Module } from '../types';
import {
  all, count, hasAttr, hasElement, isChildOf, isInside, noElement, orderIs, textMatches,
} from '../../engine/checks';

export const semantic: Module = {
  id: 'semantic',
  title: 'Semantic HTML',
  description: 'Page landmarks and elements that say what content means, not how it looks.',
  lessons: [
    {
      id: 'semantic-layout',
      title: 'Page landmarks',
      explanation: `For years, pages were built entirely out of \`<div>\`s — generic boxes with no meaning. Modern HTML
has **semantic** elements that describe each region of the page:

| Element | Region |
|---|---|
| \`<header>\` | Introductory content: logo, site title, often the navigation |
| \`<nav>\` | A block of major navigation links |
| \`<main>\` | The main content — **only one per page** |
| \`<aside>\` | Content related to, but separate from, the main content (sidebars) |
| \`<footer>\` | Closing info: copyright, contacts, links |

\`\`\`html
<header>
  <h1>My site</h1>
  <nav>
    <a href="#">Home</a>
    <a href="#">Blog</a>
  </nav>
</header>
<main>
  <p>Content</p>
</main>
<footer>&copy; 2026</footer>
\`\`\`

They look exactly like \`<div>\`s, but search engines, browser reader modes and screen readers understand them —
a screen reader user can jump straight to \`<main>\` or \`<nav>\`.`,
      starterCode: `<div class="header">
  <h1>Green Thumb</h1>
  <div class="nav">
    <a href="#">Home</a>
    <a href="#">Plants</a>
    <a href="#">Contact</a>
  </div>
</div>
<div class="main">
  <h2>Caring for succulents</h2>
  <p>Water them rarely and give them lots of light.</p>
</div>
<div class="sidebar">
  <h2>Popular posts</h2>
  <p>Repotting 101</p>
</div>
<div class="footer">
  <p>&copy; 2026 Green Thumb</p>
</div>
`,
      tasks: [
        { text: 'Replace the header div with <header>', check: all(hasElement('header'), isChildOf('h1', 'header')) },
        { text: 'Replace the nav div with <nav>, inside the header', check: all(isChildOf('nav', 'header'), count('nav > a', 3)) },
        { text: 'Use one <main> for the main content', check: all(count('main', 1), textMatches('main h2', /succulents/i)) },
        { text: 'Make the sidebar an <aside>', check: textMatches('aside h2', /popular/i) },
        { text: 'Use <footer> for the footer', check: isChildOf('p', 'footer') },
        { text: 'No <div>s left', check: noElement('div', 'Replace every <div> with a semantic element.') },
      ],
      hints: ['The class names tell you which element each div should become.'],
      solution: `<header>
  <h1>Green Thumb</h1>
  <nav>
    <a href="#">Home</a>
    <a href="#">Plants</a>
    <a href="#">Contact</a>
  </nav>
</header>
<main>
  <h2>Caring for succulents</h2>
  <p>Water them rarely and give them lots of light.</p>
</main>
<aside>
  <h2>Popular posts</h2>
  <p>Repotting 101</p>
</aside>
<footer>
  <p>&copy; 2026 Green Thumb</p>
</footer>
`,
    },
    {
      id: 'semantic-article',
      title: 'Articles and sections',
      explanation: `Two elements organise content inside \`<main>\`:

- \`<article>\` — a **self-contained** piece that would make sense on its own: a blog post, a news story, a
  product card, a comment. Test: could you publish it alone on another site?
- \`<section>\` — a **thematic group** of content, typically with its own heading. A chapter, a tab, the
  "Features" part of a landing page.

\`\`\`html
<main>
  <section>
    <h2>Latest posts</h2>
    <article>
      <h3>Learning HTML</h3>
      <p>It's easier than you think.</p>
    </article>
    <article>
      <h3>CSS next</h3>
      <p>Time to add some style.</p>
    </article>
  </section>
</main>
\`\`\`

An article can have its own \`<header>\` and \`<footer>\` (e.g. author and date).
If you just need a box for styling, \`<div>\` is still the right choice — it means "no meaning".`,
      starterCode: `<main>
  <h2>News</h2>
  <h3>New park opens</h3>
  <p>The city opened a new park on Sunday.</p>
  <p>By Marco</p>

  <h3>Library extends hours</h3>
  <p>The library will now close at 22:00.</p>
  <p>By Giulia</p>

  <h2>Weather</h2>
  <p>Sunny all week.</p>
</main>
`,
      tasks: [
        { text: 'Wrap "News" and its stories in a <section>', check: textMatches('section > h2', /news/i) },
        { text: 'Make each news story an <article>', check: all(count('article', 2), count('article > h3', 2)) },
        { text: 'Put each author line in the article\'s <footer>', check: count('article > footer', 2) },
        { text: 'Make "Weather" its own <section>', check: all(count('section', 2), textMatches('section > h2', /weather/i)) },
      ],
      hints: ['Each article contains its h3, its paragraph and a <footer> with the author.'],
      solution: `<main>
  <section>
    <h2>News</h2>
    <article>
      <h3>New park opens</h3>
      <p>The city opened a new park on Sunday.</p>
      <footer>By Marco</footer>
    </article>
    <article>
      <h3>Library extends hours</h3>
      <p>The library will now close at 22:00.</p>
      <footer>By Giulia</footer>
    </article>
  </section>
  <section>
    <h2>Weather</h2>
    <p>Sunny all week.</p>
  </section>
</main>
`,
    },
    {
      id: 'semantic-inline',
      title: 'Time, address and friends',
      explanation: `Some small elements add machine-readable meaning:

- \`<time datetime="2026-10-06">\` — a date or time. The visible text can be anything; \`datetime\` holds a
  standard format (\`YYYY-MM-DD\`, \`HH:MM\`, or both: \`2026-10-06T18:30\`).
- \`<address>\` — contact information for the nearest article or the page (not any postal address).
- \`<data value="...">\` — links content to a machine-readable value, like a product code.

\`\`\`html
<p>The concert starts on <time datetime="2026-12-24T21:00">Christmas Eve at 9pm</time>.</p>
<address>
  Written by <a href="mailto:anna@example.com">Anna</a>.
</address>
\`\`\`

Calendars, search engines and browser extensions can use these values.`,
      starterCode: `<article>
  <h2>Pottery workshop</h2>
  <p>Join us on Saturday 14 November at 10:30.</p>
  <p>Posted on 6 October 2026.</p>
  <p>Questions? Contact Luca: luca@example.com</p>
</article>
`,
      tasks: [
        { text: 'Mark the workshop date and time with <time datetime="2026-11-14T10:30">', check: hasAttr('time', 'datetime', '2026-11-14T10:30') },
        { text: 'Mark the posting date with <time datetime="2026-10-06">', check: hasAttr('time', 'datetime', '2026-10-06') },
        { text: 'Put the contact info in an <address>', check: textMatches('article address', /luca/i) },
        { text: 'Make the email a mailto: link', check: hasAttr('address a', 'href', /^mailto:luca@example\.com$/) },
      ],
      hints: ['The visible text stays the same; only the datetime attribute uses the standard format.'],
      solution: `<article>
  <h2>Pottery workshop</h2>
  <p>Join us on <time datetime="2026-11-14T10:30">Saturday 14 November at 10:30</time>.</p>
  <p>Posted on <time datetime="2026-10-06">6 October 2026</time>.</p>
  <address>Questions? Contact Luca: <a href="mailto:luca@example.com">luca@example.com</a></address>
</article>
`,
    },
    {
      id: 'semantic-interactive',
      title: 'Details, summary and dialog',
      explanation: `HTML has interactive widgets that work **without JavaScript**.

\`<details>\` creates a disclosure widget: only the \`<summary>\` is visible until the user clicks it.
Perfect for FAQs. Add \`open\` to start expanded, and give several the same \`name\` to make an accordion
where only one is open at a time.

\`\`\`html
<details name="faq">
  <summary>Is it free?</summary>
  <p>Yes, completely.</p>
</details>
<details name="faq">
  <summary>Do I need an account?</summary>
  <p>No.</p>
</details>
\`\`\`

\`<dialog>\` is a pop-up box. With the \`open\` attribute it is shown; a form with \`method="dialog"\` inside
closes it when submitted:

\`\`\`html
<dialog open>
  <p>Cookies help us improve the site.</p>
  <form method="dialog">
    <button>OK</button>
  </form>
</dialog>
\`\`\``,
      starterCode: `<h1>FAQ</h1>
<h3>How long is the course?</h3>
<p>About 20 hours.</p>
<h3>Can I get a certificate?</h3>
<p>Yes, after the final challenge.</p>
<h3>Is there a mobile app?</h3>
<p>The website works on phones.</p>
`,
      tasks: [
        { text: 'Turn each question into a <details> with a <summary>', check: all(count('details', 3), count('details > summary', 3)) },
        { text: 'The answers live inside their <details>', check: count('details > p', 3) },
        { text: 'Make it an accordion: all three share the same name', check: (doc) => {
          const names = [...doc.querySelectorAll('details')].map((d) => d.getAttribute('name'));
          return names.length > 0 && names[0] && names.every((n) => n === names[0]) ? true : 'Give every <details> the same name="...".';
        } },
        { text: 'Add an open <dialog> welcoming the reader, with a close button', check: all(hasAttr('dialog', 'open'), isInside('button', 'dialog form[method="dialog"]', 'Put a <form method="dialog"> with a <button> inside the dialog.')) },
        { text: 'No leftover <h3> questions', check: noElement('h3', 'Questions now live in <summary>, remove the <h3>s.') },
      ],
      hints: ['Click the questions in the preview to check the accordion works.'],
      solution: `<h1>FAQ</h1>
<dialog open>
  <p>Welcome! Questions? We have answers.</p>
  <form method="dialog">
    <button>Close</button>
  </form>
</dialog>
<details name="faq">
  <summary>How long is the course?</summary>
  <p>About 20 hours.</p>
</details>
<details name="faq">
  <summary>Can I get a certificate?</summary>
  <p>Yes, after the final challenge.</p>
</details>
<details name="faq">
  <summary>Is there a mobile app?</summary>
  <p>The website works on phones.</p>
</details>
`,
    },
  ],
  challenge: {
    id: 'semantic-challenge',
    title: 'Challenge: Div soup refactor',
    summary: 'Turn a page made only of <div>s into clean semantic HTML.',
    difficulty: 3,
    explanation: `This blog page was built entirely with \`<div>\` and \`<span>\`. Refactor it into **semantic HTML**
without losing any content. Use what you learned across the course: landmarks, articles, sections, time,
address, lists and emphasis.

Requirements are only revealed as passed/failed when you check.`,
    starterCode: `<div class="top">
  <div class="title">The Coding Cat</div>
  <div class="menu">
    <div><a href="#">Home</a></div>
    <div><a href="#">Archive</a></div>
    <div><a href="#">About</a></div>
  </div>
</div>
<div class="content">
  <div class="post">
    <div class="post-title">Why I love semantic HTML</div>
    <div class="date">Published 1 October 2026</div>
    <div>Semantic HTML makes pages <span class="bold">accessible</span> by default.</div>
    <div class="post-title-small">Three reasons</div>
    <div class="list">
      <div>Screen readers understand it</div>
      <div>Search engines rank it better</div>
      <div>It's easier to maintain</div>
    </div>
  </div>
  <div class="post">
    <div class="post-title">Tables are not for layout</div>
    <div class="date">Published 20 September 2026</div>
    <div>Use CSS grid instead.</div>
  </div>
</div>
<div class="side">
  <div class="post-title">About the author</div>
  <div>Miao writes about the web.</div>
</div>
<div class="bottom">
  <div>Contact: <a href="mailto:miao@example.com">miao@example.com</a></div>
</div>
`,
    tasks: [
      { text: 'Landmarks: <header> with an <h1> and a <nav>, one <main>, an <aside>, a <footer>', check: all(isChildOf('h1', 'header'), isInside('nav', 'header'), count('main', 1), hasElement('aside'), hasElement('footer')) },
      { text: 'The navigation links are a list (<ul> of <li>)', check: count('nav ul > li > a', 3) },
      { text: 'Two <article>s inside <main>, each with an <h2>', check: count('main article h2', 2) },
      { text: 'Both publish dates use <time datetime="YYYY-MM-DD">', check: (doc) => {
        const times = [...doc.querySelectorAll('article time')];
        const ok = times.length === 2 && times.every((t) => /^\d{4}-\d{2}-\d{2}$/.test(t.getAttribute('datetime') ?? ''));
        return ok ? true : 'Each article needs a <time> with datetime="YYYY-MM-DD".';
      } },
      { text: 'Correct dates: 2026-10-01 and 2026-09-20', check: all(hasAttr('time', 'datetime', '2026-10-01'), hasAttr('time', 'datetime', '2026-09-20')) },
      { text: '"Three reasons" is an <h3> followed by a real list', check: all(textMatches('h3', /three reasons/i), orderIs(['h3', 'article ul']), count('article ul > li', 3)) },
      { text: '"accessible" is marked as important', check: textMatches('strong', /accessible/i) },
      { text: 'The text paragraphs are <p>s', check: count('p', { min: 3 }) },
      { text: 'Contact info is in an <address> inside the footer', check: isInside('address', 'footer') },
      { text: 'Headings follow a correct outline (h1 → h2 → h3)', check: (doc) => {
        const levels = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1]));
        for (let k = 1; k < levels.length; k++) if (levels[k] > levels[k - 1] + 1) return 'A heading level is skipped.';
        return levels[0] === 1 ? true : 'Start with an <h1>.';
      } },
      { text: 'No <div> or <span> left', check: all(noElement('div', 'Some <div>s remain.'), noElement('span', 'A <span> remains.')) },
    ],
    hints: [
      'Work top to bottom: header, main, aside, footer. Then go inside each.',
      'The sidebar title can be an <h2> inside <aside>.',
    ],
    solution: `<header>
  <h1>The Coding Cat</h1>
  <nav>
    <ul>
      <li><a href="#">Home</a></li>
      <li><a href="#">Archive</a></li>
      <li><a href="#">About</a></li>
    </ul>
  </nav>
</header>
<main>
  <article>
    <h2>Why I love semantic HTML</h2>
    <p>Published <time datetime="2026-10-01">1 October 2026</time></p>
    <p>Semantic HTML makes pages <strong>accessible</strong> by default.</p>
    <h3>Three reasons</h3>
    <ul>
      <li>Screen readers understand it</li>
      <li>Search engines rank it better</li>
      <li>It's easier to maintain</li>
    </ul>
  </article>
  <article>
    <h2>Tables are not for layout</h2>
    <p>Published <time datetime="2026-09-20">20 September 2026</time></p>
    <p>Use CSS grid instead.</p>
  </article>
</main>
<aside>
  <h2>About the author</h2>
  <p>Miao writes about the web.</p>
</aside>
<footer>
  <address>Contact: <a href="mailto:miao@example.com">miao@example.com</a></address>
</footer>
`,
  },
};
