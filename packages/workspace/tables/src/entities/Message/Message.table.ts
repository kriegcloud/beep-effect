/**
 * Workspace Message table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { EntityTable } from "@beep/drizzle";
import { Message } from "@beep/workspace-domain/entities/Message";

/**
 * PGLite/Postgres Drizzle table for the workspace Message entity.
 *
 * @example
 * ```ts
 * import { Message } from "@beep/workspace-tables/entities"
 *
 * console.log(Message.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const Table = EntityTable.pgTableFrom(Message);
