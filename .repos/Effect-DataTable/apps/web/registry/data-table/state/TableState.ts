/**
 * @since 1.0.0
 */
import type { Atom, Result } from "@effect-atom/atom"
import type { Sync, Column, Table } from "../core"

/**
 * CellKey - Branded string for unique cell identification.
 * Format: `${rowIndex}-${columnId}`
 *
 * @since 1.0.0
 * @category Models
 */
export type CellKey = string & { readonly _brand: unique symbol }

/**
 * Creates a unique cell key from row index and column ID.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const makeCellKey = (rowIndex: number, columnId: string): CellKey =>
  `${rowIndex}-${columnId}` as CellKey

/**
 * Maps a column's accessor type to the appropriate cell atom type.
 * - Sync accessors: Just the value (no atom needed)
 * - Deferred accessors: Atom<Result<Value, E>>
 * - Streamed accessors: Atom<Result<Value, E>>
 *
 * @since 1.0.0
 * @category Type Helpers
 */
export type CellAtomOf<Row, C extends Column.Any> = C extends Column<
  Row,
  infer _Id,
  infer Value,
  infer E,
  infer _R
>
  ? C["accessor"] extends Accessor<Row, Value, never, never>
    ? C["accessor"]["_tag"] extends "Sync"
      ? Atom.Atom<Value>
      : Atom.Atom<Result.Result<Value, E>>
    : Atom.Atom<Result.Result<Value, E>>
  : never

/**
 * TableState - Core state management interface for atom-based data tables.
 *
 * @since 1.0.0
 * @category Models
 */
export interface TableState<Row, Columns extends ReadonlyArray<Column.Any>> {
  /**
   * The table definition containing columns.
   */
  readonly table: Table<Row, Columns>

  /**
   * Writable atom holding the array of row data.
   */
  readonly rowsAtom: Atom.Writable<ReadonlyArray<Row>>

  /**
   * Retrieves the appropriate cell atom for a given row and column.
   * - For Sync columns: returns the value directly
   * - For Deferred/Streamed columns: returns an Atom<Result<Value, E>>
   */
  readonly getCellAtom: <C extends Columns[number]>(
    rowIndex: number,
    column: C
  ) => CellAtomOf<Row, C>
}

/**
 * @since 1.0.0
 * @category Models
 */
export declare namespace TableState {
  export type Any = TableState<any, ReadonlyArray<Column.Any>>
}
