/**
 * Workspace CandidateProject table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { EntityTable } from "@beep/drizzle";
import { CandidateProject } from "@beep/workspace-domain/entities/CandidateProject";

/**
 * PGLite/Postgres Drizzle table for the workspace CandidateProject entity.
 *
 * @example
 * ```ts
 * import { CandidateProject } from "@beep/workspace-tables/entities"
 *
 * console.log(CandidateProject.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const Table = EntityTable.pgTableFrom(CandidateProject);
