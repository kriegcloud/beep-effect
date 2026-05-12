/**
 * Shared-kernel Membership table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { EntityTable } from "@beep/drizzle";
import { Membership } from "@beep/shared-domain/entities";

/**
 * PGLite/Postgres Drizzle table for the shared Membership entity.
 *
 * @example
 * ```ts
 * import { Membership } from "@beep/shared-tables/entities"
 *
 * console.log(Membership.Table.definition.tableName) //
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const Table = EntityTable.pgTableFrom(Membership.Model);
