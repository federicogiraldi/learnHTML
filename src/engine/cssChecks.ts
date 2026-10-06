import type { Check } from '../content/types';
import { atViewportWidth } from './render';

/**
 * Checks for CSS lessons. They run against the live rendered document, so computed styles and layout
 * are real. "Static" checks look at what the learner wrote; "computed" ones at what the browser applied.
 */

const norm = (s: string) => s.replace(/\s+/g, ' ').replace(/\s*([>+~,])\s*/g, '$1').trim().toLowerCase();

/** Every style rule in the page's stylesheets, flattened through @media, @layer, @supports and nesting. */
export function styleRules(doc: Document): CSSStyleRule[] {
  const out: CSSStyleRule[] = [];
  const walk = (rules: CSSRuleList) => {
    for (const r of rules) {
      if (r instanceof (doc.defaultView as typeof window).CSSStyleRule) out.push(r as CSSStyleRule);
      if ('cssRules' in r && (r as CSSGroupingRule).cssRules) walk((r as CSSGroupingRule).cssRules);
    }
  };
  for (const sheet of doc.styleSheets) {
    try {
      walk(sheet.cssRules);
    } catch {
      // cross-origin sheet: not readable
    }
  }
  return out;
}

const matchValue = (v: string, value?: string | RegExp) =>
  value === undefined ? v !== '' : typeof value === 'string' ? norm(v) === norm(value) : value.test(v);

/** A rule whose selector list includes `selector` declares `prop` (optionally with a matching value). */
export const declares =
  (selector: string | RegExp, prop: string, value?: string | RegExp, message?: string): Check =>
  (doc) => {
    const rules = styleRules(doc).filter((r) =>
      typeof selector === 'string'
        ? r.selectorText.split(',').map(norm).includes(norm(selector))
        : selector.test(r.selectorText),
    );
    if (rules.length === 0) return message ?? `Write a rule for ${typeof selector === 'string' ? `"${selector}"` : 'the right selector'}.`;
    const ok = rules.some((r) => matchValue(r.style.getPropertyValue(prop), value));
    if (ok) return true;
    return message ?? `Set ${prop}${typeof value === 'string' ? `: ${value}` : ''} in the "${rules[0].selectorText}" rule.`;
  };

/** Some rule anywhere uses `prop`. */
export const usesProperty =
  (prop: string, value?: string | RegExp, message?: string): Check =>
  (doc) =>
    styleRules(doc).some((r) => matchValue(r.style.getPropertyValue(prop), value)) ? true : (message ?? `Use the ${prop} property.`);

/** Some rule's selector matches `pattern`. */
export const usesSelector =
  (pattern: RegExp, message: string): Check =>
  (doc) =>
    styleRules(doc).some((r) => pattern.test(r.selectorText)) ? true : message;

export const cssMatches =
  (pattern: RegExp, message: string): Check =>
  (_doc, _raw, css = '') =>
    pattern.test(css) ? true : message;

export const cssNotMatches =
  (pattern: RegExp, message: string): Check =>
  (_doc, _raw, css = '') =>
    pattern.test(css) ? message : true;

export const noImportant = (message = "Don't use !important: fix the specificity instead."): Check =>
  cssNotMatches(/!\s*important/i, message);

/** Turns any CSS colour into the browser's canonical computed form, e.g. "rgb(255, 0, 0)". */
export function canonicalColor(doc: Document, color: string): string {
  const probe = doc.createElement('span');
  probe.style.color = color;
  doc.body.appendChild(probe);
  const out = doc.defaultView!.getComputedStyle(probe).color;
  probe.remove();
  return out;
}

const COLOR_PROPS = /^(color|background-color|border-(top|right|bottom|left)-color|outline-color|text-decoration-color|caret-color|accent-color|fill|stroke)$/;

/**
 * The computed value of `prop` on the first element matching `selector`. String expectations for colour
 * properties are compared after converting both sides to canonical colours.
 */
export const computed =
  (selector: string, prop: string, expected: string | RegExp | ((v: string) => boolean), message?: string, pseudo?: string): Check =>
  (doc) => {
    const el = doc.querySelector(selector);
    if (!el) return `There is no "${selector}" element in the HTML.`;
    const v = doc.defaultView!.getComputedStyle(el, pseudo).getPropertyValue(prop).trim();
    let ok: boolean;
    if (typeof expected === 'function') ok = expected(v);
    else if (typeof expected === 'string') ok = COLOR_PROPS.test(prop) ? v === canonicalColor(doc, expected) : v === expected;
    else ok = expected.test(v);
    return ok ? true : (message ?? `"${selector}" should have ${prop}${typeof expected === 'string' ? `: ${expected}` : ' set as asked'} (now: ${v || 'none'}).`);
  };

