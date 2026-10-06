/** A check returns `true` when it passes, or a message explaining what is wrong. */
export type CheckResult = true | string;
export type Check = (doc: Document, raw: string) => CheckResult;

export interface Task {
  text: string;
  check: Check;
}

export interface Lesson {
  id: string;
  title: string;
  /** Markdown. ```html blocks get a "Try it" button. */
  explanation: string;
  starterCode: string;
  tasks: Task[];
  hints: string[];
  solution: string;
}

export interface Challenge extends Lesson {
  difficulty: 1 | 2 | 3;
  /** Short pitch shown on the module card. */
  summary: string;
  /** Requirement texts stay hidden until each one passes (for bug hunts and audits). */
  blind?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  challenge: Challenge;
}
