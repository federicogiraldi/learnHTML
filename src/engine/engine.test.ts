import { describe, expect, it } from 'vitest';
import { validate } from './validator';
import { parse, runTests } from './runTests';
import {
  anchorsResolve, controlsLabelled, count, hasAttr, hasDoctype, hasElement, headingOrder, isChildOf, orderIs,
  textMatches, uniqueIds,
} from './checks';

describe('validate', () => {
  it('accepts a well-formed document', () => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Hi</title><style>p > a { color: red }</style></head>
<body>
  <!-- a <comment> -->
  <p>Hello <br> <img src="a.png" alt="x" /> world</p>
  <ul><li>One</li></ul>
  <script>if (1 < 2) console.log("</div>")</script>
</body>
</html>`;
    expect(validate(html)).toEqual([]);
  });

  it('reports unclosed tags with line numbers', () => {
    expect(validate('<div>\n<p>Hi\n</div>')).toEqual([
      { line: 2, message: '<p> (line 2) must be closed before </div> on line 3.' },
    ]);
    expect(validate('<section>')[0].message).toMatch(/never closed/);
  });

  it('reports stray closing tags and void closers', () => {
    expect(validate('<p>Hi</p></span>')[0].message).toMatch(/no matching opening/);
    expect(validate('<br></br>')[0].message).toMatch(/void element/);
  });

  it('reports invalid nesting and duplicate attributes', () => {
    expect(validate('<p><div>x</div></p>')[0].message).toMatch(/cannot be placed inside a <p>/);
    expect(validate('<li>x</li>')[0].message).toMatch(/directly inside <ul> or <ol>/);
    expect(validate('<a href="#"><a href="#">x</a></a>')[0].message).toMatch(/nested/);
    expect(validate('<img src="a" src="b" alt="">')[0].message).toMatch(/more than once/);
  });
});

describe('checks', () => {
  const doc = parse(`<!DOCTYPE html><h1 id="top">Hello World</h1><h3>Skip</h3>
    <ul><li>a</li><li>b</li></ul><a href="#top">up</a><a href="#nope">x</a>
    <form><label for="e">Email</label><input id="e"><input name="age"></form>`);
  const raw = '<!DOCTYPE html>';

  it('basic element checks', () => {
    expect(hasElement('h1')(doc, raw)).toBe(true);
    expect(hasElement('h2')(doc, raw)).not.toBe(true);
    expect(count('li', 2)(doc, raw)).toBe(true);
    expect(count('li', { min: 3 })(doc, raw)).toMatch(/at least 3/);
    expect(textMatches('h1', /hello/i)(doc, raw)).toBe(true);
    expect(textMatches('h1', 'hello world')(doc, raw)).toBe(true);
    expect(hasAttr('a', 'href', '#top')(doc, raw)).toBe(true);
    expect(isChildOf('li', 'ul')(doc, raw)).toBe(true);
    expect(orderIs(['h1', 'ul'])(doc, raw)).toBe(true);
    expect(orderIs(['ul', 'h1'])(doc, raw)).not.toBe(true);
    expect(hasDoctype()(doc, raw)).toBe(true);
  });

  it('semantic checks', () => {
    expect(headingOrder()(doc, raw)).toMatch(/skip/);
    expect(anchorsResolve()(doc, raw)).toMatch(/#nope/);
    expect(controlsLabelled()(doc, raw)).toMatch(/"age"/);
    expect(uniqueIds()(parse('<p id="a"></p><p id="a"></p>'), '')).toMatch(/more than once/);
  });

  it('runTests appends a well-formedness result', () => {
    const run = runTests({ tasks: [{ text: 'h1', check: hasElement('h1') }] }, '<h1>Hi</h1><p>');
    expect(run.results).toHaveLength(2);
    expect(run.results[0].passed).toBe(true);
    expect(run.results[1].passed).toBe(false);
    expect(run.allPassed).toBe(false);
  });
});
