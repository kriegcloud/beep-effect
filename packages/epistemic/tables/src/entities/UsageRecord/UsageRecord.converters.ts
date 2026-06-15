/**
 * Epistemic UsageRecord row converters.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.0.0
 */

import { UsageRecord } from "@beep/epistemic-domain/entities/UsageRecord";
import * as S from "effect/Schema";
import type { Table } from "./UsageRecord.table.ts";

/**
 * Selected epistemic UsageRecord row.
 *
 * @example
 * ```ts
 * import type { UsageRecordRow } from "@beep/epistemic-tables/entities/UsageRecord"
 *
 * const value = {} as UsageRecordRow
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type UsageRecordRow = typeof Table.$inferSelect;

/**
 * Insertable epistemic UsageRecord row.
 *
 * @example
 * ```ts
 * import type { UsageRecordInsert } from "@beep/epistemic-tables/entities/UsageRecord"
 *
 * const value = {} as UsageRecordInsert
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type UsageRecordInsert = typeof Table.$inferInsert;

const encodeUsageRecord = S.encodeSync(UsageRecord);
const decodeUsageRecordRow = S.decodeUnknownSync(UsageRecord);

/**
 * Convert a UsageRecord entity into its persistence insert row.
 *
 * The schema-first entity is its own row codec: encoding yields the
 * snake_case column shape produced by {@link Table}. The database-managed
 * `id` (SERIAL) is dropped so the insert defers to the sequence.
 *
 * @example
 * ```ts
 * import { toUsageRecordInsert } from "@beep/epistemic-tables/entities/UsageRecord"
 *
 * console.log(toUsageRecordInsert)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const toUsageRecordInsert = (usageRecord: UsageRecord): UsageRecordInsert => {
  const { id: _id, ...rest } = encodeUsageRecord(usageRecord);
  return rest as UsageRecordInsert;
};

/**
 * Convert a selected persistence row into a UsageRecord entity.
 *
 * @example
 * ```ts
 * import { fromUsageRecordRow } from "@beep/epistemic-tables/entities/UsageRecord"
 *
 * console.log(fromUsageRecordRow)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const fromUsageRecordRow = (row: UsageRecordRow): UsageRecord => decodeUsageRecordRow(row);
