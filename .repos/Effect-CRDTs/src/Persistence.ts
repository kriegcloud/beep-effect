/**
 * Persistence abstraction for CRDT state.
 *
 * This module provides a pluggable persistence layer that allows CRDTs to be
 * saved and loaded from various storage backends (memory, file system, database, etc.).
 *
 * @since 0.1.0
 */

import * as KeyValueStore from "@effect/platform/KeyValueStore"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import type * as ParseResult from "effect/ParseResult"
import * as Schema from "effect/Schema"
import type { ReplicaId } from "./CRDT.js"

/**
 * @since 0.1.0
 * @category symbols
 */
export const TypeId: unique symbol = Symbol.for("effect-crdts/Persistence")

/**
 * @since 0.1.0
 * @category symbols
 */
export type TypeId = typeof TypeId

/**
 * @since 0.1.0
 * @category symbols
 */
export const SchemaStoreTypeId: unique symbol = Symbol.for("effect-crdts/Persistence/SchemaStore")

/**
 * @since 0.1.0
 * @category symbols
 */
export type SchemaStoreTypeId = typeof SchemaStoreTypeId

/**
 * @since 0.1.0
 * @category errors
 */
export class LoadError extends Schema.TaggedError<LoadError>("@effect/crdt/Persistence/LoadError")(
  "PersistenceLoadError",
  { message: Schema.String }
) { }

/**
 * @since 0.1.0
 * @category errors
 */
export class SaveError extends Schema.TaggedError<SaveError>("@effect/crdt/Persistence/SaveError")(
  "PersistenceSaveError",
  { message: Schema.String }
) { }

/**
 * @since 0.1.0
 * @category errors
 */
export class DeleteError extends Schema.TaggedError<DeleteError>("@effect/crdt/Persistence/DeleteError")(
  "PersistenceDeleteError",
  { message: Schema.String }
) { }

/**
 * Schema-based typed persistence store.
 *
 * This interface provides type-safe persistence operations where the state type
 * is derived from a Schema. The generic parameter R represents any additional
 * requirements from the schema.
 *
 * @since 0.1.0
 * @category models
 */
export interface SchemaStore<A, R> {
  /**
   * @since 0.1.0
   */
  readonly [SchemaStoreTypeId]: SchemaStoreTypeId

  /**
   * Load state from the persistence layer.
   *
   * Returns None if no state exists for the given replica.
   *
   * @since 0.1.0
   */
  readonly load: (
    replicaId: ReplicaId
  ) => Effect.Effect<Option.Option<A>, LoadError | ParseResult.ParseError, R>

  /**
   * Save state to the persistence layer.
   *
   * @since 0.1.0
   */
  readonly save: (
    replicaId: ReplicaId,
    state: A
  ) => Effect.Effect<void, SaveError | ParseResult.ParseError, R>

  /**
   * Delete persisted state for a replica.
   *
   * @since 0.1.0
   */
  readonly delete: (replicaId: ReplicaId) => Effect.Effect<void, DeleteError>
}

/**
 * Generic persistence interface for CRDT state.
 *
 * Implementations of this interface provide the storage backend for CRDTs,
 * allowing state to be persisted and recovered across process restarts.
 *
 * The base interface works with raw strings. Use `forSchema` to create a
 * typed persistence store for a specific schema.
 *
 * @since 0.1.0
 * @category models
 */
export interface CRDTPersistence {
  /**
   * @since 0.1.0
   */
  readonly [TypeId]: TypeId

  /**
   * Load state from the persistence layer.
   *
   * Returns None if no state exists for the given replica.
   *
   * @since 0.1.0
   */
  readonly load: (replicaId: ReplicaId) => Effect.Effect<Option.Option<string>, LoadError>

  /**
   * Save state to the persistence layer.
   *
   * @since 0.1.0
   */
  readonly save: (replicaId: ReplicaId, state: string) => Effect.Effect<void, SaveError>

  /**
   * Delete persisted state for a replica.
   *
   * @since 0.1.0
   */
  readonly delete: (replicaId: ReplicaId) => Effect.Effect<void, DeleteError>

  /**
   * Create a typed persistence store from a schema.
   *
   * This method returns a SchemaStore that provides type-safe operations
   * with automatic encoding/decoding using the provided schema.
   *
   * @since 0.1.0
   */
  readonly forSchema: <A, I, R>(schema: Schema.Schema<A, I, R>) => SchemaStore<A, R>
}

/**
 * @since 0.1.0
 * @category tags
 */
