import type { Challenge, Course, CourseId, Lesson, Module } from './types';

/** The translatable text of a lesson or challenge. `tasks` and `hints` follow the English order. */
export interface ItemText {
  title: string;
  explanation: string;
  tasks: string[];
  hints: string[];
  /** Challenges only. */
  summary?: string;
}

export interface ModuleText {
  title: string;
  description: string;
  /** Keyed by lesson (and challenge) id. */
  items: Record<string, ItemText>;
  /** The module's own check messages, English → translation (exact matches). */
  messages?: Record<string, string>;
}

export interface CourseText {
  tagline: string;
  /** Keyed by module id. */
  modules: Record<string, ModuleText>;
}

export type CourseTexts = Record<CourseId, CourseText>;

function localizeItem<T extends Lesson | Challenge>(item: T, text: ItemText | undefined): T {
  if (!text) return item;
  return {
    ...item,
    title: text.title,
    explanation: text.explanation,
    // Only the wording changes: every task keeps its check.
    tasks: item.tasks.map((t, k) => ({ ...t, text: text.tasks[k] ?? t.text })),
    hints: item.hints.map((h, k) => text.hints[k] ?? h),
    ...('summary' in item && text.summary ? { summary: text.summary } : {}),
  };
}

function localizeModule(m: Module, text: ModuleText | undefined): Module {
  if (!text) return m;
  return {
    ...m,
    title: text.title,
    description: text.description,
    lessons: m.lessons.map((l) => localizeItem(l, text.items[l.id])),
    challenge: localizeItem(m.challenge, text.items[m.challenge.id]),
  };
}

/** The course with its text replaced by a translation; anything missing stays in English. */
export function localizeCourse(course: Course, text: CourseText | undefined): Course {
  if (!text) return course;
  return {
    ...course,
    tagline: text.tagline,
    modules: course.modules.map((m) => localizeModule(m, text.modules[m.id])),
  };
}
