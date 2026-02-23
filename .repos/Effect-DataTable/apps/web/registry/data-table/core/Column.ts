/**
 * @since 1.0.0
 */
import { Data, Option } from "effect"
import type { Effect } from "effect/Effect"
import type { Stream } from "effect/Stream"
import type { LucideIcon } from "lucide-react"
import { sync, deferred, streamed, type Accessor } from "./Accessor"

/**
 * Represents a table column with an id, accessor, header, and optional icon.
 *
 * @since 1.0.0
 * @category Models
 */
export interface Column<Row, Id extends string, Value, E = never, R = never> {
  readonly _tag: "Column"
  readonly id: Id
  readonly accessor: Accessor<Row, Value, E, R>
  readonly header: string
  readonly icon: Option.Option<LucideIcon>
}

/**
 * @since 1.0.0
 * @category Models
 */
export declare namespace Column {
  export type Any = Column<any, string, any, any, any>
}

/**
 * @internal
 */
const makeColumn = <Row, Id extends string, Value, E = never, R = never>(
  id: Id,
  accessor: Accessor<Row, Value, E, R>,
  header: string,
  icon: Option.Option<LucideIcon>
): Column<Row, Id, Value, E, R> =>
  Data.struct({
    _tag: "Column" as const,
    id,
    accessor,
    header,
    icon
  })

/**
 * @internal
 */
interface ColumnBuilder<Row, Id extends string, Value, E = never, R = never> {
  /**
   * Set the header text for the column.
   *
   * @since 1.0.0
   * @category Builder
   */
  readonly header: (text: string) => ColumnBuilderWithHeader<Row, Id, Value, E, R>
}

/**
 * @internal
 */
interface ColumnBuilderWithHeader<Row, Id extends string, Value, E = never, R = never> {
  /**
   * Set the optional icon for the column.
   *
   * @since 1.0.0
   * @category Builder
   */
  readonly icon: (icon: Option.Option<LucideIcon>) => Column<Row, Id, Value, E, R>
}

/**
 * @internal
 */
const createBuilder = <Row, Id extends string, Value, E = never, R = never>(
  id: Id,
  accessor: Accessor<Row, Value, E, R>
): ColumnBuilder<Row, Id, Value, E, R> => ({
  header: (text: string) => ({
    icon: (iconValue: Option.Option<LucideIcon>) => makeColumn(id, accessor, text, iconValue)
  })
})

/**
 * Creates a column helper factory for a specific row type.
 * The returned helper provides methods to create columns with sync, deferred (Effect), or streamed accessors.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const createColumnHelper = <Row>() => {
  /**
   * Create a column with a synchronous accessor.
   *
   * @since 1.0.0
   * @category Constructors
   */
  const col = <Id extends string, Value>(
    id: Id,
    get: (row: Row) => Value
  ): ColumnBuilder<Row, Id, Value, never, never> => {
    return createBuilder(id, sync(get))
  }

  /**
   * Create a column with a deferred (Effect) accessor.
   *
   * @since 1.0.0
   * @category Constructors
   */
  col.deferred = <Id extends string, Value, E = never, R = never>(
    id: Id,
    get: (row: Row) => Effect<Value, E, R>
  ): ColumnBuilder<Row, Id, Value, E, R> => {
    return createBuilder(id, deferred(get))
  }

  /**
   * Create a column with a streamed accessor.
   *
   * @since 1.0.0
   * @category Constructors
   */
  col.streamed = <Id extends string, Value, E = never, R = never>(
    id: Id,
    get: (row: Row) => Stream<Value, E, R>
  ): ColumnBuilder<Row, Id, Value, E, R> => {
    return createBuilder(id, streamed(get))
  }

  return col
}
