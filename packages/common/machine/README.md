# effect-machine

Type-safe state machines for Effect.

## Why State Machines?

State machines eliminate entire categories of bugs:

- **No invalid states** - Compile-time enforcement of valid transitions
- **Explicit side effects** - Effects scoped to states, auto-cancelled on exit
- **Testable** - Simulate transitions without actors, assert paths deterministically
- **Serializable** - Schemas power persistence and cluster distribution


## Quick Example

```ts
import { Effect, Schema } from "effect";
import { Machine, State, Event, Slot, type BuiltMachine } from "@beep/machine";

// Define state schema - states ARE schemas
const OrderState = State({
  Pending: { orderId: Schema.String },
  Processing: { orderId: Schema.String },
  Shipped: { orderId: Schema.String, trackingId: Schema.String },
  Cancelled: {},
});

// Define event schema
const OrderEvent = Event({
  Process: {},
  Ship: { trackingId: Schema.String },
  Cancel: {},
});

// Define effects (side effects scoped to states)
const OrderEffects = Slot.Effects({
  notifyWarehouse: { orderId: Schema.String },
});

// Build machine with fluent API
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
  // Cancel from any state
  .onAny(OrderEvent.Cancel, () => OrderState.Cancelled)
  // Effect runs when entering Processing, cancelled on exit
  .spawn(OrderState.Processing, ({ effects, state }) =>
    effects.notifyWarehouse({ orderId: state.orderId }),
  )
  .final(OrderState.Shipped)
  .final(OrderState.Cancelled)
  .build({
    notifyWarehouse: ({ orderId }) => Effect.log(`Warehouse notified: ${orderId}`),
  });

// Run as actor (simple — no scope required)
const program = Effect.gen(function* () {
  const actor = yield* Machine.spawn(orderMachine);

  yield* actor.send(OrderEvent.Process);
  yield* actor.send(OrderEvent.Ship({ trackingId: "TRACK-123" }));

  const state = yield* actor.waitFor(OrderState.Shipped);
  console.log(state); // Shipped { orderId: "order-1", trackingId: "TRACK-123" }

  yield* actor.stop;
});

Effect.runPromise(program);
```

## Core Concepts

### Schema-First

States and events ARE schemas. Single source of truth for types and serialization:

```ts
const MyState = State({
  Idle: {}, // Empty = plain value
  Loading: { url: Schema.String }, // Non-empty = constructor
});

MyState.Idle; // Value (no parens)
MyState.Loading({ url: "/api" }); // Constructor
```

### State.derive()

Construct new states from existing ones — picks overlapping fields, applies overrides:

```ts
// Same-state: preserve fields, override specific ones
.on(State.Active, Event.Update, ({ state, event }) =>
  State.Active.derive(state, { count: event.count })
)

// Cross-state: picks only target fields from source
.on(State.Processing, Event.Ship, ({ state, event }) =>
  State.Shipped.derive(state, { trackingId: event.trackingId })
)
```

### Multi-State Transitions

Handle the same event from multiple states:

```ts
// Array of states — handler receives union type
.on([State.Draft, State.Review], Event.Cancel, () => State.Cancelled)

// Wildcard — fires from any state (specific .on() takes priority)
.onAny(Event.Cancel, () => State.Cancelled)
```

### Guards and Effects as Slots

Define parameterized guards and effects, provide implementations:

```ts
const MyGuards = Slot.Guards({
  canRetry: { max: Schema.Number },
});

const MyEffects = Slot.Effects({
  fetchData: { url: Schema.String },
});

machine
  .on(MyState.Error, MyEvent.Retry, ({ state, guards }) =>
    Effect.gen(function* () {
      if (yield* guards.canRetry({ max: 3 })) {
        return MyState.Loading({ url: state.url }); // Transition first
      }
      return MyState.Failed;
    }),
  )
  // Fetch runs when entering Loading, auto-cancelled if state changes
  .spawn(MyState.Loading, ({ effects, state }) => effects.fetchData({ url: state.url }))
  .build({
    canRetry: ({ max }, { state }) => state.attempts < max,
    fetchData: ({ url }, { self }) =>
      Effect.gen(function* () {
        const data = yield* Http.get(url);
        yield* self.send(MyEvent.Resolve({ data }));
      }),
  });
```

### State-Scoped Effects

`.spawn()` runs effects when entering a state, auto-cancelled on exit:

```ts
machine
  .spawn(MyState.Loading, ({ effects, state }) => effects.fetchData({ url: state.url }))
  .spawn(MyState.Polling, ({ effects }) => effects.poll({ interval: "5 seconds" }));
```

`.task()` runs on entry and sends success/failure events:

