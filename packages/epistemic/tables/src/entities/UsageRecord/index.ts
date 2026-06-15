/**
 * Epistemic UsageRecord table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * UsageRecord row converter exports.
 *
 * @example
 * ```ts
 * import * as UsageRecord from "@beep/epistemic-tables/entities/UsageRecord"
 *
 * console.log(UsageRecord.toUsageRecordInsert)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export * from "./UsageRecord.converters.ts";
/**
 * UsageRecord table exports.
 *
 * @example
 * ```ts
 * import * as UsageRecord from "@beep/epistemic-tables/entities/UsageRecord"
 *
 * console.log(UsageRecord.Table.definition.entityId.entityType)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export * from "./UsageRecord.table.ts";
