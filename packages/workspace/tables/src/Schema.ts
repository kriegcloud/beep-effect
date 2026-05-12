/**
 * Workspace Drizzle schema aggregate.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { CandidateDraft, CandidateProject } from "./entities/index.ts";

type DbSchemaShape = {
  readonly candidateDraft: typeof CandidateDraft.Table;
  readonly candidateProject: typeof CandidateProject.Table;
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
};

/**
 * Type for {@link DbSchema}.
 *
 * @since 0.0.0
 * @category tables
 */
export type DbSchema = DbSchemaShape;
