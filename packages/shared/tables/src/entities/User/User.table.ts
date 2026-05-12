/**
 * Shared-kernel User table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { EntityTable } from "@beep/drizzle";
import { User } from "@beep/shared-domain/entities";

/**
 * PGLite/Postgres Drizzle table for the shared User entity.
 *
 * @example
 * ```ts
 * import { User } from "@beep/shared-tables/entities"
 *
 * console.log(User.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const Table = EntityTable.pgTableFrom(User.Model);
