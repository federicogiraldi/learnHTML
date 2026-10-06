import type { Module } from '../types';
import {
  all, count, hasElement, isChildOf, isInside, noElement, rawMatches, rawNotMatches, textMatches,
} from '../../engine/checks';

export const text: Module = {
  id: 'text',
  title: 'Working with Text',
  description: 'Emphasis, quotes, code, lists and special characters.',
  lessons: [
    {
      id: 'text-emphasis',
      title: 'Emphasis and importance',
      explanation: `HTML has *inline* elements that mark up words inside a paragraph:

| Element | Meaning | Default look |
|---|---|---|
| \`<strong>\` | Strong importance, seriousness, urgency | **bold** |
| \`<em>\` | Stress emphasis that changes the meaning of a sentence | *italic* |
| \`<mark>\` | Highlighted / relevant text (e.g. search results) | yellow background |
| \`<small>\` | Side comments, fine print | smaller text |
| \`<sub>\` / \`<sup>\` | Subscript / superscript | H<sub>2</sub>O, x<sup>2</sup> |

\`\`\`html
<p><strong>Warning:</strong> do <em>not</em> touch the wire.</p>
<p>Water is H<sub>2</sub>O and E = mc<sup>2</sup>.</p>
\`\`\`

You may also meet \`<b>\` and \`<i>\`: they only change the *style* without adding meaning. Prefer \`<strong>\`
and \`<em>\` when the text really is important or stressed — screen readers can convey that meaning.`,
      starterCode: `<h1>Lab safety</h1>
<p>Warning: always wear goggles.</p>
<p>I said you must wear them.</p>
<p>Search results for "acid": hydrochloric acid is dangerous.</p>
<p>The formula of water is H2O.</p>
<p>Prices may change without notice.</p>
`,
      tasks: [
        { text: 'Make "Warning:" strongly important', check: textMatches('strong', /warning/i) },
        { text: 'Stress the word "must" with <em>', check: textMatches('em', /^must$/i) },
        { text: 'Highlight "acid" in the search result with <mark>', check: textMatches('mark', /^acid$/i) },
        { text: 'Write the 2 in H2O as subscript', check: textMatches('sub', '2') },
        { text: 'Put the price disclaimer in <small>', check: textMatches('small', /prices/i) },
      ],
      hints: ['Wrap only the word you want: <em>must</em>.', 'H<sub>2</sub>O'],
      solution: `<h1>Lab safety</h1>
<p><strong>Warning:</strong> always wear goggles.</p>
<p>I said you <em>must</em> wear them.</p>
<p>Search results for "acid": hydrochloric <mark>acid</mark> is dangerous.</p>
<p>The formula of water is H<sub>2</sub>O.</p>
<p><small>Prices may change without notice.</small></p>
`,
    },
    {
      id: 'text-lists',
      title: 'Lists',
      explanation: `HTML has three kinds of lists.

**Unordered lists** (\`<ul>\`) for items where order doesn't matter, shown with bullets:

\`\`\`html
<ul>
  <li>Milk</li>
  <li>Eggs</li>
</ul>
\`\`\`

**Ordered lists** (\`<ol>\`) for steps or rankings, shown with numbers. \`start\` and \`reversed\` change the numbering:

\`\`\`html
<ol>
  <li>Preheat the oven</li>
  <li>Mix the ingredients</li>
</ol>
\`\`\`

**Description lists** (\`<dl>\`) pair terms (\`<dt>\`) with descriptions (\`<dd>\`), like a glossary.

Lists can be **nested**: put a whole \`<ul>\` *inside* an \`<li>\`, never directly inside another \`<ul>\`.

\`\`\`html
<ul>
  <li>Fruit
    <ul>
      <li>Apples</li>
    </ul>
  </li>
</ul>
\`\`\``,
      starterCode: `<h1>Pancake recipe</h1>
<h2>Ingredients</h2>
<!-- unordered list here -->

<h2>Steps</h2>
<!-- ordered list here -->

<h2>Glossary</h2>
<!-- description list here -->
`,
      tasks: [
        { text: 'List at least 3 ingredients in a <ul>', check: count('ul > li', { min: 3 }) },
        { text: 'List at least 3 steps in an <ol>', check: count('ol > li', { min: 3 }) },
        { text: 'Nest a sub-list inside one of the ingredients (e.g. types of flour)', check: isChildOf('ul', 'li', 'Put a <ul> inside an <li>.') },
        { text: 'Define at least two terms in a <dl> with <dt> and <dd>', check: all(count('dl > dt', { min: 2 }), count('dl > dd', { min: 2 })) },
      ],
      hints: [
        'Each list item is an <li>, directly inside <ul> or <ol>.',
        'For the nested list, open the <ul> before the </li> of the parent item.',
      ],
      solution: `<h1>Pancake recipe</h1>
<h2>Ingredients</h2>
<ul>
  <li>Flour
    <ul>
      <li>Wheat</li>
      <li>Buckwheat</li>
    </ul>
  </li>
  <li>Milk</li>
  <li>Eggs</li>
</ul>

<h2>Steps</h2>
<ol>
  <li>Whisk everything together</li>
  <li>Heat the pan</li>
  <li>Cook both sides</li>
</ol>

<h2>Glossary</h2>
<dl>
  <dt>Whisk</dt>
  <dd>To beat quickly to add air.</dd>
  <dt>Batter</dt>
  <dd>The liquid mixture before cooking.</dd>
</dl>
`,
    },
    {
      id: 'text-quotes-code',
      title: 'Quotes and code',
      explanation: `**Quotations**

- \`<blockquote>\` is a long, standalone quote. Its \`cite\` attribute can hold the source URL.
- \`<q>\` is a short inline quote: the browser adds the quotation marks for you.
- \`<cite>\` is the *title* of a work (a book, a film, a song).

\`\`\`html
<blockquote cite="https://example.com/speech">
  <p>The best way to predict the future is to invent it.</p>
</blockquote>
<p>As Alan Kay said, <q>simple things should be simple</q>.</p>
<p>My favourite book is <cite>Dune</cite>.</p>
\`\`\`

**Code**

- \`<code>\` marks a fragment of computer code.
- \`<pre>\` keeps whitespace and line breaks **exactly** as written — perfect for code blocks.
- \`<kbd>\` is keyboard input, \`<abbr title="...">\` is an abbreviation with its full form.

\`\`\`html
<p>Press <kbd>Ctrl</kbd> + <kbd>S</kbd> to save your <abbr title="HyperText Markup Language">HTML</abbr>.</p>
<pre><code>function hi() {
  return "hi";
}</code></pre>
\`\`\``,
      starterCode: `<h1>Developer notes</h1>
<p>Grace Hopper once said: It's easier to ask forgiveness than it is to get permission.</p>
<p>I'm reading Clean Code this month.</p>
<p>Use the console.log() function to debug. Press Ctrl + C to copy.</p>
<p>This page uses CSS.</p>
`,
      tasks: [
        { text: 'Put the Grace Hopper quote in a <blockquote>', check: textMatches('blockquote', /forgiveness/i) },
        { text: 'Mark the book title with <cite>', check: textMatches('cite', /clean code/i) },
        { text: 'Mark console.log() as <code>', check: textMatches('code', /console\.log/) },
        { text: 'Mark the keys with <kbd>', check: count('kbd', { min: 2 }) },
        { text: 'Explain CSS with <abbr title="...">', check: textMatches('abbr[title]', /css/i) },
        { text: 'Add a multi-line code example inside <pre><code>', check: all(isChildOf('code', 'pre'), rawMatches(/<pre>[^<]*<code>[^<]*\n[^<]*<\/code>/i, 'The code inside <pre> should span more than one line.')) },
      ],
      hints: ['The <blockquote> can contain a <p> with the quote.', 'Inside <pre>, line breaks are kept exactly as you type them.'],
      solution: `<h1>Developer notes</h1>
<p>Grace Hopper once said:</p>
<blockquote>
  <p>It's easier to ask forgiveness than it is to get permission.</p>
</blockquote>
<p>I'm reading <cite>Clean Code</cite> this month.</p>
<p>Use the <code>console.log()</code> function to debug. Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to copy.</p>
<p>This page uses <abbr title="Cascading Style Sheets">CSS</abbr>.</p>
<pre><code>let x = 1;
console.log(x);</code></pre>
`,
    },
    {
      id: 'text-entities',
      title: 'Special characters',
      explanation: `Some characters have a special meaning in HTML. If you write \`<p>\` inside text, the browser thinks
it's a tag! To show them literally, use **character entities**:

| You want | Write |
|---|---|
| \`<\` | \`&lt;\` |
| \`>\` | \`&gt;\` |
| \`&\` | \`&amp;\` |
| \`"\` | \`&quot;\` |
| non-breaking space | \`&nbsp;\` |
| © | \`&copy;\` |
| — | \`&mdash;\` |

\`\`\`html
<p>The &lt;p&gt; tag makes a paragraph.</p>
<p>Tom &amp; Jerry &copy; 1940</p>
<p>10&nbsp;km</p>
\`\`\`

\`&nbsp;\` keeps two words on the same line, e.g. a number and its unit.`,
      starterCode: `<h1>Entities</h1>
<p>The <h1> tag is the main heading.</p>
<p>Fish & chips</p>
<p>Copyright 2026 LearnHTML</p>
`,
      tasks: [
        { text: 'Show "<h1>" literally in the first paragraph', check: all(textMatches('p', /The <h1> tag/), noElement('p h1', 'The text still contains a real <h1> tag. Escape it with &lt; and &gt;.')) },
        { text: 'Escape the ampersand in "Fish & chips"', check: rawMatches(/Fish &amp; chips/, 'Write the & as &amp;.') },
        { text: 'Use the © symbol via &copy;', check: rawMatches(/&copy;/, 'Write &copy; for the copyright symbol.') },
        { text: 'Join "2026" and "LearnHTML" with a non-breaking space', check: rawMatches(/2026&nbsp;LearnHTML/, 'Put &nbsp; between 2026 and LearnHTML.') },
        { text: 'No raw "<h1>" left inside a paragraph', check: rawNotMatches(/<p>[^<]*<h1>/i, 'Escape the tag inside the paragraph.') },
      ],
      hints: ['< becomes &lt; and > becomes &gt;.'],
      solution: `<h1>Entities</h1>
<p>The &lt;h1&gt; tag is the main heading.</p>
<p>Fish &amp; chips</p>
<p>&copy; 2026&nbsp;LearnHTML</p>
`,
    },
  ],
  challenge: {
    id: 'text-challenge',
    title: 'Challenge: Bug hunt',
    summary: 'A broken article hides 7 bugs. Find and fix them all.',
    difficulty: 2,
    blind: true,
    explanation: `This article "looks fine" in the browser, because browsers silently repair broken HTML.
But it contains **7 mistakes**: unclosed or mis-nested tags, a list item outside its list, an unescaped
character, a misused element… Fix them all without removing any content.

The requirements are hidden: each one reveals itself once you fix it. The last one reports structural errors
one at a time, with line numbers.`,
    starterCode: `<h1>Why HTML matters</h1>
<p>HTML is the <strong>backbone of the web</p></strong>
<p>It describes structure, not looks. Use <b>strong</b> only when text is <em>important.</p>

<h3>Key ideas</h3>
<ul>
  <li>Elements</li>
  <li>Attributes
</ul>
<li>Nesting</li>

<p>The <p> tag makes paragraphs.</p>
<p>A quote:
  <blockquote>Make it work, make it right, make it fast.</blockquote>
</p>
`,
    tasks: [
      { text: 'The <strong> closes before the paragraph ends', check: rawMatches(/<strong>[^<]*<\/strong>/i, '<strong> must be closed inside the paragraph.') },
      { text: 'The <em> is closed', check: rawMatches(/<em>[^<]*<\/em>/i, 'Close the <em>.') },
      { text: 'Importance uses <strong>, not <b>', check: noElement('b', 'Replace <b> with <strong>.') },
      { text: 'Headings don\'t skip from <h1> to <h3>', check: noElement('h3', 'The section heading after <h1> should be an <h2>.') },
      { text: 'All three list items are inside the <ul>', check: count('ul > li', 3) },
      { text: 'The literal <p> in the text is escaped', check: rawMatches(/The &lt;p&gt; tag/, 'Escape the <p> inside the text.') },
      { text: 'The <blockquote> is not inside a <p>', check: all(hasElement('blockquote'), rawNotMatches(/<p>[^<]*<blockquote/i, '<blockquote> cannot live inside <p>.')) },
      { text: 'All the original text is still there', check: all(textMatches('blockquote', /make it fast/i), textMatches('li', /nesting/i), isInside('strong', 'p')) },
    ],
    hints: [
      'Tags close in the reverse order they were opened: <p><strong>…</strong></p>.',
      'A <p> cannot contain block elements like <blockquote> — end the paragraph first.',
    ],
    solution: `<h1>Why HTML matters</h1>
<p>HTML is the <strong>backbone of the web</strong></p>
<p>It describes structure, not looks. Use <strong>strong</strong> only when text is <em>important.</em></p>

<h2>Key ideas</h2>
<ul>
  <li>Elements</li>
  <li>Attributes</li>
  <li>Nesting</li>
</ul>

<p>The &lt;p&gt; tag makes paragraphs.</p>
<p>A quote:</p>
<blockquote>Make it work, make it right, make it fast.</blockquote>
`,
  },
};
