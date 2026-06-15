/**
 * Workspace Turn row converters.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.0.0
 */

import { Turn } from "@beep/workspace-domain/entities/Turn";
import * as S from "effect/Schema";
import type { Table } from "./Turn.table.ts";

/**
 * Selected workspace Turn row.
 *
 * @example
 * ```ts
 * import type { TurnRow } from "@beep/workspace-tables/entities/Turn"
 *
 * const value = {} as TurnRow
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type TurnRow = typeof Table.$inferSelect;

/**
 * Insertable workspace Turn row.
 *
 * @example
 * ```ts
 * import type { TurnInsert } from "@beep/workspace-tables/entities/Turn"
 *
 * const value = {} as TurnInsert
 * console.log(value)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export type TurnInsert = typeof Table.$inferInsert;

const encodeTurn = S.encodeSync(Turn);
const decodeTurnRow = S.decodeUnknownSync(Turn);

/**
 * Convert a Turn entity into its persistence insert row.
 *
 * The schema-first entity is its own row codec: encoding yields the
 * snake_case column shape produced by {@link Table}. The database-managed
 * `id` (SERIAL) is dropped so the insert defers to the sequence.
 *
 * @example
 * ```ts
 * import { toTurnInsert } from "@beep/workspace-tables/entities/Turn"
 *
 * console.log(toTurnInsert)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const toTurnInsert = (turn: Turn): TurnInsert => {
  const { id: _id, ...rest } = encodeTurn(turn);
  return rest as TurnInsert;
};

/**
 * Convert a selected persistence row into a Turn entity.
 *
 * @example
 * ```ts
 * import { fromTurnRow } from "@beep/workspace-tables/entities/Turn"
 *
 * console.log(fromTurnRow)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export const fromTurnRow = (row: TurnRow): Turn => decodeTurnRow(row);
