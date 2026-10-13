import type { CourseText } from '../../localize';
import select from './01-select';
import aggregate from './02-aggregate';
import joins from './03-joins';
import modify from './04-modify';

export const sql: CourseText = {
  tagline: 'Fai domande a un vero database: filtra e ordina, somma, unisci tabelle e modifica i dati.',
  modules: {
    'sql-select': select,
    'sql-aggregate': aggregate,
    'sql-joins': joins,
    'sql-modify': modify,
  },
};
