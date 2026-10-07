import type { Course } from '../types';
import { basics } from './01-basics';
import { controlFlow } from './02-control-flow';
import { functions } from './03-functions';
import { arraysObjects } from './04-arrays-objects';
import { dom } from './05-dom';
import { asyncJs } from './06-async';
import { modern } from './07-modern';
import { advanced } from './08-advanced';

export const jsCourse: Course = {
  id: 'js',
  title: 'JavaScript',
  tagline: 'Variables, functions, arrays and objects, the DOM, events, async code and modern JavaScript.',
  modules: [basics, controlFlow, functions, arraysObjects, dom, asyncJs, modern, advanced],
};
