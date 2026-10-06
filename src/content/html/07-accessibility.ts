import type { Module } from '../types';
import {
  all, allHaveAttr, controlsLabelled, count, hasAttr, hasElement, headingOrder, noElement, rawMatches,
  rawNotMatches, textMatches,
} from '../../engine/checks';

export const accessibility: Module = {
  id: 'accessibility',
  title: 'Accessibility',
  description: 'Pages everyone can use: alt text, outlines, keyboard access and ARIA done right.',
  lessons: [
    {
      id: 'a11y-alt',
      title: 'Writing good alt text',
      explanation: `About one in six people lives with a disability. Many use **assistive technology**: screen readers,
voice control, keyboard-only navigation, magnification. Good HTML is the foundation of accessibility.

Alt text depends on the image's **purpose**:

| Image | alt |
|---|---|
| Informative photo | Describe what matters: \`alt="Two kids planting a tree"\` |
| Image inside a link or button | Describe the **action/destination**: \`alt="Home"\` |
| Decorative (borders, flourishes) | Empty: \`alt=""\` — the screen reader skips it |
| Image of text | The text itself |

Avoid "image of…" or "picture of…" — screen readers already announce it's an image. Never leave \`alt\` out
completely: the reader will then read the file name, like "IMG_4032.jpg".`,
      starterCode: `<h1>Recipes</h1>
<a href="/">
  <img src="https://picsum.photos/id/1080/80/80" width="80" height="80">
</a>
<img src="https://picsum.photos/id/1060/400/200" width="400" height="200" alt="image">
<p>Our coffee is roasted every morning.</p>
<img src="https://picsum.photos/id/106/400/20" width="400" height="20" alt="decorative flower border">
`,
      tasks: [
        { text: 'The logo link image describes its destination (e.g. "Recipes home")', check: hasAttr('a img', 'alt', /home/i, 'The linked logo should say where it goes, e.g. alt="Recipes home".') },
        { text: 'The coffee photo has a real description (not just "image")', check: (doc) => {
          const alt = doc.querySelector('img[src*="1060"]')?.getAttribute('alt') ?? '';
          if (alt.trim().split(/\s+/).length < 3) return 'Describe the photo in a few words.';
          return /^(image|picture|photo) of/i.test(alt) || /^image$/i.test(alt) ? 'Don\'t start with "image of" — just describe it.' : true;
        } },
        { text: 'The decorative border has alt=""', check: hasAttr('img[src*="/106/"]', 'alt', '', 'Decorative images need an empty alt="".') },
        { text: 'Every image has an alt attribute', check: allHaveAttr('img', 'alt') },
      ],
      hints: ['An empty alt is written alt="" — the attribute is present, the value is empty.'],
      solution: `<h1>Recipes</h1>
<a href="/">
  <img src="https://picsum.photos/id/1080/80/80" width="80" height="80" alt="Recipes home">
</a>
<img src="https://picsum.photos/id/1060/400/200" width="400" height="200" alt="A barista pouring coffee into a cup">
<p>Our coffee is roasted every morning.</p>
<img src="https://picsum.photos/id/106/400/20" width="400" height="20" alt="">
`,
    },
    {
      id: 'a11y-structure',
      title: 'Language, headings and landmarks',
      explanation: `Screen reader users often skim a page by **headings** or **landmarks**, just like sighted users skim
by looking. That only works if:

1. The page declares its language (\`<html lang="en">\`), so the right voice and pronunciation are used.
   Parts in another language get their own \`lang\`.
2. There is a clear **heading outline**: one \`<h1>\`, no skipped levels.
3. The page uses **landmarks** (\`header\`, \`nav\`, \`main\`, \`footer\`). If there are two \`<nav>\`s, give each an
   \`aria-label\` so they can be told apart.

A **skip link** as the first element lets keyboard users jump past the navigation:

\`\`\`html
<a href="#content">Skip to main content</a>
...
<main id="content">...</main>
\`\`\``,
      starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Museum</title>
</head>
<body>
  <header>
    <h2>City Museum</h2>
    <nav>
      <a href="#">Exhibitions</a>
      <a href="#">Tickets</a>
    </nav>
  </header>
  <main>
    <h4>Current exhibitions</h4>
    <p>Our motto: Ars longa, vita brevis.</p>
  </main>
  <footer>
    <nav>
      <a href="#">Privacy</a>
      <a href="#">Jobs</a>
    </nav>
  </footer>
</body>
</html>
`,
      tasks: [
        { text: 'Declare the page language with <html lang="en">', check: rawMatches(/<html[^>]*\blang\s*=\s*["']en/i, 'Add lang="en" to <html>.') },
        { text: 'Mark the Latin motto with lang="la"', check: textMatches('[lang="la"]', /ars longa/i) },
        { text: 'Fix the heading outline (h1, then h2)', check: headingOrder() },
        { text: 'Label the two navs with aria-label so they can be told apart', check: all(allHaveAttr('nav', 'aria-label', /\S/), (doc) => {
          const labels = [...doc.querySelectorAll('nav')].map((n) => n.getAttribute('aria-label'));
          return new Set(labels).size === labels.length ? true : 'Give each nav a different label.';
        }) },
        { text: 'Add a skip link as the first thing in <body> that targets <main>', check: (doc) => {
          const first = doc.body.firstElementChild;
          const id = doc.querySelector('main')?.id;
          return first?.tagName === 'A' && id && first.getAttribute('href') === `#${id}` ? true : 'The first element in <body> should be <a href="#..."> pointing at the id of <main>.';
        } },
      ],
      hints: ['Wrap the Latin words in a <span lang="la">.', 'Give <main> an id like "content".'],
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Museum</title>
</head>
<body>
  <a href="#content">Skip to main content</a>
  <header>
    <h1>City Museum</h1>
    <nav aria-label="Main">
      <a href="#">Exhibitions</a>
      <a href="#">Tickets</a>
    </nav>
  </header>
  <main id="content">
    <h2>Current exhibitions</h2>
    <p>Our motto: <span lang="la">Ars longa, vita brevis</span>.</p>
  </main>
  <footer>
    <nav aria-label="Legal">
      <a href="#">Privacy</a>
      <a href="#">Jobs</a>
    </nav>
  </footer>