```ts
machine.task(State.Loading, ({ effects, state }) => effects.fetchData({ url: state.url }), {
  onSuccess: (data) => MyEvent.Resolve({ data }),
  onFailure: () => MyEvent.Reject,
});
```

### Testing

Test transitions without actors:

```ts
import { simulate, assertPath } from "@beep/machine";

// Simulate events and check path
const result = yield* simulate(machine, [MyEvent.Start, MyEvent.Complete]);
expect(result.states.map((s) => s._tag)).toEqual(["Idle", "Loading", "Done"]);

// Assert specific path
yield* assertPath(machine, events, ["Idle", "Loading", "Done"]);
```

## Documentation

See the [primer](./primer) for comprehensive documentation:

| Topic       | File                                      | Description                    |
|-------------|-------------------------------------------|--------------------------------|
| Overview    | [index.md](./primer/index.md)             | Navigation and quick reference |
| Basics      | [basics.md](./primer/basics.md)           | Core concepts                  |
| Handlers    | [handlers.md](./primer/handlers.md)       | Transitions and guards         |
| Effects     | [effects.md](./primer/effects.md)         | spawn, background, timeouts    |
| Testing     | [testing.md](./primer/testing.md)         | simulate, harness, assertions  |
| Actors      | [actors.md](./primer/actors.md)           | ActorSystem, ActorRef          |
| Persistence | [persistence.md](./primer/persistence.md) | Snapshots, event sourcing      |
| Gotchas     | [gotchas.md](./primer/gotchas.md)         | Common mistakes                |

## API Quick Reference

### Building

| Method                                    | Purpose                                                     |
|-------------------------------------------|-------------------------------------------------------------|
| `Machine.make({ state, event, initial })` | Create machine                                              |
| `.on(State.X, Event.Y, handler)`          | Add transition                                              |
| `.on([State.X, State.Y], Event.Z, h)`     | Multi-state transition                                      |
| `.onAny(Event.X, handler)`                | Wildcard transition (any state)                             |
| `.reenter(State.X, Event.Y, handler)`     | Force re-entry on same state                                |
| `.spawn(State.X, handler)`                | State-scoped effect                                         |
| `.task(State.X, run, { onSuccess })`      | State-scoped task                                           |
| `.background(handler)`                    | Machine-lifetime effect                                     |
| `.final(State.X)`                         | Mark final state                                            |
| `.build({ slot: impl })`                  | Provide implementations, returns `BuiltMachine` (terminal)  |
| `.build()`                                | Finalize no-slot machine, returns `BuiltMachine` (terminal) |
| `.persist(config)`                        | Enable persistence                                          |

### State Constructors

| Method                                 | Purpose                        |
|----------------------------------------|--------------------------------|
| `State.X.derive(source)`               | Pick target fields from source |
| `State.X.derive(source, { field: v })` | Pick fields + apply overrides  |
| `State.$is("X")(value)`                | Type guard                     |
| `State.$match(value, { X: fn, ... })`  | Pattern matching               |

### Running

| Method                       | Purpose                                                                                                 |
|------------------------------|---------------------------------------------------------------------------------------------------------|
| `Machine.spawn(machine)`     | Single actor, no registry. Caller manages lifetime via `actor.stop`. Auto-cleans up if `Scope` present. |
| `Machine.spawn(machine, id)` | Same as above with custom ID                                                                            |
| `system.spawn(id, machine)`  | Registry, lookup by ID, bulk ops, persistence. Cleans up on system teardown.                            |

### Testing

| Function                                   | Description                                                      |
|--------------------------------------------|------------------------------------------------------------------|
| `simulate(machine, events)`                | Run events, get all states (accepts `Machine` or `BuiltMachine`) |
| `createTestHarness(machine)`               | Step-by-step testing (accepts `Machine` or `BuiltMachine`)       |
| `assertPath(machine, events, path)`        | Assert exact path                                                |
| `assertReaches(machine, events, tag)`      | Assert final state                                               |
| `assertNeverReaches(machine, events, tag)` | Assert state never visited                                       |

### Actor

| Method                           | Description                        |
|----------------------------------|------------------------------------|
| `actor.send(event)`              | Queue event                        |
| `actor.sendSync(event)`          | Fire-and-forget (sync, for UI)     |
| `actor.snapshot`                 | Get current state                  |
| `actor.matches(tag)`             | Check state tag                    |
| `actor.can(event)`               | Can handle event?                  |
| `actor.changes`                  | Stream of changes                  |
| `actor.waitFor(State.X)`         | Wait for state (constructor or fn) |
| `actor.awaitFinal`               | Wait final state                   |
| `actor.sendAndWait(ev, State.X)` | Send + wait for state              |
| `actor.subscribe(fn)`            | Sync callback                      |