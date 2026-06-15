/**
 * Workspace Message row converters.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.0.0
 */

import { Message } from "@beep/workspace-domain/entities/Message";
import * as S from "effect/Schema";
import type { Table } from "./Message.table.ts";

/**
 * Selected workspace Message row.
 *
 * @example
 * ```ts
 * import type { MessageRow } from "@beep/workspace-tables/entities/Message"
 *
 * const value = {} as MessageRow
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type MessageRow = typeof Table.$inferSelect;

/**
 * Insertable workspace Message row.
 *
 * @example
 * ```ts
 * import type { MessageInsert } from "@beep/workspace-tables/entities/Message"
 *
 * const value = {} as MessageInsert
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type MessageInsert = typeof Table.$inferInsert;

const encodeMessage = S.encodeSync(Message);
const decodeMessageRow = S.decodeUnknownSync(Message);

/**
 * Convert a Message entity into its persistence insert row.
 *
 * The schema-first entity is its own row codec: encoding yields the
 * snake_case column shape produced by {@link Table}. The database-managed
 * `id` (SERIAL) is dropped so the insert defers to the sequence.
 *
 * @example
 * ```ts
 * import { toMessageInsert } from "@beep/workspace-tables/entities/Message"
 *
 * console.log(toMessageInsert)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const toMessageInsert = (message: Message): MessageInsert => {
  const { id: _id, ...rest } = encodeMessage(message);
  return rest as MessageInsert;
};

/**
 * Convert a selected persistence row into a Message entity.
 *
 * @example
 * ```ts
 * import { fromMessageRow } from "@beep/workspace-tables/entities/Message"
 *
 * console.log(fromMessageRow)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const fromMessageRow = (row: MessageRow): Message => decodeMessageRow(row);
