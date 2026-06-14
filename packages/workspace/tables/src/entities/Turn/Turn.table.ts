/**
 * Workspace Turn table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { EntityTable } from "@beep/drizzle";
import { Turn } from "@beep/workspace-domain/entities/Turn";

/**
 * PGLite/Postgres Drizzle table for the workspace Turn entity.
 *
 * @example
 * ```ts
 * import { Turn } from "@beep/workspace-tables/entities"
 *
 * console.log(Turn.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const Table = EntityTable.pgTableFrom(Turn);
