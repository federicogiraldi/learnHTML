import type { Challenge, Lesson, Module } from './types';
import type { ProgressState } from '../store/progress';
import { basics } from './modules/01-basics';
import { text } from './modules/02-text';
import { linksMedia } from './modules/03-links-media';
import { tables } from './modules/04-tables';
import { forms } from './modules/05-forms';
import { semantic } from './modules/06-semantic';
import { accessibility } from './modules/07-accessibility';
import { advanced } from './modules/08-advanced';

export const modules: Module[] = [basics, text, linksMedia, tables, forms, semantic, accessibility, advanced];

export interface CourseItem {
  module: Module;
  item: Lesson | Challenge;
  isChallenge: boolean;
}

/** Every lesson and challenge in course order. */
export const course: CourseItem[] = modules.flatMap((module) => [
  ...module.lessons.map((item) => ({ module, item, isChallenge: false })),
  { module, item: module.challenge, isChallenge: true },
]);

export function findItem(id: string) {
  const index = course.findIndex((c) => c.item.id === id);
  if (index === -1) return null;
  return { ...course[index], prev: course[index - 1], next: course[index + 1] };
}

export const moduleItems = (m: Module) => [...m.lessons, m.challenge];

export function isModuleComplete(m: Module, state: ProgressState) {
  return moduleItems(m).every((i) => state.completed[i.id]);
}

/** A module opens once the previous one is finished, or when skipped ahead manually. */
export function isModuleUnlocked(m: Module, state: ProgressState) {
  const idx = modules.indexOf(m);
  if (idx <= 0 || state.unlocked.includes(m.id)) return true;
  return modules[idx - 1].lessons.every((l) => state.completed[l.id]);
}
