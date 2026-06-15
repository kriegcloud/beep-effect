/**
 * Epistemic persistence boundary for metadata-only table projections.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Epistemic entity table metadata namespaces.
 *
 * @example
 * ```ts
 * import { Entities } from "@beep/epistemic-tables"
 *
 * console.log(Entities.UsageRecord.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export * as Entities from "./entities/index.ts";
/**
 * Epistemic Drizzle schema aggregate exports.
 *
 * @since 0.0.0
 * @category tables
 */
export { DbSchema } from "./Schema.ts";
