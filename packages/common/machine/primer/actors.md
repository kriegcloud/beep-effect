# Actors

Running machines as actors with lifecycle management.

## ActorSystem

Spawn and manage actors via `ActorSystem`:

```ts
import { Effect } from "effect";
import { ActorSystemService, ActorSystemDefault } from "@beep/machine";

const program = Effect.gen(function* () {
  const system = yield* ActorSystemService;

  // Spawn actor
  const actor = yield* system.spawn("order-1", orderMachine);

  // Use actor...
  yield* actor.send(Event.Process);

  // Actor auto-cleaned up when scope closes
});

Effect.runPromise(Effect.scoped(program).pipe(Effect.provide(ActorSystemDefault)));
```

**Important**: Actors require a scope. Use `Effect.scoped()` or provide a scope.

## ActorRef Methods

| Method                     | Type              | Description                        |
|----------------------------|-------------------|------------------------------------|
| `send(event)`              | `Effect<void>`    | Queue event for processing         |
| `sendSync(event)`          | `void`            | Fire-and-forget (sync, for UI)     |
| `snapshot`                 | `Effect<State>`   | Get current state                  |
| `snapshotSync()`           | `State`           | Get current state (sync)           |
| `matches(tag)`             | `Effect<boolean>` | Check if in state                  |
| `matchesSync(tag)`         | `boolean`         | Check if in state (sync)           |
| `can(event)`               | `Effect<boolean>` | Can handle event in current state? |
| `canSync(event)`           | `boolean`         | Can handle event? (sync)           |
| `changes`                  | `Stream<State>`   | Stream of state changes            |
| `waitFor(State.X)`         | `Effect<State>`   | Wait for state (constructor or fn) |
| `awaitFinal`               | `Effect<State>`   | Wait for final state               |
| `sendAndWait(ev, State.X)` | `Effect<State>`   | Send + wait for state              |
| `sendAndWait(ev)`          | `Effect<State>`   | Send + wait for final state        |
| `subscribe(fn)`            | `() => void`      | Sync callback, returns unsubscribe |
| `stop`                     | `Effect<void>`    | Stop actor gracefully              |

## Sending Events

Events are queued, not processed immediately:

```ts
yield * actor.send(Event.Start);
yield * actor.send(Event.Process);
yield * actor.send(Event.Complete);

// Events processed in order, but async
// Need to yield to let processing happen
yield * Effect.yieldNow();

const state = yield * actor.snapshot;
```

Sending after `stop` is a no-op (no error, no state change).

### sendSync (for UI integration)

`sendSync` is a synchronous fire-and-forget send for framework hooks (React, Solid):

```ts
// In a React onClick handler or Solid effect
actor.sendSync(Event.Start({ url: "/api" }));
```

No-op on stopped actors.

## Waiting for State

Prefer `waitFor`/`awaitFinal` over manual `changes` streams to avoid races:

```ts
// Accept state constructor
yield * actor.send(Event.Start);
const state = yield * actor.waitFor(MyState.Done);

// Or predicate function
const state = yield * actor.waitFor((s) => s._tag === "Done");
```

Send and await in one step:

```ts
// Wait for specific state
const state = yield * actor.sendAndWait(Event.Start, MyState.Active);

// Wait for final state
const state = yield * actor.sendAndWait(Event.Start);
```

## Observing State

**Effect-based**:

```ts
const state = yield * actor.snapshot;
const isLoading = yield * actor.matches("Loading");
const canProcess = yield * actor.can(Event.Process);
```

**Sync (for UI integration)**:

```ts
const state = actor.snapshotSync();
const isLoading = actor.matchesSync("Loading");
const canProcess = actor.canSync(Event.Process);
```

**Stream**:

```ts
yield *
  actor.changes.pipe(
    Stream.tap((state) => Effect.log(`State: ${state._tag}`)),
    Stream.takeUntil((state) => state._tag === "Done"),
    Stream.runDrain,
  );
```

**Sync callback**:

```ts
const unsubscribe = actor.subscribe((state) => {
  console.log("State changed:", state._tag);
});

// Later...
unsubscribe();
```

## Actor Lifecycle

1. **Spawn** - `system.spawn(id, machine)`
2. **Initial state** - Background effects start, initial spawn effects run
3. **Event processing** - Events processed in order
4. **State transitions** - Spawn effects cancelled on exit, new ones start on enter
5. **Final state** - Actor stops, all effects interrupted
6. **Scope close** - Cleanup finalizers run

## Multiple Actors

Each actor has independent state:

```ts
const actor1 = yield * system.spawn("order-1", orderMachine);
const actor2 = yield * system.spawn("order-2", orderMachine);

yield * actor1.send(Event.Process);
// actor2 unaffected

const state1 = yield * actor1.snapshot; // Processing
const state2 = yield * actor2.snapshot; // Idle
```

## Actor Registry

Query existing actors:

```ts
// Get actor by ID
const maybeActor = yield * system.get("order-1");
if (Option.isSome(maybeActor)) {
  const actor = maybeActor.value;
  // ...
}

// Stop actor by ID
const stopped = yield * system.stop("order-1");
// true if actor existed and was stopped
```

## Duplicate Actor Prevention

Same ID cannot be spawned twice:

```ts
yield * system.spawn("order-1", machine);
yield * system.spawn("order-1", machine);
// DuplicateActorError!
```

Check first if unsure:

```ts
const existing = yield * system.get("order-1");
if (Option.isNone(existing)) {
  yield * system.spawn("order-1", machine);
}
```

## Persistent Actors

For persistence, use `PersistentActorRef`:

```ts
const persistentMachine = machine.persist({
  snapshotSchedule: Schedule.forever,
  journalEvents: true,
});

const actor = yield * system.spawn("order-1", persistentMachine);

// Additional methods
yield * actor.persist; // Force snapshot save
const version = yield * actor.version; // Get persistence version
yield * actor.replayTo(5); // Replay to specific version
```

`PersistentActorRef` carries the machine environment type: `PersistentActorRef<State, Event, R>`.
`replayTo()` runs in the same `R`.

Machine must be built (`.build()`) before spawn/restore — `Machine.spawn` and `system.spawn` accept `BuiltMachine`.

Restore from persistence:

```ts
const maybeActor = yield * system.restore("order-1", persistentMachine);
if (Option.isSome(maybeActor)) {
  // Actor restored with persisted state
}
```

## See Also

- `effects.md` - spawn and background effects
- `persistence.md` - Persistence details
- `testing.md` - Testing actors
