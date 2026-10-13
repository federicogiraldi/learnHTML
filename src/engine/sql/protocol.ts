/** Messages between the app and the SQL worker (`worker.ts`). */

export type SqlValue = number | string | null;

export interface ResultSet {
  columns: string[];
  rows: SqlValue[][];
}

/** One statement of the learner's script and what it did. */
export interface StatementResult extends ResultSet {
  /** Line (1-based) of query.sql where the statement starts. */
  line: number;
  /** The statement's first keyword, upper case: SELECT, INSERT, UPDATE, DELETE, CREATE… */
  verb: string;
  /** True for statements that return rows (they have columns, even with no rows). */
  returnsRows: boolean;
  /** Rows inserted, changed or deleted. */
  changes: number;
  /** More rows than the worker sends back: only the first ones are in `rows`. */
  truncated?: boolean;
}

export interface SqlError {
  message: string;
  line?: number;
}

/**
 * An extra query for the checks. Without `fresh` it runs on the learner's database, after their script; with
 * `fresh` it runs on a new copy of the lesson's database after the `fresh` script (the expected answer).
 */
export interface SqlQuery {
  sql: string;
  fresh?: string;
}

export type QueryAnswer = ResultSet | { error: string };

export interface TableSnapshot {
  name: string;
  columns: { name: string; type: string; pk: boolean; notNull: boolean }[];
  rows: SqlValue[][];
  count: number;
}

export interface SqlRequest {
  id: number;
  /** Builds the lesson's database. */
  setup: string;
  /** The learner's query.sql. */
  script: string;
  queries: SqlQuery[];
  /** Also send back every table, as it is after the script. */
  snapshot?: boolean;
}

export interface SqlResponse {
  id: number;
  statements: StatementResult[];
  /** The error that stopped the script, if any. Statements before it ran. */
  error?: SqlError;
  answers: QueryAnswer[];
  tables: TableSnapshot[];
}

export type WorkerMessage = { type: 'ready' } | { type: 'failed'; message: string } | ({ type: 'result' } & SqlResponse);

export const isAnswerError = (a: QueryAnswer | undefined): a is { error: string } => !!a && 'error' in a;