</body>
</html>
`,
    },
    {
      id: 'a11y-keyboard',
      title: 'Keyboard and real buttons',
      explanation: `Many people navigate with the **keyboard** only: Tab moves between interactive elements, Enter or Space
activates them. Native elements give you this for free:

- \`<a href>\` — goes somewhere (a new page or a place on the page).
- \`<button>\` — does something (opens a menu, submits, toggles).

A clickable \`<div onclick="...">\` is **not** reachable with Tab, and screen readers don't know it's clickable.
Always use the real element.

\`tabindex\`:

- \`tabindex="0"\` makes a non-interactive element focusable (rarely needed).
- \`tabindex="-1"\` makes something focusable by script only.
- **Never** use positive values like \`tabindex="5"\`: they scramble the natural tab order.

Try it: click into the preview and press Tab — see which elements get focus.`,
      starterCode: `<h1>Shop</h1>
<div onclick="alert('Added!')">Add to cart</div>
<span onclick="location.href='/checkout'">Go to checkout</span>
<p tabindex="3">Free shipping over €50.</p>
<button tabindex="1">Subscribe</button>
`,
      tasks: [
        { text: '"Add to cart" is a real <button type="button">', check: textMatches('button[type="button"]', /add to cart/i) },
        { text: '"Go to checkout" is a real link to /checkout', check: all(hasAttr('a', 'href', '/checkout'), textMatches('a', /checkout/i)) },
        { text: 'No clickable div/span left', check: noElement('div[onclick], span[onclick]', 'Replace clickable <div>/<span> with real elements.') },
        { text: 'No positive tabindex values', check: rawNotMatches(/tabindex\s*=\s*["']?[1-9]/i, 'Remove the positive tabindex values.') },
      ],
      hints: ['A button can keep its onclick: <button type="button" onclick="...">.'],
      solution: `<h1>Shop</h1>
<button type="button" onclick="alert('Added!')">Add to cart</button>
<a href="/checkout">Go to checkout</a>
<p>Free shipping over €50.</p>
<button>Subscribe</button>
`,
    },
    {
      id: 'a11y-aria',
      title: 'ARIA: the last resort',
      explanation: `**ARIA** (Accessible Rich Internet Applications) attributes add accessibility information when HTML
alone can't express it. The first rule of ARIA: **don't use ARIA if a native element does the job.**
\`<button>\` beats \`<div role="button">\`, always.

Where ARIA *is* useful:

- \`aria-label\` — an accessible name for elements with no visible text, like an icon button:
  \`<button aria-label="Close">✕</button>\`
- \`aria-describedby\` — links a control to extra help text by id.
- \`aria-expanded="true|false"\` — tells whether a toggle button's menu is open.
- \`aria-hidden="true"\` — hides decorative content (like an icon next to text) from screen readers.
- \`aria-live="polite"\` — announces content that changes, like "Saved!".

\`\`\`html
<label for="pw">Password</label>
<input type="password" id="pw" aria-describedby="pw-help">
<p id="pw-help">At least 8 characters.</p>
\`\`\``,
      starterCode: `<header>
  <button>☰</button>
  <button><span>🔍</span> Search</button>
</header>
<form>
  <label for="user">Username</label>
  <input id="user" name="user">
  <p id="user-help">Letters and numbers only.</p>
</form>
<p>Saved!</p>
<div role="button">Delete</div>
`,
      tasks: [
        { text: 'Give the ☰ icon button an aria-label', check: (doc) => {
          const b = [...doc.querySelectorAll('button')].find((x) => x.textContent?.includes('☰'));
          return b?.getAttribute('aria-label')?.trim() ? true : 'Add aria-label="Menu" to the ☰ button.';
        } },
        { text: 'The ☰ menu button says it is collapsed (aria-expanded="false")', check: hasAttr('button', 'aria-expanded', 'false') },
        { text: 'Hide the decorative 🔍 emoji from screen readers', check: hasAttr('button span', 'aria-hidden', 'true') },
        { text: 'Connect the username input to its help text', check: hasAttr('#user', 'aria-describedby', 'user-help') },
        { text: 'Announce "Saved!" with aria-live="polite"', check: textMatches('[aria-live="polite"]', /saved/i) },
        { text: 'Replace the fake div button with a real <button>', check: all(noElement('[role="button"]', 'Use a real <button> instead of role="button".'), textMatches('button', /delete/i)) },
      ],
      hints: ['aria-expanded goes on the button that opens/closes the menu.'],
      solution: `<header>
  <button aria-label="Menu" aria-expanded="false">☰</button>
  <button><span aria-hidden="true">🔍</span> Search</button>
</header>
<form>
  <label for="user">Username</label>
  <input id="user" name="user" aria-describedby="user-help">
  <p id="user-help">Letters and numbers only.</p>
</form>
<p aria-live="polite">Saved!</p>
<button type="button">Delete</button>
`,
    },
  ],
  challenge: {
    id: 'a11y-challenge',
    title: 'Challenge: Accessibility audit',
    summary: 'A newsletter page fails an audit on 8 points. Fix them all.',
    difficulty: 3,
    blind: true,
    explanation: `An accessibility audit flagged this newsletter sign-up page. Fix **every** issue so it passes
— the 9 requirements are hidden, and each one reveals itself once it passes. Think about: language, headings, images, labels, keyboard,
link text and ARIA misuse.`,
    starterCode: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Newsletter</title>
</head>
<body>
  <header>
    <img src="https://picsum.photos/id/30/120/40" width="120" height="40">
    <h3>The Weekly Web</h3>
  </header>
  <main>
    <h1>Join 10,000 readers</h1>
    <h4>What you get</h4>
    <p>One email a week. To read our privacy policy <a href="/privacy">click here</a>.</p>
    <form>
      <input type="email" name="email" placeholder="Your email">
      <div role="button" onclick="this.closest('form').submit()">Subscribe</div>
    </form>
    <p tabindex="2">No spam, ever.</p>
  </main>
</body>
</html>
`,
    tasks: [
      { text: 'The page declares its language', check: rawMatches(/<html[^>]*\blang\s*=\s*["']?\w/i, 'Add a lang attribute to <html>.') },
      { text: 'The logo has meaningful alt text', check: allHaveAttr('img', 'alt', /\w{3,}/) },
      { text: 'Heading outline starts at h1 and never skips', check: headingOrder() },
      { text: 'Exactly one <h1>', check: count('h1', 1) },
      { text: 'The email field has a real label (placeholder isn\'t enough)', check: controlsLabelled() },
      { text: 'Subscribing uses a real submit button', check: all(hasElement('form button:not([type="button"])', 'Add a <button> (type submit) to the form.'), noElement('[role="button"]', 'Remove the fake div button.')) },
      { text: 'The privacy link text describes its destination', check: (doc) => {
        const a = doc.querySelector('a[href="/privacy"]');
        if (!a) return 'Keep the link to /privacy.';
        return /click here|here|more/i.test(a.textContent?.trim() ?? '') || !/privacy/i.test(a.textContent ?? '') ? 'Make the link text say where it goes, e.g. "privacy policy".' : true;
      } },
      { text: 'No positive tabindex', check: rawNotMatches(/tabindex\s*=\s*["']?[1-9]/i, 'Remove positive tabindex values.') },
      { text: 'The email field is required', check: hasElement('input[type="email"][required]') },
    ],
    hints: [
      'The site name in the header and the page heading compete. Which one is the page\'s main topic?',
      'Placeholders disappear as soon as you type: a <label> is always needed.',
    ],
    solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Newsletter</title>
</head>
<body>
  <header>
    <img src="https://picsum.photos/id/30/120/40" width="120" height="40" alt="The Weekly Web logo">
    <p>The Weekly Web</p>
  </header>
  <main>
    <h1>Join 10,000 readers</h1>
    <h2>What you get</h2>
    <p>One email a week. Read our <a href="/privacy">privacy policy</a>.</p>
    <form>
      <label for="email">Email address</label>
      <input type="email" id="email" name="email" placeholder="you@example.com" required>
      <button type="submit">Subscribe</button>
    </form>
    <p>No spam, ever.</p>
  </main>
</body>
</html>
`,
  },
};
