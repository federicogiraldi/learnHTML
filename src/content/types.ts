/** A check returns `true` when it passes, or a message explaining what is wrong. */
export type CheckResult = true | string;
/**
 * `doc` is the parsed page (HTML lessons) or the live, styled and laid-out page (CSS lessons).
 * `raw` is the HTML source and `css` the stylesheet source ('' in HTML lessons).
 */
export type Check = (doc: Document, raw: string, css?: string) => CheckResult;

/**
 * A check for JavaScript lessons: an expression evaluated inside the sandbox after the learner's script runs,
 * with the helpers as `h`. Build them with `src/engine/jsChecks.ts`.
 */
export interface JsCheck {
  js: string;
}

export interface Task {
  text: string;
  check: Check | JsCheck;
}

export type { FetchMock } from '../engine/js/runtime';
import type { FetchMock } from '../engine/js/runtime';

export interface Lesson {
  id: string;
  title: string;
  /** Markdown. ```html and ```css blocks get a "Try it" button. */
  explanation: string;
  starterCode: string;
  tasks: Task[];
  hints: string[];
  solution: string;
  /** Present on CSS lessons: the starting stylesheet (the HTML then lives in `starterCode`). */
  starterCss?: string;
  solutionCss?: string;
  /**
   * Present on JavaScript lessons: the starting script.js. With an empty `starterCode` the lesson is console-only;
   * otherwise `starterCode` is index.html (and `starterCss`, if present, style.css).
   */
  starterJs?: string;
  solutionJs?: string;
  /** JavaScript lessons: fake responses for fetch(), keyed by URL (optionally "POST <url>"). */
  fetchMocks?: Record<string, FetchMock>;
  /** JavaScript lessons: what localStorage holds when the checks run. */
  storage?: Record<string, string>;
}

export interface Challenge extends Lesson {
  difficulty: 1 | 2 | 3;
  /** Short pitch shown on the module card. */
  summary: string;
  /** Requirement texts stay hidden until each one passes (for bug hunts and audits). */
  blind?: boolean;
  /** Show the rendered solution in a "Target" tab next to the preview (recreate-the-design challenges). */
  showTarget?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  challenge: Challenge;
}

export type CourseId = 'html' | 'css' | 'js';

export interface Course {
  id: CourseId;
  title: string;
  tagline: string;
  modules: Module[];
}

export const isJsLesson = (l: Lesson) => l.starterJs !== undefined;
/** A CSS-course lesson (JavaScript lessons can have a style.css too, but run differently). */
export const isCssLesson = (l: Lesson) => l.starterCss !== undefined && !isJsLesson(l);
/** A JavaScript lesson with a page (index.html), not just the console. */
export const isJsPageLesson = (l: Lesson) => isJsLesson(l) && l.starterCode.trim() !== '';