export const CRDTPersistence: Context.Tag<CRDTPersistence, CRDTPersistence> = Context.GenericTag<CRDTPersistence>(
  "effect-crdts/Persistence"
)

/**
 * Creates the base proto object with error mapping.
 *
 * Wraps KeyValueStore operations with domain-specific error types.
 *
 * @internal
 */
const makeProto = <Store extends { get: any; set: any; remove: any }>(store: Store) => ({
  load: (replicaId: ReplicaId) =>
    store.get(replicaId).pipe(Effect.mapError((e: any) => new LoadError({ message: e.message }))),
  save: (replicaId: ReplicaId, state: any) =>
    store.set(replicaId, state).pipe(Effect.mapError((e: any) => new SaveError({ message: e.message }))),
  delete: (replicaId: ReplicaId) =>
    store.remove(replicaId).pipe(Effect.mapError((e: any) => new DeleteError({ message: e.message })))
})

/**
 * Creates the base KeyValueStore-based persistence layer.
 *
 * @internal
 */
const make = (kv: KeyValueStore.KeyValueStore): CRDTPersistence =>
  Object.assign(makeProto(kv), {
    [TypeId]: TypeId,
    forSchema<A, I, R>(schema: Schema.Schema<A, I, R>): SchemaStore<A, R> {
      return Object.assign(makeProto(kv.forSchema(schema)), {
        [SchemaStoreTypeId]: SchemaStoreTypeId
      }) as SchemaStore<A, R>
    }
  }) as CRDTPersistence

/**
 * Base layer that creates a CRDTPersistence from a KeyValueStore.
 *
 * Compose this with KeyValueStore layers for different backends.
 *
 * @since 0.1.0
 * @category layers
 */
export const layer: Layer.Layer<CRDTPersistence, never, KeyValueStore.KeyValueStore> = Layer.effect(
  CRDTPersistence,
  Effect.map(KeyValueStore.KeyValueStore, make)
)


/**
 * Layer for in-memory persistence.
 *
 * Provides a CRDTPersistence backed by an in-memory KeyValueStore.
 *
 * @example
 * ```ts
 * import { layerMemory } from "effect-crdts/Persistence"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const persistence = yield* CRDTPersistence
 *   const store = persistence.forSchema(MySchema)
 *
 *   yield* store.save("replica-1", myState)
 *   const loaded = yield* store.load("replica-1")
 * }).pipe(Effect.provide(layerMemory))
 * ```
 *
 * @since 0.1.0
 * @category layers
 */
export const layerMemory: Layer.Layer<CRDTPersistence> = layer.pipe(
  Layer.provide(KeyValueStore.layerMemory)
)

/**
 * Creates both a tag and layer for a schema-specific persistence store.
 *
 * This is the most ergonomic way to create a typed persistence store. It generates
 * a unique service tag for your schema and provides a layer that you can compose
 * with different KeyValueStore backends.
 *
 * @example
 * ```ts
 * import { layerSchema } from "effect-crdts/Persistence"
 * import * as Schema from "effect/Schema"
 * import * as Effect from "effect/Effect"
 * import * as KeyValueStore from "@effect/platform/KeyValueStore"
 *
 * const CounterState = Schema.Struct({
 *   counts: Schema.Map({ key: Schema.String, value: Schema.Number })
 * })
 *
 * const CounterStore = layerSchema(CounterState, "CounterStore")
 *
 * const program = Effect.gen(function* () {
 *   const store = yield* CounterStore.tag
 *   yield* store.save("replica-1", { counts: new Map([["a", 1]]) })
 *   const loaded = yield* store.load("replica-1")
 * }).pipe(
 *   Effect.provide(CounterStore.layer),
 *   Effect.provide(KeyValueStore.layerMemory)
 * )
 * ```
 *
 * @since 0.1.0
 * @category constructors
 */
export const layerSchema = <A, I, R>(
  schema: Schema.Schema<A, I, R>,
  tagIdentifier: string
): {
  readonly tag: Context.Tag<SchemaStore<A, R>, SchemaStore<A, R>>
  readonly layer: Layer.Layer<SchemaStore<A, R>, never, CRDTPersistence>
} => {
  const tag = Context.GenericTag<SchemaStore<A, R>>(tagIdentifier)
  const schemaLayer = Layer.effect(
    tag,
    Effect.map(CRDTPersistence, (persistence) => persistence.forSchema(schema))
  )
  return { tag, layer: schemaLayer }
}

/**
 * Re-export Platform's KeyValueStore for convenience.
 *
 * @since 0.1.0
 * @category re-exports
 */
export { KeyValueStore } from "@effect/platform/KeyValueStore"
