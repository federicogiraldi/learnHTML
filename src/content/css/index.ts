import type { Course } from '../types';
import { basics } from './01-basics';
import { selectors } from './02-selectors';
import { typography } from './03-typography';
import { boxModel } from './04-box-model';
import { flexbox } from './05-flexbox';
import { grid } from './06-grid';

export const cssCourse: Course = {
  id: 'css',
  title: 'CSS',
  tagline: 'Colours, typography, the box model, Flexbox, Grid, responsive design and animation.',
  modules: [basics, selectors, typography, boxModel, flexbox, grid],
};
