/**
 * Workspace Thread row converters.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.0.0
 */

import { Thread } from "@beep/workspace-domain/entities/Thread";
import * as S from "effect/Schema";
import type { Table } from "./Thread.table.ts";

/**
 * Selected workspace Thread row.
 *
 * @example
 * ```ts
 * import type { ThreadRow } from "@beep/workspace-tables/entities/Thread"
 *
 * const value = {} as ThreadRow
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type ThreadRow = typeof Table.$inferSelect;

/**
 * Insertable workspace Thread row.
 *
 * @example
 * ```ts
 * import type { ThreadInsert } from "@beep/workspace-tables/entities/Thread"
 *
 * const value = {} as ThreadInsert
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type ThreadInsert = typeof Table.$inferInsert;

const encodeThread = S.encodeSync(Thread);
const decodeThreadRow = S.decodeUnknownSync(Thread);

/**
 * Convert a Thread entity into its persistence insert row.
 *
 * The schema-first entity is its own row codec: encoding yields the
 * snake_case column shape produced by {@link Table}. The database-managed
 * `id` (SERIAL) is dropped so the insert defers to the sequence.
 *
 * @example
 * ```ts
 * import { toThreadInsert } from "@beep/workspace-tables/entities/Thread"
 *
 * console.log(toThreadInsert)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const toThreadInsert = (thread: Thread): ThreadInsert => {
  const { id: _id, ...rest } = encodeThread(thread);
  return rest as ThreadInsert;
};

/**
 * Convert a selected persistence row into a Thread entity.
 *
 * @example
 * ```ts
 * import { fromThreadRow } from "@beep/workspace-tables/entities/Thread"
 *
 * console.log(fromThreadRow)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const fromThreadRow = (row: ThreadRow): Thread => decodeThreadRow(row);
