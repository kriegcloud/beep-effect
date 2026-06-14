/**
 * Workspace Thread table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { EntityTable } from "@beep/drizzle";
import { Thread } from "@beep/workspace-domain/entities/Thread";

/**
 * PGLite/Postgres Drizzle table for the workspace Thread entity.
 *
 * @example
 * ```ts
 * import { Thread } from "@beep/workspace-tables/entities"
 *
 * console.log(Thread.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const Table = EntityTable.pgTableFrom(Thread);
