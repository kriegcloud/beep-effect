# effect-machine

Type-safe state machines for Effect. Schema-first API with full Effect integration.

## Why effect-machine?

State machines eliminate entire categories of bugs:

- **No invalid states** - compile-time enforcement of valid transitions
- **Explicit side effects** - effects scoped to states, auto-cancelled on exit
- **Testable** - simulate transitions without actors, assert paths deterministically
- **Serializable** - schemas power persistence and cluster distribution

## Navigation

```
What are you doing?
├─ Learning the basics        → basics.md
├─ Writing transitions        → handlers.md
├─ Adding side effects        → effects.md
├─ Testing a machine          → testing.md
├─ Running actors             → actors.md
├─ Adding persistence         → persistence.md
└─ Debugging issues           → gotchas.md
```

## Topic Index

| Topic       | File             | When to Read                     |
|-------------|------------------|----------------------------------|
| Core        | `basics.md`      | First time, understanding API    |
| Handlers    | `handlers.md`    | Transitions, guards, derive      |
| Effects     | `effects.md`     | spawn, background, timeouts      |
| Testing     | `testing.md`     | simulate, harness, assertions    |
| Actors      | `actors.md`      | ActorSystem, ActorRef, lifecycle |
| Persistence | `persistence.md` | Snapshots, event sourcing        |
| Gotchas     | `gotchas.md`     | Common mistakes, debugging       |

## Quick Example

```ts
import { Effect, Schema } from "effect";
import {
  Machine,
  State,
  Event,
  Slot,
  ActorSystemService,
  ActorSystemDefault,
} from "@beep/machine";

// 1. Define state schema
const OrderState = State({
  Pending: { orderId: Schema.String },
  Processing: { orderId: Schema.String },
  Shipped: { orderId: Schema.String, trackingId: Schema.String },
  Cancelled: {},
});

// 2. Define event schema
const OrderEvent = Event({
  Process: {},
  Ship: { trackingId: Schema.String },
  Cancel: {},
});

// 3. Define effect slots
const OrderEffects = Slot.Effects({
  notifyWarehouse: { orderId: Schema.String },
});

// 4. Build machine
const orderMachine = Machine.make({
  state: OrderState,
  event: OrderEvent,
  effects: OrderEffects,
  initial: OrderState.Pending({ orderId: "order-1" }),
})
  .on(OrderState.Pending, OrderEvent.Process, ({ state }) => OrderState.Processing.derive(state))
  .on(OrderState.Processing, OrderEvent.Ship, ({ state, event }) =>
    OrderState.Shipped.derive(state, { trackingId: event.trackingId }),
  )
  .onAny(OrderEvent.Cancel, () => OrderState.Cancelled)
  .spawn(OrderState.Processing, ({ effects, state }) =>
    effects.notifyWarehouse({ orderId: state.orderId }),
  )
  .final(OrderState.Shipped)
  .final(OrderState.Cancelled)
  .build({
    notifyWarehouse: ({ orderId }, { self }) =>
      Effect.gen(function* () {
        yield* Effect.log(`Notifying warehouse for ${orderId}`);
      }),
  });

// 5. Run as actor
const program = Effect.gen(function* () {
  const system = yield* ActorSystemService;
  const actor = yield* system.spawn("order-1", orderMachine);

  yield* actor.send(OrderEvent.Process);
  yield* actor.send(OrderEvent.Ship({ trackingId: "TRACK-123" }));

  const state = yield* actor.waitFor(OrderState.Shipped);
  console.log(state); // Shipped { orderId: "order-1", trackingId: "TRACK-123" }
});

Effect.runPromise(Effect.scoped(program.pipe(Effect.provide(ActorSystemDefault))));
```

## Core Concepts

| Concept          | Description                                                                                                 |
|------------------|-------------------------------------------------------------------------------------------------------------|
| **State**        | Schema-first tagged union. Empty = value (`State.Idle`), non-empty = constructor (`State.Loading({ url })`) |
| **Event**        | Schema-first tagged union. Same pattern as State.                                                           |
| **Machine**      | Fluent builder. `.on()` for transitions, `.onAny()` for wildcards, `.spawn()` for state-scoped effects.     |
| **Slots**        | Parameterized guards/effects. Define with `Slot.Guards`/`Slot.Effects`, wire with `.build()`.               |
| **BuiltMachine** | Result of `.build()` — ready to spawn. `Machine.spawn()` and `ActorSystem.spawn()` accept `BuiltMachine`.   |
| **Actor**        | Running machine instance with send/stop/state. Spawned via `Machine.spawn()` or `ActorSystem.spawn()`.      |
| **derive**       | Construct state from source — `State.X.derive(source, overrides)` picks overlapping fields.                 |

## API Quick Reference

### Building

| Method                                    | Purpose                                                     |
|-------------------------------------------|-------------------------------------------------------------|
| `Machine.make({ state, event, initial })` | Create machine                                              |
| `.on(State.X, Event.Y, handler)`          | Add transition                                              |
| `.on([State.X, State.Y], Event.Z, h)`     | Multi-state transition                                      |
| `.onAny(Event.X, handler)`                | Wildcard (specific .on() wins)                              |
| `.reenter(State.X, Event.Y, handler)`     | Transition with forced re-entry                             |
| `.spawn(State.X, handler)`                | State-scoped effect                                         |
| `.background(handler)`                    | Machine-lifetime effect                                     |
| `.final(State.X)`                         | Mark state as final                                         |
| `.build({ slot: impl })`                  | Wire implementations, returns `BuiltMachine` (terminal)     |
| `.build()`                                | Finalize no-slot machine, returns `BuiltMachine` (terminal) |
| `.persist(config)`                        | Enable persistence                                          |

### Testing

| Function                     | Runs Slots | Runs Spawn | Use For         |
|------------------------------|------------|------------|-----------------|
| `simulate(machine, events)`  | Yes        | No         | Path assertions |
| `createTestHarness(machine)` | Yes        | No         | Step-by-step    |
| Actor + `yieldFibers`        | Yes        | Yes        | Integration     |

### Actor

| Method                           | Sync   | Description                        |
|----------------------------------|--------|------------------------------------|
| `actor.send(event)`              | No     | Send event                         |
| `actor.sendSync(event)`          | Yes    | Fire-and-forget (for UI hooks)     |
| `actor.snapshot`                 | No     | Get state                          |
| `actor.snapshotSync()`           | Yes    | Get state                          |
| `actor.matches(tag)`             | No     | Check state tag                    |
| `actor.matchesSync(tag)`         | Yes    | Check state tag                    |
| `actor.can(event)`               | No     | Can handle event?                  |
| `actor.canSync(event)`           | Yes    | Can handle event?                  |
| `actor.changes`                  | Stream | State changes                      |
| `actor.waitFor(State.X)`         | No     | Wait for state (constructor or fn) |
| `actor.sendAndWait(ev, State.X)` | No     | Send + wait for state              |
| `actor.subscribe(fn)`            | Yes    | Sync callback                      |

## See Also

- `basics.md` - Core concepts in depth
- `handlers.md` - Transition handlers and guards
- `effects.md` - spawn, background, timeouts
