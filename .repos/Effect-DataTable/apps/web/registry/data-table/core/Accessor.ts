/**
 * Accessor ADT - defines how a column extracts its value from a row.
 *
 * Follows idiomatic Effect library patterns:
 * - Discriminated union with TypeId symbol
 * - Proto-based constructors
 * - Pipeable implementation
 *
 * @since 1.0.0
 */
import { dual } from "effect/Function"
import type { Pipeable } from "effect/Pipeable"
import { pipeArguments } from "effect/Pipeable"
import { hasProperty } from "effect/Predicate"
import type { Effect } from "effect/Effect"
import type { Stream } from "effect/Stream"

/**
 * @since 1.0.0
 * @category Symbols
 */
export const TypeId: unique symbol = Symbol.for("@registry/data-table/Accessor")

/**
 * @since 1.0.0
 * @category Symbols
 */
export type TypeId = typeof TypeId

/**
 * Accessor ADT - defines how a column extracts its value from a row.
 *
 * @since 1.0.0
 * @category Models
 */
export type Accessor<Row, Value, E = never, R = never> =
  | Sync<Row, Value>
  | Deferred<Row, Value, E, R>
  | Streamed<Row, Value, E, R>

/**
 * @since 1.0.0
 * @category Models
 */
export declare namespace Accessor {
  /**
   * @since 1.0.0
   */
  export type Any = Accessor<any, any, any, any>

  /**
   * Extract the Row type from an Accessor.
   *
   * @since 1.0.0
   */
  export type RowOf<A> = A extends Accessor<infer Row, any, any, any> ? Row : never

  /**
   * Extract the Value type from an Accessor.
   *
   * @since 1.0.0
   */
  export type ValueOf<A> = A extends Accessor<any, infer Value, any, any> ? Value : never

  /**
   * Extract the Error type from an Accessor.
   *
   * @since 1.0.0
   */
  export type ErrorOf<A> = A extends Accessor<any, any, infer E, any> ? E : never

  /**
   * Extract the Requirements type from an Accessor.
   *
   * @since 1.0.0
   */
  export type RequirementsOf<A> = A extends Accessor<any, any, any, infer R> ? R : never
}

// -----------------------------------------------------------------------------
// Proto
// -----------------------------------------------------------------------------

const Proto: Pipeable = {
  [TypeId]: TypeId,
  pipe() {
    return pipeArguments(this, arguments)
  }
}

// -----------------------------------------------------------------------------
// Sync
// -----------------------------------------------------------------------------

/**
 * Sync accessor - immediate value extraction.
 *
 * @since 1.0.0
 * @category Models
 */
export interface Sync<Row, Value> extends Pipeable {
  readonly _tag: "Sync"
  readonly [TypeId]: TypeId
  readonly get: (row: Row) => Value
}

/**
 * Create a Sync accessor - immediate value extraction.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const sync = <Row, Value>(get: (row: Row) => Value): Sync<Row, Value> => {
  const self = Object.create(Proto)
  self._tag = "Sync"
  self.get = get
  return self
}

/**
 * Type guard for Sync accessor.
 *
 * @since 1.0.0
 * @category Guards
 */
export const isSync = <Row, Value, E, R>(
  accessor: Accessor<Row, Value, E, R>
): accessor is Sync<Row, Value> => accessor._tag === "Sync"

// -----------------------------------------------------------------------------
// Deferred
// -----------------------------------------------------------------------------

/**
 * Deferred accessor - Effect that resolves later.
 *
 * @since 1.0.0
 * @category Models
 */
export interface Deferred<Row, Value, E = never, R = never> extends Pipeable {
  readonly _tag: "Deferred"
  readonly [TypeId]: TypeId
  readonly get: (row: Row) => Effect<Value, E, R>
}

/**
 * Create a Deferred accessor - Effect that resolves later.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const deferred = <Row, Value, E = never, R = never>(
  get: (row: Row) => Effect<Value, E, R>
): Deferred<Row, Value, E, R> => {
  const self = Object.create(Proto)
  self._tag = "Deferred"
  self.get = get
  return self
}

/**
 * Type guard for Deferred accessor.
 *
 * @since 1.0.0
 * @category Guards
 */
export const isDeferred = <Row, Value, E, R>(
  accessor: Accessor<Row, Value, E, R>
): accessor is Deferred<Row, Value, E, R> => accessor._tag === "Deferred"

// -----------------------------------------------------------------------------
// Streamed
// -----------------------------------------------------------------------------

/**
 * Streamed accessor - real-time updates via Stream.
 *
 * @since 1.0.0
 * @category Models
 */
export interface Streamed<Row, Value, E = never, R = never> extends Pipeable {
  readonly _tag: "Streamed"
  readonly [TypeId]: TypeId
  readonly get: (row: Row) => Stream<Value, E, R>
}

/**
 * Create a Streamed accessor - real-time updates via Stream.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const streamed = <Row, Value, E = never, R = never>(
  get: (row: Row) => Stream<Value, E, R>
): Streamed<Row, Value, E, R> => {
  const self = Object.create(Proto)
  self._tag = "Streamed"
  self.get = get
  return self
}

/**
 * Type guard for Streamed accessor.
 *
 * @since 1.0.0
 * @category Guards
 */
export const isStreamed = <Row, Value, E, R>(
  accessor: Accessor<Row, Value, E, R>
): accessor is Streamed<Row, Value, E, R> => accessor._tag === "Streamed"

// -----------------------------------------------------------------------------
// General Guards
// -----------------------------------------------------------------------------

/**
 * Check if a value is an Accessor.
 *
 * @since 1.0.0
 * @category Guards
 */
export const isAccessor = (u: unknown): u is Accessor<unknown, unknown, unknown, unknown> =>
  hasProperty(u, TypeId)

// -----------------------------------------------------------------------------
// Pattern Matching
// -----------------------------------------------------------------------------

/**
 * Pattern match on Accessor variants.
 *
 * @since 1.0.0
 * @category Pattern Matching
 */
export const match: {
  <Row, Value, E, R, A, B, C>(options: {
    readonly onSync: (accessor: Sync<Row, Value>) => A
    readonly onDeferred: (accessor: Deferred<Row, Value, E, R>) => B
    readonly onStreamed: (accessor: Streamed<Row, Value, E, R>) => C
  }): (accessor: Accessor<Row, Value, E, R>) => A | B | C
  <Row, Value, E, R, A, B, C>(
    accessor: Accessor<Row, Value, E, R>,
    options: {
      readonly onSync: (accessor: Sync<Row, Value>) => A
      readonly onDeferred: (accessor: Deferred<Row, Value, E, R>) => B
      readonly onStreamed: (accessor: Streamed<Row, Value, E, R>) => C
    }
  ): A | B | C
} = dual(2, (accessor: any, options: any) => {
  switch (accessor._tag) {
    case "Sync":
      return options.onSync(accessor)
    case "Deferred":
      return options.onDeferred(accessor)
    case "Streamed":
      return options.onStreamed(accessor)
  }
})
