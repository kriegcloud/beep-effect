/**
 * Epistemic entity table namespaces.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * UsageRecord table metadata namespace.
 *
 * @example
 * ```ts
 * import { UsageRecord } from "@beep/epistemic-tables/entities"
 *
 * console.log(UsageRecord.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export * as UsageRecord from "./UsageRecord/index.ts";
