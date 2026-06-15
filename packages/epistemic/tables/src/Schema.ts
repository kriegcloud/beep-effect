/**
 * Epistemic Drizzle schema aggregate.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { UsageRecord } from "./entities/index.ts";

type DbSchemaShape = {
  readonly usageRecord: typeof UsageRecord.Table;
};

/**
 * Metadata-only epistemic Drizzle schema aggregate.
 *
 * @example
 * ```ts
 * import { DbSchema } from "@beep/epistemic-tables"
 *
 * console.log(DbSchema.usageRecord.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const DbSchema: DbSchemaShape = {
  usageRecord: UsageRecord.Table,
};

/**
 * Type for {@link DbSchema}.
 *
 * @since 0.0.0
 * @example
 * ```ts
 * import type { DbSchema } from "@beep/epistemic-tables"
 *
 * const value = {} as DbSchema
 * console.log(value)
 * ```
 *
 * @category tables
 */
export type DbSchema = DbSchemaShape;
