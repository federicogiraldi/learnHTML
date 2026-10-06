import { describe, expect, it } from 'vitest';
import { combine, renderPage } from './render';
import { validateCss } from './cssValidator';
import {
  atWidth, centeredIn, columns, computed, declares, hasMediaQuery, inOneRow, stacked, usesProperty,
} from './cssChecks';

describe('combine', () => {
  it('replaces a style.css link, or injects after the doctype', () => {
    expect(combine('<head><link rel="stylesheet" href="style.css"></head>', 'p{}')).toContain('<style data-learnweb>');
    expect(combine('<head><link rel="stylesheet" href="style.css"></head>', 'p{}')).not.toContain('<link');
    expect(combine('<!DOCTYPE html><p>x</p>', 'p{}')).toMatch(/^<!DOCTYPE html><style/);
    expect(combine('<html><head><title>t</title></head></html>', 'p{}')).toMatch(/<head><style/);
    expect(combine('<p>x</p>', undefined)).toBe('<p>x</p>');
  });
});

describe('validateCss', () => {
  it('accepts valid CSS including at-rules, nesting and custom properties', () => {
    const css = `/* hi { */
:root { --brand: #e44d26; }
@media (max-width: 600px) { .a, .b > p { color: var(--brand); } }
@keyframes spin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
.card { padding: 1rem !important; &:hover { color: red; } }
a::before { content: "{"; }`;
    expect(validateCss(css)).toEqual([]);
  });

  it('reports common mistakes with line numbers', () => {
    expect(validateCss('p {\n  color: red\n  margin: 0;\n}')[0]).toEqual({ line: 2, message: 'Missing ";" after "color: red".' });
    expect(validateCss('p { colr: red; }')[0].message).toMatch(/Unknown property "colr"/);
    expect(validateCss('p { color: 12px; }')[0].message).toMatch(/not a valid value/);
    expect(validateCss('p { color red; }')[0].message).toMatch(/missing a colon/);
    expect(validateCss('p { color: red;')[0].message).toMatch(/never closed/);
    expect(validateCss('p { color: red; } }')[0].message).toMatch(/no matching/);
    expect(validateCss('p..x { color: red; }')[0].message).toMatch(/not a valid selector/);
    expect(validateCss('color: red;')[0].message).toMatch(/inside a rule/);
  });
});

describe('css checks', () => {
  const html = `<div class="row"><span>a</span><span>b</span></div>
<div class="box"><p class="in">hi</p></div>
<ul class="grid"><li>1</li><li>2</li><li>3</li><li>4</li></ul>`;
  const css = `.row { display: flex; gap: 8px; }
.box { display: grid; place-items: center; height: 200px; }
.in { color: tomato; margin: 0; }
.grid { display: grid; grid-template-columns: repeat(2, 1fr); }
@media (max-width: 500px) { .grid { grid-template-columns: 1fr; } .row { flex-direction: column; } }`;
  const doc = renderPage(html, css);

  it('static checks', () => {
    expect(declares('.row', 'display', 'flex')(doc, html, css)).toBe(true);
    expect(declares('.row', 'display', 'grid')(doc, html, css)).not.toBe(true);
    expect(declares('.missing', 'color')(doc, html, css)).toMatch(/Write a rule/);
    expect(usesProperty('gap')(doc, html, css)).toBe(true);
    expect(hasMediaQuery(/max-width/)(doc, html, css)).toBe(true);
  });

  it('computed checks normalise colours', () => {
    expect(computed('.in', 'color', 'tomato')(doc, html, css)).toBe(true);
    expect(computed('.in', 'color', '#ff6347')(doc, html, css)).toBe(true);
    expect(computed('.in', 'color', 'red')(doc, html, css)).not.toBe(true);
  });

  it('layout checks', () => {
    expect(inOneRow('.row > span')(doc, html, css)).toBe(true);
    expect(centeredIn('.in', '.box')(doc, html, css)).toBe(true);
    expect(columns('.grid', 2)(doc, html, css)).toBe(true);
    expect(stacked('.box, .grid')(doc, html, css)).toBe(true);
  });

  it('atWidth applies media queries', () => {
    expect(atWidth(400, columns('.grid', 1))(doc, html, css)).toBe(true);
    expect(atWidth(400, stacked('.row > span'))(doc, html, css)).toBe(true);
    expect(columns('.grid', 2)(doc, html, css)).toBe(true);
  });
});
