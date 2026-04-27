/**
 * Shared-kernel Organization table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ProfilePack } from "@beep/shared-domain/entities/Organization/Organization.values";
import * as Shared from "@beep/shared-domain/identity/Shared";
import * as TableFactory from "../../table/Table.js";

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
export const Table = TableFactory.make(Shared.OrganizationId, ProfilePack);
