/**
 * Workspace Drizzle schema aggregate.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { CandidateDraft, CandidateProject, Message, Thread, Turn } from "./entities/index.ts";

type DbSchemaShape = {
  readonly candidateDraft: typeof CandidateDraft.Table;
  readonly candidateProject: typeof CandidateProject.Table;
  readonly message: typeof Message.Table;
  readonly thread: typeof Thread.Table;
  readonly turn: typeof Turn.Table;
};

/**
 * Metadata-only workspace Drizzle schema aggregate.
 *
 * @example
 * ```ts
 * import { DbSchema } from "@beep/workspace-tables"
 *
 * console.log(DbSchema.candidateDraft.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const DbSchema: DbSchemaShape = {
  candidateDraft: CandidateDraft.Table,
  candidateProject: CandidateProject.Table,
  message: Message.Table,
  thread: Thread.Table,
  turn: Turn.Table,
};

/**
 * Type for {@link DbSchema}.
 *
 * @since 0.0.0
 * @example
 * ```ts
 * import type { DbSchema } from "@beep/workspace-tables"
 *
 * const value = {} as DbSchema
 * console.log(value)
 * ```
 *
 * @category tables
 */
export type DbSchema = DbSchemaShape;
