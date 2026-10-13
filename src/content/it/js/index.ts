import type { CourseText } from '../../localize';
import basics from './01-basics';
import controlFlow from './02-control-flow';
import functions from './03-functions';
import arraysObjects from './04-arrays-objects';
import dom from './05-dom';
import asyncJs from './06-async';
import modern from './07-modern';
import advanced from './08-advanced';

export const js: CourseText = {
  tagline: 'Variabili, funzioni, array e oggetti, il DOM, gli eventi, il codice asincrono e il JavaScript moderno.',
  modules: {
    'js-basics': basics,
    'js-control': controlFlow,
    'js-functions': functions,
    'js-data': arraysObjects,
    'js-dom': dom,
    'js-async': asyncJs,
    'js-modern': modern,
    'js-advanced': advanced,
  },
};
