/**
 * @since 1.0.0
 */
import { Atom } from "@effect-atom/atom"
import { match } from "../core/Accessor"
import type { Column } from "../core/Column"
import type { Table } from "../core/Table"
import type { CellAtomOf, CellKey, TableState } from "./TableState"
import { makeCellKey } from "./TableState"

/**
 * Create a TableState from a Table definition and initial rows.
 *
 * This is the main state orchestrator that:
 * 1. Creates a writable rows atom
 * 2. Manages cell atoms using family pattern for memoization
 * 3. Provides getCellAtom that returns appropriate atoms per column type
 *
 * Cell atoms derive from rowsAtom and update reactively when row data changes.
 * For Sync accessors: Atom<Value>
 * For Deferred accessors: Atom<Result<Value, E>>
 * For Streamed accessors: Atom<Result<Value, E>>
 *
 * @since 1.0.0
 * @category constructors
 */
export const make = <Row, Columns extends ReadonlyArray<Column.Any>>(
  table: Table<Row, Columns>,
  initialRows: ReadonlyArray<Row> = []
): TableState<Row, Columns> => {
  // 1. Create writable rows atom
  const rowsAtom = Atom.make(initialRows)

  // 2. Cell atom cache using family pattern
  //    Key: CellKey (rowIndex-columnId)
  //    Value: Atom for that cell
  const cellAtomFamily = Atom.family((key: CellKey) => {
    // Parse the key - only split on first '-' since columnId may contain '-'
    const dashIndex = (key as string).indexOf("-")
    const rowIndexStr = (key as string).slice(0, dashIndex)
    const columnId = (key as string).slice(dashIndex + 1)
    const rowIndex = parseInt(rowIndexStr, 10)

    // Find the column
    const column = table.columns.find((c) => c.id === columnId)
    if (!column) {
      throw new Error(`Column ${columnId} not found in table`)
    }

    // Create appropriate atom based on accessor type
    return match(column.accessor, {
      // For Sync: readable atom that extracts value from rowsAtom
      onSync: ({ get }) =>
        Atom.readable((getAtom) => {
          const rows = getAtom(rowsAtom)
          const row = rows[rowIndex]
          if (row === undefined) {
            throw new Error(
              `Row index ${rowIndex} out of bounds (total rows: ${rows.length})`
            )
          }
          return get(row)
        }),

      // For Deferred: readable atom that creates Effect atom from current row
      // The Effect will re-run when rowsAtom changes
      onDeferred: ({ get: getEffect }) =>
        Atom.make((getAtom) => {
          const rows = getAtom(rowsAtom)
          const row = rows[rowIndex]
          if (row === undefined) {
            throw new Error(
              `Row index ${rowIndex} out of bounds (total rows: ${rows.length})`
            )
          }
          // Return the effect for this row
          // Atom.make will handle running it and managing Result state
          return getEffect(row)
        }),

      // For Streamed: readable atom that creates Stream atom from current row
      // The Stream will re-subscribe when rowsAtom changes
      onStreamed: ({ get: getStream }) =>
        Atom.make((getAtom) => {
          const rows = getAtom(rowsAtom)
          const row = rows[rowIndex]
          if (row === undefined) {
            throw new Error(
              `Row index ${rowIndex} out of bounds (total rows: ${rows.length})`
            )
          }
          // Return the stream for this row
          // Atom.make will handle subscribing and managing Result state
          return getStream(row)
        })
    })
  })

  // 3. getCellAtom implementation
  const getCellAtom = <C extends Columns[number]>(
    rowIndex: number,
    column: C
  ): CellAtomOf<Row, C> => {
    const key = makeCellKey(rowIndex, column.id)
    return cellAtomFamily(key) as CellAtomOf<Row, C>
  }

  return {
    table,
    rowsAtom,
    getCellAtom
  }
}
