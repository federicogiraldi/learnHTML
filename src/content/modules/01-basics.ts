import type { Module } from '../types';
import {
  all, count, hasAttr, hasComment, hasDoctype, hasElement, isChildOf, orderIs, rawMatches, textMatches,
} from '../../engine/checks';

export const basics: Module = {
  id: 'basics',
  title: 'HTML Basics',
  description: 'Tags, elements, attributes and the skeleton every web page shares.',
  lessons: [
    {
      id: 'basics-first-tag',
      title: 'Your first tag',
      explanation: `HTML (HyperText Markup Language) describes the **structure** of a web page. You wrap content in
**tags** to tell the browser what each piece of content *is*.

Most tags come in pairs: an opening tag \`<p>\` and a closing tag \`</p>\` with a slash. The opening tag, the
content and the closing tag together form an **element**.

\`\`\`html
<p>This is a paragraph.</p>
\`\`\`

\`<h1>\` is the main heading of a page — think of it as the title on the front page of a newspaper.

\`\`\`html
<h1>Breaking news</h1>
<p>HTML is easy to learn.</p>
\`\`\`

Type in the editor on the right: the preview updates as you write, and the checklist below ticks itself off.`,
      starterCode: `<!-- Write your code below this line -->
`,
      tasks: [
        { text: 'Add an <h1> heading with the text "Hello, World!"', check: textMatches('h1', /^hello,? world!?$/i) },
        { text: 'Add a <p> paragraph below it that introduces yourself', check: hasElement('p', 'Add a <p> paragraph.') },
        { text: 'The heading comes before the paragraph', check: orderIs(['h1', 'p']) },
      ],
      hints: [
        'Open with <h1>, write the text, close with </h1>.',
        'A paragraph looks like <p>My name is Ada.</p>',
      ],
      solution: `<h1>Hello, World!</h1>
<p>My name is Ada and I am learning HTML.</p>
`,
    },
    {
      id: 'basics-document',
      title: 'The document skeleton',
      explanation: `A real HTML page has a fixed skeleton:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My page</title>
  </head>
  <body>
    <h1>Visible content goes here</h1>
  </body>
</html>
\`\`\`

- \`<!DOCTYPE html>\` tells the browser to use modern HTML. It is not a tag, just a declaration.
- \`<html>\` wraps everything. Its \`lang\` attribute says which language the page is written in.
- \`<head>\` holds information *about* the page: the character encoding and the \`<title>\` shown in the browser tab.
- \`<body>\` holds everything that is *shown* on the page.

Notice the indentation: elements inside other elements are **nested**, and indenting them makes the structure easy
to read.`,
      starterCode: `<h1>My first real page</h1>
<p>Wrap me in a proper document.</p>
`,
      tasks: [
        { text: 'Start with <!DOCTYPE html>', check: hasDoctype() },
        { text: 'Wrap everything in <html lang="en">', check: all(rawMatches(/<html[^>]*\blang\s*=\s*["']?en/i, 'Add <html lang="en"> around the document.')) },
        { text: 'Add a <head> with <meta charset="UTF-8">', check: hasAttr('head meta', 'charset', /^utf-8$/i, 'Put <meta charset="UTF-8"> inside <head>.') },
        { text: 'Give the page a <title> inside <head>', check: textMatches('head title', /\S/, 'Add a <title> with some text inside <head>.') },
        { text: 'Put the heading and paragraph inside <body>', check: all(rawMatches(/<body[^>]*>[\s\S]*<h1/i, 'Put the <h1> inside <body>.'), isChildOf('p', 'body')) },
      ],
      hints: [
        'Use the "Try it" button on the example to see the full structure.',
        '<head> comes first, then <body>. Both go inside <html>.',
      ],
      solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>My first real page</title>
  </head>
  <body>
    <h1>My first real page</h1>
    <p>Wrap me in a proper document.</p>
  </body>
</html>
`,
    },
    {
      id: 'basics-headings',
      title: 'Headings and paragraphs',
      explanation: `HTML has six heading levels, from \`<h1>\` (most important) to \`<h6>\` (least important).
They create an **outline** of the page, like chapters and sections in a book:

\`\`\`html
<h1>Cooking 101</h1>
<h2>Breakfast</h2>
<p>Start the day right.</p>
<h3>Pancakes</h3>
<p>Fluffy and easy.</p>
<h2>Dinner</h2>
<p>Something warm.</p>
\`\`\`

Rules of thumb:

- Use **one** \`<h1>\` per page.
- Don't skip levels: an \`<h3>\` should live under an \`<h2>\`.
- Pick a heading for its *meaning*, not its size. Size is the job of CSS.

Browsers ignore extra spaces and line breaks in your text: writing several spaces shows just one.`,
      starterCode: `<h1>My Travel Blog</h1>
`,
      tasks: [
        { text: 'Keep exactly one <h1>', check: count('h1', 1) },
        { text: 'Add two <h2> sections (e.g. two cities)', check: count('h2', { min: 2 }) },
        { text: 'Add at least one <h3> under one of the <h2>s', check: orderIs(['h2', 'h3']) },
        { text: 'Write at least three paragraphs', check: count('p', { min: 3 }) },
      ],
      hints: ['Each section can be an <h2> followed by a <p>. A sub-section is an <h3> after its <h2>.'],
      solution: `<h1>My Travel Blog</h1>
<h2>Rome</h2>
<p>Ancient ruins and great food.</p>
<h3>Where to eat</h3>
<p>Try the trattorias in Trastevere.</p>
<h2>Lisbon</h2>
<p>Hills, trams and pastel de nata.</p>
`,
    },
    {
      id: 'basics-breaks-comments',
      title: 'Line breaks, rules and comments',
      explanation: `Some elements have **no content** and therefore no closing tag. They are called *void elements*.

- \`<br>\` forces a line break inside text — useful for addresses or poems.
- \`<hr>\` marks a thematic break between sections (drawn as a horizontal line).

\`\`\`html
<p>Roses are red,<br>violets are blue.</p>
<hr>
<p>A new topic starts here.</p>
\`\`\`

You may see them written as \`<br />\` — both forms are fine, but \`</br>\` is wrong.

**Comments** are notes for humans. The browser ignores them:

\`\`\`html
<!-- TODO: add a photo here -->
\`\`\``,
      starterCode: `<h1>A short poem</h1>
<p>The sun goes down the evening falls the stars come out</p>
<p>About the author</p>
`,
      tasks: [
        { text: 'Split the poem into lines with at least two <br>', check: count('p br', { min: 2 }) },
        { text: 'Separate the poem from the author section with an <hr>', check: orderIs(['p br', 'hr']) },
        { text: 'Leave a comment somewhere in the code', check: hasComment() },
      ],
      hints: ['Put <br> between the lines inside the same <p>.', 'A comment looks like <!-- note -->.'],
      solution: `<h1>A short poem</h1>
<p>The sun goes down<br>the evening falls<br>the stars come out</p>
<hr>
<!-- Author bio below -->
<p>About the author</p>
`,
    },
    {
      id: 'basics-attributes',
      title: 'Attributes',
      explanation: `**Attributes** add extra information to an element. They always go in the *opening* tag, as
\`name="value"\` pairs:

\`\`\`html
<p id="intro" title="Hover me!">Hover this paragraph.</p>
\`\`\`

A few attributes work on (almost) every element — they are called *global attributes*:

| Attribute | What it does |
|---|---|
| \`id\` | A unique name for one element on the page |
| \`class\` | One or more group names, separated by spaces, used by CSS and JS |
| \`title\` | Extra info, shown as a tooltip |
| \`lang\` | The language of that element's content |
| \`hidden\` | Hides the element (a *boolean* attribute: no value needed) |

Always quote attribute values. An \`id\` must be unique on the page; a \`class\` can be shared by many elements.`,
      starterCode: `<h1>Attributes</h1>
<p>This paragraph is the introduction.</p>
<p>This is a note.</p>
<p>This is another note.</p>
<p>Ciao a tutti!</p>
<p>This is a secret.</p>
`,
      tasks: [
        { text: 'Give the first paragraph id="intro"', check: hasAttr('p', 'id', 'intro') },
        { text: 'Give both note paragraphs class="note"', check: count('p.note', 2, 'Two paragraphs need class="note".') },
        { text: 'Mark "Ciao a tutti!" as Italian with lang="it"', check: textMatches('p[lang="it"]', /ciao/i, 'Add lang="it" to the Italian paragraph.') },
        { text: 'Hide the secret with the hidden attribute', check: textMatches('p[hidden]', /secret/i, 'Add hidden to the secret paragraph.') },
        { text: 'Give any element a title tooltip', check: hasElement('[title]', 'Add a title="..." attribute to an element.') },
      ],
      hints: ['Attributes go inside the opening tag: <p id="intro">.', 'Boolean attributes need no value: <p hidden>.'],
      solution: `<h1 title="Extra information">Attributes</h1>
<p id="intro">This paragraph is the introduction.</p>
<p class="note">This is a note.</p>
<p class="note">This is another note.</p>
<p lang="it">Ciao a tutti!</p>
<p hidden>This is a secret.</p>
`,
    },
  ],
  challenge: {
    id: 'basics-challenge',
    title: 'Challenge: Personal profile page',
    summary: 'Build a complete page from a blank file — no starter code.',
    difficulty: 1,
    explanation: `Build a small **profile page** from scratch, with no help from starter code.
The requirements are listed below, but they are only checked when you press **Check my solution**.

Earn ⭐⭐⭐ by passing without hints. Each hint costs a star; peeking at the solution leaves you with one.`,
    starterCode: '',
    tasks: [
      { text: 'A complete document: DOCTYPE, <html lang>, <head> and <body>', check: all(hasDoctype(), rawMatches(/<html[^>]*\blang=/i, 'Add a lang attribute to <html>.'), hasElement('head'), rawMatches(/<body/i, 'Add a <body>.')) },
      { text: 'A UTF-8 charset and a <title> containing your name', check: all(hasAttr('meta', 'charset', /^utf-8$/i), textMatches('title', /\S/)) },
      { text: 'One <h1> with your name', check: count('h1', 1) },
      { text: 'At least two <h2> sections, each followed by a paragraph', check: all(count('h2', { min: 2 }), count('h2 + p', { min: 2 }, 'Put a <p> directly after each <h2>.')) },
      { text: 'A short address or poem using <br>', check: hasElement('p br', 'Use <br> inside a paragraph.') },
      { text: 'An <hr> separating two parts of the page', check: hasElement('hr') },
      { text: 'One element with id="contact"', check: count('#contact', 1) },
    ],
    hints: [
      'Start from the document skeleton you learned in "The document skeleton".',
      'An h2 followed by a p looks like: <h2>Hobbies</h2> <p>I like chess.</p>',
    ],
    solution: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Ada Lovelace</title>
  </head>
  <body>
    <h1>Ada Lovelace</h1>
    <h2>About me</h2>
    <p>I write programs for machines that do not exist yet.</p>
    <h2>Hobbies</h2>
    <p>Mathematics, poetry and horses.</p>
    <hr>
    <h2 id="contact">Contact</h2>
    <p>12 St James's Square<br>London</p>
  </body>
</html>
`,
  },
};
