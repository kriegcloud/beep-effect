import { Effect, Layer, Ref } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { ActorMetadata, PersistedEvent, PersistenceAdapter, Snapshot } from "../adapter";
import { PersistenceAdapterTag, PersistenceError, VersionConflictError } from "../adapter";

/**
 * In-memory storage for a single actor
 */
interface ActorStorage {
  snapshot: O.Option<{
    readonly data: unknown;
    readonly version: number;
    readonly timestamp: number;
  }>;
  events: Array<{ readonly data: unknown; readonly version: number; readonly timestamp: number }>;
}

/**
 * Create an in-memory persistence adapter.
 * Useful for testing and development.
 */
const make = Effect.gen(function* () {
  const storage = yield* Ref.make(new Map<string, ActorStorage>());
  const registry = yield* Ref.make(new Map<string, ActorMetadata>());

  const getOrCreateStorage = Effect.fn("effect-machine.persistence.inMemory.getOrCreateStorage")(function* (
    id: string
  ) {
    return yield* Ref.modify(storage, (map) => {
      const existing = map.get(id);
      if (existing !== undefined) {
        return [existing, map];
      }
      const newStorage: ActorStorage = {
        snapshot: O.none(),
        events: [],
      };
      const newMap = new Map(map);
      newMap.set(id, newStorage);
      return [newStorage, newMap];
    });
  });

  const updateStorage = Effect.fn("effect-machine.persistence.inMemory.updateStorage")(function* (
    id: string,
    update: (storage: ActorStorage) => ActorStorage
  ) {
    yield* Ref.update(storage, (map) => {
      const existing = map.get(id);
      if (existing === undefined) {
        return map;
      }
      const newMap = new Map(map);
      newMap.set(id, update(existing));
      return newMap;
    });
  });

  const saveSnapshot = Effect.fn("effect-machine.persistence.inMemory.saveSnapshot")(function* <S, SI>(
    id: string,
    snapshot: Snapshot<S>,
    schema: S.Schema<S, SI, never>
  ) {
    const actorStorage = yield* getOrCreateStorage(id);

    // Optimistic locking: check version
    // Reject only if trying to save an older version (strict <)
    // Same-version saves are idempotent (allow retries/multiple callers)
    if (O.isSome(actorStorage.snapshot)) {
      const existingVersion = actorStorage.snapshot.value.version;
      if (snapshot.version < existingVersion) {
        return yield* new VersionConflictError({
          actorId: id,
          expectedVersion: existingVersion,
          actualVersion: snapshot.version,
        });
      }
    }

    // Encode state using schema
    const encoded = yield* S.encode(schema)(snapshot.state).pipe(
      Effect.mapError(
        (cause) =>
          new PersistenceError({
            operation: "saveSnapshot",
            actorId: id,
            cause,
            message: "Failed to encode state",
          })
      )
    );

    yield* updateStorage(id, (s) => ({
      ...s,
      snapshot: O.some({
        data: encoded,
        version: snapshot.version,
        timestamp: snapshot.timestamp,
      }),
    }));
  });

  const loadSnapshot = Effect.fn("effect-machine.persistence.inMemory.loadSnapshot")(function* <S, SI>(
    id: string,
    schema: S.Schema<S, SI, never>
  ) {
    const actorStorage = yield* getOrCreateStorage(id);

    if (O.isNone(actorStorage.snapshot)) {
      return O.none();
    }

    const stored = actorStorage.snapshot.value;

    // Decode state using schema
    const decoded = yield* S.decode(schema)(stored.data as SI).pipe(
      Effect.mapError(
        (cause) =>
          new PersistenceError({
            operation: "loadSnapshot",
            actorId: id,
            cause,
            message: "Failed to decode state",
          })
      )
    );

    return O.some({
      state: decoded,
      version: stored.version,
      timestamp: stored.timestamp,
    });
  });

  const appendEvent = Effect.fn("effect-machine.persistence.inMemory.appendEvent")(function* <E, EI>(
    id: string,
    event: PersistedEvent<E>,
    schema: S.Schema<E, EI, never>
  ) {
    yield* getOrCreateStorage(id);

    // Encode event using schema
    const encoded = yield* S.encode(schema)(event.event).pipe(
      Effect.mapError(
        (cause) =>
          new PersistenceError({
            operation: "appendEvent",
            actorId: id,
            cause,
            message: "Failed to encode event",
          })
      )
    );

    yield* updateStorage(id, (s) => ({
      ...s,
      events: [
        ...s.events,
        {
          data: encoded,
          version: event.version,
          timestamp: event.timestamp,
        },
      ],
    }));
  });

  const loadEvents = Effect.fn("effect-machine.persistence.inMemory.loadEvents")(function* <E, EI>(
    id: string,
    schema: S.Schema<E, EI, never>,
    afterVersion?: undefined | number
  ) {
    const actorStorage = yield* getOrCreateStorage(id);

    // Single pass - skip filtered events inline instead of creating intermediate array
    const decoded: PersistedEvent<E>[] = [];
    for (const stored of actorStorage.events) {
      if (afterVersion !== undefined && stored.version <= afterVersion) continue;

      const event = yield* S.decode(schema)(stored.data as EI).pipe(
        Effect.mapError(
          (cause) =>
            new PersistenceError({
              operation: "loadEvents",
              actorId: id,
              cause,
              message: "Failed to decode event",
            })
        )
      );
      decoded.push({
        event,
        version: stored.version,
        timestamp: stored.timestamp,
      });
    }

    return decoded;
  });

  const deleteActor = Effect.fn("effect-machine.persistence.inMemory.deleteActor")(function* (id: string) {
    yield* Ref.update(storage, (map) => {
      const newMap = new Map(map);
      newMap.delete(id);
      return newMap;
    });
    // Also delete metadata
    yield* Ref.update(registry, (map) => {
      const newMap = new Map(map);
      newMap.delete(id);
      return newMap;
    });
  });

  const listActors = Effect.fn("effect-machine.persistence.inMemory.listActors")(function* () {
    const map = yield* Ref.get(registry);
    return Array.from(map.values());
  });

  const saveMetadata = Effect.fn("effect-machine.persistence.inMemory.saveMetadata")(function* (
    metadata: ActorMetadata
  ) {
    yield* Ref.update(registry, (map) => {
      const newMap = new Map(map);
      newMap.set(metadata.id, metadata);
      return newMap;
    });
  });

  const deleteMetadata = Effect.fn("effect-machine.persistence.inMemory.deleteMetadata")(function* (id: string) {
    yield* Ref.update(registry, (map) => {
      const newMap = new Map(map);
      newMap.delete(id);
      return newMap;
    });
  });

  const loadMetadata = Effect.fn("effect-machine.persistence.inMemory.loadMetadata")(function* (id: string) {
    const map = yield* Ref.get(registry);
    const meta = map.get(id);
    return meta !== undefined ? O.some(meta) : O.none();
  });

  const adapter: PersistenceAdapter = {
    saveSnapshot,
    loadSnapshot,
    appendEvent,
    loadEvents,
    deleteActor,

    // Registry methods for actor discovery
    listActors,
    saveMetadata,
    deleteMetadata,
    loadMetadata,
  };

  return adapter;
}).pipe(Effect.withSpan("effect-machine.persistence.inMemory.make"));

/**
 * Create an in-memory persistence adapter effect.
 * Returns the adapter directly for custom layer composition.
 */
export const makeInMemoryPersistenceAdapter = make;

/**
 * In-memory persistence adapter layer.
 * Data is not persisted across process restarts.
 *
 * NOTE: Each `Effect.provide(InMemoryPersistenceAdapter)` creates a NEW adapter
 * with empty storage. For tests that need persistent storage across multiple
 * runPromise calls, use `makeInMemoryPersistenceAdapter` with a shared scope.
 *
 * @example
 * ```ts
 * const program = Effect.gen(function* () {
 *   const system = yield* ActorSystemService;
 *   const actor = yield* system.spawn("my-actor", persistentMachine);
 *   // ...
 * }).pipe(
 *   Effect.provide(InMemoryPersistenceAdapter),
 *   Effect.provide(ActorSystemDefault),
 * );
 * ```
 */
export const InMemoryPersistenceAdapter: Layer.Layer<PersistenceAdapterTag> = Layer.effect(PersistenceAdapterTag, make);
