import type { Module } from '../types';
import {
  all, allHaveAttr, anchorsResolve, controlsLabelled, count, hasAttr, hasDoctype, hasElement, headingOrder,
  isChildOf, isInside, rawMatches, textMatches, uniqueIds,
} from '../../engine/checks';

export const advanced: Module = {
  id: 'advanced',
  title: 'Advanced HTML',
  description: 'Metadata and SEO, responsive images, performance, templates, SVG and structured data.',
  lessons: [
    {
      id: 'adv-meta',
      title: 'Metadata, SEO and social sharing',
      explanation: `The \`<head>\` holds metadata that is never shown on the page, but matters a lot:

\`\`\`html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Handmade Ceramics | Studio Argilla</title>
  <meta name="description" content="Hand-thrown mugs and bowls from Florence.">
  <link rel="icon" href="/favicon.svg">
  <link rel="stylesheet" href="/styles.css">

  <meta property="og:title" content="Studio Argilla">
  <meta property="og:description" content="Hand-thrown mugs and bowls.">
  <meta property="og:image" content="https://example.com/cover.jpg">
</head>
\`\`\`

- **viewport** makes the page render at the device's width on phones. Without it, mobile browsers show a tiny
  zoomed-out desktop page.
- **title** and **description** are what search engines display in results. Keep the title unique per page.
- **Open Graph** (\`og:\`) tags control the preview card when the link is shared on social apps and chats.
- \`<link>\` connects external resources: icons, stylesheets, fonts.`,
      starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Home</title>
</head>
<body>
  <h1>Studio Argilla</h1>
  <p>Hand-thrown ceramics from Florence.</p>
</body>
</html>
`,
      tasks: [
        { text: 'Add the responsive viewport meta tag', check: hasAttr('meta[name="viewport"]', 'content', /width=device-width/, 'Add <meta name="viewport" content="width=device-width, initial-scale=1">.') },
        { text: 'Give the page a descriptive title (more than just "Home")', check: textMatches('title', /^(?!home$).{10,}/i, 'Write a more descriptive <title>, at least 10 characters.') },
        { text: 'Add a meta description of 50–160 characters', check: hasAttr('meta[name="description"]', 'content', /^.{50,160}$/, 'Add a meta description between 50 and 160 characters.') },
        { text: 'Add og:title, og:description and og:image', check: all(hasElement('meta[property="og:title"]'), hasElement('meta[property="og:description"]'), hasAttr('meta[property="og:image"]', 'content', /^https?:\/\//)) },
        { text: 'Link a favicon with <link rel="icon">', check: hasElement('link[rel="icon"][href]', 'Add <link rel="icon" href="...">.') },
      ],
      hints: ['Everything here goes inside <head>.', 'og:image must be an absolute URL starting with https://.'],
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Handmade Ceramics | Studio Argilla</title>
  <meta name="description" content="Hand-thrown mugs, bowls and vases, made one at a time in our Florence studio.">
  <link rel="icon" href="/favicon.svg">
  <meta property="og:title" content="Studio Argilla">
  <meta property="og:description" content="Hand-thrown ceramics from Florence.">
  <meta property="og:image" content="https://example.com/cover.jpg">
</head>
<body>
  <h1>Studio Argilla</h1>
  <p>Hand-thrown ceramics from Florence.</p>
</body>
</html>
`,
    },
    {
      id: 'adv-responsive-images',
      title: 'Responsive images',
      explanation: `Phones shouldn't download a 3000-pixel image to show it 400 pixels wide. HTML lets the browser choose.

**\`srcset\` + \`sizes\`** — same image, different resolutions:

\`\`\`html
<img
  src="https://picsum.photos/id/1025/800/533"
  srcset="https://picsum.photos/id/1025/400/267 400w,
          https://picsum.photos/id/1025/800/533 800w,
          https://picsum.photos/id/1025/1600/1066 1600w"
  sizes="(max-width: 600px) 100vw, 50vw"
  alt="A pug wrapped in a blanket" width="800" height="533">
\`\`\`

\`400w\` tells the browser each file's real width; \`sizes\` tells it how wide the image will be displayed. The
browser does the maths, considering screen density too.

**\`<picture>\`** — different images or formats (*art direction*). The first matching \`<source>\` wins, and
the \`<img>\` inside is the required fallback:

\`\`\`html
<picture>
  <source media="(max-width: 600px)" srcset="https://picsum.photos/id/1025/400/400">
  <source type="image/avif" srcset="cover.avif">
  <img src="https://picsum.photos/id/1025/800/400" alt="A pug wrapped in a blanket" width="800" height="400">
</picture>
\`\`\``,
      starterCode: `<h1>Responsive hero</h1>
<img src="https://picsum.photos/id/1039/1600/800" alt="A waterfall in a forest" width="1600" height="800">
`,
      tasks: [
        { text: 'Wrap the image in a <picture>', check: isChildOf('img', 'picture') },
        { text: 'Add a <source> for small screens (max-width: 600px) with a square crop', check: hasAttr('picture > source', 'media', /max-width:\s*600px/) },
        { text: 'Give the <img> a srcset with at least two widths (w descriptors)', check: hasAttr('picture img', 'srcset', /\d+w\s*,[\s\S]*\d+w/, 'List at least two images with 400w, 800w... in srcset.') },
        { text: 'Tell the browser the display size with sizes', check: hasAttr('picture img', 'sizes') },
        { text: 'The fallback <img> keeps alt, width and height', check: all(allHaveAttr('img', 'alt', /\w/), allHaveAttr('img', 'width'), allHaveAttr('img', 'height')) },
      ],
      hints: ['The <source> elements come before the <img> inside <picture>.'],
      solution: `<h1>Responsive hero</h1>
<picture>
  <source media="(max-width: 600px)" srcset="https://picsum.photos/id/1039/600/600">
  <img
    src="https://picsum.photos/id/1039/1600/800"
    srcset="https://picsum.photos/id/1039/800/400 800w,
            https://picsum.photos/id/1039/1600/800 1600w"
    sizes="100vw"
    alt="A waterfall in a forest" width="1600" height="800">
</picture>
`,
    },
    {
      id: 'adv-performance',
      title: 'Loading performance',
      explanation: `A few attributes make pages load much faster:

- \`loading="lazy"\` on images and iframes far down the page: they load only when the user scrolls near them.
  Don't lazy-load the first big image — that one should load immediately.
- \`fetchpriority="high"\` on the most important image (the "hero") so the browser fetches it first.
- \`decoding="async"\` lets the browser decode images without blocking the page.
- Scripts block page rendering. Use \`defer\` (run after the HTML is parsed, in order) or \`async\` (run as soon
  as downloaded, any order). \`type="module"\` scripts are deferred automatically.
- \`<link rel="preload">\` fetches critical resources early; \`<link rel="preconnect">\` warms up a connection to
  another server.

\`\`\`html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <script src="app.js" defer></script>
</head>
<body>
  <img src="hero.jpg" fetchpriority="high" alt="..." width="1200" height="600">
  ...
  <img src="footer-photo.jpg" loading="lazy" alt="..." width="400" height="300">
</body>
\`\`\``,
      starterCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gallery</title>
  <script src="analytics.js"></script>
  <script src="gallery.js"></script>
</head>
<body>
  <img id="hero" src="https://picsum.photos/id/1011/1200/500" alt="A woman paddling a canoe on a lake" width="1200" height="500">
  <h1>Gallery</h1>
  <p>Scroll down for more photos.</p>
  <img class="below" src="https://picsum.photos/id/1012/400/300" alt="A dog walking in the snow" width="400" height="300">
  <img class="below" src="https://picsum.photos/id/1013/400/300" alt="A man looking at a city skyline" width="400" height="300">
  <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=10.2,43.7,10.5,43.8" title="Map of the gallery location" width="400" height="300"></iframe>
</body>
</html>
`,
      tasks: [
        { text: 'The hero image gets fetchpriority="high" (and is not lazy)', check: all(hasAttr('#hero', 'fetchpriority', 'high'), (doc) => (doc.querySelector('#hero')?.getAttribute('loading') === 'lazy' ? 'Don\'t lazy-load the hero.' : true)) },
        { text: 'Images below the fold are lazy-loaded', check: allHaveAttr('img.below', 'loading', 'lazy') },
        { text: 'The map iframe is lazy-loaded', check: hasAttr('iframe', 'loading', 'lazy') },
        { text: 'analytics.js loads with async', check: hasAttr('script[src="analytics.js"]', 'async') },
        { text: 'gallery.js loads with defer', check: hasAttr('script[src="gallery.js"]', 'defer') },
      ],
      hints: ['async suits independent scripts like analytics; defer suits scripts that need the page.'],
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Gallery</title>
  <script src="analytics.js" async></script>
  <script src="gallery.js" defer></script>
</head>
<body>
  <img id="hero" src="https://picsum.photos/id/1011/1200/500" alt="A woman paddling a canoe on a lake" width="1200" height="500" fetchpriority="high">
  <h1>Gallery</h1>
  <p>Scroll down for more photos.</p>
  <img class="below" src="https://picsum.photos/id/1012/400/300" alt="A dog walking in the snow" width="400" height="300" loading="lazy">
  <img class="below" src="https://picsum.photos/id/1013/400/300" alt="A man looking at a city skyline" width="400" height="300" loading="lazy">
  <iframe src="https://www.openstreetmap.org/export/embed.html?bbox=10.2,43.7,10.5,43.8" title="Map of the gallery location" width="400" height="300" loading="lazy"></iframe>
</body>
</html>
`,
    },
    {
      id: 'adv-data-template',
      title: 'Data attributes and templates',
      explanation: `**Custom data attributes** store extra information on any element. They must start with \`data-\`:

\`\`\`html
<li data-product-id="A42" data-price="19.90">Blue mug</li>
\`\`\`

JavaScript reads them via \`element.dataset.productId\` and CSS can select them with \`[data-price]\`.

**\`<template>\`** holds HTML that is **not rendered** — a blueprint that JavaScript clones to create content:

\`\`\`html
<ul id="list"></ul>
<template id="row">
  <li class="item"><strong></strong> — <span></span></li>
</template>
<script>
  const tpl = document.getElementById('row');
  for (const [name, price] of [['Mug', '€19'], ['Bowl', '€25']]) {
    const li = tpl.content.cloneNode(true);
    li.querySelector('strong').textContent = name;
    li.querySelector('span').textContent = price;
    document.getElementById('list').append(li);
  }
</script>
\`\`\`

Press "Try it" to see the script fill the list from the template. (Web Components also use \`<template>\`
together with \`<slot>\` to define reusable custom elements.)`,
      starterCode: `<h1>Team</h1>
<ul id="team"></ul>

<!-- 1. a <template id="member"> with an <li> that has an <h2> and a <p> -->

<script>
  const people = [['Ada', 'Engineer'], ['Grace', 'Admiral'], ['Linus', 'Maintainer']];
  const tpl = document.getElementById('member');
  if (tpl) {
    people.forEach(([name, role], i) => {
      const node = tpl.content.cloneNode(true);
      node.querySelector('h2').textContent = name;
      node.querySelector('p').textContent = role;
      node.querySelector('li').dataset.index = i;
      document.getElementById('team').append(node);
    });
  }
</script>
`,
      tasks: [
        { text: 'Add a <template id="member">', check: hasElement('template#member') },
        { text: 'The template contains an <li> with an <h2> and a <p>', check: (doc) => {
          const tpl = doc.querySelector('template#member') as HTMLTemplateElement | null;
          const li = tpl?.content.querySelector('li');
          return li?.querySelector('h2') && li.querySelector('p') ? true : 'Inside the template, add <li><h2></h2><p></p></li>.';
        } },
        { text: 'Give the <h1> a data attribute: data-section="team"', check: hasAttr('h1', 'data-section', 'team') },
      ],
      hints: ['The template content stays invisible; the script clones it three times.'],
      solution: `<h1 data-section="team">Team</h1>
<ul id="team"></ul>

<template id="member">
  <li>
    <h2></h2>
    <p></p>
  </li>
</template>

<script>
  const people = [['Ada', 'Engineer'], ['Grace', 'Admiral'], ['Linus', 'Maintainer']];
  const tpl = document.getElementById('member');
  if (tpl) {
    people.forEach(([name, role], i) => {
      const node = tpl.content.cloneNode(true);
      node.querySelector('h2').textContent = name;
      node.querySelector('p').textContent = role;
      node.querySelector('li').dataset.index = i;
      document.getElementById('team').append(node);
    });
  }
</script>
`,
    },
    {
      id: 'adv-svg-canvas',
      title: 'Inline SVG and canvas',
      explanation: `HTML can draw graphics in two ways.

**SVG** (Scalable Vector Graphics) is markup for shapes. It stays sharp at any size and each shape is an element:

\`\`\`html
<svg width="200" height="120" viewBox="0 0 200 120" role="img" aria-labelledby="t">
  <title id="t">A red circle next to a blue square</title>
  <circle cx="50" cy="60" r="40" fill="tomato" />
  <rect x="110" y="20" width="80" height="80" fill="steelblue" />
</svg>
\`\`\`

- \`viewBox\` defines the internal coordinate system, so the drawing scales with the element.
- Add \`role="img"\` and a \`<title>\` so screen readers can describe it. (Inside SVG, shapes may self-close.)

**\`<canvas>\`** is a blank bitmap that JavaScript paints pixel by pixel — ideal for games and charts with
thousands of points. Its content is invisible to screen readers, so put a text fallback inside it.

\`\`\`html
<canvas id="c" width="200" height="100">A green bar chart.</canvas>
<script>
  const ctx = document.getElementById('c').getContext('2d');
  ctx.fillStyle = 'seagreen';
  ctx.fillRect(10, 40, 40, 60);
  ctx.fillRect(70, 10, 40, 90);
</script>
\`\`\``,
      starterCode: `<h1>Traffic light</h1>
<!-- Draw a traffic light with inline SVG -->
`,
      tasks: [
        { text: 'Add an <svg> with a viewBox', check: hasAttr('svg', 'viewBox', /^\s*[\d.-]+\s+[\d.-]+\s+[\d.]+\s+[\d.]+\s*$/) },
        { text: 'Draw the box with a <rect>', check: hasElement('svg rect') },
        { text: 'Draw three lights with <circle> (red, orange/yellow, green)', check: all(count('svg circle', 3), (doc) => {
          const fills = [...doc.querySelectorAll('svg circle')].map((c) => (c.getAttribute('fill') ?? '').toLowerCase()).join(' ');
          return /red|tomato|crimson|#f00/.test(fills) && /green|lime|#0f0/.test(fills) ? true : 'Use fill colours for the lights.';
        }) },
        { text: 'Make it accessible: role="img" and a <title>', check: all(hasAttr('svg', 'role', 'img'), isChildOf('title', 'svg', 'Add a <title> inside the <svg>.')) },
      ],
      hints: ['The rect is drawn first, then the circles on top of it.', 'cx and cy are the centre of a circle, r is its radius.'],
      solution: `<h1>Traffic light</h1>
<svg width="100" height="240" viewBox="0 0 100 240" role="img" aria-labelledby="tl">
  <title id="tl">A traffic light</title>
  <rect x="10" y="10" width="80" height="220" rx="16" fill="#333" />
  <circle cx="50" cy="50" r="28" fill="red" />
  <circle cx="50" cy="120" r="28" fill="orange" />
  <circle cx="50" cy="190" r="28" fill="green" />
</svg>
`,
    },
    {
      id: 'adv-microdata',
      title: 'Structured data',
      explanation: `Search engines can show **rich results** — star ratings, recipe times, event dates — if you describe
your content with a shared vocabulary from [schema.org](https://schema.org).

The most common way is a **JSON-LD** script in the page:

\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Tiramisù",
  "prepTime": "PT30M",
  "recipeIngredient": ["mascarpone", "coffee", "savoiardi"]
}
</script>
\`\`\`

The alternative is **microdata**, attributes directly on your HTML:

\`\`\`html
<article itemscope itemtype="https://schema.org/Event">
  <h2 itemprop="name">Jazz night</h2>
  <time itemprop="startDate" datetime="2026-11-20T21:00">20 Nov, 9pm</time>
</article>
\`\`\`

- \`itemscope\` starts an item, \`itemtype\` says what kind of thing it is.
- \`itemprop\` marks each property of that item.`,
      starterCode: `<article>
  <h2>Margherita pizza</h2>
  <p>By <span>Sofia</span></p>
  <p>Ready in <time datetime="PT45M">45 minutes</time></p>
</article>
`,
      tasks: [
        { text: 'Make the article a schema.org Recipe with itemscope + itemtype', check: all(hasAttr('article', 'itemscope'), hasAttr('article', 'itemtype', 'https://schema.org/Recipe')) },
        { text: 'Mark the title with itemprop="name"', check: textMatches('[itemprop="name"]', /margherita/i) },
        { text: 'Mark the author with itemprop="author"', check: textMatches('[itemprop="author"]', /sofia/i) },
        { text: 'Mark the time with itemprop="totalTime"', check: hasAttr('time', 'itemprop', 'totalTime') },
        { text: 'Also add a JSON-LD script with "@type": "Recipe"', check: all(hasElement('script[type="application/ld+json"]'), (doc) => {
          try {
            const data = JSON.parse(doc.querySelector('script[type="application/ld+json"]')!.textContent ?? '');
            return data['@type'] === 'Recipe' ? true : 'Set "@type": "Recipe".';
          } catch {
            return 'The JSON-LD is not valid JSON. Check quotes and commas.';
          }
        }) },
      ],
      hints: ['JSON needs double quotes around keys and string values, and no trailing commas.'],
      solution: `<article itemscope itemtype="https://schema.org/Recipe">
  <h2 itemprop="name">Margherita pizza</h2>
  <p>By <span itemprop="author">Sofia</span></p>
  <p>Ready in <time itemprop="totalTime" datetime="PT45M">45 minutes</time></p>
</article>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Recipe",
  "name": "Margherita pizza",
  "author": "Sofia",
  "totalTime": "PT45M"
}
</script>
`,
    },
  ],
  challenge: {
    id: 'capstone',
    title: 'Capstone: Your portfolio site',
    summary: 'Everything together: a complete, accessible, production-ready page.',
    difficulty: 3,
    explanation: `The final project. Build a **one-page portfolio** from an empty file that brings together everything
in the course. You decide the content and the design of the outline — the checks only verify the structure.

Your page must have:

- A complete document with language, charset, viewport, a descriptive title, a meta description and Open Graph tags.
- A skip link, a header with your name as the only \`<h1>\` and a labelled navigation that links to every section.
- A \`<main>\` with at least three \`<section>\`s (e.g. About, Projects, Contact), each with an \`<h2>\` and an id.
- A **Projects** section with at least two \`<article>\`s, each with a responsive image (\`srcset\`) in a
  \`<figure>\` with a caption.
- A **skills** table with a caption, a \`<thead>\` and column headers with \`scope\`.
- A **contact form** with a labelled, required email and message, sent via POST.
- A footer with your contact details in an \`<address>\` and a \`<time>\` for the year.
- No structural errors, no broken #links, no duplicated ids, and a heading outline with no skipped levels.`,
    starterCode: '',
    tasks: [
      { text: 'Complete head: doctype, lang, charset, viewport, title, description', check: all(hasDoctype(), rawMatches(/<html[^>]*\blang=/i, 'Add lang to <html>.'), hasElement('meta[charset]'), hasElement('meta[name="viewport"]'), textMatches('title', /.{10,}/, 'Write a descriptive <title>.'), hasElement('meta[name="description"]')) },
      { text: 'Open Graph title and image', check: all(hasElement('meta[property="og:title"]'), hasElement('meta[property="og:image"]')) },
      { text: 'A skip link targeting <main>', check: (doc) => {
        const id = doc.querySelector('main')?.id;
        return id && doc.querySelector(`a[href="#${id}"]`) ? true : 'Give <main> an id and link to it with a skip link.';
      } },
      { text: 'Header with the only <h1> and a labelled <nav>', check: all(count('h1', 1), isInside('h1', 'header'), hasAttr('nav', 'aria-label', /\S/)) },
      { text: 'At least 3 sections with an id and an <h2>', check: (doc) => {
        const secs = [...doc.querySelectorAll('main section')];
        return secs.length >= 3 && secs.every((s) => s.id && s.querySelector('h2')) ? true : 'Add 3+ <section>s in <main>, each with an id and an <h2>.';
      } },
      { text: 'The navigation links to every section', check: (doc) => {
        const links = new Set([...doc.querySelectorAll('nav a')].map((a) => a.getAttribute('href')));
        const missing = [...doc.querySelectorAll('main section')].find((s) => !links.has(`#${s.id}`));
        return missing ? `The nav has no link to #${missing.id}.` : true;
      } },
      { text: 'Two project articles with responsive, captioned images', check: all(count('article figure img[srcset]', { min: 2 }), count('article figure figcaption', { min: 2 }), allHaveAttr('img', 'alt'), allHaveAttr('img', 'width'), allHaveAttr('img', 'height')) },
      { text: 'Skills table: caption, thead, scoped headers', check: all(isChildOf('caption', 'table'), hasElement('table thead'), allHaveAttr('thead th', 'scope', 'col')) },
      { text: 'Contact form: POST, required email and message, all labelled', check: all(hasAttr('form', 'method', /^post$/i), hasElement('input[type="email"][required]'), hasElement('textarea[required]'), controlsLabelled(), hasElement('form button')) },
      { text: 'Footer with <address> and <time>', check: all(isInside('address', 'footer'), isInside('time', 'footer')) },
      { text: 'Quality: valid heading outline, unique ids, working #links', check: all(headingOrder(), uniqueIds(), anchorsResolve()) },
    ],
    hints: [
      'Start from the document skeleton, then write the header + nav + empty sections, then fill each section.',
      'Use https://picsum.photos/id/<n>/<w>/<h> to generate images of different widths for srcset.',
      'Compare with the requirements one at a time — each maps to a lesson you have already done.',
    ],
    solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ada Rossi | Web developer</title>
  <meta name="description" content="Portfolio of Ada Rossi, a web developer who builds fast and accessible websites.">
  <meta property="og:title" content="Ada Rossi — Web developer">
  <meta property="og:image" content="https://picsum.photos/id/0/1200/630">
</head>
<body>
  <a href="#content">Skip to main content</a>
  <header>
    <h1>Ada Rossi</h1>
    <nav aria-label="Sections">
      <ul>
        <li><a href="#about">About</a></li>
        <li><a href="#projects">Projects</a></li>
        <li><a href="#skills">Skills</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>

  <main id="content">
    <section id="about">
      <h2>About</h2>
      <p>I build websites that are <strong>fast</strong> and <em>accessible</em>.</p>
    </section>

    <section id="projects">
      <h2>Projects</h2>
      <article>
        <h3>Bakery website</h3>
        <figure>
          <img src="https://picsum.photos/id/292/800/500"
               srcset="https://picsum.photos/id/292/400/250 400w, https://picsum.photos/id/292/800/500 800w"
               sizes="(max-width: 600px) 100vw, 50vw"
               alt="Fresh bread on a wooden table" width="800" height="500" loading="lazy">
          <figcaption>A site for a local bakery.</figcaption>
        </figure>
      </article>
      <article>
        <h3>Hiking app</h3>
        <figure>
          <img src="https://picsum.photos/id/1018/800/500"
               srcset="https://picsum.photos/id/1018/400/250 400w, https://picsum.photos/id/1018/800/500 800w"
               sizes="(max-width: 600px) 100vw, 50vw"
               alt="Mountains under a cloudy sky" width="800" height="500" loading="lazy">
          <figcaption>Trail maps that work offline.</figcaption>
        </figure>
      </article>
    </section>

    <section id="skills">
      <h2>Skills</h2>
      <table>
        <caption>My skills</caption>
        <thead>
          <tr>
            <th scope="col">Skill</th>
            <th scope="col">Level</th>
          </tr>
        </thead>
        <tbody>
          <tr><th scope="row">HTML</th><td>Advanced</td></tr>
          <tr><th scope="row">CSS</th><td>Intermediate</td></tr>
        </tbody>
      </table>
    </section>

    <section id="contact">
      <h2>Contact</h2>
      <form action="/contact" method="post">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required>
        <label for="message">Message</label>
        <textarea id="message" name="message" required></textarea>
        <button type="submit">Send</button>
      </form>
    </section>
  </main>

  <footer>
    <address><a href="mailto:ada@example.com">ada@example.com</a></address>
    <p>&copy; <time datetime="2026">2026</time> Ada Rossi</p>
  </footer>
</body>
</html>
`,
  },
};
