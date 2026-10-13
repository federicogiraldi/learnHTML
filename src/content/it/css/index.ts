import type { CourseText } from '../../localize';
import basics from './01-basics';
import selectors from './02-selectors';
import typography from './03-typography';
import boxModel from './04-box-model';
import flexbox from './05-flexbox';
import grid from './06-grid';
import responsive from './07-responsive';
import advanced from './08-advanced';

export const css: CourseText = {
  tagline: 'Colori, tipografia, box model, Flexbox, Grid, design responsive e animazioni.',
  modules: {
    'css-basics': basics,
    'css-selectors': selectors,
    'css-type': typography,
    'css-box': boxModel,
    'css-flex': flexbox,
    'css-grid': grid,
    'css-responsive': responsive,
    'css-advanced': advanced,
  },
};
