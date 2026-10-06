import type { Check } from '../content/types';
import { validate } from './validator';

/** Reusable, composable checks used by lessons and challenges. */

const text = (el: Element | null) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

export const hasElement =
  (selector: string, message?: string): Check =>
  (doc) =>
    doc.querySelector(selector) ? true : (message ?? `Add a <${selector}> element.`);

export const noElement =
  (selector: string, message?: string): Check =>
  (doc) =>
    doc.querySelector(selector) ? (message ?? `Remove the ${selector} element.`) : true;

export const count =
  (selector: string, expected: number | { min?: number; max?: number }, message?: string): Check =>
  (doc) => {
    const n = doc.querySelectorAll(selector).length;
    const { min, max } = typeof expected === 'number' ? { min: expected, max: expected } : expected;
    if ((min === undefined || n >= min) && (max === undefined || n <= max)) return true;
    if (message) return message;
    const want =
      min === max ? `exactly ${min}` : max === undefined ? `at least ${min}` : min === undefined ? `at most ${max}` : `${min}–${max}`;
    return `Expected ${want} "${selector}", found ${n}.`;
  };

export const textMatches =
  (selector: string, pattern: RegExp | string, message?: string): Check =>
  (doc) => {
    const els = [...doc.querySelectorAll(selector)];
    if (els.length === 0) return message ?? `Add a "${selector}" element.`;
    const ok = els.some((el) =>
      typeof pattern === 'string' ? text(el).toLowerCase() === pattern.toLowerCase() : pattern.test(text(el)),
    );
    return ok ? true : (message ?? `The text of "${selector}" doesn't match what was asked.`);
  };

export const hasText =
  (selector: string, message?: string): Check =>
  (doc) => {
    const els = [...doc.querySelectorAll(selector)];
    if (els.length === 0) return message ?? `Add a "${selector}" element.`;
    return els.every((el) => text(el).length > 0) ? true : (message ?? `Every "${selector}" needs some text.`);
  };

export const hasAttr =
  (selector: string, attr: string, value?: string | RegExp, message?: string): Check =>
  (doc) => {
    const els = [...doc.querySelectorAll(selector)];
    if (els.length === 0) return message ?? `Add a "${selector}" element.`;
    const ok = els.some((el) => attrOk(el, attr, value));
    return ok ? true : (message ?? describeAttr(selector, attr, value));
  };

export const allHaveAttr =
  (selector: string, attr: string, value?: string | RegExp, message?: string): Check =>
  (doc) => {
    const els = [...doc.querySelectorAll(selector)];
    if (els.length === 0) return message ?? `Add a "${selector}" element.`;
    const bad = els.filter((el) => !attrOk(el, attr, value));
    return bad.length === 0 ? true : (message ?? `${bad.length} "${selector}" element(s): ${describeAttr(selector, attr, value)}`);
  };

function attrOk(el: Element, attr: string, value?: string | RegExp) {
  if (!el.hasAttribute(attr)) return false;
  const v = el.getAttribute(attr) ?? '';
  if (value === undefined) return true;
  return typeof value === 'string' ? v === value : value.test(v);
}

function describeAttr(selector: string, attr: string, value?: string | RegExp) {
  if (value === undefined) return `"${selector}" needs a ${attr} attribute.`;
  if (typeof value === 'string') return `"${selector}" needs ${attr}="${value}".`;
  return `Check the ${attr} attribute of "${selector}".`;
}

/** `child` must appear as a direct child of `parent`. */
export const isChildOf =
  (child: string, parent: string, message?: string): Check =>
  (doc) =>
    doc.querySelector(`${parent} > ${child}`) ? true : (message ?? `Put a <${child}> directly inside <${parent}>.`);

export const isInside =
  (descendant: string, ancestor: string, message?: string): Check =>
  (doc) =>
    doc.querySelector(`${ancestor} ${descendant}`) ? true : (message ?? `Put a <${descendant}> inside <${ancestor}>.`);

