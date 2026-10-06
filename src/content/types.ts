/** A check returns `true` when it passes, or a message explaining what is wrong. */
export type CheckResult = true | string;
/**
 * `doc` is the parsed page (HTML lessons) or the live, styled and laid-out page (CSS lessons).
 * `raw` is the HTML source and `css` the stylesheet source ('' in HTML lessons).
 */
export type Check = (doc: Document, raw: string, css?: string) => CheckResult;

export interface Task {
  text: string;
  check: Check;
}

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

export type CourseId = 'html' | 'css';

export interface Course {
  id: CourseId;
  title: string;
  tagline: string;
  modules: Module[];
}

export const isCssLesson = (l: Lesson) => l.starterCss !== undefined;
