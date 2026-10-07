import type { CourseText } from '../../localize';
import basics from './01-basics';
import text from './02-text';
import linksMedia from './03-links-media';
import tables from './04-tables';
import forms from './05-forms';
import semantic from './06-semantic';
import accessibility from './07-accessibility';
import advanced from './08-advanced';

export const html: CourseText = {
  tagline: 'Dal tuo primo tag a pagine accessibili, semantiche e pronte per la produzione.',
  modules: { basics, text, 'links-media': linksMedia, tables, forms, semantic, accessibility, advanced },
};