/** The first match of each selector must appear in this document order. */
export const orderIs =
  (selectors: string[], message?: string): Check =>
  (doc) => {
    const els = selectors.map((s) => doc.querySelector(s));
    const missing = selectors.find((_, k) => !els[k]);
    if (missing) return `Add a "${missing}" element.`;
    for (let k = 1; k < els.length; k++) {
      if (!(els[k - 1]!.compareDocumentPosition(els[k]!) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        return message ?? `"${selectors[k - 1]}" should come before "${selectors[k]}".`;
      }
    }
    return true;
  };

export const hasDoctype =
  (message = 'Start the document with <!DOCTYPE html>.'): Check =>
  (doc, raw) =>
    doc.doctype?.name.toLowerCase() === 'html' && /^\s*<!doctype html>/i.test(raw) ? true : message;

export const rawMatches =
  (pattern: RegExp, message: string): Check =>
  (_doc, raw) =>
    pattern.test(raw) ? true : message;

export const rawNotMatches =
  (pattern: RegExp, message: string): Check =>
  (_doc, raw) =>
    pattern.test(raw) ? message : true;

export const hasComment =
  (message = 'Add an HTML comment: <!-- like this -->.'): Check =>
  (doc) => {
    const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_COMMENT);
    const node = walker.nextNode();
    return node && (node.textContent ?? '').trim() ? true : message;
  };

export const validStructure =
  (): Check =>
  (_doc, raw) => {
    const issues = validate(raw);
    return issues.length === 0 ? true : `Line ${issues[0].line}: ${issues[0].message}`;
  };

/** Every form control has an accessible name: a <label for>, a wrapping <label>, or aria-label(ledby). */
export const controlsLabelled =
  (message?: string): Check =>
  (doc) => {
    const controls = [
      ...doc.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]):not([type=reset]), select, textarea'),
    ];
    if (controls.length === 0) return 'Add some form controls.';
    const unlabelled = controls.filter((el) => {
      if (el.closest('label')) return false;
      if (el.getAttribute('aria-label')?.trim() || el.getAttribute('aria-labelledby')) return false;
      const id = el.getAttribute('id');
      return !(id && doc.querySelector(`label[for="${id.replace(/["\\]/g, '\\$&')}"]`));
    });
    if (unlabelled.length === 0) return true;
    const first = unlabelled[0];
    const name = first.getAttribute('name') || first.getAttribute('id') || first.tagName.toLowerCase();
    return message ?? `The control "${name}" has no label. Use <label for="..."> matching its id.`;
  };

/** Headings must start at <h1> and never skip a level going down. */
export const headingOrder =
  (message?: string): Check =>
  (doc) => {
    const levels = [...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1]));
    if (levels.length === 0) return 'Add some headings.';
    if (levels[0] !== 1) return message ?? 'The first heading should be an <h1>.';
    for (let k = 1; k < levels.length; k++) {
      if (levels[k] > levels[k - 1] + 1) {
        return message ?? `Heading levels skip from <h${levels[k - 1]}> to <h${levels[k]}>.`;
      }
    }
    return true;
  };

export const uniqueIds =
  (message?: string): Check =>
  (doc) => {
    const seen = new Set<string>();
    for (const el of doc.querySelectorAll('[id]')) {
      const id = el.id;
      if (seen.has(id)) return message ?? `The id "${id}" is used more than once. Ids must be unique.`;
      seen.add(id);
    }
    return true;
  };

/** Every same-page link (#id) points to an element that exists. */
export const anchorsResolve =
  (message?: string): Check =>
  (doc) => {
    const links = [...doc.querySelectorAll('a[href^="#"]')];
    for (const a of links) {
      const id = decodeURIComponent((a.getAttribute('href') ?? '').slice(1));
      if (id && !doc.getElementById(id)) return message ?? `The link to "#${id}" points to an id that doesn't exist.`;
    }
    return true;
  };

export const all =
  (...checks: Check[]): Check =>
  (doc, raw, css) => {
    for (const c of checks) {
      const r = c(doc, raw, css);
      if (r !== true) return r;
    }
    return true;
  };
