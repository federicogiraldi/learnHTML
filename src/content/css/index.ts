import type { Course } from '../types';
import { basics } from './01-basics';
import { selectors } from './02-selectors';
import { typography } from './03-typography';

export const cssCourse: Course = {
  id: 'css',
  title: 'CSS',
  tagline: 'Colours, typography, the box model, Flexbox, Grid, responsive design and animation.',
  modules: [basics, selectors, typography],
};
