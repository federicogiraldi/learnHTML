import type { Challenge, Course, CourseId, Lesson, Module } from './types';
import type { ProgressState } from '../store/progress';
import { htmlCourse } from './html';
import { cssCourse } from './css';
import { jsCourse } from './js';
import { localizeCourse } from './localize';
import { itCourses } from './it';
import type { Lang } from '../i18n';

/** The courses in English, the language they are written in. */
export const courses: Course[] = [htmlCourse, cssCourse, jsCourse];

const localized: Record<Lang, Course[]> = {
  en: courses,
  it: courses.map((c) => localizeCourse(c, itCourses[c.id])),
};

/** The courses in `lang`. Lessons keep the same ids, code and checks in every language. */
export const coursesIn = (lang: Lang) => localized[lang];

export const getCourse = (id: string | undefined, lang: Lang = 'en') => coursesIn(lang).find((c) => c.id === id);

export interface CourseItem {
  course: Course;
  module: Module;
  item: Lesson | Challenge;
  isChallenge: boolean;
}

/** Every lesson and challenge of a course, in order. */
export function courseItems(course: Course): CourseItem[] {
  return course.modules.flatMap((module) => [
    ...module.lessons.map((item) => ({ course, module, item, isChallenge: false })),
    { course, module, item: module.challenge, isChallenge: true },
  ]);
}

/** Every lesson and challenge of every course. */
export const allItems: CourseItem[] = courses.flatMap(courseItems);

export function findItem(id: string, lang: Lang = 'en') {
  const found = coursesIn(lang).flatMap(courseItems).find((c) => c.item.id === id);
  if (!found) return null;
  const items = courseItems(found.course);
  const index = items.findIndex((c) => c.item.id === id);
  return { ...found, prev: items[index - 1], next: items[index + 1] };
}

export const moduleItems = (m: Module) => [...m.lessons, m.challenge];

export function isModuleComplete(m: Module, state: ProgressState) {
  return moduleItems(m).every((i) => state.completed[i.id]);
}

/** A module opens once the previous one's lessons are done, or when skipped ahead manually. */
export function isModuleUnlocked(course: Course, m: Module, state: ProgressState) {
  const idx = course.modules.indexOf(m);
  if (idx <= 0 || state.unlocked.includes(m.id)) return true;
  return course.modules[idx - 1].lessons.every((l) => state.completed[l.id]);
}

export type { CourseId };
