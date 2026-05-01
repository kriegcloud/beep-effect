/**
 * Shared-kernel Organization table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { EntityTable } from "@beep/drizzle";
import { Model } from "@beep/shared-domain/entities/Organization/Organization.model";

/**
 * PGLite/Postgres Drizzle table for the shared Organization entity.
 *
 * @example
 * ```ts
 * import { Table } from "@beep/shared-tables/entities/Organization/Organization.table"
 *
 * console.log(Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const Table = EntityTable.pgTableFrom(Model);
