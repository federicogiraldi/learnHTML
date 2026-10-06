import type { Module } from '../types';
import {
  all, allHaveAttr, anchorsResolve, count, hasAttr, hasElement, isChildOf,
} from '../../engine/checks';

export const linksMedia: Module = {
  id: 'links-media',
  title: 'Links & Media',
  description: 'Hyperlinks, images, figures, audio, video and embedded content.',
  lessons: [
    {
      id: 'links-basics',
      title: 'Links',
      explanation: `The **a**nchor element \`<a>\` creates a link. The \`href\` attribute says where it goes:

\`\`\`html
<a href="https://developer.mozilla.org">MDN Web Docs</a>
\`\`\`

Kinds of \`href\`:

- **Absolute URL**: \`https://example.com/page\` — another website.
- **Relative URL**: \`about.html\` or \`../images/cat.png\` — a file relative to the current page.
- **Email / phone**: \`mailto:hi@example.com\`, \`tel:+390612345678\`.

\`target="_blank"\` opens the link in a new tab. Warn the user, and the text of a link should describe its
destination — "click here" tells a screen reader user nothing.

\`\`\`html
<p>Read the <a href="https://html.spec.whatwg.org" target="_blank">HTML specification</a> (opens in a new tab).</p>
\`\`\``,
      starterCode: `<h1>Useful links</h1>
<ul>
  <li>MDN Web Docs</li>
  <li>About this site</li>
  <li>Email me</li>
</ul>
`,
      tasks: [
        { text: 'Link "MDN Web Docs" to https://developer.mozilla.org', check: hasAttr('a', 'href', /^https:\/\/developer\.mozilla\.org\/?$/) },
        { text: 'Make that link open in a new tab', check: hasAttr('a[href*="mozilla"]', 'target', '_blank', 'Add target="_blank" to the MDN link.') },
        { text: 'Link "About this site" to the relative page about.html', check: hasAttr('a', 'href', 'about.html') },
        { text: 'Turn "Email me" into a mailto: link', check: hasAttr('a', 'href', /^mailto:.+@.+/) },
        { text: 'All links are inside the list items', check: count('li > a', 3) },
      ],
      hints: ['<a href="about.html">About this site</a>', 'mailto:you@example.com'],
      solution: `<h1>Useful links</h1>
<ul>
  <li><a href="https://developer.mozilla.org" target="_blank">MDN Web Docs</a></li>
  <li><a href="about.html">About this site</a></li>
  <li><a href="mailto:me@example.com">Email me</a></li>
</ul>
`,
    },
    {
      id: 'links-anchors',
      title: 'Jumping within a page',
      explanation: `A link can also jump to a part of the *same* page. Give the target an \`id\`, then link to it with
\`#\` followed by the id:

\`\`\`html
<nav>
  <a href="#faq">FAQ</a>
</nav>
<h2 id="faq">Frequently asked questions</h2>
<a href="#top">Back to top</a>
\`\`\`

This is how a *table of contents* works. Ids are case-sensitive and must be unique.
Try clicking the links in the preview!`,
      starterCode: `<h1 id="top">Long article</h1>
<p>Table of contents:</p>
<ul>
  <li>Introduction</li>
  <li>Details</li>
  <li>Conclusion</li>
</ul>

<h2>Introduction</h2>
<p>Lorem ipsum dolor sit amet.</p>
<h2>Details</h2>
<p>Consectetur adipiscing elit.</p>
<h2>Conclusion</h2>
<p>Sed do eiusmod tempor.</p>
`,
      tasks: [
        { text: 'Give each <h2> a unique id', check: allHaveAttr('h2', 'id', /\S/) },
        { text: 'Turn the three table-of-contents items into #links', check: count('li > a[href^="#"]', 3) },
        { text: 'Every #link points to an existing id', check: all(hasElement('a[href^="#"]'), anchorsResolve()) },
        { text: 'Add a "Back to top" link at the end', check: hasAttr('a', 'href', '#top') },
      ],
      hints: ['<h2 id="intro">Introduction</h2> and <a href="#intro">Introduction</a>'],
      solution: `<h1 id="top">Long article</h1>
<p>Table of contents:</p>
<ul>
  <li><a href="#intro">Introduction</a></li>
  <li><a href="#details">Details</a></li>
  <li><a href="#conclusion">Conclusion</a></li>
</ul>

<h2 id="intro">Introduction</h2>
<p>Lorem ipsum dolor sit amet.</p>
<h2 id="details">Details</h2>
<p>Consectetur adipiscing elit.</p>
<h2 id="conclusion">Conclusion</h2>
<p>Sed do eiusmod tempor.</p>
<p><a href="#top">Back to top</a></p>
`,
    },
    {
      id: 'media-images',
      title: 'Images',
      explanation: `\`<img>\` is a void element that embeds an image:

\`\`\`html
<img src="https://picsum.photos/id/237/400/300" alt="A black puppy looking up" width="400" height="300">
\`\`\`

- \`src\` — where the image file is.
- \`alt\` — **alternative text**, read by screen readers and shown if the image fails to load. Describe what
  matters about the image. For purely decorative images use an empty \`alt=""\`, so it gets skipped.
- \`width\` / \`height\` — the intrinsic size in pixels. Setting them lets the browser reserve space and avoids the
  page "jumping" while loading.

An image can also be a link: wrap the \`<img>\` in an \`<a>\`.`,
      starterCode: `<h1>My pets</h1>
<!-- https://picsum.photos/id/237/400/300 is a photo of a black puppy -->
<!-- https://picsum.photos/id/40/400/300 is a photo of a grey cat -->
`,
      tasks: [
        { text: 'Add the puppy photo', check: hasAttr('img', 'src', /picsum\.photos\/id\/237/) },
        { text: 'Add the cat photo', check: hasAttr('img', 'src', /picsum\.photos\/id\/40\//) },
        { text: 'Every image has a meaningful alt text', check: allHaveAttr('img', 'alt', /\w{3,}/) },
        { text: 'Every image has width and height', check: all(allHaveAttr('img', 'width', /^\d+$/), allHaveAttr('img', 'height', /^\d+$/)) },
        { text: 'Make one of the images a link to its full-size version', check: isChildOf('img', 'a') },
      ],
      hints: ['<a href="https://picsum.photos/id/40/1200/900"><img ...></a>'],
      solution: `<h1>My pets</h1>
<img src="https://picsum.photos/id/237/400/300" alt="A black puppy looking up" width="400" height="300">
<a href="https://picsum.photos/id/40/1200/900">
  <img src="https://picsum.photos/id/40/400/300" alt="A grey cat staring at the camera" width="400" height="300">
</a>
`,
    },
    {
      id: 'media-figure',
      title: 'Figures and captions',
      explanation: `\`<figure>\` groups self-contained content — an image, a chart, a code listing — with an optional caption
in \`<figcaption>\`:

\`\`\`html
<figure>
  <img src="https://picsum.photos/id/1018/400/250" alt="Mountains under a cloudy sky" width="400" height="250">
  <figcaption>The Dolomites in October.</figcaption>
</figure>
\`\`\`

The caption is visible text tied to the figure. It does not replace \`alt\`: \`alt\` *describes* the image,
the caption *comments* on it.`,
      starterCode: `<h1>Photo gallery</h1>
<img src="https://picsum.photos/id/1018/400/250" alt="Mountains under a cloudy sky" width="400" height="250">
<p>The Dolomites in October.</p>
<img src="https://picsum.photos/id/1015/400/250" alt="A river running through a valley" width="400" height="250">
<p>A river in Norway.</p>
`,
      tasks: [
        { text: 'Wrap each image in its own <figure>', check: count('figure > img', 2) },
        { text: 'Turn each description into a <figcaption>', check: count('figure > figcaption', 2) },
        { text: 'No captions left as plain paragraphs', check: count('p', 0, 'Replace the <p> captions with <figcaption>.') },
      ],
      hints: ['<figcaption> goes inside <figure>, before or after the image.'],
      solution: `<h1>Photo gallery</h1>
<figure>
  <img src="https://picsum.photos/id/1018/400/250" alt="Mountains under a cloudy sky" width="400" height="250">
  <figcaption>The Dolomites in October.</figcaption>
</figure>
<figure>
  <img src="https://picsum.photos/id/1015/400/250" alt="A river running through a valley" width="400" height="250">
  <figcaption>A river in Norway.</figcaption>
</figure>
`,
    },
    {
      id: 'media-av',
      title: 'Audio, video and iframes',
      explanation: `\`<video>\` and \`<audio>\` play media natively. Add \`controls\` so users can play, pause and change
the volume:

\`\`\`html
<video controls width="400" poster="https://picsum.photos/id/1043/400/225">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
  Your browser doesn't support video.
</video>
\`\`\`

- Several \`<source>\` elements offer alternative formats; the browser picks the first it supports.
- Text inside the element is a fallback for very old browsers.
- \`<track kind="captions">\` adds subtitles — essential for deaf users.
- Avoid \`autoplay\`: if you must, add \`muted\`.

\`<iframe>\` embeds another web page (maps, videos from other sites). Always give it a \`title\` that describes
its content.

\`\`\`html
<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=12.48,41.89,12.50,41.90" width="400" height="250" title="Map of central Rome"></iframe>
\`\`\``,
      starterCode: `<h1>Media corner</h1>
<h2>Video</h2>
<!-- flower.webm and flower.mp4 from https://interactive-examples.mdn.mozilla.net/media/cc0-videos/ -->

<h2>Audio</h2>
<!-- https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3 -->

<h2>Map</h2>
`,
      tasks: [
        { text: 'Add a <video> with controls', check: hasAttr('video', 'controls') },
        { text: 'Give the video two <source> formats with a type', check: all(count('video > source', { min: 2 }), allHaveAttr('video > source', 'type')) },
        { text: 'Add an <audio> element with controls and the roar mp3', check: all(hasAttr('audio', 'controls'), hasElement('audio[src*="t-rex"], audio source[src*="t-rex"]', 'Use the t-rex-roar.mp3 file.')) },
        { text: 'Embed a map in an <iframe> with a title', check: hasAttr('iframe', 'title', /\w{3,}/) },
      ],
      hints: ['Copy the video example with "Try it", then add the rest.'],
      solution: `<h1>Media corner</h1>
<h2>Video</h2>
<video controls width="400">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
  <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
  Your browser doesn't support video.
</video>

<h2>Audio</h2>
<audio controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3"></audio>

<h2>Map</h2>
<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=12.48,41.89,12.50,41.90" width="400" height="250" title="Map of central Rome"></iframe>
`,
    },
  ],
  challenge: {
    id: 'links-media-challenge',
    title: 'Challenge: Travel guide',
    summary: 'A one-page guide with a table of contents, figures and an embedded map.',
    difficulty: 2,
    explanation: `Build a one-page **travel guide** for a city you like, starting from an empty file.

It must be navigable from a table of contents at the top, illustrated with captioned photos
(use \`https://picsum.photos/id/<number>/400/300\` for placeholder images), and include a map.`,
    starterCode: '',
    tasks: [
      { text: 'An <h1> with id="top" and at least three <h2> sections', check: all(hasElement('h1#top', 'Give the <h1> id="top".'), count('h2', { min: 3 })) },
      { text: 'A table of contents: a list with a #link to every <h2>', check: all(count('li > a[href^="#"]', { min: 3 }), (doc) => {
        const ids = [...doc.querySelectorAll('h2')].map((h) => h.id);
        const targets = new Set([...doc.querySelectorAll('a[href^="#"]')].map((a) => a.getAttribute('href')!.slice(1)));
        return ids.every((id) => id && targets.has(id)) ? true : 'Every <h2> needs an id that the table of contents links to.';
      }) },
      { text: 'All #links resolve', check: anchorsResolve() },
      { text: 'At least two <figure>s, each with an <img> and a <figcaption>', check: all(count('figure > img', { min: 2 }), count('figure > figcaption', { min: 2 })) },
      { text: 'Every image has alt, width and height', check: all(allHaveAttr('img', 'alt', /\w{3,}/), allHaveAttr('img', 'width'), allHaveAttr('img', 'height')) },
      { text: 'An external link that opens in a new tab', check: hasElement('a[href^="http"][target="_blank"]', 'Add an external link with target="_blank".') },
      { text: 'An embedded map in a titled <iframe>', check: hasAttr('iframe', 'title', /\w{3,}/) },
      { text: 'A "Back to top" link', check: hasAttr('a', 'href', '#top') },
    ],
    hints: [
      'Give each <h2> an id first, then write the table of contents.',
      'OpenStreetMap embeds: https://www.openstreetmap.org/export/embed.html?bbox=<lon1>,<lat1>,<lon2>,<lat2>',
    ],
    solution: `<h1 id="top">Rome in a weekend</h1>
<ul>
  <li><a href="#see">What to see</a></li>
  <li><a href="#eat">Where to eat</a></li>
  <li><a href="#map">Map</a></li>
</ul>

<h2 id="see">What to see</h2>
<figure>
  <img src="https://picsum.photos/id/1040/400/300" alt="An old stone building at sunset" width="400" height="300">
  <figcaption>The old town at golden hour.</figcaption>
</figure>

<h2 id="eat">Where to eat</h2>
<figure>
  <img src="https://picsum.photos/id/292/400/300" alt="Fresh vegetables on a table" width="400" height="300">
  <figcaption>Fresh produce at Campo de' Fiori.</figcaption>
</figure>
<p>More tips on <a href="https://www.turismoroma.it" target="_blank">the official tourism site</a>.</p>

<h2 id="map">Map</h2>
<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=12.45,41.88,12.51,41.91" width="400" height="300" title="Map of central Rome"></iframe>

<p><a href="#top">Back to top</a></p>
`,
  },
};
