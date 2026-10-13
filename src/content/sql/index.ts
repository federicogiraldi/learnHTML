import type { Course } from '../types';
import { select } from './01-select';
import { aggregate } from './02-aggregate';
import { joins } from './03-joins';
import { modify } from './04-modify';

export const sqlCourse: Course = {
  id: 'sql',
  title: 'SQL',
  tagline: 'Ask a real database questions: filter and sort, add up, join tables and change data.',
  modules: [select, aggregate, joins, modify],
};
