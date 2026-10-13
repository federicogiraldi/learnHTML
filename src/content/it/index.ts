import type { CourseTexts, ModuleText } from '../localize';
import { html } from './html';
import { css } from './css';
import { js } from './js';
import { sql } from './sql';

/** Italian text for every course. Code (starter files, solutions, examples) stays as in English. */
export const itCourses: CourseTexts = { html, css, js, sql };

/** Every module's check messages, English → Italian. */
export const itMessages: Record<string, string> = Object.assign(
  {},
  ...Object.values(itCourses).flatMap((c) => Object.values(c.modules).map((m: ModuleText) => m.messages ?? {})),
);
