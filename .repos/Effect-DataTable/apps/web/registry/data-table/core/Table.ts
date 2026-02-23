import type { Column } from "./Column"

/**
 * Table - a collection of columns for a specific Row type.
 * Preserves column IDs as a union type for type-safe column access.
 *
 * @since 1.0.0
 * @category Models
 */
export interface Table<
  Row,
  Columns extends ReadonlyArray<Column.Any>
> {
  readonly _tag: "Table"
  readonly columns: Columns
}

/**
 * @since 1.0.0
 * @category Models
 */
export declare namespace Table {
  export type Any = Table<any, ReadonlyArray<Column.Any>>
}

/**
 * Helper to extract column IDs from a Table as a union type.
 *
 * @since 1.0.0
 * @category Type Helpers
 */
export type TableColumnIds<T extends Table.Any> = T extends Table<any, infer C>
  ? C extends ReadonlyArray<Column<any, infer Id, any, any, any>>
    ? Id
    : never
  : never

/**
 * Factory function to create a Table with type-safe column ID preservation.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const createTable =
  <Row>() =>
  <Columns extends ReadonlyArray<Column.Any>>(
    columns: Columns
  ): Table<Row, Columns> => ({ _tag: "Table", columns })
