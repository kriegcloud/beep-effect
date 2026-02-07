# Persistence

Snapshot and event sourcing for durable actors.

## Enable Persistence

Call `.persist()` on a machine:

```ts
import { Schedule } from "effect";

const persistentMachine = machine.persist({
  snapshotSchedule: Schedule.forever, // Snapshot on every transition
  journalEvents: true, // Also store events
  machineType: "Order", // For registry filtering
});
```

**Schemas inferred from machine** - no need to pass them again.

## Persistence Config

| Option             | Type       | Description                  |
|--------------------|------------|------------------------------|
| `snapshotSchedule` | `Schedule` | When to take snapshots       |
| `journalEvents`    | `boolean`  | Store events for replay      |
| `machineType`      | `string`   | Type identifier for registry |

`snapshotSchedule` drives a background scheduler. When the schedule ends (e.g. `Schedule.recurs`),
no further automatic snapshots are taken. Use `actor.persist` to force a snapshot at any time.

Event journaling and metadata updates run in a background worker for throughput; state updates do
not wait on persistence. Use `actor.persist` when you need an immediate durable snapshot.

## Persistence Adapter

Provide an adapter to enable persistence:

```ts
import { InMemoryPersistenceAdapter } from "@beep/machine";

const program = Effect.gen(function* () {
  const system = yield* ActorSystemService;
  const actor = yield* system.spawn("order-1", persistentMachine);
  // ...
});

Effect.runPromise(
  Effect.scoped(program).pipe(
    Effect.provide(ActorSystemDefault),
    Effect.provide(InMemoryPersistenceAdapter), // or custom adapter
  ),
);
```

## PersistentActorRef

Persistent actors have additional methods:

```ts
const actor = yield * system.spawn("order-1", persistentMachine);

// Force immediate snapshot
yield * actor.persist;

// Get current version
const version = yield * actor.version;

// Replay to specific version (state only, no effects)
yield * actor.replayTo(5);
```

`PersistentActorRef` carries the machine environment type: `PersistentActorRef<State, Event, R>`.
`replayTo()` runs in the same `R`.

## Restoring Actors

Restore from persisted state:

```ts
// Restore single actor
const maybeActor = yield * system.restore("order-1", persistentMachine);
if (Option.isSome(maybeActor)) {
  const actor = maybeActor.value;
  const state = yield * actor.snapshot;
  console.log(`Restored to ${state._tag}`);
}

// Restore returns None if no persisted state exists
```

Restore loads the latest snapshot if present, otherwise replays the event journal from the machine
initial state. Spawn and background effects run after restore just like a fresh spawn.

## Bulk Restore

Restore multiple actors:

```ts
// Restore by IDs
const result = yield * system.restoreMany(["order-1", "order-2", "order-3"], persistentMachine);
console.log(`Restored: ${result.restored.length}`);
console.log(`Failed: ${result.failed.length}`);

// Restore all of a machine type (requires machineType in config)
const result =
  yield *
  system.restoreAll(persistentMachine, {
    filter: (meta) => meta.stateTag !== "Completed", // Optional filter
  });
```

## List Persisted Actors

Query the registry (if adapter supports it):

```ts
const actors = yield * system.listPersisted();
for (const meta of actors) {
  console.log(`${meta.id}: ${meta.stateTag} (v${meta.version})`);
}
```

## Actor Metadata

```ts
interface ActorMetadata {
  id: string;
  machineType: string;
  createdAt: number;
  lastActivityAt: number;
  version: number;
  stateTag: string;
}
```

## Custom Adapter

Implement `PersistenceAdapter` interface:

```ts
interface PersistenceAdapter {
  // Required
  saveSnapshot: (id, snapshot, schema) => Effect<void, PersistenceError>;
  loadSnapshot: (id, schema) => Effect<Option<Snapshot>, PersistenceError>;
  appendEvent: (id, event, schema) => Effect<void, PersistenceError>;
  loadEvents: (id, schema, afterVersion) => Effect<PersistedEvent[], PersistenceError>;
  deleteActor: (id) => Effect<void, PersistenceError>;

  // Optional (for registry)
  listActors?: () => Effect<ActorMetadata[], PersistenceError>;
  saveMetadata?: (meta) => Effect<void, PersistenceError>;
  loadMetadata?: (id) => Effect<Option<ActorMetadata>, PersistenceError>;
  deleteMetadata?: (id) => Effect<void, PersistenceError>;
}
```

Provide via Context:

```ts
const MyAdapter = Layer.succeed(PersistenceAdapterTag, myAdapterImpl);

program.pipe(Effect.provide(MyAdapter));
```

## Version Conflicts

Optimistic locking via version numbers:

```ts
// VersionConflictError thrown if concurrent modification
const result = yield * Effect.either(actor.persist);
if (result._tag === "Left" && result.left._tag === "VersionConflictError") {
  // Handle conflict
}
```

## Replay Semantics

`replayTo()` computes state only - doesn't re-run effects:

```ts
// Replay to version 5
yield * actor.replayTo(5);

// State is now what it was at version 5
// But effects that ran during original transitions are NOT re-run
```

Useful for debugging or implementing time-travel.

## Cluster Integration

For distributed actors, use `toEntity()`:

```ts
import { toEntity, EntityMachine } from "@beep/machine";

// Generate Entity from machine
const OrderEntity = toEntity(orderMachine);

// Create layer for cluster
const OrderEntityLayer = EntityMachine.layer(OrderEntity, orderMachine, {
  initializeState: (entityId) => OrderState.Pending({ orderId: entityId }),
});
```

See @effect/cluster documentation for cluster setup.

## See Also

- `actors.md` - Actor basics
- `testing.md` - Testing persistent actors
