/**
 * Workspace CandidateDraft table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { EntityTable } from "@beep/drizzle";
import { CandidateDraft } from "@beep/workspace-domain/entities/CandidateDraft";

/**
 * PGLite/Postgres Drizzle table for the workspace CandidateDraft entity.
 *
 * @example
 * ```ts
 * import { CandidateDraft } from "@beep/workspace-tables/entities"
 *
 * console.log(CandidateDraft.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const Table = EntityTable.pgTableFrom(CandidateDraft);