/** Every element matching `selector` passes `computed`. */
export const allComputed =
  (selector: string, prop: string, expected: string | RegExp | ((v: string) => boolean), message?: string): Check =>
  (doc) => {
    const els = [...doc.querySelectorAll(selector)];
    if (els.length === 0) return `There is no "${selector}" element in the HTML.`;
    const win = doc.defaultView!;
    const want = typeof expected === 'string' && COLOR_PROPS.test(prop) ? canonicalColor(doc, expected) : expected;
    const bad = els.find((el) => {
      const v = win.getComputedStyle(el).getPropertyValue(prop).trim();
      return typeof want === 'function' ? !want(v) : typeof want === 'string' ? v !== want : !want.test(v);
    });
    return bad ? (message ?? `Every "${selector}" should have ${prop} set as asked.`) : true;
  };

export const px = (v: string) => parseFloat(v) || 0;

const rect = (doc: Document, selector: string) => doc.querySelector(selector)?.getBoundingClientRect();

/** The elements matching `selector` sit side by side on one row: each starts after the previous one ends, overlapping vertically. */
export const inOneRow =
  (selector: string, message?: string): Check =>
  (doc) => {
    const rs = [...doc.querySelectorAll(selector)].map((e) => e.getBoundingClientRect());
    if (rs.length < 2) return `Need at least two "${selector}" elements.`;
    const ok = rs.every((r, k) => k === 0 || (r.left >= rs[k - 1].right - 1 && r.top < rs[k - 1].bottom && r.bottom > rs[k - 1].top));
    return ok ? true : (message ?? `The "${selector}" elements should sit side by side in one row.`);
  };

/** The elements matching `selector` are stacked vertically. */
export const stacked =
  (selector: string, message?: string): Check =>
  (doc) => {
    const rs = [...doc.querySelectorAll(selector)].map((e) => e.getBoundingClientRect());
    if (rs.length < 2) return `Need at least two "${selector}" elements.`;
    const ok = rs.every((r, k) => k === 0 || r.top >= rs[k - 1].bottom - 1);
    return ok ? true : (message ?? `The "${selector}" elements should be stacked one under the other.`);
  };

/** `child` is centred inside `parent` horizontally and/or vertically (2px tolerance). */
export const centeredIn =
  (child: string, parent: string, axis: 'x' | 'y' | 'both' = 'both', message?: string): Check =>
  (doc) => {
    const c = rect(doc, child);
    const p = rect(doc, parent);
    if (!c || !p) return `Both "${child}" and "${parent}" must exist.`;
    const dx = Math.abs(c.left - p.left - (p.right - c.right));
    const dy = Math.abs(c.top - p.top - (p.bottom - c.bottom));
    const ok = (axis === 'y' || dx < 2) && (axis === 'x' || dy < 2) && c.width < p.width + 1;
    return ok ? true : (message ?? `Centre "${child}" inside "${parent}"${axis === 'both' ? '' : ` (${axis === 'x' ? 'horizontally' : 'vertically'})`}.`);
  };

/** Number of distinct columns the children of `selector` are laid out in. */
export function columnCount(doc: Document, selector: string): number {
  const parent = doc.querySelector(selector);
  if (!parent) return 0;
  const lefts = new Set([...parent.children].map((c) => Math.round(c.getBoundingClientRect().left)));
  return lefts.size;
}

export const columns =
  (selector: string, n: number, message?: string): Check =>
  (doc) => {
    const got = columnCount(doc, selector);
    return got === n ? true : (message ?? `The children of "${selector}" should form ${n} column${n === 1 ? '' : 's'} (now ${got}).`);
  };

/** Size of the element's box in px. */
export const boxSize =
  (selector: string, dim: 'width' | 'height', test: (v: number) => boolean, message: string): Check =>
  (doc) => {
    const r = rect(doc, selector);
    if (!r) return `There is no "${selector}" element in the HTML.`;
    return test(r[dim]) ? true : message;
  };

/** Runs `check` with the preview viewport resized to `width` pixels (for media queries). */
export const atWidth =
  (width: number, check: Check): Check =>
  (doc, raw, css) =>
    atViewportWidth(doc, width, () => check(doc, raw, css));

export const hasMediaQuery =
  (pattern: RegExp = /./, message = 'Add a @media query.'): Check =>
  (doc) => {
    const win = doc.defaultView as typeof window;
    for (const sheet of doc.styleSheets) {
      const stack = [...sheet.cssRules];
      while (stack.length) {
        const r = stack.pop()!;
        if (r instanceof win.CSSMediaRule && pattern.test(r.conditionText)) return true;
        if ('cssRules' in r) stack.push(...(r as CSSGroupingRule).cssRules);
      }
    }
    return message;
  };
